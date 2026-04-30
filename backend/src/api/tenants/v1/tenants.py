from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import get_current_user
from domain.tenants.models import TenantModel
from domain.tenants.schemas import TenantCreate, TenantResponse
from domain.identity.models import User

router = APIRouter(prefix="/tenants", tags=["tenants"])

@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_in: TenantCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Only super-admins can create tenants
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only super-administrators can create tenants"
        )
        
    db_tenant = TenantModel(**tenant_in.model_dump())
    session.add(db_tenant)
    session.commit()
    session.refresh(db_tenant)
    return db_tenant

@router.get("", response_model=List[TenantResponse])
async def list_tenants(
    session: Session = Depends(get_session)
):
    statement = select(TenantModel).where(TenantModel.is_active == True)
    results = session.exec(statement).all()
    return results

@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: UUID,
    session: Session = Depends(get_session)
):
    tenant = session.get(TenantModel, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
