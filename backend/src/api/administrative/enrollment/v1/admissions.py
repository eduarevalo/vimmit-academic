from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from uuid import UUID
from sqlmodel import Session

from infrastructure.persistence.database import get_session
from application.administrative.admission_service import AdmissionService
from domain.administrative.enrollment.admission_schemas import (
    AdmissionPublicCreate, 
    AdmissionResponse, 
    AdmissionUpdate, 
    AdmissionAdminCreate,
    AdmissionPublicUpdate
)
from domain.identity.models import User
from api.identity.dependencies.auth_dependencies import get_current_user, AllowedTenants

router = APIRouter(prefix="/admissions", tags=["Admissions"])

@router.post("/public/{tenant_slug}", response_model=AdmissionResponse)
async def create_public_admission(
    tenant_slug: str,
    data: AdmissionPublicCreate,
    session: Session = Depends(get_session)
):
    """
    Creates an initial admission record using JSON body.
    Only contact info is strictly required for the first step.
    """
    service = AdmissionService(session)
    try:
        return await service.create_public_application(tenant_slug, data, [])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing admission: {e}")


@router.patch("/public/{tenant_slug}/{admission_id}", response_model=AdmissionResponse)
async def update_public_admission(
    tenant_slug: str,
    admission_id: UUID,
    data: AdmissionPublicUpdate,
    session: Session = Depends(get_session)
):
    """
    Updates an existing admission record using JSON body during the wizard flow.
    """
    service = AdmissionService(session)
    try:
        return await service.update_public_application(admission_id, data, [])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating admission: {e}")


@router.patch("/public/{tenant_slug}/{admission_id}/attachments", response_model=AdmissionResponse)
async def upload_admission_attachments(
    tenant_slug: str,
    admission_id: UUID,
    files: List[UploadFile] = File(...),
    session: Session = Depends(get_session)
):
    """
    Uploads files to an existing admission record via Multipart.
    """
    service = AdmissionService(session)
    processed_files = []
    for file in files:
        content = await file.read()
        processed_files.append((file.filename, content, file.content_type, len(content)))

    try:
        # Use empty update data since we only care about files
        update_data = AdmissionPublicUpdate()
        return await service.update_public_application(admission_id, update_data, processed_files)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading attachments: {e}")

@router.get("", response_model=List[AdmissionResponse])
def list_admissions(
    tenant_id: Optional[UUID] = Query(None),
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"]))
):
    """List all admission applications in authorized tenants."""
    service = AdmissionService(session)
    if tenant_id and tenant_id not in allowed_tenants:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # If no tenant_id provided by query, use all allowed
    if not tenant_id:
        all_results = []
        for tid in allowed_tenants:
            all_results.extend(service.list_applications(tid))
        return all_results

    return service.list_applications(tenant_id)

@router.get("/{admission_id}", response_model=AdmissionResponse)
def get_admission(
    admission_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"]))
):
    service = AdmissionService(session)
    admission = service.get_application(admission_id)
    if not admission or admission.tenant_id not in allowed_tenants:
        raise HTTPException(status_code=404, detail="Admission not found")
    return admission

@router.put("/{admission_id}/status", response_model=AdmissionResponse)
def update_admission_status(
    admission_id: UUID,
    data: AdmissionUpdate,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"]))
):
    service = AdmissionService(session)
    admission = service.get_application(admission_id)
    if not admission or admission.tenant_id not in allowed_tenants:
        raise HTTPException(status_code=404, detail="Admission not found")

    updated = service.update_status(admission_id, data)
    return updated
    
@router.post("/{admission_id}/enroll", response_model=AdmissionResponse)
async def enroll_admission(
    admission_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"]))
):
    """
    Triggers the promotion of a verified admission to a formal enrollment.
    Creates a student account and an enrollment record.
    """
    service = AdmissionService(session)
    admission = service.get_application(admission_id)
    if not admission or admission.tenant_id not in allowed_tenants:
        raise HTTPException(status_code=404, detail="Admission not found")

    try:
        updated = await service.enroll_applicant(admission_id)
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finalizing enrollment: {e}")

