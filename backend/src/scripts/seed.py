import sys
import os
from sqlmodel import Session, select
from pydantic import EmailStr

# Add src to sys.path to allow imports from domain, infrastructure, etc.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from infrastructure.security.hash_provider import HashProvider
from infrastructure.persistence.database import engine
from infrastructure.config.settings import get_settings
from domain.identity.models import User

def get_or_create(session: Session, model_class, filters: dict, defaults: dict):
    stmt = select(model_class)
    for k, v in filters.items():
        stmt = stmt.where(getattr(model_class, k) == v)
    obj = session.exec(stmt).first()
    if not obj:
        obj = model_class(**{**filters, **defaults})
        session.add(obj)
        session.commit()
        session.refresh(obj)
    return obj

def seed_system(session: Session = None):
    """
    Initial bootstrap script.
    Creates the first system administrator (superuser) without any tenants.
    """
    settings = get_settings()
    
    # In production, these should come from environment variables.
    # We default them to safe values if not provided, or better yet, require them.
    admin_email = os.getenv("INITIAL_ADMIN_EMAIL", "admin@vimmit.com")
    admin_password = os.getenv("INITIAL_ADMIN_PASSWORD", "changeme123")
    
    print(f"--- Bootstrapping System ---")
    print(f"Target Admin Email: {admin_email}")
    
    if session:
        _perform_seed(session, admin_email, admin_password)
    else:
        with Session(engine) as session:
            _perform_seed(session, admin_email, admin_password)
            
def _perform_seed(session: Session, admin_email: str, admin_password: str):
    # 1. Create System Admin (Superuser)
    hashed_password = HashProvider.get_password_hash(admin_password)
    
    admin_user = get_or_create(
        session, User,
        filters={"email": admin_email},
        defaults={
            "hashed_password": hashed_password,
            "is_active": True,
            "is_superuser": True,
            "first_name": "System",
            "last_name": "Administrator"
        }
    )
    
    if admin_user:
        print(f"✓ System administrator created/verified: {admin_user.email}")
        if not admin_user.is_superuser:
            print("! User exists but was not superuser. Granting superuser status.")
            admin_user.is_superuser = True
            session.add(admin_user)
            session.commit()
            print("✓ Superuser status granted.")
        
    print(f"--- Bootstrap Complete ---")

if __name__ == "__main__":
    seed_system()
