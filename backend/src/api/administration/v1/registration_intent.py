from fastapi import APIRouter, Depends, status, HTTPException, BackgroundTasks
import json
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from domain.administration.models import RegistrationIntentModel, LeadInteractionModel
from domain.administration.schemas.registration_intent_schema import (
    RegistrationIntentCreate, 
    RegistrationIntentUpdate,
    RegistrationIntentResponse
)
from domain.tenants.models import TenantModel
from domain.identity.models import User, Role, UserRoleLink
from domain.academic.programs.models import ProgramModel
from infrastructure.email.email_service import EmailService
from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import AllowedTenants, get_current_user

router = APIRouter(prefix="/registration-intents", tags=["registration-intents"])

@router.post("/public/{tenant_slug}", response_model=RegistrationIntentResponse, status_code=status.HTTP_201_CREATED)
async def create_registration_intent(
    tenant_slug: str,
    intent_in: RegistrationIntentCreate,
    session: Session = Depends(get_session)
):
    # Lookup tenant by slug
    statement = select(TenantModel).where(TenantModel.slug == tenant_slug)
    tenant = session.exec(statement).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    db_intent = RegistrationIntentModel(
        tenant_id=tenant.id,
        email=intent_in.email,
        full_name=intent_in.fullName,
        phone=intent_in.phone,
        interests=intent_in.interests
    )
    session.add(db_intent)
    session.commit()
    session.refresh(db_intent)

    # Email notifications (asynchronous)
    email_service = EmailService()
    
    # Send confirmation to the user synchronously (blocking)
    success = await email_service.send_lead_confirmation(
        to_email=intent_in.email,
        full_name=intent_in.fullName,
        tenant_slug=tenant_slug,
        tenant_name=tenant.name
    )
    if not success:
        # Se asegura que si no sale el correo del usuario, le avisamos al UI con error
        raise HTTPException(status_code=500, detail="Error sending confirmation email to user. Registration intents could not be completed.")

    # Find admins and send notifications
    statement_admins = (
        select(User.email)
        .join(UserRoleLink)
        .join(Role)
        .where(
            UserRoleLink.tenant_id == tenant.id,
            Role.name == "Admin"
        )
    )
    admin_emails = session.exec(statement_admins).all()

    lead_data = {
        "full_name": intent_in.fullName,
        "email": intent_in.email,
        "phone": intent_in.phone or "N/A",
        "interests": ", ".join(intent_in.interests) if intent_in.interests else "General",
        "portal_link": f"/portal/leads"
    }

    for admin_email in admin_emails:
        admin_success = await email_service.send_new_lead_admin(
            to_email=admin_email,
            lead_data=lead_data,
            tenant_slug=tenant_slug,
            tenant_name=tenant.name
        )
        if not admin_success:
            print(f"Warning: Failed to send new lead alert to admin {admin_email}")
    
    # Map to response schema (handling camelCase/snake_case mapping)
    return RegistrationIntentResponse(
        id=db_intent.id,
        email=db_intent.email,
        fullName=db_intent.full_name,
        phone=db_intent.phone,
        interests=db_intent.interests,
        interestsNames=[], # New lead, usually no names resolved yet or can be done if needed
        status=db_intent.status,
        assigned_to=db_intent.assigned_to,
        notes=db_intent.notes,
        tenantId=db_intent.tenant_id,
        createdAt=db_intent.created_at,
        updatedAt=db_intent.updated_at
    )

@router.get("", response_model=List[RegistrationIntentResponse])
async def list_registration_intents(
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"]))
):
    statement = select(RegistrationIntentModel).where(RegistrationIntentModel.tenant_id.in_(allowed_tenants))
    results = session.exec(statement).all()
    
    # ── Resolve Program Names ──
    # Collect all unique program IDs from all intents
    all_program_ids = set()
    for intent in results:
        if intent.interests:
            for pid in intent.interests:
                try:
                    all_program_ids.add(UUID(pid))
                except ValueError:
                    continue
    
    # Fetch all relevant programs in one query
    program_map = {}
    if all_program_ids:
        program_statement = select(ProgramModel).where(ProgramModel.id.in_(list(all_program_ids)))
        programs = session.exec(program_statement).all()
        program_map = {str(p.id): p.name for p in programs}
    
    return [
        RegistrationIntentResponse(
            id=i.id,
            email=i.email,
            fullName=i.full_name,
            phone=i.phone,
            interests=i.interests,
            interestsNames=[program_map.get(pid, pid) for pid in (i.interests or [])],
            status=i.status,
            assigned_to=i.assigned_to,
            notes=i.notes,
            interactions=i.interactions,
            tenantId=i.tenant_id,
            createdAt=i.created_at,
            updatedAt=i.updated_at
        ) for i in results
    ]

