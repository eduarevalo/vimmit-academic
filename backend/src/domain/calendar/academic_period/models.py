import enum
from typing import Optional
from sqlmodel import SQLModel, Field, Column, Enum as SAEnum
from uuid import UUID, uuid4
from datetime import date, datetime, timezone
from decimal import Decimal


class CalendarModel(SQLModel, table=True):
    __tablename__ = "calendars"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    program_id: UUID = Field(index=True, foreign_key="programs.id")
    campus_id: UUID = Field(index=True, foreign_key="campuses.id")
    tenant_id: UUID = Field(index=True)   # denormalized, cross-context ref
    name: str                                                        # e.g. "School Year 2025-2026"
    start_date: date
    end_date: date
    enrollment_open: Optional[date] = None
    enrollment_close: Optional[date] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TermModel(SQLModel, table=True):
    __tablename__ = "terms"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    calendar_id: UUID = Field(index=True, foreign_key="calendars.id")
    level_id: UUID = Field(index=True, foreign_key="program_levels.id")
    tenant_id: UUID = Field(index=True)   # denormalized, cross-context ref
    name: str                                                        # e.g. "Bimestre 1", "Parcial 2"
    sequence: int                                                    # order within this level+calendar
    start_date: date
    end_date: date
    weight_percent: Optional[Decimal] = Field(default=None, decimal_places=2, max_digits=5)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
