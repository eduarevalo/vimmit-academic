from typing import Annotated, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session

from api.identity.dependencies.auth_dependencies import get_session
from application.identity.services.identity_service import IdentityService
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.identity.repositories.role_repository import RoleRepository
from infrastructure.security.hash_provider import HashProvider
from api.identity.dependencies.auth_dependencies import get_current_user, enrich_user_memberships
from domain.identity.models import User
from .schemas import UserUpdate, UserOut

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    email: str
    password: str

class RoleAssign(BaseModel):
    role_name: str

def get_identity_service(session: Session = Depends(get_session)):
    user_repo = UserRepository(session)
    role_repo = RoleRepository(session)
    hash_provider = HashProvider()
    return IdentityService(session, user_repo, role_repo, hash_provider)

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(user_in: UserCreate, service: IdentityService = Depends(get_identity_service)):
    return service.register_user(user_in.email, user_in.password)

from api.identity.v1.error_codes import ErrorCode

@router.post("/{user_id}/roles")
async def assign_role(user_id: UUID, role_in: RoleAssign, service: IdentityService = Depends(get_identity_service)):
    success = service.assign_role_to_user(user_id, role_in.role_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail={"code": ErrorCode.RESOURCE_NOT_FOUND, "message": "User or Role not found"}
        )
    return {"message": "Role assigned successfully"}

@router.patch("/me", response_model=UserOut)
async def update_my_profile(
    user_in: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    service: IdentityService = Depends(get_identity_service)
):
    updated_user = service.update_user_profile(
        current_user.id,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        phone=user_in.phone
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": ErrorCode.AUTH_USER_NOT_FOUND, "message": "User not found"}
        )
    
    return enrich_user_memberships(updated_user, service._session)
