from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from uuid import UUID

from api.identity.dependencies.auth_dependencies import (
    get_session,
    get_allowed_tenants,
    AllowedTenants,
    body_with_tenant_access,
)
from domain.organization.campus.models import CampusModel
from domain.organization.campus.schemas import CampusCreate, CampusUpdate, CampusResponse
from infrastructure.organization.campus.repositories.campus_repository import CampusRepository

router = APIRouter(prefix="/campuses", tags=["campus"])


def get_campus_or_404(campus_id: UUID, allowed_tenants: List[UUID], session: Session) -> CampusModel:
    repo = CampusRepository(session)
    campus = repo.get_by_id_and_tenant(campus_id, next(
        (t for t in allowed_tenants), None
    ))
    # Try all allowed tenants
    for tenant_id in allowed_tenants:
        campus = repo.get_by_id_and_tenant(campus_id, tenant_id)
        if campus:
            return campus
    raise HTTPException(status_code=404, detail="Campus not found")


@router.post("", response_model=CampusResponse, status_code=status.HTTP_201_CREATED)
async def create_campus(
    campus_in: CampusCreate = Depends(
        body_with_tenant_access(CampusCreate, required_roles=["Admin"])
    ),
    session: Session = Depends(get_session),
):
    repo = CampusRepository(session)
    if repo.code_exists(campus_in.tenant_id, campus_in.code):
        raise HTTPException(status_code=409, detail="Campus code already exists for this tenant")
    return repo.save(CampusModel(**campus_in.model_dump()))


@router.get("", response_model=List[CampusResponse])
async def list_campuses(
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
):
    repo = CampusRepository(session)
    results = repo.list_by_tenants(allowed_tenants)

    campuses = []
    for campus, tenant_name in results:
        data = CampusResponse.model_validate(campus)
        data.tenant_name = tenant_name
        campuses.append(data)
    return campuses


@router.get("/{campus_id}", response_model=CampusResponse)
async def get_campus(
    campus_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
):
    return get_campus_or_404(campus_id, allowed_tenants, session)


@router.put("/{campus_id}", response_model=CampusResponse)
async def update_campus(
    campus_id: UUID,
    campus_in: CampusUpdate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    repo = CampusRepository(session)
    campus = get_campus_or_404(campus_id, allowed_tenants, session)
    if campus_in.code and campus_in.code != campus.code:
        if repo.code_exists(campus.tenant_id, campus_in.code, exclude_id=campus_id):
            raise HTTPException(status_code=409, detail="Campus code already exists for this tenant")
    update_data = campus_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(campus, key, value)
    return repo.save(campus)


@router.delete("/{campus_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campus(
    campus_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    repo = CampusRepository(session)
    campus = get_campus_or_404(campus_id, allowed_tenants, session)
    repo.delete(campus)
    return None
