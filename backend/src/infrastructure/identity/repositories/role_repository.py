from typing import Optional, List
from uuid import UUID
from sqlmodel import Session, select
from domain.identity.models import Role

class RoleRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_id(self, role_id: UUID) -> Optional[Role]:
        return self._session.get(Role, role_id)

    def get_by_name(self, name: str) -> Optional[Role]:
        statement = select(Role).where(Role.name == name)
        return self._session.exec(statement).first()

    def list_by_tenant(self, tenant_id: UUID) -> List[Role]:
        statement = select(Role).where(Role.tenant_id == tenant_id)
        return self._session.exec(statement).all()

    def create_role(self, name: str, tenant_id: Optional[UUID] = None, description: Optional[str] = None) -> Role:
        role = Role(name=name, tenant_id=tenant_id, description=description)
        self._session.add(role)
        self._session.commit()
        self._session.refresh(role)
        return role
