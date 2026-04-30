import uuid
from typing import BinaryIO, List, Optional, Union
from uuid import UUID
from sqlmodel import Session, select
from datetime import datetime, timezone

from domain.shared.attachments import AttachmentModel
from infrastructure.storage.protocol import StorageServiceInterface
from infrastructure.storage.s3 import S3StorageService

class AttachmentService:
    """
    Application service for managing file attachments.
    Orchestrates storage in DigitalOcean Spaces and metadata persistence in SQLModel.
    """
    def __init__(self, session: Session, storage: Optional[StorageServiceInterface] = None):
        self.session = session
        self.storage = storage or S3StorageService()

    async def upload_attachment(
        self, 
        tenant_id: UUID, 
        file_name: str, 
        file_obj: Union[BinaryIO, bytes], 
        content_type: str,
        size: int,
        entity_type: Optional[str] = None,
        entity_id: Optional[UUID] = None
    ) -> AttachmentModel:
        """
        Uploads a file to storage and creates an attachment record in the database.
        """
        # Generate a unique key for the file in the bucket to avoid collisions
        # Structure: {tenant_id}/{entity_type or 'general'}/{file_uuid}_{file_name}
        file_uuid = uuid.uuid4()
        folder = entity_type.lower() if entity_type else 'general'
        # Clean filename to avoid issues with special characters in S3 keys
        safe_file_name = "".join(c for c in file_name if c.isalnum() or c in "._-").strip()
        key = f"{tenant_id}/{folder}/{file_uuid}_{safe_file_name}"
        
        # 1. Upload to storage (S3/Spaces)
        uploaded_key = self.storage.upload_file(
            file_obj=file_obj,
            key=key,
            content_type=content_type
        )
        
        # 2. Save metadata to DB
        db_attachment = AttachmentModel(
            tenant_id=tenant_id,
            file_name=file_name,
            file_key=uploaded_key,
            content_type=content_type,
            size=size,
            entity_type=entity_type,
            entity_id=entity_id
        )
        self.session.add(db_attachment)
        self.session.commit()
        self.session.refresh(db_attachment)
        
        return db_attachment

    def get_attachment(self, attachment_id: UUID) -> Optional[AttachmentModel]:
        """
        Retrieves an attachment by its ID.
        """
        return self.session.get(AttachmentModel, attachment_id)

    def get_attachments_for_entity(self, entity_type: str, entity_id: UUID) -> List[AttachmentModel]:
        """
        Retrieves all attachments associated with a specific entity.
        """
        statement = select(AttachmentModel).where(
            AttachmentModel.entity_type == entity_type,
            AttachmentModel.entity_id == entity_id
        )
        return self.session.exec(statement).all()

    def get_download_url(self, attachment: AttachmentModel, expires_in: int = 3600) -> str:
        """
        Generates a temporary signed URL for downloading the file.
        """
        return self.storage.get_download_url(attachment.file_key, expires_in=expires_in)

    def delete_attachment(self, attachment: AttachmentModel) -> bool:
        """
        Deletes an attachment from both storage and database.
        """
        # 1. Delete from storage
        storage_deleted = self.storage.delete_file(attachment.file_key)
        
        # 2. Delete from DB
        self.session.delete(attachment)
        self.session.commit()
        
        return storage_deleted

    async def replace_attachment_data(
        self,
        attachment: AttachmentModel,
        file_obj: Union[BinaryIO, bytes],
        content_type: str,
        size: int
    ) -> AttachmentModel:
        """
        Replaces the actual file content in storage and updates metadata.
        Key is kept the same or updated depending on name, but for internal replaced 
        edits we usually keep the key or generate a new version path.
        """
        # We'll generate a new key suffix to avoid cache issues in some CDNs
        # but keep the base path.
        import time
        base_key = attachment.file_key.rsplit('.', 1)[0]
        ext = attachment.file_key.rsplit('.', 1)[1] if '.' in attachment.file_key else ''
        new_key = f"{base_key}_v{int(time.time())}.{ext}" if ext else f"{base_key}_v{int(time.time())}"
        
        # 1. Upload new one
        self.storage.upload_file(
            file_obj=file_obj,
            key=new_key,
            content_type=content_type
        )
        
        # 2. Delete old one
        self.storage.delete_file(attachment.file_key)
        
        # 3. Update DB
        attachment.file_key = new_key
        attachment.content_type = content_type
        attachment.size = size
        attachment.updated_at = datetime.now(timezone.utc)
        
        self.session.add(attachment)
        self.session.commit()
        self.session.refresh(attachment)
        
        return attachment
