from fastapi import APIRouter, Depends, status, HTTPException
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from api.identity.dependencies.auth_dependencies import get_session
from domain.administration.models import RegistrationIntentModel
from domain.administration.schemas.registration_intent_schema import (
    RegistrationIntentCreate, 
    RegistrationIntentResponse
)

router = APIRouter(prefix="/registration-intents", tags=["registration-intents"])

@router.post("", response_model=RegistrationIntentResponse, status_code=status.HTTP_201_CREATED)
async def create_registration_intent(
    intent_in: RegistrationIntentCreate,
    session: Session = Depends(get_session)
):
    db_intent = RegistrationIntentModel(
        tenant_id=intent_in.tenantId,
        email=intent_in.email,
        full_name=intent_in.fullName,
        phone=intent_in.phone,
        interests=intent_in.interests
    )
    session.add(db_intent)
    session.commit()
    session.refresh(db_intent)
    
    # Map to response schema (handling camelCase/snake_case mapping)
    return RegistrationIntentResponse(
        id=db_intent.id,
        email=db_intent.email,
        fullName=db_intent.full_name,
        phone=db_intent.phone,
        interests=db_intent.interests,
        status=db_intent.status,
        tenantId=db_intent.tenant_id,
        createdAt=db_intent.created_at,
        updatedAt=db_intent.updated_at
    )

@router.get("", response_model=List[RegistrationIntentResponse])
async def list_registration_intents(
    tenant_id: UUID,
    session: Session = Depends(get_session)
):
    statement = select(RegistrationIntentModel).where(RegistrationIntentModel.tenant_id == tenant_id)
    results = session.exec(statement).all()
    
    return [
        RegistrationIntentResponse(
            id=i.id,
            email=i.email,
            fullName=i.full_name,
            phone=i.phone,
            interests=i.interests,
            status=i.status,
            tenantId=i.tenant_id,
            createdAt=i.created_at,
            updatedAt=i.updated_at
        ) for i in results
    ]
