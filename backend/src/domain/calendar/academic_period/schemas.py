from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import date, datetime
from decimal import Decimal


# ── Calendar ────────────────────────────────────────────────────────────────

class CalendarBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    enrollment_open: Optional[date] = None
    enrollment_close: Optional[date] = None
    is_active: bool = True


class CalendarCreate(CalendarBase):
    program_id: UUID
    campus_id: UUID
    tenant_id: UUID


class CalendarUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    enrollment_open: Optional[date] = None
    enrollment_close: Optional[date] = None
    is_active: Optional[bool] = None


class CalendarResponse(CalendarBase):
    id: UUID
    program_id: UUID
    campus_id: UUID
    tenant_id: UUID
    program_name: Optional[str] = None
    campus_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Term ─────────────────────────────────────────────────────────────────────

class TermBase(BaseModel):
    name: str
    sequence: int
    start_date: date
    end_date: date
    weight_percent: Optional[Decimal] = None
    is_active: bool = True


class TermCreate(TermBase):
    calendar_id: UUID
    level_id: UUID
    tenant_id: UUID


class TermUpdate(BaseModel):
    name: Optional[str] = None
    sequence: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    weight_percent: Optional[Decimal] = None
    is_active: Optional[bool] = None


class TermResponse(TermBase):
    id: UUID
    calendar_id: UUID
    level_id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
