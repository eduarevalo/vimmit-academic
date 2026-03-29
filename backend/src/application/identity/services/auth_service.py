from datetime import timedelta
from typing import Optional
from domain.identity.models import User
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.security.hash_provider import HashProvider
from infrastructure.security.token_provider import TokenProvider

class AuthService:
    def __init__(self, user_repo: UserRepository, hash_provider: HashProvider, token_provider: TokenProvider):
        self._user_repo = user_repo
        self._hash_provider = hash_provider
        self._token_provider = token_provider

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = self._user_repo.get_by_email(email)
        if not user:
            return None
        
        if not self._hash_provider.verify_password(password, user.hashed_password):
            return None
            
        return user

    def create_access_token(self, username: str) -> str:
        # We use standard 'sub' for identification
        return self._token_provider.create_access_token(data={"sub": username})

    def create_password_reset_token(self, email: str) -> str:
        # Set a short expiration for security (e.g., 60 minutes)
        expires = timedelta(minutes=60)
        return self._token_provider.create_access_token(
            data={"sub": email, "purpose": "password_reset"}, 
            expires_delta=expires
        )

    def verify_password_reset_token(self, token: str) -> Optional[str]:
        payload = self._token_provider.decode_token(token)
        if not payload or payload.get("purpose") != "password_reset":
            return None
        return payload.get("sub")

    def update_password(self, user: User, new_password: str) -> User:
        user.hashed_password = self._hash_provider.get_password_hash(new_password)
        self._user_repo.save(user)
        return user
