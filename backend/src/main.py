from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.identity.dependencies.auth_dependencies import init_db
from api.identity.v1.auth import router as auth_router
from api.identity.v1.users import router as user_router
from api.administration.v1.registration_intent import router as registration_intent_router
from api.academic.programs.v1.programs import router as programs_router
from api.academic.programs.v1.program_levels import router as program_levels_router
from api.organization.campus.v1.campus import router as campus_router
from api.calendar.academic_period.v1.calendars import router as calendars_router
from api.administrative.enrollment.v1.enrollments import router as enrollments_router
from api.tenants.v1.tenants import router as tenants_router
from infrastructure.config.settings import get_settings

# Ensure models are loaded for init_db()
from domain.academic.programs.models import ProgramModel, ProgramLevelModel
from domain.tenants.models import TenantModel
from domain.organization.campus.models import CampusModel
from domain.calendar.academic_period.models import CalendarModel, TermModel
from domain.administrative.enrollment.models import EnrollmentModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()
    yield

settings = get_settings()
app = FastAPI(
    title=settings.PROJECT_NAME, 
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOW_METHODS,
    allow_headers=settings.ALLOW_HEADERS,
)

# Mounting Identity API
app.include_router(auth_router, prefix="/v1/identity")
app.include_router(user_router, prefix="/v1/identity")

# Mounting Administration API
app.include_router(registration_intent_router, prefix="/v1/administration")
app.include_router(tenants_router, prefix="/v1/administration")

# Mounting Academic API
app.include_router(programs_router, prefix="/v1/academic")
app.include_router(program_levels_router, prefix="/v1/academic")

# Mounting Administrative API
app.include_router(enrollments_router, prefix="/v1/administrative")

# Mounting Organization API
app.include_router(campus_router, prefix="/v1/organization")

# Mounting Calendar API
app.include_router(calendars_router, prefix="/v1/calendar")

@app.get("/")
def read_root():
    return {"message": "Welcome to Vimmit Academic API"}
