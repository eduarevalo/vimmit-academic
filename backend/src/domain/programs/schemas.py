from typing import Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class ProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration: Optional[str] = None
    is_active: bool = True

class ProgramCreate(ProgramBase):
    tenant_id: UUID

class ProgramResponse(ProgramBase):
    id: UUID
    tenant_id: UUID
    tenant_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
