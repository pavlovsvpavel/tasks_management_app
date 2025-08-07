from datetime import datetime, timezone

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.functions import func
from starlette import status
from starlette.exceptions import HTTPException

from db.database import get_db
from models.users import User
from core.security import get_password_hash, verify_password, validate_token
from schemas.users import UserUpdate, UserChangePassword

bearer_scheme = HTTPBearer()


async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
        db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = await validate_token(token, expected_type="access")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"}
        )

    query = select(User).where(User.id == int(user_id))
    result = await db.execute(query)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


async def get_user_by_email(db: AsyncSession, email: EmailStr) -> User | None:
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    user = result.scalars().first()
    return user


async def authenticate_user(db: AsyncSession, email: EmailStr, password: str) -> User | None:
    """Authenticate a user with email/password"""
    user = await get_user_by_email(db, email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is disabled. Please contact support."
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is disabled. Please contact support."
        )

    return user


async def get_user_by_google_id(db: AsyncSession, google_id: str) -> User | None:
    query = select(User).where(User.google_id == google_id)
    result = await db.execute(query)
    return result.scalars().first()


async def create_user(db: AsyncSession, user_data) -> User:
    """Create a new user with password hashing"""
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def create_oauth_user(db: AsyncSession, email: str, google_id: str,
                            full_name: str = None, picture: str = None) -> User:
    """Create a user from OAuth provider"""
    db_user = User(
        email=email,
        google_id=google_id,
        full_name=full_name,
        picture=picture,
        is_verified=True,
        is_active=True,
        last_login=datetime.now(timezone.utc)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_last_login(db: AsyncSession, user: User):
    """Explicitly update last login timestamp"""
    user.last_login = func.now()
    await db.commit()
    await db.refresh(user)
    return user


async def update_user_full_name(db: AsyncSession, user_id: int, user_update: UserUpdate):
    db_user = await db.get(User, user_id)
    if not db_user:
        return None

    if user_update.full_name is not None:
        db_user.full_name = user_update.full_name

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def change_user_password(db: AsyncSession, user: User, password_data: UserChangePassword):
    """Change user password after verifying current password"""

    if not verify_password(password_data.current_password, user.hashed_password):
        return False

    user.hashed_password = get_password_hash(password_data.new_password)
    await db.commit()
    await db.refresh(user)

    return user
