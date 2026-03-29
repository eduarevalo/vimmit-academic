from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr, Field
from typing import Optional
from functools import lru_cache

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Vimmit Academic"
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: list[str] = ["*"]
    ALLOW_METHODS: list[str] = ["*"]
    ALLOW_HEADERS: list[str] = ["*"]
    ALLOW_CREDENTIALS: bool = True
    
    # Security Settings
    # In production, this should be set to a real secret key
    SECRET_KEY: str = Field(default="dummy-secret-key-for-learning")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database Settings
    DATABASE_URL: str = Field(default="sqlite:///./test.db")

    # Email Settings (ZeptoMail)
    ZEPTOMAIL_TOKEN: Optional[str] = None
    ZEPTOMAIL_API_URL: str = "https://api.zeptomail.com/v1.1/email"
    AUTHORIZED_SENDER_EMAIL: EmailStr = "notifications@vimmit.com"
    AUTHORIZED_SENDER_NAME: str = "Vimmit Academic"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

@lru_cache
def get_settings():
    return Settings()
