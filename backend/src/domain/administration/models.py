from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel, Column, JSON, Relationship

class RegistrationIntentModel(SQLModel, table=True):
    __tablename__ = "registration_intents"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    email: str = Field(index=True, nullable=False)
    full_name: str = Field(nullable=False)
    phone: Optional[str] = Field(default=None)
    interests: List[str] = Field(default=[], sa_column=Column(JSON))
    status: str = Field(default="PENDING")
    
    # Commercial Tracking
    assigned_to: Optional[UUID] = Field(default=None, foreign_key="users.id", nullable=True)
    notes: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship to tracking interactions
    interactions: List["LeadInteractionModel"] = Relationship(
        back_populates="intent",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "LeadInteractionModel.created_at.desc()"}
    )

class LeadInteractionModel(SQLModel, table=True):
    __tablename__ = "registration_intent_interactions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    intent_id: UUID = Field(foreign_key="registration_intents.id", index=True)
    user_id: Optional[UUID] = Field(default=None, foreign_key="users.id")
    
    # E.g. "STATUS_CHANGE", "ASSIGNMENT", "NOTE"
    interaction_type: str = Field(nullable=False)
    
    # Details or the note body
    details: str = Field(nullable=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    intent: RegistrationIntentModel = Relationship(back_populates="interactions")
