from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import get_current_user, get_allowed_tenants
from domain.financial.schemas import ProgramCostItemCreate, ProgramCostItemUpdate, ProgramCostItemResponse
from application.financial.cost_service import CostService

router = APIRouter(prefix="/costs", tags=["Financial - Costs"])

@router.get("", response_model=List[ProgramCostItemResponse])
async def list_costs(
    program_id: Optional[UUID] = None,
    level_id: Optional[UUID] = None,
    # Ideally should be passed in headers, but for simplicity taking first allowed tenant
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    if not allowed_tenants:
        raise HTTPException(status_code=403, detail="No tenants available")
    tenant_id = allowed_tenants[0]
    
    cost_service = CostService(session)
    return cost_service.list_cost_items(tenant_id, program_id, level_id)

@router.post("", response_model=ProgramCostItemResponse)
async def create_cost(
    data: ProgramCostItemCreate,
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    if not allowed_tenants:
        raise HTTPException(status_code=403, detail="No tenants available")
    tenant_id = allowed_tenants[0]
    
    cost_service = CostService(session)
    return cost_service.create_cost_item(tenant_id, data)

@router.put("/{item_id}", response_model=ProgramCostItemResponse)
async def update_cost(
    item_id: UUID,
    data: ProgramCostItemUpdate,
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    if not allowed_tenants:
        raise HTTPException(status_code=403, detail="No tenants available")
    tenant_id = allowed_tenants[0]
    
    cost_service = CostService(session)
    return cost_service.update_cost_item(item_id, tenant_id, data)

@router.delete("/{item_id}", response_model=ProgramCostItemResponse)
async def deactivate_cost(
    item_id: UUID,
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    if not allowed_tenants:
        raise HTTPException(status_code=403, detail="No tenants available")
    tenant_id = allowed_tenants[0]
    
    cost_service = CostService(session)
    return cost_service.deactivate_cost_item(item_id, tenant_id)
