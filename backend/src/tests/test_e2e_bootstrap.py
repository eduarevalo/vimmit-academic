import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from datetime import date
from uuid import uuid4

from domain.identity.models import User
from domain.tenants.models import TenantModel
from infrastructure.security.hash_provider import HashProvider
from infrastructure.security.token_provider import TokenProvider
from scripts.seed import seed_system

def test_system_starting_state(session: Session):
    """Verify that the system starts empty before seeding."""
    # This assumes a clean session as provided by coftest.py
    users = session.exec(select(User)).all()
    tenants = session.exec(select(TenantModel)).all()
    assert len(users) == 0
    assert len(tenants) == 0

def test_seed_creates_superuser(session: Session):
    """Verify that the seed script creates a superuser but no tenants."""
    seed_system(session=session)
    
    admin = session.exec(select(User).where(User.email == "admin@vimmit.com")).first()
    assert admin is not None
    assert admin.is_superuser is True
    
    tenants = session.exec(select(TenantModel)).all()
    assert len(tenants) == 0

def test_tenant_creation_flow(client: TestClient, session: Session):
    """
    E2E Flow:
    1. Seed the system.
    2. Try to create a tenant with a regular user (fails).
    3. Create a tenant with the superuser admin (success).
    """
    seed_system(session=session)
    
    # 1. Create a regular user for comparison
    regular_user = User(
        email="regular@example.com",
        hashed_password=HashProvider.get_password_hash("password"),
        is_active=True,
        is_superuser=False
    )
    session.add(regular_user)
    session.commit()
    session.refresh(regular_user)
    
    # Generate tokens
    regular_token = TokenProvider.create_access_token(data={"sub": regular_user.email})
    admin_token = TokenProvider.create_access_token(data={"sub": "admin@vimmit.com"})
    
    # 2. Try creating tenant with regular user (SHOULD FAIL 403)
    tenant_data = {
        "name": "New Institutional Tenant",
        "slug": "new-inst",
        "description": "My first tenant"
    }
    
    # Corrected URL from main.py mount
    response = client.post(
        "/v1/administration/tenants", 
        json=tenant_data,
        headers={"Authorization": f"Bearer {regular_token}"}
    )
    assert response.status_code == 403
    
    # 3. Create tenant with Admin (SHOULD SUCCEED 201)
    response = client.post(
        "/v1/administration/tenants", 
        json=tenant_data,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201
    created_tenant = response.json()
    assert created_tenant["slug"] == "new-inst"
    
    # Verify in DB
    db_tenant = session.exec(select(TenantModel).where(TenantModel.slug == "new-inst")).first()
    assert db_tenant is not None
    assert db_tenant.name == "New Institutional Tenant"

def test_unauthenticated_tenant_creation(client: TestClient):
    """Check that anonymous users can't create tenants."""
    tenant_data = {"name": "Anon", "slug": "anon"}
    # Corrected URL from main.py mount
    response = client.post("/v1/administration/tenants", json=tenant_data)
    assert response.status_code == 401
