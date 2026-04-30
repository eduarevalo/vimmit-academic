from typing import List, Optional
from uuid import UUID
from datetime import date, datetime, timezone
from sqlmodel import Session
from fastapi import HTTPException

from domain.financial.models import ProgramCostItem, EnrollmentCharge, ChargeStatus
from domain.financial.schemas import ProgramCostItemCreate, ProgramCostItemUpdate
from domain.academic.programs.models import ProgramLevelModel
from infrastructure.financial.repositories.cost_repository import CostRepository
from infrastructure.administrative.enrollment.repositories.enrollment_repository import EnrollmentRepository


class CostService:
    def __init__(self, session: Session):
        self._session = session
        self.cost_repo = CostRepository(session)
        self.enrollment_repo = EnrollmentRepository(session)

    def list_cost_items(
        self, tenant_id: UUID, program_id: Optional[UUID] = None, level_id: Optional[UUID] = None
    ) -> List[ProgramCostItem]:
        return self.cost_repo.list_by_program(tenant_id, program_id, level_id, active_only=False)

    def create_cost_item(self, tenant_id: UUID, data: ProgramCostItemCreate) -> ProgramCostItem:
        # Check overlapping dates could go here (if necessary)
        item = ProgramCostItem(
            tenant_id=tenant_id,
            program_id=data.program_id,
            level_id=data.level_id,
            name=data.name,
            description=data.description,
            amount=data.amount,
            is_recurring=data.is_recurring,
            effective_from=data.effective_from,
            effective_until=data.effective_until,
            is_active=True
        )
        return self.cost_repo.save_item(item)

    def update_cost_item(self, item_id: UUID, tenant_id: UUID, data: ProgramCostItemUpdate) -> ProgramCostItem:
        item = self.cost_repo.get_by_id(item_id)
        if not item or item.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Cost item not found")
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)
            
        item.updated_at = datetime.now(timezone.utc)
        return self.cost_repo.save_item(item)

    def deactivate_cost_item(self, item_id: UUID, tenant_id: UUID) -> ProgramCostItem:
        item = self.cost_repo.get_by_id(item_id)
        if not item or item.tenant_id != tenant_id:
            raise HTTPException(status_code=404, detail="Cost item not found")
        
        item.is_active = False
        item.effective_until = date.today()
        item.updated_at = datetime.now(timezone.utc)
        return self.cost_repo.save_item(item)

    def generate_charges_for_enrollment(self, enrollment_id: UUID, tenant_id: UUID) -> List[EnrollmentCharge]:
        """
        Called when a student is enrolled. Finds active cost items and generates charges.
        """
        enrollment = self.enrollment_repo.get_by_id_and_tenant(enrollment_id, tenant_id)
        if not enrollment:
            raise HTTPException(status_code=404, detail="Enrollment not found")

        # Use enrollment creation date as the 'on_date'
        enrollment_date = enrollment.enrolled_at.date()
        
        # Get level to find the program_id
        level = self._session.get(ProgramLevelModel, enrollment.level_id)
        if not level:
            raise HTTPException(status_code=404, detail="Program level not found")

        active_items = self.cost_repo.get_active_for_level(
            program_id=level.program_id,
            level_id=enrollment.level_id,
            on_date=enrollment_date,
            tenant_id=tenant_id
        )

        charges = []
        for item in active_items:
            charge = EnrollmentCharge(
                enrollment_id=enrollment.id,
                cost_item_id=item.id,
                tenant_id=tenant_id,
                description=item.name,  # Copy existing name
                amount=item.amount,     # IMMUTABLE SNAPSHOT
                status=ChargeStatus.PENDING
            )
            charges.append(self.cost_repo.save_charge(charge))
            
        return charges
