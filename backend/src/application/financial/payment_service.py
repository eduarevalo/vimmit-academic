from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime, timezone
from decimal import Decimal
from sqlmodel import Session
from fastapi import HTTPException

from domain.financial.models import Payment, ChargeStatus, PaymentMethod
from domain.financial.schemas import PaymentCreate, StudentBalanceResponse, EnrollmentChargeResponse, PaymentResponse
from infrastructure.financial.repositories.payment_repository import PaymentRepository
from infrastructure.financial.repositories.cost_repository import CostRepository
from domain.identity.models import User
from domain.tenants.models import TenantModel


class PaymentService:
    def __init__(self, session: Session):
        self._session = session
        self.payment_repo = PaymentRepository(session)
        self.cost_repo = CostRepository(session)

    def register_payment(self, student_id: UUID, tenant_id: UUID, registered_by: UUID, data: PaymentCreate) -> Payment:
        if data.amount <= 0:
            raise HTTPException(status_code=400, detail="Payment amount must be greater than zero")

        payment = Payment(
            student_id=student_id,
            tenant_id=tenant_id,
            registered_by=registered_by,
            amount=data.amount,
            payment_method=data.payment_method,
            reference=data.reference,
            notes=data.notes,
            paid_at=data.paid_at or datetime.now(timezone.utc)
        )
        saved_payment = self.payment_repo.save(payment)
        
        # After registering payment, update charge statuses based on new balance
        self.update_charge_statuses(student_id, tenant_id)
        
        return saved_payment

    def get_student_balance(self, student_id: UUID, tenant_id: UUID) -> StudentBalanceResponse:
        student = self._session.get(User, student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
            
        tenant = self._session.get(TenantModel, tenant_id)
        currency = tenant.currency if tenant else "USD"

        charges = self.cost_repo.get_charges_for_student(student_id, tenant_id)
        payments = self.payment_repo.list_by_student(student_id, tenant_id)

        total_charged = sum(charge.amount for charge in charges)
        total_paid = sum(payment.amount for payment in payments)
        balance = total_charged - total_paid

        return StudentBalanceResponse(
            student_id=student_id,
            student_name=f"{student.first_name} {student.last_name}".strip(),
            student_email=student.email,
            tenant_id=tenant_id,
            tenant_name=tenant.name if tenant else "Unknown",
            currency=currency,
            total_charged=total_charged,
            total_paid=total_paid,
            balance=balance,
            charges=[EnrollmentChargeResponse.model_validate(c) for c in charges],
            payments=[PaymentResponse.model_validate(p) for p in payments]
        )

    def update_charge_statuses(self, student_id: UUID, tenant_id: UUID) -> None:
        """
        Recalculates which charges are paid, partially paid, or pending based on total paid amount.
        Distributes total_paid across charges acting in chronological order (FIFO).
        """
        charges_in_order = self.cost_repo.get_charges_for_student(student_id, tenant_id)
        total_paid = self.payment_repo.get_total_paid(student_id, tenant_id)

        remaining_paid = total_paid

        for charge in charges_in_order:
            if remaining_paid >= charge.amount:
                # Fully paid
                if charge.status != ChargeStatus.PAID:
                    charge.status = ChargeStatus.PAID
                    self.cost_repo.update_charge(charge)
                remaining_paid -= charge.amount
            elif remaining_paid > 0:
                # Partially paid
                if charge.status != ChargeStatus.PARTIALLY_PAID:
                    charge.status = ChargeStatus.PARTIALLY_PAID
                    self.cost_repo.update_charge(charge)
                remaining_paid = Decimal('0.00')
            else:
                # Pending
                if charge.status != ChargeStatus.PENDING:
                    charge.status = ChargeStatus.PENDING
                    self.cost_repo.update_charge(charge)
