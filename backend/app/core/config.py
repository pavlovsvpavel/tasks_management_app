import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import field_validator, BaseModel


class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    DEBUG: bool = False
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    ALLOWED_ORIGINS: str = ""
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI")
    FRONTEND_HOME_URL: str = os.getenv("FRONTEND_HOME_URL")

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> List[str]:
        return v.split(",") if v else []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()


class AuthCookieSettings(BaseModel):
    httponly: bool = True
    secure: bool = True
    samesite: str = "lax"
    max_age: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    path: str = "/"
    domain: str = None

class CsrfCookieSettings(BaseModel):
    secure: bool = True
    samesite: str = "strict"
    max_age: int = 3600