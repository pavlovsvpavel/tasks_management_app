from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.responses import Response, RedirectResponse, JSONResponse
from core.config import settings
from core.cookies import CookieManager
from db.database import get_db
from models.users import User
from schemas.users import UserCreate, UserResponse, LoginRequest, UserChangePassword, UserUpdate
from services.user_service import (
    create_user,
    get_user_by_email,
    authenticate_user, update_last_login, change_user_password, update_user_full_name, get_current_user
)
from core.security import create_access_token, generate_csrf_token, create_refresh_token

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse)
def register_user(
        user: UserCreate,
        db: Session = Depends(get_db)
):
    """Register with email/password"""

    db_user = get_user_by_email(db, email=user.email)

    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already registered"
        )
    return create_user(db=db, user_data=user)


@router.post("/login")
async def login_user(
        response: Response,
        credentials: LoginRequest,
        db: Session = Depends(get_db)
):
    """Login with email/password and get access token"""

    user = authenticate_user(db, credentials.email, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled"
        )

    user = update_last_login(db, user)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    csrf_token = generate_csrf_token()

    cookie_mgr = CookieManager(response)
    cookie_mgr.set_access_token(access_token)
    cookie_mgr.set_refresh_token(refresh_token)
    cookie_mgr.set_csrf(csrf_token)

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name
        },
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        },
        "csrf_token": csrf_token
    }


@router.get("/logout")
async def logout(response: Response):
    """Logout user and clearing the cookies"""

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
    """Logout user, clearing the cookies and redirect to page"""

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


@router.get("/profile-details", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile"""

    return current_user


@router.patch("/profile-update", response_model=UserResponse)
async def update_user_profile(
        user_update: UserUpdate,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """Update current user's profile information"""

    updated_user = update_user_full_name(db, current_user.id, user_update)

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user


@router.post("/change-password")
async def change_password(
        password_data: UserChangePassword,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    """Change user password after verifying current password"""

    result = change_user_password(db, current_user.id, password_data)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if result is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    response = JSONResponse(
        content={
            "message": "Password changed successfully",
            "action": "logout",
            "notification": "You have to log in with your new password"
        },
        status_code=status.HTTP_200_OK
    )

    await logout(response)

    return {"message": "Password changed successfully"}
