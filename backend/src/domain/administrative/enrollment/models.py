import enum
from typing import Optional
from sqlmodel import SQLModel, Field, Column, Enum as SAEnum
from uuid import UUID, uuid4
from datetime import datetime, timezone


class EnrollmentStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    GRADUATED = "GRADUATED"


class EnrollmentModel(SQLModel, table=True):
    __tablename__ = "enrollments"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_id: UUID = Field(index=True)
    level_id: UUID = Field(index=True)
    calendar_id: UUID = Field(index=True)
    tenant_id: UUID = Field(index=True)   # denormalized
    status: EnrollmentStatus = Field(
        default=EnrollmentStatus.PENDING,
        sa_column=Column(SAEnum(EnrollmentStatus), nullable=False),
    )
    notes: Optional[str] = None
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
