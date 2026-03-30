import os
from typing import Annotated, Generator, Optional, List, Type, TypeVar
from uuid import UUID
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, create_engine, SQLModel, select

# Import entities and infrastructure
from domain.identity.models import User, Role, UserRoleLink
from domain.administration.models import RegistrationIntentModel
from domain.academic.programs.models import ProgramModel
from domain.tenants.models import TenantModel
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.security.token_provider import TokenProvider
from infrastructure.config.settings import get_settings

# Database engine setup
settings = get_settings()
DATABASE_URL = settings.DATABASE_URL
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

# Defined once here to be reused everywhere
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/identity/auth/token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/identity/auth/token", auto_error=False)

from api.identity.v1.error_codes import ErrorCode

def get_current_user(
    session: SessionDep,
    token: str = Depends(oauth2_scheme)
) -> User:
    payload = TokenProvider.decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail={"code": ErrorCode.AUTH_SESSION_EXPIRED, "message": "Could not validate credentials"},
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail={"code": ErrorCode.AUTH_SESSION_EXPIRED, "message": "Invalid token payload"},
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_repo = UserRepository(session)
    user = user_repo.get_by_email(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail={"code": ErrorCode.AUTH_USER_NOT_FOUND, "message": "User not found"}
        )
    return user

def get_optional_current_user(
    session: SessionDep,
    token: Optional[str] = Depends(oauth2_scheme_optional)
) -> Optional[User]:
    if not token:
        return None
    try:
        return get_current_user(session, token)
    except HTTPException:
        return None

class AllowedTenants:
    """
    Dependency for resolving which tenants a user can access, 
    optionally filtered by roles.
    """
    def __init__(self, required_roles: Optional[List[str]] = None):
        self.required_roles = required_roles

    def __call__(
        self,
        x_tenant_id: str = Header(default="all", alias="X-Tenant-ID"),
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user)
    ) -> List[UUID]:
        # Base statement: get all tenant IDs where user has a membership
        statement = select(UserRoleLink.tenant_id).where(UserRoleLink.user_id == current_user.id)
        
        # If roles are required, join with Role and filter
        if self.required_roles:
            statement = (
                select(UserRoleLink.tenant_id)
                .join(Role, UserRoleLink.role_id == Role.id)
                .where(
                    UserRoleLink.user_id == current_user.id,
                    Role.name.in_(self.required_roles)
                )
            )
            
        allowed_tenant_ids = session.exec(statement).all()
        
        if not allowed_tenant_ids:
            role_msg = f" with roles {self.required_roles}" if self.required_roles else ""
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": ErrorCode.AUTH_UNAUTHORIZED, "message": f"User has no institutional memberships{role_msg}"}
            )

        if x_tenant_id.lower() == "all":
            return list(allowed_tenant_ids)
        
        try:
            requested_id = UUID(x_tenant_id)
            if requested_id not in allowed_tenant_ids:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={"code": ErrorCode.AUTH_UNAUTHORIZED, "message": "User does not have access to this tenant with the required permissions"}
                )
            return [requested_id]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": ErrorCode.AUTH_UNAUTHORIZED, "message": "Invalid Tenant ID format"}
            )

# Replace the function with a default instance for backward compatibility
get_allowed_tenants = AllowedTenants()


class TenantAccess:
    """
    Parameterized dependency factory for tenant + role-based access control.

    Usage:
        # Only checks membership:
        Depends(TenantAccess())

        # Also checks that the user has a specific role in the tenant:
        Depends(TenantAccess(required_roles=["Admin"]))
    """

    def __init__(self, required_roles: Optional[List[str]] = None):
        self.required_roles = required_roles

    def __call__(
        self,
        tenant_id: UUID,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
    ) -> User:
        """
        tenant_id is injected by FastAPI from the route path/body — the caller
        passes it explicitly via Depends(TenantAccess())(tenant_id=...).
        In practice, endpoints call it via a helper below.
        """
        statement = select(UserRoleLink).where(
            UserRoleLink.user_id == current_user.id,
            UserRoleLink.tenant_id == tenant_id
        )
        membership = session.exec(statement).first()

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": ErrorCode.AUTH_UNAUTHORIZED, "message": "User does not belong to this tenant"},
            )

        if self.required_roles:
            role = session.get(Role, membership.role_id)
            if not role or role.name not in self.required_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": ErrorCode.AUTH_UNAUTHORIZED,
                        "message": f"One of these roles is required: {', '.join(self.required_roles)}",
                    },
                )

        return current_user


def require_tenant_access(tenant_id: UUID, required_roles: Optional[List[str]] = None):
    """
    Convenience function that creates a ready-to-use FastAPI Depends() closure.
    """
    return TenantAccess(required_roles=required_roles)(tenant_id)


T = TypeVar("T")


def body_with_tenant_access(body_class: Type[T], required_roles: Optional[List[str]] = None):
    """
    Dependency factory for endpoints where tenant_id is inside the request body.
    """
    async def dependency(
        body: body_class,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
    ) -> body_class:
        TenantAccess(required_roles=required_roles)(
            tenant_id=body.tenant_id,
            session=session,
            current_user=current_user,
        )
        return body

    return dependency


def enrich_user_memberships(user: User, session: Session) -> dict:
    """
    Enriches a User object with tenant and role names for its memberships.
    Returns a dictionary suitable for UserOut schema.
    """
    memberships_with_names = []
    for membership in user.memberships:
        tenant = session.get(TenantModel, membership.tenant_id)
        role = session.get(Role, membership.role_id)
        memberships_with_names.append({
            "tenant_id": membership.tenant_id,
            "tenant_name": tenant.name if tenant else "Unknown",
            "role_id": membership.role_id,
            "role_name": role.name if role else "Unknown",
        })

    user_data = user.model_dump()
    user_data["memberships"] = memberships_with_names
    return user_data
