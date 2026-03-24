from typing import Optional
from uuid import UUID
from sqlmodel import Session, select
from domain.identity.models import User

class UserRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self._session.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return self._session.exec(statement).first()

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.commit()
        self._session.refresh(user)
        return user
