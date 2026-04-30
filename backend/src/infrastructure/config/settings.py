from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr, Field
from typing import Optional
from functools import lru_cache

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Vimmit Academic"
    FRONTEND_URL: str = "http://localhost:5173"
    PORTAL_FRONTEND_URL: str = "http://localhost:5173/portal"
    ALLOWED_ORIGINS: list[str] = [FRONTEND_URL, PORTAL_FRONTEND_URL, "http://127.0.0.1:5173"]
    ALLOW_METHODS: list[str] = ["*"]
    ALLOW_HEADERS: list[str] = ["*"]
    ALLOW_CREDENTIALS: bool = True
    
    # Security Settings
    # In production, this should be set to a real secret key
    SECRET_KEY: str = Field(default="dummy-secret-key-for-learning")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    TESTING: bool = False

    # Database Settings
    DATABASE_URL: str = Field(default="sqlite:///./test.db")

    @property
    def database_url_sync(self) -> str:
        """
        Ensures the database URL is compatible with SQLModel/SQLAlchemy.
        Specifically adds +pymysql for mysql schemes.
        """
        url = self.DATABASE_URL
        if url.startswith("mysql:"):
            return url.replace("mysql:", "mysql+pymysql:", 1)
        return url

    # Email Settings (ZeptoMail SMTP)
    ZEPTOMAIL_TOKEN: str = "" # This is the SMTP Password
    ZEPTOMAIL_SMTP_HOST: str = "smtp.zeptomail.com"
    ZEPTOMAIL_SMTP_PORT: int = 587
    ZEPTOMAIL_SMTP_USER: str = Field(default="notificaciones@vimmmit.com")
    AUTHORIZED_SENDER_EMAIL: EmailStr = Field(default="notificaciones@vimmit.com")
    AUTHORIZED_SENDER_NAME: str = Field(default="Vimmit Academic")

    # DigitalOcean Spaces / S3 Settings
    SPACES_ACCESS_ID: Optional[str] = None
    SPACES_SECRET_KEY: Optional[str] = None
    SPACES_BUCKET: Optional[str] = None
    SPACES_REGION: str = "nyc3"
    SPACES_ENDPOINT: str = "https://nyc3.digitaloceanspaces.com"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

@lru_cache
def get_settings():
    return Settings()
