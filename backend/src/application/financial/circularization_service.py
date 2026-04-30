from uuid import UUID
from datetime import datetime, timezone
from sqlmodel import Session
from fastapi import HTTPException

from domain.financial.models import CircularizationRun, CircularizationStatus
from domain.tenants.models import TenantModel
from domain.identity.models import User
from infrastructure.financial.repositories.cost_repository import CostRepository
from application.financial.payment_service import PaymentService
from infrastructure.email.email_service import EmailService


class CircularizationService:
    def __init__(self, session: Session):
        self._session = session
        self.cost_repo = CostRepository(session)
        self.payment_service = PaymentService(session)
        self.email_service = EmailService()

    async def run_circularization(self, tenant_id: UUID, initiated_by: UUID) -> CircularizationRun:
        tenant = self._session.get(TenantModel, tenant_id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
            
        run = CircularizationRun(
            tenant_id=tenant_id,
            initiated_by=initiated_by,
            status=CircularizationStatus.RUNNING
        )
        self._session.add(run)
        self._session.commit()
        self._session.refresh(run)

        try:
            # 1. Get all students that have pending or partially paid charges
            students_with_balance = self.cost_repo.get_all_students_with_balance(tenant_id)
            run.total_students = len(students_with_balance)

            emails_sent = 0
            for student_id in students_with_balance:
                # 2. Get detailed balance
                balance_summary = self.payment_service.get_student_balance(student_id, tenant_id)
                
                # Double check to ensure they actually have a positive balance
                # They might have unapplied payments that cover the pending charges
                if balance_summary.balance > 0:
                    student = self._session.get(User, student_id)
                    
                    # 3. Send email statement
                    await self.email_service.send_balance_statement(
                        to_email=student.email,
                        full_name=balance_summary.student_name,
                        tenant_slug=tenant.slug,
                        tenant_name=tenant.name,
                        balance_summary=balance_summary
                    )
                    emails_sent += 1

            run.emails_sent = emails_sent
            run.status = CircularizationStatus.COMPLETED
            
        except Exception as e:
            run.status = CircularizationStatus.FAILED
            run.notes = str(e)
            
        finally:
            run.completed_at = datetime.now(timezone.utc)
            self._session.add(run)
            self._session.commit()
            self._session.refresh(run)

        return run
