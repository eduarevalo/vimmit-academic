from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import get_current_user, get_allowed_tenants
from domain.identity.models import User
from domain.financial.models import CircularizationRun
from domain.financial.schemas import CircularizationRunResponse
from application.financial.circularization_service import CircularizationService

router = APIRouter(prefix="/circularization", tags=["Financial - Circularization"])

@router.post("/run", response_model=CircularizationRunResponse)
async def run_circularization(
    current_user: User = Depends(get_current_user),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    """Trigger a manual circularization process"""
    if not allowed_tenants:
        raise HTTPException(status_code=403, detail="No tenants available")
    tenant_id = allowed_tenants[0]

    service = CircularizationService(session)
    return await service.run_circularization(tenant_id, current_user.id)

@router.get("/history", response_model=List[CircularizationRunResponse])
async def get_circularization_history(
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    """Get history of circularization runs"""
    if not allowed_tenants:
        raise HTTPException(status_code=403, detail="No tenants available")
    tenant_id = allowed_tenants[0]

    stmt = select(CircularizationRun).where(
        CircularizationRun.tenant_id == tenant_id
    ).order_by(CircularizationRun.run_date.desc())
    
    return list(session.exec(stmt).all())
