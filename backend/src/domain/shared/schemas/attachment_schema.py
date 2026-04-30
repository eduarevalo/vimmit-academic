from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

class AttachmentResponse(BaseModel):
    """
    Response schema for file attachments.
    """
    id: UUID
    fileName: str = Field(alias="file_name")
    contentType: str = Field(alias="content_type")
    size: int
    entityType: Optional[str] = Field(None, alias="entity_type")
    entityId: Optional[UUID] = Field(None, alias="entity_id")
    createdAt: datetime = Field(alias="created_at")
    downloadUrl: Optional[str] = Field(None, alias="download_url")

    model_config = {
        "populate_by_name": True,
        "from_attributes": True
    }
