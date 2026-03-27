import sys
import os
from sqlmodel import Session, select
from datetime import date

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from infrastructure.security.hash_provider import HashProvider
from api.identity.dependencies.auth_dependencies import engine, init_db
from domain.identity.models import User, Role, UserRoleLink
from domain.tenants.models import TenantModel
from domain.academic.programs.models import ProgramModel, ProgramLevelModel, ProgramType
from domain.organization.campus.models import CampusModel
from domain.calendar.academic_period.models import CalendarModel, TermModel
from domain.administrative.enrollment.models import EnrollmentModel, EnrollmentStatus


# ─── Helpers ─────────────────────────────────────────────────────────────────

def get_or_create(session: Session, model_class, filters: dict, defaults: dict):
    stmt = select(model_class)
    for k, v in filters.items():
        stmt = stmt.where(getattr(model_class, k) == v)
    obj = session.exec(stmt).first()
    if not obj:
        obj = model_class(**{**filters, **defaults})
        session.add(obj)
    else:
        # Update existing object with new defaults
        for k, v in defaults.items():
            setattr(obj, k, v)
    
    session.commit()
    session.refresh(obj)
    return obj


# ─── Data ────────────────────────────────────────────────────────────────────

TENANTS = [
    {
        "name": "Aseder",
        "slug": "aseder",
        "description": "ASEDER: institución técnica laboral con más de 25 años de experiencia.",
        "campuses": [
            {"name": "Sede Principal",      "code": "MAIN", "city": "Santander de Quilichao", "country": "Colombia", "address": "Calle 3 # 10-86, Barrio Centro"},
            {"name": "Sede Bugalagrande",    "code": "BUGA", "city": "Bugalagrande",          "country": "Colombia", "address": "Calle 7 # 6-46, Barrio Antonio Nariño", "phone": "3234764325"},
            {"name": "Sede Caicedonia",      "code": "CAIC", "city": "Caicedonia",            "country": "Colombia", "address": "Carrera 15 # 4-51, Barrio El Recreo", "phone": "3202609433"},
        ],
        "programs": [
            {
                "name": "Auxiliar en Enfermería",
                "description": "Formación integral para el cuidado y asistencia de pacientes en entornos hospitalarios y domiciliarios.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 3,
                "level_label": "Semestre",
                "degree_title": "Técnico en Enfermería",
                "credits_per_level": 20,
                "levels": ["Primer Semestre", "Segundo Semestre", "Tercer Semestre"],
            },
            {
                "name": "Auxiliar en Salud Oral",
                "description": "Capacitación práctica en higiene dental, asistencia en consultorio y prevención de enfermedades orales.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 3,
                "level_label": "Semestre",
                "degree_title": "Técnico en Salud Oral",
                "credits_per_level": 20,
                "levels": ["Primer Semestre", "Segundo Semestre", "Tercer Semestre"],
            },
            {
                "name": "Auxiliar en Servicios Farmacéuticos",
                "description": "Atención y suministro de medicamentos bajo normatividad legal y técnica.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 3,
                "level_label": "Semestre",
                "degree_title": "Técnico en Servicios Farmacéuticos",
                "credits_per_level": 20,
                "levels": ["Primer Semestre", "Segundo Semestre", "Tercer Semestre"],
            },
            {
                "name": "Auxiliar en Veterinaria",
                "description": "Apoyo en el cuidado, manejo y asistencia médica de animales en clínicas especializadas.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 3,
                "level_label": "Semestre",
                "degree_title": "Técnico en Veterinaria",
                "credits_per_level": 20,
                "levels": ["Primer Semestre", "Segundo Semestre", "Tercer Semestre"],
            },
            {
                "name": "Técnico Laboral en Calidad y Procedimiento Aplicado a la Industria de Alimentos",
                "description": "Control de calidad y procesos seguros en la producción alimentaria industrial.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 3,
                "level_label": "Semestre",
                "degree_title": "Técnico en Calidad de Alimentos",
                "credits_per_level": 20,
                "levels": ["Primer Semestre", "Segundo Semestre", "Tercer Semestre"],
            },
            {
                "name": "Técnico en Atención Integral a la Primera Infancia",
                "description": "Cuidado, educación y desarrollo de niños y niñas en sus primeros años de vida.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 3,
                "level_label": "Semestre",
                "degree_title": "Técnico en Primera Infancia",
                "credits_per_level": 20,
                "levels": ["Primer Semestre", "Segundo Semestre", "Tercer Semestre"],
            },
            {
                "name": "Técnico en Seguridad y Salud en el Trabajo",
                "description": "Prevención de riesgos laborales y fomento de entornos de trabajo seguros.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 3,
                "level_label": "Semestre",
                "degree_title": "Técnico en Seguridad Laboral",
                "credits_per_level": 20,
                "levels": ["Primer Semestre", "Segundo Semestre", "Tercer Semestre"],
            },
            {
                "name": "Técnico Laboral en Agente de Tránsito",
                "description": "Control de movilidad, normatividad de tránsito y seguridad vial.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 3,
                "level_label": "Semestre",
                "degree_title": "Técnico en Agente de Tránsito",
                "credits_per_level": 20,
                "levels": ["Primer Semestre", "Segundo Semestre", "Tercer Semestre"],
            },
        ],
    },
    {
        "name": "Vimmit Academy",
        "slug": "vimmit-academy",
        "description": "Una academia moderna enfocada en tecnología y diseño.",
        "campuses": [
            {"name": "Campus Digital", "code": "DIGI", "city": "Bogotá", "country": "Colombia"},
        ],
        "programs": [
            {
                "name": "Desarrollo Web Fullstack",
                "description": "Domina las tecnologías más demandadas: desde el diseño de interfaces hasta la arquitectura de servidores.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 2,
                "level_label": "Módulo",
                "degree_title": "Certificado Fullstack",
                "credits_per_level": 15,
                "levels": ["Módulo 1: Frontend", "Módulo 2: Backend"],
            },
            {
                "name": "Diseño UX/UI",
                "description": "Aprende a crear experiencias digitales cautivadoras centradas en el usuario y su necesidad.",
                "program_type": ProgramType.TECHNICAL,
                "total_levels": 2,
                "level_label": "Módulo",
                "degree_title": "Certificado UX/UI",
                "credits_per_level": 12,
                "levels": ["Módulo 1: Fundamentos", "Módulo 2: Prototipado"],
            },
        ],
    },
]


