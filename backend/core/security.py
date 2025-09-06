import datetime
import time
import uuid
from typing import Dict, Any, Optional

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Header
from httpx import AsyncClient
from jose import jwt, JWTError, ExpiredSignatureError, jwk
from starlette import status
from starlette.exceptions import HTTPException
from core.config import settings

pwd_hasher = PasswordHasher()


def get_password_hash(password: str) -> str:
    """Generate a password hash"""
    return pwd_hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    try:
        pwd_hasher.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False
    except Exception as e:
        print(f"An error occurred during password verification: {e}")
        return False


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


async def validate_token(token: str, expected_type: str):
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
        if exp_timestamp and datetime.datetime.now(datetime.UTC) > datetime.datetime.fromtimestamp(exp_timestamp,
                                                                                                   tz=datetime.timezone.utc):
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


async def verify_admin(x_admin_token: str = Header(...)):
    if x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid admin token")


GOOGLE_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs"
google_public_keys: Dict[str, Any] = {}
last_key_fetch_time: float = 0
KEY_CACHE_LIFETIME_SECONDS = 3600


async def get_google_public_keys():
    """
    Fetches and caches Google's public keys for verifying ID tokens.
    """
    global google_public_keys, last_key_fetch_time

    current_time = time.time()
    if not google_public_keys or (current_time - last_key_fetch_time > KEY_CACHE_LIFETIME_SECONDS):
        async with AsyncClient() as client:
            response = await client.get(GOOGLE_KEYS_URL)
            response.raise_for_status()
            jwks = response.json()

            google_public_keys = {key['kid']: jwk.construct(key) for key in jwks['keys']}
            last_key_fetch_time = current_time

    return google_public_keys


async def verify_google_id_token(token: str, client_id: str, access_token: Optional[str] = None) -> dict:
    """
    Verifies a Google ID token and returns the payload if valid.
    """
    try:
        keys = await get_google_public_keys()

        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise JWTError("'kid' not found in token header")

        public_key = keys.get(kid)
        if not public_key:
            raise JWTError("Public key not found")

        pem_key = public_key.to_pem().decode('utf-8')
        payload = jwt.decode(
            token=token,
            key=pem_key,
            algorithms=["RS256"],
            audience=client_id,
            issuer="https://accounts.google.com",
            access_token=access_token
        )
        return payload

    except JWTError as e:
        raise ValueError(f"Invalid Google Token: {e}")
