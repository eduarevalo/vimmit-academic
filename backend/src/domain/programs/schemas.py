from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from domain.programs.models import ProgramType


# ── Program ──────────────────────────────────────────────────────────────────

class ProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    program_type: ProgramType
    total_levels: int = 1
    level_label: str = "Level"
    degree_title: Optional[str] = None
    credits_per_level: Optional[int] = None
    is_active: bool = True


class ProgramCreate(ProgramBase):
    tenant_id: UUID


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    total_levels: Optional[int] = None
    level_label: Optional[str] = None
    degree_title: Optional[str] = None
    credits_per_level: Optional[int] = None
    is_active: Optional[bool] = None


class ProgramResponse(ProgramBase):
    id: UUID
    tenant_id: UUID
    tenant_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── ProgramLevel ──────────────────────────────────────────────────────────────

class ProgramLevelBase(BaseModel):
    name: str
    sequence: int
    is_active: bool = True


class ProgramLevelCreate(ProgramLevelBase):
    program_id: UUID
    tenant_id: UUID


class ProgramLevelUpdate(BaseModel):
    name: Optional[str] = None
    sequence: Optional[int] = None
    is_active: Optional[bool] = None


class ProgramLevelResponse(ProgramLevelBase):
    id: UUID
    program_id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
