from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import Session, select

from api.identity.dependencies.auth_dependencies import get_session, get_current_user, oauth2_scheme, enrich_user_memberships, get_settings
from domain.identity.models import User
from application.identity.services.auth_service import AuthService
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.security.hash_provider import HashProvider
from infrastructure.security.token_provider import TokenProvider
from infrastructure.email.email_service import EmailService
from .error_codes import ErrorCode
from .schemas import (
    Token, 
    UserOut, 
    ForgotPasswordRequest, 
    ResetPasswordRequest, 
    ChangePasswordRequest
)

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

def get_email_service():
    return EmailService()

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    service: Annotated[AuthService, Depends(get_auth_service)],
    email_service: Annotated[EmailService, Depends(get_email_service)]
):
    user = service._user_repo.get_by_email(request.email)
    if not user:
        # We return success to avoid email enumeration
        return {"message": "If the email is registered, a reset link has been sent"}
    
    token = service.create_password_reset_token(request.email)
    settings = get_settings()
    frontend_url = settings.FRONTEND_URL
    reset_link = f"{frontend_url}/portal/reset-password?token={token}"
    
    # In a multi-tenant system, we might want to get the tenant slug from context
    # For now, using default
    await email_service.send_password_reset(request.email, reset_link)
    
    return {"message": "If the email is registered, a reset link has been sent"}

@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    service: Annotated[AuthService, Depends(get_auth_service)]
):
    email = service.verify_password_reset_token(request.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": ErrorCode.AUTH_INVALID_TOKEN, "message": "Invalid or expired token"}
        )
    
    user = service._user_repo.get_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": ErrorCode.AUTH_USER_NOT_FOUND, "message": "User not found"}
        )
    
    service.update_password(user, request.new_password)
    return {"message": "Password updated successfully"}

@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[AuthService, Depends(get_auth_service)]
):
    # Verify current password
    if not service._hash_provider.verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": ErrorCode.AUTH_INVALID_CREDENTIALS, "message": "Incorrect current password"}
        )
    
    service.update_password(current_user, request.new_password)
    return {"message": "Password changed successfully"}


@router.get("/me", response_model=UserOut)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Session = Depends(get_session)
):
    user_data = enrich_user_memberships(current_user, session)
    return user_data
