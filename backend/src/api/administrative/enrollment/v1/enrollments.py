from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from uuid import UUID

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import (
    get_allowed_tenants,
    get_current_user,
    AllowedTenants,
    body_with_tenant_access,
)
from domain.administrative.enrollment.models import EnrollmentModel
from domain.administrative.enrollment.schemas import EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse
from domain.identity.models import User
from infrastructure.administrative.enrollment.repositories.enrollment_repository import EnrollmentRepository

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


def get_enrollment_or_404(enrollment_id: UUID, allowed_tenants: List[UUID], session: Session) -> EnrollmentModel:
    repo = EnrollmentRepository(session)
    for tenant_id in allowed_tenants:
        enrollment = repo.get_by_id_and_tenant(enrollment_id, tenant_id)
        if enrollment:
            return enrollment
    raise HTTPException(status_code=404, detail="Enrollment not found")


@router.post("", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    enrollment_in: EnrollmentCreate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    if enrollment_in.tenant_id not in allowed_tenants:
        raise HTTPException(status_code=403, detail="Forbidden")
    repo = EnrollmentRepository(session)
    # Prevent duplicate enrollment
    existing = repo.get_by_student_level_calendar(
        enrollment_in.student_id, enrollment_in.level_id, enrollment_in.calendar_id
    )
    if existing:
        raise HTTPException(status_code=409, detail="Student is already enrolled in this level and calendar")
    return repo.save(EnrollmentModel(**enrollment_in.model_dump()))


@router.get("", response_model=List[EnrollmentResponse])
async def list_enrollments(
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
    calendar_id: UUID | None = None,
    status: str | None = None,
):
    repo = EnrollmentRepository(session)
    results = []
    for tenant_id in allowed_tenants:
        enrollments = repo.list_detailed_enrollments(tenant_id, calendar_id, status)
        results.extend([EnrollmentResponse(**e) for e in enrollments])
    return results


@router.get("/me", response_model=List[EnrollmentResponse])
async def get_my_enrollments(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Returns all enrollments for the currently authenticated student."""
    repo = EnrollmentRepository(session)
    return repo.list_by_student(current_user.id)


@router.put("/{enrollment_id}", response_model=EnrollmentResponse)
async def update_enrollment(
    enrollment_id: UUID,
    enrollment_in: EnrollmentUpdate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    repo = EnrollmentRepository(session)
    enrollment = get_enrollment_or_404(enrollment_id, allowed_tenants, session)
    for key, value in enrollment_in.model_dump(exclude_unset=True).items():
        setattr(enrollment, key, value)
    return repo.save(enrollment)


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_enrollment(
    enrollment_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"])),
):
    repo = EnrollmentRepository(session)
    enrollment = get_enrollment_or_404(enrollment_id, allowed_tenants, session)
    session.delete(enrollment)
    session.commit()
    return None
