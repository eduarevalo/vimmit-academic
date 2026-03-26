from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from datetime import datetime

from api.identity.dependencies.auth_dependencies import (
    get_session,
    get_allowed_tenants,
    body_with_tenant_access,
    AllowedTenants,
)
from domain.academic.programs.models import ProgramModel
from domain.academic.programs.schemas import ProgramCreate, ProgramUpdate, ProgramResponse
from infrastructure.academic.programs.repositories.program_repository import ProgramRepository

router = APIRouter(prefix="/programs", tags=["programs"])


def get_program_or_404(
    program_id: UUID,
    allowed_tenants: List[UUID],
    session: Session,
) -> ProgramModel:
    """Load a program only if it belongs to one of the user's authorized tenants."""
    repo = ProgramRepository(session)
    program = repo.get_by_id_in_tenants(program_id, allowed_tenants)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program


@router.post("", response_model=ProgramResponse, status_code=status.HTTP_201_CREATED)
async def create_program(
    program_in: ProgramCreate = Depends(
        body_with_tenant_access(ProgramCreate, required_roles=["Admin"])
    ),
    session: Session = Depends(get_session),
):
    """Create a new program. Requires Admin role in the selected institution."""
    repo = ProgramRepository(session)
    db_program = ProgramModel(**program_in.model_dump())
    return repo.save(db_program)


@router.get("", response_model=List[ProgramResponse])
async def list_programs(
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
):
    """List all active programs across all authorized institutions."""
    repo = ProgramRepository(session)
    results = repo.list_by_tenants(allowed_tenants)

    programs = []
    for program, tenant_name in results:
        p_data = ProgramResponse.model_validate(program)
        p_data.tenant_name = tenant_name
        programs.append(p_data)

    return programs


@router.get("/public/{tenant_slug}", response_model=List[ProgramResponse])
async def list_public_programs(
    tenant_slug: str,
    session: Session = Depends(get_session),
):
    """List all active programs for a given tenant slug publicly."""
    repo = ProgramRepository(session)
    db_programs = repo.list_by_tenant_slug(tenant_slug)

    programs = []
    for program in db_programs:
        programs.append(ProgramResponse.model_validate(program))

    return programs


@router.get("/{program_id}", response_model=ProgramResponse)
async def get_program(
    program_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
):
    return get_program_or_404(program_id, allowed_tenants, session)


@router.put("/{program_id}", response_model=ProgramResponse)
async def update_program(
    program_id: UUID,
    program_in: ProgramUpdate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    repo = ProgramRepository(session)
    db_program = get_program_or_404(program_id, allowed_tenants, session)

    update_data = program_in.model_dump(exclude_unset=True, exclude={"tenant_id"})
    for key, value in update_data.items():
        setattr(db_program, key, value)

    db_program.updated_at = datetime.utcnow()
    return repo.save(db_program)


@router.delete("/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_program(
    program_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    repo = ProgramRepository(session)
    program = get_program_or_404(program_id, allowed_tenants, session)
    repo.delete(program)
    return None
