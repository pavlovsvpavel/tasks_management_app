import time

from fastapi import APIRouter, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from httpx import AsyncClient
from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.exceptions import HTTPException
from starlette.responses import RedirectResponse
from core.cookies import CookieManager
from db.database import get_db
from core.config import settings
from models.users import User
from services.user_service import get_user_by_google_id, create_oauth_user, update_last_login
from core.security import create_access_token, create_refresh_token, validate_token

router = APIRouter(prefix="/auth", tags=["auth"])

bearer_scheme = HTTPBearer(auto_error=False)


@router.post("/validate-token")
async def validate_token_route(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
        expected_type: str | None = Header(None)
):
    """Validate token."""

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided or invalid Authorization header"
        )
    payload = await validate_token(credentials.credentials, expected_type)

    return {
        "valid": True,
        "user_id": payload.get("sub"),
        "expires_in": payload["exp"] - int(time.time())
    }


@router.post("/refresh-token")
async def refresh_token_route(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
        db: AsyncSession = Depends(get_db)
):
    """Refresh tokens using ONLY a valid refresh token."""
    refresh_token = credentials.credentials

    try:
        # 1. Validate token type strictly (only refresh tokens allowed)
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only refresh tokens can be used here"
            )

        # 2. Validate user
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )

        query = select(User).where(User.id == int(user_id))
        result = await db.execute(query)
        user = result.scalars().first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        new_access_token = create_access_token(data={"sub": str(user.id)})
        remaining_life = payload["exp"] - int(time.time())

        if remaining_life < (
                settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400 * 0.25):
            new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        else:
            new_refresh_token = refresh_token

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_meta": {
                "refresh_rotated": new_refresh_token is not None,
                "access_expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            }
        }

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
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
        db: AsyncSession = Depends(get_db)
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

        user = await get_user_by_google_id(db, user_info["sub"])
        if not user:
            user = await create_oauth_user(
                db,
                email=user_info["email"],
                google_id=user_info["sub"],
                full_name=user_info.get("name"),
                picture=user_info.get("picture")
            )

        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        await update_last_login(db, user)
        response = RedirectResponse(url=settings.FRONTEND_HOME_URL)

        cookie_mgr = CookieManager(response)
        cookie_mgr.set_access_token(access_token)
        cookie_mgr.set_refresh_token(refresh_token)

        return response

    except Exception as e:
        return RedirectResponse(f"{settings.FRONTEND_HOME_URL}?error={str(e)}")
