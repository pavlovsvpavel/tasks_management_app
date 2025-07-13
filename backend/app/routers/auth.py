from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from httpx import AsyncClient
from sqlalchemy.orm import Session
from starlette import status
from starlette.exceptions import HTTPException
from starlette.responses import RedirectResponse, Response

from app.core.cookies import CookieManager
from app.db.database import get_db
from app.core.config import settings

from app.services.user_service import get_user_by_google_id, create_oauth_user, authenticate_user, update_last_login
from app.core.security import create_access_token, generate_csrf_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/token")
def login_for_access_token(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email
    }


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
        update_last_login(db, user)
        response = RedirectResponse(url=settings.FRONTEND_HOME_URL)

        cookie_mgr = CookieManager(response)
        cookie_mgr.set_auth(access_token)

        csrf_token = generate_csrf_token()
        cookie_mgr.set_csrf(csrf_token)

        return response

    except Exception as e:
        return RedirectResponse(f"{settings.FRONTEND_HOME_URL}?error={str(e)}")


@router.get("/logout")
async def logout(response: Response):
    """
    Logout user by clearing the cookies
    """

    response.delete_cookie(
        key="access_token",
        path="/",
        domain=None,
    )

    response.delete_cookie(
        key="csrf_token",
        path="/",
        domain=None,
    )

    return {"message": "Successfully logged out"}


@router.get("/logout-with-redirect")
async def logout_and_redirect():
    """
    Logout user, clearing the cookies and redirect to page
    """
    response = RedirectResponse(url=settings.FRONTEND_HOME_URL)

    response.delete_cookie(
        key="access_token",
        path="/",
        domain=None,
    )
    response.delete_cookie(
        key="csrf_token",
        path="/",
        domain=None,
    )
    return response
