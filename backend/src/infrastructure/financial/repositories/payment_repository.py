from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from sqlmodel import Session, select, func

from domain.financial.models import Payment


class PaymentRepository:
    def __init__(self, session: Session):
        self._session = session

    def save(self, payment: Payment) -> Payment:
        self._session.add(payment)
        self._session.commit()
        self._session.refresh(payment)
        return payment

    def get_by_id(self, payment_id: UUID) -> Optional[Payment]:
        return self._session.get(Payment, payment_id)

    def list_by_student(self, student_id: UUID, tenant_id: UUID) -> List[Payment]:
        stmt = select(Payment).where(
            Payment.student_id == student_id,
            Payment.tenant_id == tenant_id
        ).order_by(Payment.paid_at.asc())
        return list(self._session.exec(stmt).all())

    def list_by_tenant(self, tenant_id: UUID) -> List[Payment]:
        stmt = select(Payment).where(
            Payment.tenant_id == tenant_id
        ).order_by(Payment.paid_at.desc())
        return list(self._session.exec(stmt).all())

    def get_total_paid(self, student_id: UUID, tenant_id: UUID) -> Decimal:
        """Sum of all payments for a student."""
        stmt = select(func.sum(Payment.amount)).where(
            Payment.student_id == student_id,
            Payment.tenant_id == tenant_id
        )
        result = self._session.exec(stmt).first()
        return Decimal(result or 0)
