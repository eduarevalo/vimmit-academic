from typing import Optional
from uuid import UUID
from sqlmodel import Session, select
from domain.identity.models import Role

class RoleRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_name(self, name: str) -> Optional[Role]:
        statement = select(Role).where(Role.name == name)
        return self._session.exec(statement).first()

    def create_role(self, name: str, tenant_id: Optional[UUID] = None, description: Optional[str] = None) -> Role:
        role = Role(name=name, tenant_id=tenant_id, description=description)
        self._session.add(role)
        self._session.commit()
        self._session.refresh(role)
        return role
