import os
from pathlib import Path
from typing import List, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_DIR = BASE_DIR / "envs"


class Settings(BaseSettings):
    ENVIRONMENT: Literal["local", "development", "production"]
    API_PREFIX: str
    DEBUG: bool
    DATABASE_URL: str
    ALLOWED_ORIGINS: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    FRONTEND_HOME_URL: str

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> List[str]:
        return v.split(",") if v else []


    @staticmethod
    def get_env_file() -> Path:
        env_name = os.getenv("ENVIRONMENT")
        env_file = ENV_DIR / f".env.{env_name}"
        if not env_file.exists():
            env_file = ENV_DIR / ".env"
        return env_file

    model_config = SettingsConfigDict(
        env_file=get_env_file(),
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='forbid'
    )


settings = Settings()  # type: ignore[call-arg]
