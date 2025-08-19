import os
from pathlib import Path
from typing import List, Literal, Optional

from pydantic import field_validator, PostgresDsn, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_DIR = BASE_DIR / "envs"


class Settings(BaseSettings):
    ENVIRONMENT: Literal["local", "development", "production"]
    API_PREFIX: str
    DEBUG: bool
    DATABASE_URL: Optional[str] = None
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    ALLOWED_ORIGINS: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    GOOGLE_AUTH_URL: str
    FRONTEND_REDIRECT_SCHEME: str
    STATE_SECRET_KEY: str
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    ADMIN_SECRET_KEY: str
    NGINX_APP_KEY: str

    @model_validator(mode='after')
    def assemble_db_connection(self) -> 'Settings':
        built_url = PostgresDsn.build(
            scheme="postgresql+psycopg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_HOST,
            port=self.POSTGRES_PORT,
            path=f"{self.POSTGRES_DB or ''}"
        )
        self.DATABASE_URL = str(built_url)
        return self



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
