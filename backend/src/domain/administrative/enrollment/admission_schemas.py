from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from domain.administrative.enrollment.admission_models import AdmissionStatus

class AdmissionBase(BaseModel):
    full_name: str
    email: str
    phone: str
    campus_id: Optional[UUID] = None
    program_id: Optional[UUID] = None
    calendar_id: Optional[UUID] = None
    notes: Optional[str] = None
    
    # Enrichment fields for display
    program_name: Optional[str] = None
    campus_name: Optional[str] = None
    calendar_name: Optional[str] = None

class AdmissionPublicCreate(AdmissionBase):
    pass

class AdmissionPublicUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    campus_id: Optional[UUID] = None
    program_id: Optional[UUID] = None
    calendar_id: Optional[UUID] = None
    notes: Optional[str] = None
    status: Optional[AdmissionStatus] = None

class AdmissionAdminCreate(AdmissionBase):
    tenant_id: UUID
    status: AdmissionStatus = AdmissionStatus.PENDING

class AdmissionUpdate(BaseModel):
    status: Optional[AdmissionStatus] = None
    notes: Optional[str] = None

from domain.shared.schemas.attachment_schema import AttachmentResponse

class AdmissionResponse(AdmissionBase):
    id: UUID
    tenant_id: UUID
    status: AdmissionStatus
    created_at: datetime
    updated_at: datetime
    attachments: List[AttachmentResponse] = []
    
    model_config = {
        "from_attributes": True
    }
