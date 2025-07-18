from fastapi import Depends
from jose import JWTError
from pydantic import EmailStr
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import func
from starlette import status
from starlette.exceptions import HTTPException
from starlette.requests import Request

from db.database import get_db
from models.users import User
from core.security import get_password_hash, verify_password, validate_token
from schemas.users import UserUpdate, UserChangePassword


async def get_current_user(
        db: Session = Depends(get_db),
        request: Request = None,
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )

    token = None

    if request:
        cookie_token = request.cookies.get("access_token")

        if cookie_token:
            token = cookie_token

    if not token:
        raise credentials_exception

    try:
        payload = validate_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"}
            )

        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception

        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise credentials_exception

        return user

    except JWTError:
        raise credentials_exception


def validate_user_status(user: User):
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )


def get_user_by_email(db: Session, email: EmailStr) -> User | None:
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: EmailStr, password: str) -> User | None:
    """Authenticate a user with email/password"""
    user = get_user_by_email(db, email)

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


def get_user_by_google_id(db: Session, google_id: str) -> User | None:
    return db.query(User).filter(User.google_id == google_id).first()


def create_user(db: Session, user_data) -> User:
    """Create a new user with password hashing"""
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_oauth_user(db: Session, email: str, google_id: str,
                      full_name: str = None, picture: str = None) -> User:
    """Create a user from OAuth provider"""
    db_user = User(
        email=email,
        google_id=google_id,
        full_name=full_name,
        picture=picture,
        is_verified=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_last_login(db: Session, user: User):
    """Explicitly update last login timestamp"""
    user.last_login = func.now()
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int):
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def update_user_full_name(db: Session, user_id: int, user_update: UserUpdate):
    db_user = db.get(User, user_id)
    if not db_user:
        return None

    if user_update.full_name is not None:
        db_user.full_name = user_update.full_name

    db.commit()
    db.refresh(db_user)
    return db_user


def change_user_password(db: Session, user_id: int, password_data: UserChangePassword):
    """Change user password after verifying current password"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    if not verify_password(password_data.current_password, user.hashed_password):
        return False

    user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    db.refresh(user)

    return user
