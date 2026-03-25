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
from domain.programs.models import ProgramModel, ProgramType

def init_tenant():
    # Ensure tables are created (creates new columns if DB was reset)
    init_db()

    with Session(engine) as session:
        tenants_data = [
            {
                "name": "Aseder",
                "slug": "aseder",
                "description": "ASEDER en Santander de Quilichao es una institución técnica laboral con más de 25 años de experiencia.",
                "programs": [
                    {
                        "name": "Auxiliar en Enfermería",
                        "program_type": ProgramType.TECHNICAL,
                        "total_levels": 3,
                        "level_label": "Semestre",
                        "degree_title": "Técnico en Enfermería",
                        "credits_per_level": 20,
                    },
                    {
                        "name": "Salud Oral",
                        "program_type": ProgramType.TECHNICAL,
                        "total_levels": 3,
                        "level_label": "Semestre",
                        "degree_title": "Técnico en Salud Oral",
                        "credits_per_level": 20,
                    },
                ]
            },
            {
                "name": "Vimmit Academy",
                "slug": "vimmit-academy",
                "description": "Una academia moderna enfocada en tecnología y diseño.",
                "programs": [
                    {
                        "name": "Desarrollo Web Fullstack",
                        "program_type": ProgramType.TECHNICAL,
                        "total_levels": 2,
                        "level_label": "Módulo",
                        "degree_title": "Certificado Fullstack",
                        "credits_per_level": 15,
                    },
                    {
                        "name": "Diseño UX/UI",
                        "program_type": ProgramType.TECHNICAL,
                        "total_levels": 2,
                        "level_label": "Módulo",
                        "degree_title": "Certificado UX/UI",
                        "credits_per_level": 12,
                    },
                ]
            }
        ]

        # 1. User
        user_email = "test@aseder.edu.co"
        user = session.exec(select(User).where(User.email == user_email)).first()
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
            tenant = session.exec(select(TenantModel).where(TenantModel.slug == t_data["slug"])).first()
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
            role = session.exec(
                select(Role).where(Role.name == role_name, Role.tenant_id == tenant.id)
            ).first()
            if not role:
                print(f"Creating role '{role_name}' for tenant {tenant.name}...")
                role = Role(name=role_name, tenant_id=tenant.id)
                session.add(role)
                session.commit()
                session.refresh(role)

            # Membership
            membership = session.exec(
                select(UserRoleLink).where(
                    UserRoleLink.user_id == user.id,
                    UserRoleLink.tenant_id == tenant.id
                )
            ).first()
            if not membership:
                print(f"Associating user {user_email} with tenant {tenant.name}...")
                session.add(UserRoleLink(user_id=user.id, role_id=role.id, tenant_id=tenant.id))
                session.commit()

            # Programs
            for p_data in t_data["programs"]:
                exists = session.exec(
                    select(ProgramModel).where(
                        ProgramModel.name == p_data["name"],
                        ProgramModel.tenant_id == tenant.id
                    )
                ).first()
                if not exists:
                    print(f"Creating program '{p_data['name']}' for {tenant.name}...")
                    session.add(ProgramModel(tenant_id=tenant.id, **p_data))
            session.commit()

if __name__ == "__main__":
    init_tenant()
    print("Tenant initialization complete.")
