"""Application configuration."""

import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import model_validator
from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", "development")


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # CORS_ORIGINS: default value depends on environment
    # - development: localhost addresses
    # - production: actual domains (override via CORS_ORIGINS env var)
    CORS_ORIGINS: str = ""

    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str = ""
    REDIS_MAX_CONNECTIONS: int = 10
    REDIS_SOCKET_TIMEOUT: int = 5
    REDIS_SOCKET_CONNECT_TIMEOUT: int = 5

    @property
    def cors_origins_list(self) -> List[str]:
        # If CORS_ORIGINS env var is explicitly set, use it directly
        if self.CORS_ORIGINS:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        # Otherwise, default based on environment
        if ENV == "production":
            return ["https://earthonline.com"]
        # development / staging
        return [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ]

    @model_validator(mode="after")
    def validate_settings(self):
        # Validate SECRET_KEY
        if not self.SECRET_KEY:
            raise ValueError(
                "SECRET_KEY must be set! Generate one with: "
                "python -c \"import secrets; print(secrets.token_urlsafe(32))\""
            )
        if len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        
        # Validate DATABASE_URL
        if not self.DATABASE_URL:
            raise ValueError(
                "DATABASE_URL must be set! Example: "
                "postgresql://user:password@localhost:5432/dbname"
            )
        
        return self


settings = Settings()
