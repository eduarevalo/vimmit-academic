from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from api.identity.dependencies.auth_dependencies import (
    get_session,
    get_allowed_tenants,
    body_with_tenant_access,
    AllowedTenants,
)
from domain.calendar.academic_period.models import CalendarModel, TermModel
from domain.calendar.academic_period.schemas import (
    CalendarCreate, CalendarUpdate, CalendarResponse,
    TermCreate, TermUpdate, TermResponse,
)
from infrastructure.calendar.academic_period.repositories.calendar_repository import CalendarRepository, TermRepository

router = APIRouter(prefix="/academic-periods", tags=["academic-periods"])


def get_calendar_or_404(calendar_id: UUID, allowed_tenants: List[UUID], session: Session) -> CalendarModel:
    repo = CalendarRepository(session)
    for tenant_id in allowed_tenants:
        cal = repo.get_by_id_and_tenant(calendar_id, tenant_id)
        if cal:
            return cal
    raise HTTPException(status_code=404, detail="Calendar not found")


# ── Calendars ─────────────────────────────────────────────────────────────────

@router.post("", response_model=CalendarResponse, status_code=status.HTTP_201_CREATED)
async def create_calendar(
    calendar_in: CalendarCreate = Depends(
        body_with_tenant_access(CalendarCreate, required_roles=["Admin"])
    ),
    session: Session = Depends(get_session),
):
    repo = CalendarRepository(session)
    return repo.save(CalendarModel(**calendar_in.model_dump()))


@router.get("", response_model=List[CalendarResponse])
async def list_calendars(
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
):
    repo = CalendarRepository(session)
    results = []
    for tenant_id in allowed_tenants:
        results.extend(repo.list_by_tenant_enriched(tenant_id))
    return results


@router.get("/{calendar_id}", response_model=CalendarResponse)
async def get_calendar(
    calendar_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
):
    return get_calendar_or_404(calendar_id, allowed_tenants, session)


@router.put("/{calendar_id}", response_model=CalendarResponse)
async def update_calendar(
    calendar_id: UUID,
    calendar_in: CalendarUpdate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    repo = CalendarRepository(session)
    calendar = get_calendar_or_404(calendar_id, allowed_tenants, session)
    for key, value in calendar_in.model_dump(exclude_unset=True).items():
        setattr(calendar, key, value)
    calendar.updated_at = datetime.now(timezone.utc)
    return repo.save(calendar)


@router.delete("/{calendar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_calendar(
    calendar_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    repo = CalendarRepository(session)
    calendar = get_calendar_or_404(calendar_id, allowed_tenants, session)
    repo.delete(calendar)
    return None


# ── Terms (nested under calendar) ────────────────────────────────────────────

@router.get("/{calendar_id}/terms", response_model=List[TermResponse])
async def list_terms(
    calendar_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
):
    get_calendar_or_404(calendar_id, allowed_tenants, session)
    return TermRepository(session).list_by_calendar(calendar_id)


@router.post("/{calendar_id}/terms", response_model=TermResponse, status_code=status.HTTP_201_CREATED)
async def create_term(
    calendar_id: UUID,
    term_in: TermCreate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    calendar = get_calendar_or_404(calendar_id, allowed_tenants, session)
    repo = TermRepository(session)
    term = TermModel(
        calendar_id=calendar_id,
        level_id=term_in.level_id,
        tenant_id=calendar.tenant_id,
        name=term_in.name,
        sequence=term_in.sequence,
        start_date=term_in.start_date,
        end_date=term_in.end_date,
        weight_percent=term_in.weight_percent,
        is_active=term_in.is_active,
    )
    return repo.save(term)


@router.put("/{calendar_id}/terms/{term_id}", response_model=TermResponse)
async def update_term(
    calendar_id: UUID,
    term_id: UUID,
    term_in: TermUpdate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    get_calendar_or_404(calendar_id, allowed_tenants, session)
    repo = TermRepository(session)
    term = next(
        (t for t in repo.list_by_calendar(calendar_id) if t.id == term_id), None
    )
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")
    for key, value in term_in.model_dump(exclude_unset=True).items():
        setattr(term, key, value)
    term.updated_at = datetime.now(timezone.utc)
    return repo.save(term)


@router.delete("/{calendar_id}/terms/{term_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_term(
    calendar_id: UUID,
    term_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    get_calendar_or_404(calendar_id, allowed_tenants, session)
    repo = TermRepository(session)
    term = next(
        (t for t in repo.list_by_calendar(calendar_id) if t.id == term_id), None
    )
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")
    repo.delete(term)
    return None
