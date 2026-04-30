from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class RegistrationIntentCreate(BaseModel):
    email: EmailStr
    fullName: str
    phone: Optional[str] = None
    interests: List[str] = []

class RegistrationIntentUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None

class LeadInteractionResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    interaction_type: str
    details: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RegistrationIntentResponse(BaseModel):
    id: UUID
    email: EmailStr
    fullName: str
    phone: Optional[str] = None
    interests: List[str] = []
    interestsNames: List[str] = []
    status: str
    assigned_to: Optional[UUID] = None
    notes: Optional[str] = None
    interactions: List[LeadInteractionResponse] = []
    tenantId: UUID
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
