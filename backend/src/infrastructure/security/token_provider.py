from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt

from infrastructure.config.settings import get_settings

class TokenProvider:
    """
    Handles JWT generation and decoding.
    """
    
    @classmethod
    def create_access_token(cls, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        settings = get_settings()
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

    @classmethod
    def decode_token(cls, token: str) -> Optional[dict]:
        settings = get_settings()
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None
