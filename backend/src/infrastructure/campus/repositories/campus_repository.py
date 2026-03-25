from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from domain.campus.models import CampusModel


class CampusRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_id_and_tenant(self, campus_id: UUID, tenant_id: UUID) -> Optional[CampusModel]:
        return self._session.exec(
            select(CampusModel).where(
                CampusModel.id == campus_id,
                CampusModel.tenant_id == tenant_id,
            )
        ).first()

    def list_by_tenant(self, tenant_id: UUID, active_only: bool = True) -> List[CampusModel]:
        stmt = select(CampusModel).where(CampusModel.tenant_id == tenant_id)
        if active_only:
            stmt = stmt.where(CampusModel.is_active == True)
        return list(self._session.exec(stmt).all())

    def code_exists(self, tenant_id: UUID, code: str, exclude_id: Optional[UUID] = None) -> bool:
        stmt = select(CampusModel).where(
            CampusModel.tenant_id == tenant_id,
            CampusModel.code == code,
        )
        if exclude_id:
            stmt = stmt.where(CampusModel.id != exclude_id)
        return self._session.exec(stmt).first() is not None

    def save(self, campus: CampusModel) -> CampusModel:
        self._session.add(campus)
        self._session.commit()
        self._session.refresh(campus)
        return campus

    def delete(self, campus: CampusModel) -> None:
        self._session.delete(campus)
        self._session.commit()
