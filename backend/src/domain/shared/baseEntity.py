from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class BaseEntity(BaseModel):
    """
    Base Entity according to DDD principles.
    Contains the common identification and tracking fields.
    """

    id: UUID = Field(default_factory=uuid4)
    tenantId: UUID
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    dynamicAttributes: dict[str, Any] = Field(default_factory=dict)

    model_config = {
        "from_attributes": True,
        "validate_assignment": True,
    }
