import os
from typing import Annotated, Generator, Optional, List
from uuid import UUID
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, create_engine, SQLModel, select

# Import entities and infrastructure
from domain.identity.models import User, Role, UserRoleLink
from domain.administration.models import RegistrationIntentModel
from domain.programs.models import ProgramModel
from domain.tenants.models import TenantModel
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.security.token_provider import TokenProvider

# Database engine setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

# Defined once here to be reused everywhere
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/identity/auth/token")

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

def get_allowed_tenants(
    x_tenant_id: str = Header(default="all", alias="X-Tenant-ID"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> List[UUID]:
    # Get all memberships for the user
    statement = select(UserRoleLink.tenant_id).where(UserRoleLink.user_id == current_user.id)
    allowed_tenant_ids = session.exec(statement).all()
    
    if not allowed_tenant_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": ErrorCode.AUTH_UNAUTHORIZED, "message": "User has no institutional memberships"}
        )

    if x_tenant_id.lower() == "all":
        return list(allowed_tenant_ids)
    
    try:
        requested_id = UUID(x_tenant_id)
        if requested_id not in allowed_tenant_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": ErrorCode.AUTH_UNAUTHORIZED, "message": "User does not belong to this tenant"}
            )
        return [requested_id]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": ErrorCode.AUTH_UNAUTHORIZED, "message": "Invalid Tenant ID format"}
        )


class TenantAccess:
    """
    Parameterized dependency factory for tenant + role-based access control.

    Usage:
        # Only checks membership:
        Depends(TenantAccess())

        # Also checks that the user has a specific role in the tenant:
        Depends(TenantAccess(required_role="Admin"))
    """

    def __init__(self, required_role: Optional[str] = None):
        self.required_role = required_role

    def __call__(
        self,
        tenant_id: UUID,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
    ) -> UUID:
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

        if self.required_role:
            role = session.get(Role, membership.role_id)
            if not role or role.name != self.required_role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "code": ErrorCode.AUTH_UNAUTHORIZED,
                        "message": f"Role '{self.required_role}' required for this action",
                    },
                )

        return tenant_id


def require_tenant_access(tenant_id: UUID, required_role: Optional[str] = None):
    """
    Convenience function that creates a ready-to-use FastAPI Depends() closure.
    See programs.py for usage examples.
    """
    return TenantAccess(required_role=required_role)(tenant_id)


from typing import Type, TypeVar

T = TypeVar("T")

def body_with_tenant_access(body_class: Type[T], required_role: Optional[str] = None):
    """
    Dependency factory for endpoints where tenant_id is inside the request body.

    Returns a dependency that:
      1. Parses the request body as `body_class`
      2. Validates the user's membership in `body.tenant_id`
      3. Optionally checks that the user has `required_role` in that tenant
      4. Returns the validated body object

    Usage:
        @router.post("")
        async def create_program(
            program_in: ProgramCreate = Depends(
                body_with_tenant_access(ProgramCreate, required_role="Admin")
            ),
        ):
            ...
    """
    async def dependency(
        body: body_class,
        session: Session = Depends(get_session),
        current_user: User = Depends(get_current_user),
    ) -> body_class:
        TenantAccess(required_role=required_role)(
            tenant_id=body.tenant_id,
            session=session,
            current_user=current_user,
        )
        return body

    return dependency
