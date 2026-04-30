from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import get_current_user, get_allowed_tenants
from application.administrative.student_directory_service import StudentDirectoryService
from domain.administrative.students.schemas import StudentSummaryResponse, StudentProfileResponse
from domain.administrative.enrollment.schemas import EnrollmentResponse

router = APIRouter(prefix="/students", tags=["Administrative - Students Hub"])

@router.get("", response_model=List[StudentSummaryResponse])
async def list_students(
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    service = StudentDirectoryService(session)
    return service.get_student_directory(allowed_tenants)


@router.get("/{student_id}", response_model=StudentProfileResponse)
async def get_student_profile(
    student_id: UUID,
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    service = StudentDirectoryService(session)
    return service.get_student_profile(student_id, allowed_tenants)


@router.get("/{student_id}/enrollments", response_model=List[EnrollmentResponse])
async def get_student_enrollments(
    student_id: UUID,
    allowed_tenants: List[UUID] = Depends(get_allowed_tenants),
    session: Session = Depends(get_session)
):
    service = StudentDirectoryService(session)
    return service.get_student_enrollments(student_id, allowed_tenants)
