from pydantic import BaseModel, EmailStr
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class RegistrationIntentCreate(BaseModel):
    email: EmailStr
    fullName: str
    phone: Optional[str] = None
    interests: List[str] = []
    tenantId: UUID

class RegistrationIntentResponse(BaseModel):
    id: UUID
    email: EmailStr
    fullName: str
    phone: Optional[str] = None
    interests: List[str] = []
    status: str
    tenantId: UUID
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