@router.get("/{intent_id}", response_model=RegistrationIntentResponse)
async def get_registration_intent(
    intent_id: UUID,
    session: Session = Depends(get_session),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"]))
):
    statement = select(RegistrationIntentModel).where(
        RegistrationIntentModel.id == intent_id,
        RegistrationIntentModel.tenant_id.in_(allowed_tenants)
    )
    db_intent = session.exec(statement).first()
    if not db_intent:
        raise HTTPException(status_code=404, detail="Registration intent not found")

    # Resolve program names for this single intent
    program_map = {}
    if db_intent.interests:
        program_ids = []
        for pid in db_intent.interests:
            try:
                program_ids.append(UUID(pid))
            except ValueError:
                continue
        if program_ids:
            program_statement = select(ProgramModel).where(ProgramModel.id.in_(program_ids))
            programs = session.exec(program_statement).all()
            program_map = {str(p.id): p.name for p in programs}

    return RegistrationIntentResponse(
        id=db_intent.id,
        email=db_intent.email,
        fullName=db_intent.full_name,
        phone=db_intent.phone,
        interests=db_intent.interests,
        interestsNames=[program_map.get(pid, pid) for pid in (db_intent.interests or [])],
        status=db_intent.status,
        assigned_to=db_intent.assigned_to,
        notes=db_intent.notes,
        interactions=db_intent.interactions,
        tenantId=db_intent.tenant_id,
        createdAt=db_intent.created_at,
        updatedAt=db_intent.updated_at
    )

@router.patch("/{intent_id}", response_model=RegistrationIntentResponse)
async def update_registration_intent(
    intent_id: UUID,
    intent_in: RegistrationIntentUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    allowed_tenants: List[UUID] = Depends(AllowedTenants(required_roles=["Admin"]))
):
    db_intent = session.get(RegistrationIntentModel, intent_id)
    if not db_intent:
        raise HTTPException(status_code=404, detail="Registration intent not found")
        
    if db_intent.tenant_id not in allowed_tenants:
        raise HTTPException(status_code=403, detail="Not authorized to access this tenant")

    update_data = intent_in.model_dump(exclude_unset=True)
    changes = []
    
    for key, value in update_data.items():
        old_value = getattr(db_intent, key)
        # Avoid creating interactions for changes that are logically the same
        if str(old_value) != str(value):
            if key == "status":
                changes.append(("STATUS_CHANGE", json.dumps({"old": old_value or "PENDING", "new": value})))
            elif key == "assigned_to":
                changes.append(("ASSIGNMENT", json.dumps({"assigned_to": str(value) if value else None})))
            elif key == "notes":
                changes.append(("NOTE", json.dumps({"note": value})))
        
        setattr(db_intent, key, value)
        
    for interaction_type, details in changes:
        interaction = LeadInteractionModel(
            intent_id=db_intent.id,
            user_id=current_user.id,
            interaction_type=interaction_type,
            details=details,
        )
        session.add(interaction)

    session.add(db_intent)
    session.commit()
    session.refresh(db_intent)
    
    # Resolve program names for the updated intent
    program_map = {}
    if db_intent.interests:
        program_ids = []
        for pid in db_intent.interests:
            try:
                program_ids.append(UUID(pid))
            except ValueError:
                continue
        if program_ids:
            program_statement = select(ProgramModel).where(ProgramModel.id.in_(program_ids))
            programs = session.exec(program_statement).all()
            program_map = {str(p.id): p.name for p in programs}

    return RegistrationIntentResponse(
        id=db_intent.id,
        email=db_intent.email,
        fullName=db_intent.full_name,
        phone=db_intent.phone,
        interests=db_intent.interests,
        interestsNames=[program_map.get(pid, pid) for pid in (db_intent.interests or [])],
        status=db_intent.status,
        assigned_to=db_intent.assigned_to,
        notes=db_intent.notes,
        interactions=db_intent.interactions,
        tenantId=db_intent.tenant_id,
        createdAt=db_intent.created_at,
        updatedAt=db_intent.updated_at
    )
