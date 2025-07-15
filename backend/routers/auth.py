import datetime

from fastapi import APIRouter, Depends, Body
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from httpx import AsyncClient
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from starlette import status
from starlette.exceptions import HTTPException
from starlette.requests import Request
from starlette.responses import RedirectResponse, Response
from core.cookies import CookieManager
from db.database import get_db
from core.config import settings
from models.users import User
from schemas.auth import TokenResponse
from services.user_service import get_user_by_google_id, create_oauth_user, authenticate_user, update_last_login, \
    validate_user_status
from core.security import create_access_token, generate_csrf_token, create_refresh_token, verify_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

bearer_scheme = HTTPBearer(auto_error=False)

@router.get("/protected")
async def protected_route(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = credentials.credentials

    payload = verify_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return {
        "message": "Access granted",
        "user_id": payload.get("sub"),
        "token_info": {
            "type": "bearer",
            "expires_at": datetime.datetime.fromtimestamp(payload["exp"]).isoformat()
        }
    }

@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
        response: Response,
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    """
    OAuth2 token login that returns both access and refresh tokens.
    Supports web (cookies) and mobile (JSON response).
    """
    # Authenticate user
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    validate_user_status(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    csrf_token = generate_csrf_token()

    cookie_mgr = CookieManager(response)
    cookie_mgr.set_access_token(access_token)
    cookie_mgr.set_refresh_token(refresh_token)
    cookie_mgr.set_csrf(csrf_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "email": user.email
        }
    }


@router.post("/refresh-token")
async def refresh_access_token(
        request: Request,
        response: Response,
        refresh_token: str = Body(None, embed=True),
        db: Session = Depends(get_db)
):
    """
    Refresh access token using a valid refresh token.
    Accepts token from either cookie (web) or request body (mobile).
    """

    if not refresh_token:
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token is required"
            )

    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        validate_user_status(user)

        new_access_token = create_access_token(data={"sub": str(user.id)})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

        cookie_mgr = CookieManager(response)
        cookie_mgr.set_access_token(new_access_token)
        cookie_mgr.set_refresh_token(new_refresh_token)

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid refresh token: {str(e)}"
        )


@router.get("/login/google")
async def login_google():
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?response_type=code"
        f"&client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        f"&scope=openid%20email%20profile"
    )

    return RedirectResponse(google_auth_url)


@router.get("/callback")
async def auth_google_callback(
        code: str = None,
        error: str = None,
        db: Session = Depends(get_db)
):
    if error:
        return RedirectResponse(url="{settings.FRONTEND_HOME_URL}")

    if not code:
        return RedirectResponse(url="{settings.FRONTEND_HOME_URL}")

    try:
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        async with AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            token_response.raise_for_status()
            token_json = token_response.json()

            access_token = token_json["access_token"]
            user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            user_info_response = await client.get(user_info_url, headers=headers)
            user_info_response.raise_for_status()
            user_info = user_info_response.json()

        user = get_user_by_google_id(db, user_info["sub"])
        if not user:
            user = create_oauth_user(
                db,
                email=user_info["email"],
                google_id=user_info["sub"],
                full_name=user_info.get("name"),
                picture=user_info.get("picture")
            )

        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        csrf_token = generate_csrf_token()

        update_last_login(db, user)
        response = RedirectResponse(url=settings.FRONTEND_HOME_URL)

        cookie_mgr = CookieManager(response)
        cookie_mgr.set_access_token(access_token)
        cookie_mgr.set_refresh_token(refresh_token)
        cookie_mgr.set_csrf(csrf_token)

        return response

    except Exception as e:
        return RedirectResponse(f"{settings.FRONTEND_HOME_URL}?error={str(e)}")
