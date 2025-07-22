import datetime
import uuid

from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from starlette import status
from starlette.exceptions import HTTPException
from core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """Generate a password hash"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    expires_delta = datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token(data, expires_delta, "access")


def create_refresh_token(data: dict):
    expires_delta = datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return _create_token(data, expires_delta, "refresh")


def _create_token(data: dict, expires_delta: datetime.timedelta, token_type: str):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.UTC) + expires_delta
    to_encode.update({
        "exp": expire,
        "iat": datetime.datetime.now(datetime.UTC),
        "type": token_type,
        "jti": str(uuid.uuid4())
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def validate_token(token: str, expected_type:str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"require_exp": True}  # ← Ensures exp claim exists
        )

        if expected_type and payload.get("type") != expected_type:
            raise JWTError(f"Invalid token type. Expected: {expected_type}")

        exp_timestamp = payload.get("exp")
        if exp_timestamp and datetime.datetime.now(datetime.UTC) > datetime.datetime.fromtimestamp(exp_timestamp, tz=datetime.timezone.utc):
            raise JWTError("Token expired")

        return payload


    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"}

        )

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )