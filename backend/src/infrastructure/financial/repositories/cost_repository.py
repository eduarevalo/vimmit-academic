from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from datetime import date
from sqlmodel import Session, select

from domain.financial.models import ProgramCostItem, EnrollmentCharge, ChargeStatus
from domain.administrative.enrollment.models import EnrollmentModel


class CostRepository:
    def __init__(self, session: Session):
        self._session = session

    # ── Cost Items ────────────────────────────────────────────────────────────

    def get_by_id(self, item_id: UUID) -> Optional[ProgramCostItem]:
        return self._session.get(ProgramCostItem, item_id)

    def list_by_program(
        self,
        tenant_id: UUID,
        program_id: Optional[UUID] = None,
        level_id: Optional[UUID] = None,
        active_only: bool = True
    ) -> List[ProgramCostItem]:
        stmt = select(ProgramCostItem).where(ProgramCostItem.tenant_id == tenant_id)
        if program_id:
            stmt = stmt.where(ProgramCostItem.program_id == program_id)
        if level_id:
            stmt = stmt.where(ProgramCostItem.level_id == level_id)
        if active_only:
            stmt = stmt.where(ProgramCostItem.is_active == True)
        return list(self._session.exec(stmt).all())

    def get_active_for_level(
        self,
        program_id: UUID,
        level_id: UUID,
        on_date: date,
        tenant_id: UUID
    ) -> List[ProgramCostItem]:
        """
        Returns all cost items applicable to a level on a specific date.
        Includes level-specific AND program-wide items (level_id is NULL).
        """
        stmt = select(ProgramCostItem).where(
            ProgramCostItem.tenant_id == tenant_id,
            ProgramCostItem.program_id == program_id,
            ProgramCostItem.is_active == True,
            ProgramCostItem.effective_from <= on_date,
        ).where(
            (ProgramCostItem.effective_until == None) |
            (ProgramCostItem.effective_until >= on_date)
        ).where(
            (ProgramCostItem.level_id == level_id) |
            (ProgramCostItem.level_id == None)
        )
        return list(self._session.exec(stmt).all())

    def save_item(self, item: ProgramCostItem) -> ProgramCostItem:
        self._session.add(item)
        self._session.commit()
        self._session.refresh(item)
        return item

    # ── Enrollment Charges ────────────────────────────────────────────────────

    def save_charge(self, charge: EnrollmentCharge) -> EnrollmentCharge:
        self._session.add(charge)
        self._session.commit()
        self._session.refresh(charge)
        return charge

    def get_charges_for_enrollment(self, enrollment_id: UUID) -> List[EnrollmentCharge]:
        stmt = select(EnrollmentCharge).where(
            EnrollmentCharge.enrollment_id == enrollment_id
        )
        return list(self._session.exec(stmt).all())

    def get_charges_for_student(self, student_id: UUID, tenant_id: UUID) -> List[EnrollmentCharge]:
        """All charges for a student across all their enrollments."""
        stmt = select(EnrollmentCharge).join(
            EnrollmentModel, EnrollmentCharge.enrollment_id == EnrollmentModel.id
        ).where(
            EnrollmentModel.student_id == student_id,
            EnrollmentCharge.tenant_id == tenant_id,
            EnrollmentCharge.status.not_in([ChargeStatus.CANCELLED, ChargeStatus.WAIVED])
        ).order_by(EnrollmentCharge.created_at.asc())  # oldest first for FIFO
        return list(self._session.exec(stmt).all())

    def update_charge(self, charge: EnrollmentCharge) -> EnrollmentCharge:
        self._session.add(charge)
        self._session.commit()
        self._session.refresh(charge)
        return charge

    def get_all_students_with_balance(self, tenant_id: UUID) -> List[UUID]:
        """Returns student_ids who have at least one pending/partial charge."""
        stmt = select(EnrollmentModel.student_id).join(
            EnrollmentCharge, EnrollmentCharge.enrollment_id == EnrollmentModel.id
        ).where(
            EnrollmentModel.tenant_id == tenant_id,
            EnrollmentCharge.status.in_([ChargeStatus.PENDING, ChargeStatus.PARTIALLY_PAID])
        ).distinct()
        return list(self._session.exec(stmt).all())
