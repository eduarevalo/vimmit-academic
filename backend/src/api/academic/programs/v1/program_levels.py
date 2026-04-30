from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import (
    get_allowed_tenants,
    body_with_tenant_access,
    AllowedTenants,
)
from domain.academic.programs.models import ProgramModel, ProgramLevelModel
from domain.academic.programs.schemas import ProgramLevelCreate, ProgramLevelUpdate, ProgramLevelResponse
from infrastructure.academic.programs.repositories.program_repository import ProgramRepository

router = APIRouter(prefix="/programs", tags=["program-levels"])


def get_program_or_403(program_id: UUID, allowed_tenants: List[UUID], session: Session) -> ProgramModel:
    repo = ProgramRepository(session)
    program = repo.get_by_id_in_tenants(program_id, allowed_tenants)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program


@router.get("/{program_id}/levels", response_model=List[ProgramLevelResponse])
async def list_levels(
    program_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
):
    get_program_or_403(program_id, allowed_tenants, session)
    levels = session.exec(
        select(ProgramLevelModel)
        .where(ProgramLevelModel.program_id == program_id)
        .order_by(ProgramLevelModel.sequence)
    ).all()
    return levels


@router.post("/{program_id}/levels", response_model=ProgramLevelResponse, status_code=status.HTTP_201_CREATED)
async def create_level(
    program_id: UUID,
    level_in: ProgramLevelCreate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    program = get_program_or_403(program_id, allowed_tenants, session)
    level = ProgramLevelModel(
        program_id=program_id,
        tenant_id=program.tenant_id,
        name=level_in.name,
        sequence=level_in.sequence,
        is_active=level_in.is_active,
    )
    session.add(level)
    session.commit()
    session.refresh(level)
    return level


@router.put("/{program_id}/levels/{level_id}", response_model=ProgramLevelResponse)
async def update_level(
    program_id: UUID,
    level_id: UUID,
    level_in: ProgramLevelUpdate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    get_program_or_403(program_id, allowed_tenants, session)
    level = session.exec(
        select(ProgramLevelModel).where(
            ProgramLevelModel.id == level_id,
            ProgramLevelModel.program_id == program_id,
        )
    ).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    update_data = level_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(level, key, value)
    level.updated_at = datetime.now(timezone.utc)
    session.add(level)
    session.commit()
    session.refresh(level)
    return level


@router.delete("/{program_id}/levels/{level_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_level(
    program_id: UUID,
    level_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    get_program_or_403(program_id, allowed_tenants, session)
    level = session.exec(
        select(ProgramLevelModel).where(
            ProgramLevelModel.id == level_id,
            ProgramLevelModel.program_id == program_id,
        )
    ).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    session.delete(level)
    session.commit()
    return None
