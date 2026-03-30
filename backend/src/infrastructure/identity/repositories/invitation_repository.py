from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from domain.identity.models import Invitation, InvitationStatus

class InvitationRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_id(self, invitation_id: UUID) -> Optional[Invitation]:
        return self._session.get(Invitation, invitation_id)

    def get_by_token(self, token: str) -> Optional[Invitation]:
        statement = select(Invitation).where(Invitation.token == token)
        return self._session.exec(statement).first()

    def list_by_tenant(self, tenant_id: UUID) -> List[Invitation]:
        statement = select(Invitation).where(Invitation.tenant_id == tenant_id)
        return self._session.exec(statement).all()

    def get_pending_by_email_and_tenant(self, email: str, tenant_id: UUID) -> Optional[Invitation]:
        statement = select(Invitation).where(
            Invitation.email == email,
            Invitation.tenant_id == tenant_id,
            Invitation.status == InvitationStatus.PENDING
        )
        return self._session.exec(statement).first()

    def save(self, invitation: Invitation) -> Invitation:
        self._session.add(invitation)
        self._session.commit()
        self._session.refresh(invitation)
        return invitation

    def delete(self, invitation: Invitation) -> None:
        self._session.delete(invitation)
        self._session.commit()
