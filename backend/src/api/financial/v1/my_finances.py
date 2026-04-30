from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import get_current_user
from domain.identity.models import User
from domain.financial.schemas import StudentBalanceResponse
from domain.administrative.enrollment.models import EnrollmentModel
from application.financial.payment_service import PaymentService
from infrastructure.administrative.enrollment.repositories.enrollment_repository import EnrollmentRepository

router = APIRouter(prefix="/my/finances", tags=["Financial - Student Portal"])

@router.get("/balance", response_model=StudentBalanceResponse)
async def get_my_balance(
    current_user: User = Depends(get_current_user),
    tenant_id: Optional[UUID] = None,
    session: Session = Depends(get_session)
):
    """Get the currently logged-in student's balance"""
    enroll_repo = EnrollmentRepository(session)
    enrollments = enroll_repo.list_by_student(current_user.id)
    
    if not enrollments:
        raise HTTPException(status_code=403, detail="Student has no active enrollments")
    
    # If no tenant_id provided, use the first institution where they are enrolled
    if not tenant_id:
        target_tenant = enrollments[0].tenant_id
    else:
        # Verify enrollment in requested tenant
        if not any(e.tenant_id == tenant_id for e in enrollments):
            raise HTTPException(status_code=403, detail="Not enrolled in this institution")
        target_tenant = tenant_id

    payment_service = PaymentService(session)
    return payment_service.get_student_balance(current_user.id, target_tenant)
