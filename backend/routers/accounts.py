from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.responses import Response

from core.cookies import CookieManager
from db.database import get_db
from schemas.accounts import UserCreate, UserResponse, LoginRequest

from services.user_service import (
    create_user,
    get_user_by_email,
    authenticate_user, update_last_login
)
from core.security import create_access_token, generate_csrf_token

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already registered"
        )
    return create_user(db=db, user_data=user)


@router.post("/login")
def email_login(
        response: Response,
        credentials: LoginRequest,
        db: Session = Depends(get_db)
):
    """Login with email/password and get access token"""
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    user = update_last_login(db, user)

    access_token = create_access_token(data={"sub": str(user.id)})

    cookie_mgr = CookieManager(response)
    cookie_mgr.set_auth(access_token)

    csrf_token = generate_csrf_token()
    cookie_mgr.set_csrf(csrf_token)

    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.full_name
        },
        # Include only if frontend needs it
        "csrf_token": csrf_token
    }
