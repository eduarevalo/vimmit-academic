from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session

from api.identity.dependencies.auth_dependencies import get_session, get_current_user, oauth2_scheme
from domain.identity.models import User
from application.identity.services.auth_service import AuthService
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.security.hash_provider import HashProvider
from infrastructure.security.token_provider import TokenProvider
from .error_codes import ErrorCode
from .schemas import Token, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

def get_auth_service(session: Annotated[Session, Depends(get_session)]):
    user_repo = UserRepository(session)
    hash_provider = HashProvider()
    token_provider = TokenProvider()
    return AuthService(user_repo, hash_provider, token_provider)

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: Annotated[AuthService, Depends(get_auth_service)]
):
    user = await service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": ErrorCode.AUTH_INVALID_CREDENTIALS, "message": "Incorrect username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = service.create_access_token(username=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

from sqlmodel import Session, select
from domain.tenants.models import TenantModel
from domain.identity.models import Role

@router.get("/me", response_model=UserOut)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    memberships_with_names = []
    for membership in current_user.memberships:
        tenant = session.get(TenantModel, membership.tenant_id)
        role = session.get(Role, membership.role_id)
        memberships_with_names.append({
            "tenant_id": membership.tenant_id,
            "tenant_name": tenant.name if tenant else "Unknown",
            "role_id": membership.role_id,
            "role_name": role.name if role else "Unknown",
        })

    user_data = current_user.model_dump()
    user_data["memberships"] = memberships_with_names
    return user_data
