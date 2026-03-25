from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(UserBase):
    hashed_password: str

from typing import List

class TenantSummary(BaseModel):
    id: UUID
    name: str
    slug: str

class MembershipOut(BaseModel):
    tenant_id: UUID
    tenant_name: str
    role_id: UUID
    role_name: str

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    is_active: bool
    memberships: List[MembershipOut] = []
    
    class Config:
        from_attributes = True
