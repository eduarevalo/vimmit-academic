import os
from typing import Annotated, Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, create_engine, SQLModel

# Import entities and infrastructure
from domain.identity.models import User, Role, UserRoleLink
from domain.administration.models import RegistrationIntentModel
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
