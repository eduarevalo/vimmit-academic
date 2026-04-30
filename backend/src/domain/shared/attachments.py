from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel

class AttachmentModel(SQLModel, table=True):
    """
    Model for tracking file attachments stored in external storage (S3/Spaces).
    """
    __tablename__ = "attachments"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    
    # Original filename provided by the user
    file_name: str = Field(nullable=False)
    
    # The unique key/path in the storage bucket
    file_key: str = Field(nullable=False, index=True)
    
    # MIME type
    content_type: str = Field(nullable=False)
    
    # Size in bytes
    size: int = Field(nullable=False)
    
    # Metadata for categorization
    entity_type: Optional[str] = Field(default=None, index=True) # e.g. "LEAD", "ADMISSION"
    entity_id: Optional[UUID] = Field(default=None, index=True)   # ID of the related object
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @property
    def extension(self) -> str:
        if "." in self.file_name:
            return self.file_name.split(".")[-1]
        return ""
