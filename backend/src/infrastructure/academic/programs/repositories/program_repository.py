from typing import Optional, List, Tuple
from uuid import UUID
from sqlmodel import Session, select
from domain.academic.programs.models import ProgramModel
from domain.tenants.models import TenantModel


class ProgramRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_id_and_tenant(
        self, program_id: UUID, tenant_id: UUID
    ) -> Optional[ProgramModel]:
        """
        Returns the program only if it belongs to the given tenant.
        A single query — returns None if not found or tenant mismatch.
        """
        statement = select(ProgramModel).where(
            ProgramModel.id == program_id,
            ProgramModel.tenant_id == tenant_id,
        )
        return self._session.exec(statement).first()

    def get_by_id_in_tenants(
        self, program_id: UUID, tenant_ids: List[UUID]
    ) -> Optional[ProgramModel]:
        """
        Returns the program only if it belongs to one of the given tenants.
        Used for multi-tenant (aggregate) read/write operations.
        """
        statement = select(ProgramModel).where(
            ProgramModel.id == program_id,
            ProgramModel.tenant_id.in_(tenant_ids),
        )
        return self._session.exec(statement).first()

    def list_by_tenants(
        self, tenant_ids: List[UUID], active_only: bool = True
    ) -> List[Tuple[ProgramModel, str]]:
        """
        Returns all programs for the given tenants, enriched with tenant_name.
        Returns a list of (ProgramModel, tenant_name) tuples.
        """
        statement = (
            select(ProgramModel, TenantModel.name)
            .join(TenantModel, ProgramModel.tenant_id == TenantModel.id)
            .where(ProgramModel.tenant_id.in_(tenant_ids))
        )
        if active_only:
            statement = statement.where(ProgramModel.is_active == True)
        return self._session.exec(statement).all()

    def list_by_tenant_slug(
        self, tenant_slug: str, active_only: bool = True
    ) -> List[ProgramModel]:
        """
        Returns all programs for a given tenant slug.
        """
        statement = (
            select(ProgramModel)
            .join(TenantModel, ProgramModel.tenant_id == TenantModel.id)
            .where(TenantModel.slug == tenant_slug)
        )
        if active_only:
            statement = statement.where(ProgramModel.is_active == True)
        return self._session.exec(statement).all()

    def save(self, program: ProgramModel) -> ProgramModel:
        self._session.add(program)
        self._session.commit()
        self._session.refresh(program)
        return program

    def delete(self, program: ProgramModel) -> None:
        self._session.delete(program)
        self._session.commit()
