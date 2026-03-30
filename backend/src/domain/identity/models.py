from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlmodel import Field, Relationship, SQLModel

class InvitationStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    CANCELLED = "CANCELLED"

class UserRoleLink(SQLModel, table=True):
    __tablename__ = "user_role_links"

    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    role_id: UUID = Field(foreign_key="roles.id", primary_key=True)
    tenant_id: UUID = Field(primary_key=True, index=True)

    # Relationships
    user: "User" = Relationship(back_populates="memberships")

class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    name: str = Field(index=True, nullable=False)
    description: Optional[str] = Field(default=None)

    # Relationships
    users: List["User"] = Relationship(back_populates="roles", link_model=UserRoleLink, sa_relationship_kwargs={"overlaps": "user"})

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    is_active: bool = Field(default=True)

    first_name: Optional[str] = Field(default=None)
    last_name: Optional[str] = Field(default=None)
    phone: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    roles: List[Role] = Relationship(back_populates="users", link_model=UserRoleLink, sa_relationship_kwargs={"overlaps": "user,memberships"})
    memberships: List[UserRoleLink] = Relationship(back_populates="user", sa_relationship_kwargs={"overlaps": "roles,users"})

class Invitation(SQLModel, table=True):
    __tablename__ = "invitations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, nullable=False)
    tenant_id: UUID = Field(index=True, nullable=False)
    role_id: UUID = Field(foreign_key="roles.id", nullable=False)
    token: str = Field(unique=True, index=True, nullable=False)
    status: InvitationStatus = Field(default=InvitationStatus.PENDING)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    accepted_at: Optional[datetime] = Field(default=None)

    # Relationships
    role: Role = Relationship()
