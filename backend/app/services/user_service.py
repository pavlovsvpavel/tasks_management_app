from pydantic import EmailStr
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import func

from app.models.accounts import User
from app.core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: EmailStr) -> User | None:
    return db.query(User).filter(User.email == email).first()

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

def authenticate_user(db: Session, email: EmailStr, password: str) -> User | None:
    """Authenticate a user with email/password"""
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def update_last_login(db: Session, user: User):
    """Explicitly update last login timestamp"""
    user.last_login = func.now()
    db.commit()
    db.refresh(user)
    return user