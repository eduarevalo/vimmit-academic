import enum
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Column, JSON, Relationship, Enum as SAEnum


class AdmissionStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFYING = "VERIFYING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    ENROLLED = "ENROLLED"


class AdmissionApplicationModel(SQLModel, table=True):
    __tablename__ = "admission_applications"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    campus_id: Optional[UUID] = Field(default=None, index=True, foreign_key="campuses.id")
    program_id: Optional[UUID] = Field(default=None, index=True, foreign_key="programs.id")
    calendar_id: Optional[UUID] = Field(default=None, index=True, foreign_key="calendars.id")
    
    # Applicant Info
    full_name: str = Field(nullable=False)
    email: str = Field(index=True, nullable=False)
    phone: str = Field(nullable=False)
    
    status: AdmissionStatus = Field(
        default=AdmissionStatus.PENDING,
        sa_column=Column(SAEnum(AdmissionStatus), nullable=False)
    )
    
    notes: Optional[str] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # We will use AttachmentModel with entity_type="ADMISSION" and entity_id=this_id