# ─── Main ────────────────────────────────────────────────────────────────────

def init_tenant():
    init_db()

    with Session(engine) as session:
        # ── Test Users ────────────────────────────────────────────────────────
        admin_user = get_or_create(
            session, User,
            filters={"email": "test@aseder.edu.co"},
            defaults={"hashed_password": HashProvider.get_password_hash("password")},
        )
        viewer_user = get_or_create(
            session, User,
            filters={"email": "viewer@aseder.edu.co"},
            defaults={"hashed_password": HashProvider.get_password_hash("password")},
        )
        print(f"Users: {admin_user.email}, {viewer_user.email}")

        for t_data in TENANTS:
            # ── Tenant ────────────────────────────────────────────────────────
            tenant = get_or_create(
                session, TenantModel,
                filters={"slug": t_data["slug"]},
                defaults={"name": t_data["name"], "description": t_data["description"]},
            )
            print(f"\nTenant: {tenant.name}")

            # ── Roles + Membership ─────────────────────────────────────────────
            admin_role = get_or_create(
                session, Role,
                filters={"name": "Admin", "tenant_id": tenant.id},
                defaults={},
            )
            viewer_role = get_or_create(
                session, Role,
                filters={"name": "Viewer", "tenant_id": tenant.id},
                defaults={},
            )

            # Link Admin user
            get_or_create(
                session, UserRoleLink,
                filters={"user_id": admin_user.id, "tenant_id": tenant.id},
                defaults={"role_id": admin_role.id},
            )
            # Link Viewer user
            get_or_create(
                session, UserRoleLink,
                filters={"user_id": viewer_user.id, "tenant_id": tenant.id},
                defaults={"role_id": viewer_role.id},
            )

            # ── Campuses ──────────────────────────────────────────────────────
            campus_objects = []
            for c_data in t_data["campuses"]:
                campus = get_or_create(
                    session, CampusModel,
                    filters={"tenant_id": tenant.id, "code": c_data["code"]},
                    defaults={
                        "name": c_data["name"],
                        "city": c_data["city"],
                        "country": c_data["country"],
                        "address": c_data.get("address"),
                        "phone": c_data.get("phone"),
                    },
                )
                campus_objects.append(campus)
                print(f"  Campus: {campus.name} ({campus.code})")

            # ── Programs + Levels + Calendars + Terms ─────────────────────────
            for p_data in t_data["programs"]:
                levels_names = p_data.pop("levels")

                # Program
                program = get_or_create(
                    session, ProgramModel,
                    filters={"tenant_id": tenant.id, "name": p_data["name"]},
                    defaults={k: v for k, v in p_data.items() if k != "name"},
                )
                print(f"  Program: {program.name}")

                # Program levels
                level_objects = []
                for seq, level_name in enumerate(levels_names, start=1):
                    level = get_or_create(
                        session, ProgramLevelModel,
                        filters={"program_id": program.id, "sequence": seq},
                        defaults={"tenant_id": tenant.id, "name": level_name},
                    )
                    level_objects.append(level)
                    print(f"    Level {seq}: {level.name}")

                # Calendar (one per program per campus, year 2025-2026)
                for campus in campus_objects:
                    calendar = get_or_create(
                        session, CalendarModel,
                        filters={"program_id": program.id, "campus_id": campus.id},
                        defaults={
                            "tenant_id": tenant.id,
                            "name": f"Año Académico 2025-2026 – {program.name} ({campus.city})",
                            "start_date": date(2025, 2, 1),
                            "end_date":   date(2025, 12, 15),
                            "enrollment_open":  date(2025, 1, 5),
                            "enrollment_close": date(2025, 1, 25),
                        },
                    )
                    print(f"    Calendar: {calendar.name}")

                # Terms (one term per level)
                term_dates = [
                    (date(2025, 2,  1), date(2025, 5, 31)),
                    (date(2025, 6,  1), date(2025, 9, 30)),
                    (date(2025, 10, 1), date(2025, 12, 15)),
                ]
                for idx, level in enumerate(level_objects):
                    s_date, e_date = term_dates[idx % len(term_dates)]
                    term = get_or_create(
                        session, TermModel,
                        filters={"calendar_id": calendar.id, "level_id": level.id},
                        defaults={
                            "tenant_id": tenant.id,
                            "name": f"Período {idx + 1} – {level.name}",
                            "sequence": idx + 1,
                            "start_date": s_date,
                            "end_date":   e_date,
                            "weight_percent": None,
                        },
                    )
                    print(f"      Term: {term.name}")

                # ── Enrollment (test user in first level, first campus) ─────────────
                if level_objects:
                    # Use a calendar associated with the first campus for the test enrollment
                    first_campus_calendar = session.exec(
                        select(CalendarModel).where(
                            CalendarModel.program_id == program.id,
                            CalendarModel.campus_id == campus_objects[0].id
                        )
                    ).first()

                    if first_campus_calendar:
                        enrollment = get_or_create(
                            session, EnrollmentModel,
                            filters={
                                "student_id":  admin_user.id,
                                "level_id":    level_objects[0].id,
                                "calendar_id": first_campus_calendar.id,
                            },
                            defaults={
                                "tenant_id": tenant.id,
                                "status":    EnrollmentStatus.CONFIRMED,
                            },
                        )
                        print(f"      Enrollment: {enrollment.status} → {level_objects[0].name}")

                # Restore levels list for potential re-runs
                p_data["levels"] = levels_names


if __name__ == "__main__":
    init_tenant()
    print("\nTenant initialization complete.")
