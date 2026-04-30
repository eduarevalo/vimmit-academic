from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from domain.administrative.enrollment.models import EnrollmentStatus


class EnrollmentBase(BaseModel):
    status: EnrollmentStatus = EnrollmentStatus.PENDING
    notes: Optional[str] = None


class EnrollmentCreate(BaseModel):
    student_id: UUID
    level_id: UUID
    calendar_id: UUID
    tenant_id: UUID
    notes: Optional[str] = None


class EnrollmentUpdate(BaseModel):
    status: Optional[EnrollmentStatus] = None
    notes: Optional[str] = None


class EnrollmentResponse(EnrollmentBase):
    id: UUID
    student_id: UUID
    level_id: UUID
    calendar_id: UUID
    tenant_id: UUID
    enrolled_at: datetime
    updated_at: datetime
    
    # Joined fields for UI
    student_name: Optional[str] = None
    program_name: Optional[str] = None
    level_name: Optional[str] = None
    calendar_name: Optional[str] = None
    tenant_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
