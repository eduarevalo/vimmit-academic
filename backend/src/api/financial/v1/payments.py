from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import get_current_user, get_allowed_tenants
from domain.identity.models import User
from domain.financial.schemas import PaymentCreate, PaymentResponse, StudentBalanceResponse
from application.financial.payment_service import PaymentService

router = APIRouter(prefix="/students", tags=["Financial - Payments"])

@router.get("/{student_id}/balance", response_model=StudentBalanceResponse)
async def get_balance(
    student_id: UUID,
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    # If no specific tenant is requested, we use the first allowed one (context-aware via header)
    tenant_id = allowed_tenants[0]
    payment_service = PaymentService(session)
    return payment_service.get_student_balance(student_id, tenant_id)

@router.post("/{student_id}/payments", response_model=PaymentResponse)
async def register_payment(
    student_id: UUID,
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    """Register a manual payment for a student and update their balance"""
    # X-Tenant-ID should have narrowed this down to 1 ID in the frontend call
    tenant_id = allowed_tenants[0]

    payment_service = PaymentService(session)
    return payment_service.register_payment(student_id, tenant_id, current_user.id, data)
