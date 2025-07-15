from pydantic import BaseModel
from starlette.responses import Response

from core.config import settings


class AccessCookieSettings(BaseModel):
    httponly: bool = True
    secure: bool = not settings.DEBUG
    samesite: str = "lax"
    max_age: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    path: str = "/"
    domain: str = None


class RefreshCookieSettings(BaseModel):
    httponly: bool = True
    secure: bool = not settings.DEBUG
    samesite: str = "lax"
    max_age: int = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    path: str = "/auth/refresh-token"
    domain: str = None


class CsrfCookieSettings(BaseModel):
    secure: bool = not settings.DEBUG
    samesite: str = "strict"
    max_age: int = 86400
    path: str = "/"
    domain: str | None = None


class CookieManager:
    def __init__(self, response: Response):
        self.response = response

    def set_access_token(self, token: str) -> None:
        self.response.set_cookie(
            key="access_token",
            value=token,
            **AccessCookieSettings().model_dump()
        )

    def set_refresh_token(self, token: str) -> None:
        self.response.set_cookie(
            key="refresh_token",
            value=token,
            **RefreshCookieSettings().model_dump()
        )

    def set_csrf(self, csrf_token: str) -> None:
        self.response.set_cookie(
            key="csrf_token",
            value=csrf_token,
            **CsrfCookieSettings().model_dump()
        )
