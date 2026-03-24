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
