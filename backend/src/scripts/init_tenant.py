import sys
import os
from sqlmodel import Session, select
from uuid import uuid4

# Add src to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from infrastructure.security.hash_provider import HashProvider
from api.identity.dependencies.auth_dependencies import engine, init_db
from domain.identity.models import User, Role, UserRoleLink
from domain.tenants.models import TenantModel
from domain.programs.models import ProgramModel

def init_tenant():
    # Ensure tables are created
    init_db()
    
    with Session(engine) as session:
        # Tenants to create
        tenants_data = [
            {
                "name": "Aseder",
                "slug": "aseder",
                "description": "ASEDER en Santander de Quilichao es una institución técnica laboral con más de 25 años de experiencia.",
                "programs": [
                    {"name": "Auxiliar en Enfermería", "duration": "3 semestres"},
                    {"name": "Salud Oral", "duration": "3 semestres"}
                ]
            },
            {
                "name": "Vimmit Academy",
                "slug": "vimmit-academy",
                "description": "Una academia moderna enfocada en tecnología y diseño.",
                "programs": [
                    {"name": "Desarrollo Web Fullstack", "duration": "6 meses"},
                    {"name": "Diseño UX/UI", "duration": "4 meses"}
                ]
            }
        ]

        # 1. User
        user_email = "test@aseder.edu.co"
        user_statement = select(User).where(User.email == user_email)
        user = session.exec(user_statement).first()
        if not user:
            print(f"Creating user {user_email}...")
            user = User(
                email=user_email,
                hashed_password=HashProvider.get_password_hash("password")
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        role_name = "Admin"
        for t_data in tenants_data:
            # Tenant
            statement = select(TenantModel).where(TenantModel.slug == t_data["slug"])
            tenant = session.exec(statement).first()
            if not tenant:
                print(f"Creating tenant '{t_data['name']}'...")
                tenant = TenantModel(
                    name=t_data["name"],
                    slug=t_data["slug"],
                    description=t_data["description"]
                )
                session.add(tenant)
                session.commit()
                session.refresh(tenant)
            
            # Role per tenant
            role_statement = select(Role).where(Role.name == role_name, Role.tenant_id == tenant.id)
            role = session.exec(role_statement).first()
            if not role:
                print(f"Creating role '{role_name}' for tenant {tenant.name}...")
                role = Role(name=role_name, tenant_id=tenant.id)
                session.add(role)
                session.commit()
                session.refresh(role)

            # Membership
            membership_statement = select(UserRoleLink).where(
                UserRoleLink.user_id == user.id,
                UserRoleLink.tenant_id == tenant.id
            )
            membership = session.exec(membership_statement).first()
            if not membership:
                print(f"Associating user {user_email} with tenant {tenant.name}...")
                membership = UserRoleLink(user_id=user.id, role_id=role.id, tenant_id=tenant.id)
                session.add(membership)
                session.commit()

            # Programs
            for p_data in t_data["programs"]:
                p_statement = select(ProgramModel).where(ProgramModel.name == p_data["name"], ProgramModel.tenant_id == tenant.id)
                if not session.exec(p_statement).first():
                    print(f"Creating program '{p_data['name']}' for {tenant.name}...")
                    p = ProgramModel(name=p_data["name"], duration=p_data["duration"], tenant_id=tenant.id)
                    session.add(p)
            session.commit()

if __name__ == "__main__":
    init_tenant()
    print("Tenant initialization complete.")
