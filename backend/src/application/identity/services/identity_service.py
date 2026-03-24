from typing import Optional
from uuid import UUID
from sqlmodel import Session

from domain.identity.models import User
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.identity.repositories.role_repository import RoleRepository
from infrastructure.security.hash_provider import HashProvider

class IdentityService:
    def __init__(self, session: Session, user_repo: UserRepository, role_repo: RoleRepository, hash_provider: HashProvider):
        self._session = session
        self._user_repo = user_repo
        self._role_repo = role_repo
        self._hash_provider = hash_provider

    def register_user(self, email: str, password: str) -> User:
        hashed_password = self._hash_provider.get_password_hash(password)
        user = User(email=email, hashed_password=hashed_password)
        return self._user_repo.save(user)

    def assign_role_to_user(self, user_id: UUID, role_name: str) -> bool:
        user = self._user_repo.get_by_id(user_id)
        role = self._role_repo.get_by_name(role_name)
        
        if not user or not role:
            return False
            
        if role not in user.roles:
            user.roles.append(role)
            self._user_repo.save(user)
        return True
