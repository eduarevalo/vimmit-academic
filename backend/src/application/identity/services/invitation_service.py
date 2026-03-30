from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
import os

from domain.identity.models import Invitation, InvitationStatus, UserRoleLink, User
from infrastructure.identity.repositories.invitation_repository import InvitationRepository
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.identity.repositories.role_repository import RoleRepository
from infrastructure.email.email_service import EmailService
from infrastructure.config.settings import get_settings

from infrastructure.security.hash_provider import HashProvider

class InvitationService:
    def __init__(
        self, 
        invitation_repo: InvitationRepository, 
        user_repo: UserRepository, 
        role_repo: RoleRepository,
        email_service: EmailService,
        hash_provider: HashProvider
    ):
        self._invitation_repo = invitation_repo
        self._user_repo = user_repo
        self._role_repo = role_repo
        self._email_service = email_service
        self._hash_provider = hash_provider

    async def create_invitation(self, email: str, tenant_id: UUID, role_id: UUID, invited_by_name: str) -> Invitation:
        # Check if there is already a pending invitation
        existing = self._invitation_repo.get_pending_by_email_and_tenant(email, tenant_id)
        if existing:
            # We could resend the email here or just return existing
            await self._send_invitation_email(existing, invited_by_name)
            return existing

        token = str(uuid4())
        invitation = Invitation(
            email=email,
            tenant_id=tenant_id,
            role_id=role_id,
            token=token,
            status=InvitationStatus.PENDING
        )
        saved = self._invitation_repo.save(invitation)
        
        # Send email
        await self._send_invitation_email(saved, invited_by_name)
        
        return saved

    async def _send_invitation_email(self, invitation: Invitation, invited_by_name: str):
        # We need to get the role name for the email
        role = self._role_repo.get_by_id(invitation.role_id)
        role_name = role.name if role else "Member"
        
        # Frontend URL for accepting invitation
        settings = get_settings()
        frontend_url = settings.FRONTEND_URL
        accept_link = f"{frontend_url}/portal/accept-invitation?token={invitation.token}"
        
        await self._email_service.send_email(
            to_email=invitation.email,
            template_name="invitation.html",
            context={
                "invited_by": invited_by_name,
                "role_name": role_name,
                "accept_link": accept_link,
                "portal_url": settings.PORTAL_FRONTEND_URL,
                "frontend_url": settings.FRONTEND_URL,
                "tenant_name": "Institution" # Ideally we pass the tenant name here
            }
        )

    def get_invitation_by_token(self, token: str) -> Optional[Invitation]:
        return self._invitation_repo.get_by_token(token)

    def accept_invitation(
        self, 
        token: str, 
        user_id: Optional[UUID] = None, 
        password: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None
    ) -> Optional[User]:
        invitation = self._invitation_repo.get_by_token(token)
        if not invitation or invitation.status != InvitationStatus.PENDING:
            return None
        
        user = None
        if user_id:
            user = self._user_repo.get_by_id(user_id)
        elif password:
            # Create new user for this invitation
            # Verify user doesn't exist yet
            existing_user = self._user_repo.get_by_email(invitation.email)
            if existing_user:
                return None # Should have logged in
            
            user = User(
                email=invitation.email,
                hashed_password=self._hash_provider.get_password_hash(password),
                first_name=first_name,
                last_name=last_name,
                is_active=True
            )
            user = self._user_repo.save(user)
        
        if not user:
            return None
        
        # Add membership
        # Check if already a member
        is_member = any(m.tenant_id == invitation.tenant_id for m in user.memberships)
        if not is_member:
            membership = UserRoleLink(
                user_id=user.id,
                role_id=invitation.role_id,
                tenant_id=invitation.tenant_id
            )
            # Append to user.memberships
            user.memberships.append(membership)
            self._user_repo.save(user)
        
        # Update invitation status
        invitation.status = InvitationStatus.ACCEPTED
        invitation.accepted_at = datetime.now(timezone.utc)
        self._invitation_repo.save(invitation)
        
        return user

    async def resend_invitation(self, invitation_id: UUID, invited_by_name: str) -> Optional[Invitation]:
        invitation = self._invitation_repo.get_by_id(invitation_id)
        if not invitation or invitation.status != InvitationStatus.PENDING:
            return None
            
        # Optional: Update created_at or add a last_resent_at if desired
        # For now, just resend with existing token
        await self._send_invitation_email(invitation, invited_by_name)
        return invitation

    def list_tenant_invitations(self, tenant_id: UUID) -> List[Invitation]:
        return self._invitation_repo.list_by_tenant(tenant_id)

    def delete_invitation(self, invitation_id: UUID, tenant_id: UUID) -> bool:
        invitation = self._invitation_repo.get_by_id(invitation_id)
        if not invitation or invitation.tenant_id != tenant_id:
            return False
        
        self._invitation_repo.delete(invitation)
        return True
