import io
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Query
from sqlmodel import Session

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import AllowedTenants
from application.shared.attachment_service import AttachmentService
from domain.shared.schemas.attachment_schema import AttachmentResponse

router = APIRouter(prefix="/attachments", tags=["attachments"])

@router.post("/upload", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    file: UploadFile = File(...),
    entity_type: Optional[str] = Query(None, alias="entityType"),
    entity_id: Optional[UUID] = Query(None, alias="entityId"),
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin", "Staff"]))
):
    """
    Uploads a file to DigitalOcean Spaces and returns its metadata.
    Restricted to authorized tenants and members.
    """
    # For now, we take the first allowed tenant as the context for the upload
    # unless we want to specify a tenantId in the query.
    if not allowed_tenants:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No active tenant found for user")
        
    tenant_id = allowed_tenants[0]
    
    # Read file content
    contents = await file.read()
    size = len(contents)
    
    # Limit size to 10MB (optional but recommended)
    if size > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 10MB)")

    attachment_service = AttachmentService(session)
    
    try:
        # We wrap the bytes in a BytesIO for boto3
        file_obj = io.BytesIO(contents)
        db_attachment = await attachment_service.upload_attachment(
            tenant_id=tenant_id,
            file_name=file.filename,
            file_obj=file_obj,
            content_type=file.content_type,
            size=size,
            entity_type=entity_type,
            entity_id=entity_id
        )
        
        # Generate a temporary download URL to return in the response
        download_url = attachment_service.get_download_url(db_attachment)
        
        # Convert to response schema
        response = AttachmentResponse.model_validate(db_attachment)
        response.downloadUrl = download_url
        return response
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload file: {str(e)}")

@router.get("/{attachment_id}", response_model=AttachmentResponse)
async def get_attachment_details(
    attachment_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants())
):
    """
    Retrieves metadata and a signed download URL for a specific attachment.
    """
    attachment_service = AttachmentService(session)
    db_attachment = attachment_service.get_attachment(attachment_id)
    
    if not db_attachment or db_attachment.tenant_id not in allowed_tenants:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
        
    download_url = attachment_service.get_download_url(db_attachment)
    
    response = AttachmentResponse.model_validate(db_attachment)
    response.downloadUrl = download_url
    return response

@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    attachment_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"]))
):
    """
    Deletes an attachment from both storage and database.
    """
    attachment_service = AttachmentService(session)
    db_attachment = attachment_service.get_attachment(attachment_id)
    
    if not db_attachment or db_attachment.tenant_id not in allowed_tenants:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
        
    success = attachment_service.delete_attachment(db_attachment)
    if not success:
        # Even if storage delete fails, metadata is removed from DB. 
        # We just return a warning/notify but usually it's cleaner to succeed the API call.
        pass
        
    return None
    
@router.post("/{attachment_id}/replace", response_model=AttachmentResponse)
async def replace_attachment(
    attachment_id: UUID,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin", "Staff"]))
):
    """
    Replaces the binary data of an existing attachment.
    """
    attachment_service = AttachmentService(session)
    db_attachment = attachment_service.get_attachment(attachment_id)
    
    if not db_attachment or db_attachment.tenant_id not in allowed_tenants:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
        
    # Read file content
    contents = await file.read()
    size = len(contents)
    
    try:
        file_obj = io.BytesIO(contents)
        updated_attachment = await attachment_service.replace_attachment_data(
            attachment=db_attachment,
            file_obj=file_obj,
            content_type=file.content_type,
            size=size
        )
        
        # Generate new download URL
        download_url = attachment_service.get_download_url(updated_attachment)
        
        response = AttachmentResponse.model_validate(updated_attachment)
        response.downloadUrl = download_url
        return response
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to replace file: {str(e)}")
