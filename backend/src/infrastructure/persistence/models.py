# Import all models here so Alembic can discover them through SQLModel.metadata
from domain.identity.models import User, Role, UserRoleLink, Invitation
from domain.administration.models import RegistrationIntentModel, LeadInteractionModel
from domain.academic.programs.models import ProgramModel, ProgramLevelModel
from domain.tenants.models import TenantModel
from domain.organization.campus.models import CampusModel
from domain.calendar.academic_period.models import CalendarModel, TermModel
from domain.administrative.enrollment.models import EnrollmentModel
from domain.administrative.enrollment.admission_models import AdmissionApplicationModel
from domain.shared.attachments import AttachmentModel
from domain.financial.models import ProgramCostItem, EnrollmentCharge, Payment, CircularizationRun

# This list is used for discovery
__all__ = [
    "User",
    "Role",
    "UserRoleLink",
    "Invitation",
    "RegistrationIntentModel",
    "LeadInteractionModel",
    "ProgramModel",
    "ProgramLevelModel",
    "TenantModel",
    "CampusModel",
    "CalendarModel",
    "TermModel",
    "EnrollmentModel",
    "AdmissionApplicationModel",
    "AttachmentModel",
    "ProgramCostItem",
    "EnrollmentCharge",
    "Payment",
    "CircularizationRun",
]
