from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from infrastructure.persistence.database import get_session
from api.identity.dependencies.auth_dependencies import (
    get_current_user, 
    TenantAccess,
    enrich_user_memberships
)
from domain.identity.models import User, Role, UserRoleLink, Invitation
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.identity.repositories.role_repository import RoleRepository
from infrastructure.identity.repositories.invitation_repository import InvitationRepository
from infrastructure.email.email_service import EmailService
from infrastructure.security.hash_provider import HashProvider
from application.identity.services.invitation_service import InvitationService
from .schemas import InvitationCreate, InvitationOut, MemberOut, AcceptInvitationRequest
from .error_codes import ErrorCode

router = APIRouter(prefix="/tenants/{tenant_id}", tags=["tenant-management"])

def get_invitation_service(session: Annotated[Session, Depends(get_session)]):
    invitation_repo = InvitationRepository(session)
    user_repo = UserRepository(session)
    role_repo = RoleRepository(session)
    email_service = EmailService()
    hash_provider = HashProvider()
    return InvitationService(invitation_repo, user_repo, role_repo, email_service, hash_provider)

@router.get("/members", response_model=List[MemberOut])
async def list_members(
    tenant_id: UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(TenantAccess(required_roles=["Admin"]))]
):
    statement = (
        select(User, Role)
        .join(UserRoleLink, User.id == UserRoleLink.user_id)
        .join(Role, UserRoleLink.role_id == Role.id)
        .where(UserRoleLink.tenant_id == tenant_id)
    )
    results = session.exec(statement).all()
    
    members = []
    for user, role in results:
        members.append(MemberOut(
            user_id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            role_id=role.id,
            role_name=role.name
        ))
    return members

@router.get("/invitations", response_model=List[InvitationOut])
async def list_invitations(
    tenant_id: UUID,
    service: Annotated[InvitationService, Depends(get_invitation_service)],
    current_user: Annotated[User, Depends(TenantAccess(required_roles=["Admin"]))]
):
    invitations = service.list_tenant_invitations(tenant_id)
    out = []
    for inv in invitations:
        # We need to ensure role is loaded or get it
        role_name = inv.role.name if inv.role else "Unknown"
        # Check if user exists
        user_repo = UserRepository(service._invitation_repo._session)
        user_exists = user_repo.get_by_email(inv.email) is not None
        
        from domain.tenants.models import TenantModel
        tenant = service._invitation_repo._session.get(TenantModel, inv.tenant_id)
        tenant_name = tenant.name if tenant else "Institution"

        out.append(InvitationOut(
            id=inv.id,
            email=inv.email,
            tenant_id=inv.tenant_id,
            role_id=inv.role_id,
            role_name=role_name,
            token=inv.token,
            status=inv.status,
            user_exists=user_exists,
            tenant_name=tenant_name,
            created_at=inv.created_at,
            accepted_at=inv.accepted_at
        ))
    return out

@router.get("/roles")
async def list_roles(
    tenant_id: UUID,
    session: Annotated[Session, Depends(get_session)],
    current_user: Annotated[User, Depends(TenantAccess(required_roles=["Admin"]))]
):
    # This should probably also include global roles if they exist, 
    # but for now let's just list tenant roles
    statement = select(Role).where(Role.tenant_id == tenant_id)
    roles = session.exec(statement).all()
    return roles

@router.post("/invitations", response_model=InvitationOut)
async def create_invitation(
    tenant_id: UUID,
    invitation_in: InvitationCreate,
    service: Annotated[InvitationService, Depends(get_invitation_service)],
    current_user: Annotated[User, Depends(TenantAccess(required_roles=["Admin"]))]
):
    invited_by_name = f"{current_user.first_name} {current_user.last_name}" if current_user.first_name else current_user.email
    
    invitation = await service.create_invitation(
        email=invitation_in.email,
        tenant_id=tenant_id,
        role_id=invitation_in.role_id,
        invited_by_name=invited_by_name
    )
    
    role_name = invitation.role.name if invitation.role else "Unknown"
    
    # Check if user exists
    user_repo = UserRepository(service._invitation_repo._session)
    user_exists = user_repo.get_by_email(invitation.email) is not None
    
    from domain.tenants.models import TenantModel
    tenant = service._invitation_repo._session.get(TenantModel, invitation.tenant_id)
    tenant_name = tenant.name if tenant else "Institution"

    return InvitationOut(
        id=invitation.id,
        email=invitation.email,
        tenant_id=invitation.tenant_id,
        role_id=invitation.role_id,
        role_name=role_name,
        token=invitation.token,
        status=invitation.status,
        user_exists=user_exists,
        tenant_name=tenant_name,
        created_at=invitation.created_at,
        accepted_at=invitation.accepted_at
    )

@router.post("/invitations/{invitation_id}/resend", response_model=InvitationOut)
async def resend_invitation(
    tenant_id: UUID,
    invitation_id: UUID,
    service: Annotated[InvitationService, Depends(get_invitation_service)],
    current_user: Annotated[User, Depends(TenantAccess(required_roles=["Admin"]))]
):
    invited_by_name = f"{current_user.first_name} {current_user.last_name}" if current_user.first_name else current_user.email
    
    invitation = await service.resend_invitation(
        invitation_id=invitation_id,
        invited_by_name=invited_by_name
    )
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": ErrorCode.RESOURCE_NOT_FOUND, "message": "Invitation not found or not pending"}
        )
    
    role_name = invitation.role.name if invitation.role else "Unknown"
    
    # Check if user exists
    user_repo = UserRepository(service._invitation_repo._session)
    user_exists = user_repo.get_by_email(invitation.email) is not None
    
    from domain.tenants.models import TenantModel
    tenant = service._invitation_repo._session.get(TenantModel, invitation.tenant_id)
    tenant_name = tenant.name if tenant else "Institution"

    return InvitationOut(
        id=invitation.id,
        email=invitation.email,
        tenant_id=invitation.tenant_id,
        role_id=invitation.role_id,
        role_name=role_name,
        token=invitation.token,
        status=invitation.status,
        user_exists=user_exists,
        tenant_name=tenant_name,
        created_at=invitation.created_at,
        accepted_at=invitation.accepted_at
    )

@router.delete("/invitations/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invitation(
    tenant_id: UUID,
    invitation_id: UUID,
    service: Annotated[InvitationService, Depends(get_invitation_service)],
    current_user: Annotated[User, Depends(TenantAccess(required_roles=["Admin"]))]
):
    success = service.delete_invitation(invitation_id, tenant_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": ErrorCode.RESOURCE_NOT_FOUND, "message": "Invitation not found"}
        )
    return None
