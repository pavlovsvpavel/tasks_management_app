from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from models.users import User
from schemas.users import UserCreate, UserResponse, UserChangePassword, UserUpdate, LoginResponse
from services.user_service import (
    create_user,
    get_user_by_email,
    authenticate_user, update_last_login, change_user_password, update_user_full_name, get_current_user,
)
from core.security import create_access_token, create_refresh_token

from backend.schemas.users import PictureUpdateRequest

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse)
async def register_user(
        user: UserCreate,
        db: AsyncSession = Depends(get_db)
):
    """Register with email/password"""

    db_user = await get_user_by_email(db, email=user.email)

    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already registered"
        )
    return await create_user(db=db, user_data=user)


@router.post("/login", response_model=LoginResponse)
async def login_user(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: AsyncSession = Depends(get_db)
):
    """OAuth2 token login that returns both access and refresh tokens.
     Supports web (cookies) and mobile (JSON response)."""

    user = await authenticate_user(db, form_data.username, form_data.password)

    user = await update_last_login(db, user)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return {
        "tokens": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        },
        "user": {
            "id": user.id,
            "email": user.email,
        }
    }


@router.get("/profile-details", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile"""

    return current_user


@router.patch("/profile-update", response_model=UserResponse)
async def update_user_profile(
        user_update: UserUpdate,
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """Update current user's profile information"""

    updated_user = await update_user_full_name(db, current_user.id, user_update)

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
        db: AsyncSession = Depends(get_db),
):
    """Change user password after verifying current password"""

    result = await change_user_password(db, current_user, password_data)

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

    return {"message": "Password changed successfully"}


@router.post("/upload-picture", response_model=UserResponse)
async def upload_profile_picture_base64(
        request: PictureUpdateRequest,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # The base64 string is received directly from the request body
    picture_data = request.picture

    if not picture_data.startswith("data:image/"):
        raise HTTPException(status_code=400, detail="Invalid Base64 image format")

    current_user.picture = picture_data
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return current_user
