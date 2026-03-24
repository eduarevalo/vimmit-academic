from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Column, JSON

class RegistrationIntentModel(SQLModel, table=True):
    __tablename__ = "registration_intents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    email: str = Field(index=True, nullable=False)
    full_name: str = Field(nullable=False)
    phone: Optional[str] = Field(default=None)
    interests: List[str] = Field(default=[], sa_column=Column(JSON))
    status: str = Field(default="PENDING")
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
