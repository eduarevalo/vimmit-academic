from typing import List, Optional, BinaryIO
from uuid import UUID
from sqlmodel import Session, select
from datetime import datetime, timezone

from domain.administrative.enrollment.admission_models import AdmissionApplicationModel, AdmissionStatus
from domain.administrative.enrollment.admission_schemas import (
    AdmissionPublicCreate, 
    AdmissionAdminCreate, 
    AdmissionUpdate, 
    AdmissionPublicUpdate,
    AdmissionResponse
)
from domain.shared.attachments import AttachmentModel
from domain.shared.schemas.attachment_schema import AttachmentResponse
from application.shared.attachment_service import AttachmentService
from application.financial.cost_service import CostService
from infrastructure.email.email_service import EmailService
from domain.tenants.models import TenantModel
from domain.academic.programs.models import ProgramModel, ProgramLevelModel
from domain.organization.campus.models import CampusModel
from domain.calendar.academic_period.models import CalendarModel
from domain.administrative.enrollment.models import EnrollmentModel, EnrollmentStatus
from domain.identity.models import User
from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.identity.repositories.role_repository import RoleRepository
from infrastructure.security.hash_provider import HashProvider
import secrets
import string

class AdmissionService:
    def __init__(self, session: Session):
        self.session = session
        self.attachment_service = AttachmentService(session)
        self.email_service = EmailService()
        self.cost_service = CostService(session)

    async def create_public_application(
        self, 
        tenant_slug: str, 
        data: AdmissionPublicCreate,
        files: List[tuple] = None # List of (filename, file_obj, content_type, size)
    ) -> AdmissionApplicationModel:
        # 1. Get Tenant
        statement = select(TenantModel).where(TenantModel.slug == tenant_slug)
        tenant = self.session.exec(statement).first()
        if not tenant:
            raise ValueError(f"Tenant {tenant_slug} not found")

        # 2. Create Application
        db_admission = AdmissionApplicationModel(
            tenant_id=tenant.id,
            campus_id=data.campus_id,
            program_id=data.program_id,
            calendar_id=data.calendar_id,
            full_name=data.full_name,
            email=data.email,
            phone=data.phone,
            notes=data.notes,
            status=AdmissionStatus.PENDING
        )
        self.session.add(db_admission)
        self.session.commit()
        self.session.refresh(db_admission)

        # 3. Handle Attachments
        if files:
            for file_name, file_obj, content_type, size in files:
                await self.attachment_service.upload_attachment(
                    tenant_id=tenant.id,
                    file_name=file_name,
                    file_obj=file_obj,
                    content_type=content_type,
                    size=size,
                    entity_type="ADMISSION",
                    entity_id=db_admission.id
                )

        # 4. Email is now only sent upon finalization in update_public_application


        return db_admission

    async def update_public_application(
        self,
        admission_id: UUID,
        data: AdmissionPublicUpdate,
        files: List[tuple] = None
    ) -> AdmissionApplicationModel:
        db_admission = self._get_application_model(admission_id)
        if not db_admission:
            raise ValueError(f"Admission {admission_id} not found")

        # Update metadata
        if data.full_name is not None:
            db_admission.full_name = data.full_name
        if data.email is not None:
            db_admission.email = data.email
        if data.phone is not None:
            db_admission.phone = data.phone
        if data.campus_id is not None:
            db_admission.campus_id = data.campus_id
        if data.program_id is not None:
            db_admission.program_id = data.program_id
        if data.calendar_id is not None:
            db_admission.calendar_id = data.calendar_id
        if data.notes is not None:
            db_admission.notes = data.notes
        if data.status is not None:
            db_admission.status = data.status

        # Handle status-based transitions
        is_finalizing = data.status == AdmissionStatus.VERIFYING and db_admission.status != AdmissionStatus.VERIFYING
        
        db_admission.updated_at = datetime.now(timezone.utc)
        self.session.add(db_admission)
        
        # Handle new attachments
        if files:
            for file_name, file_obj, content_type, size in files:
                await self.attachment_service.upload_attachment(
                    tenant_id=db_admission.tenant_id,
                    file_name=file_name,
                    file_obj=file_obj,
                    content_type=content_type,
                    size=size,
                    entity_type="ADMISSION",
                    entity_id=db_admission.id
                )

        self.session.commit()
        self.session.refresh(db_admission)

        # Send full confirmation email only if finalizing
        if is_finalizing:
            # Re-fetch tenant to get slug and name
            statement = select(TenantModel).where(TenantModel.id == db_admission.tenant_id)
            tenant = self.session.exec(statement).first()
            if tenant:
                await self.email_service.send_admission_confirmation(
                    to_email=db_admission.email,
                    full_name=db_admission.full_name,
                    tenant_slug=tenant.slug,
                    tenant_name=tenant.name
                )

        return db_admission

    def list_applications(self, tenant_id: Optional[UUID] = None) -> List[AdmissionResponse]:
        statement = select(
            AdmissionApplicationModel, 
            ProgramModel.name.label("program_name"),
            CampusModel.name.label("campus_name"),
            CalendarModel.name.label("calendar_name")
        ).outerjoin(ProgramModel, AdmissionApplicationModel.program_id == ProgramModel.id)\
         .outerjoin(CampusModel, AdmissionApplicationModel.campus_id == CampusModel.id)\
         .outerjoin(CalendarModel, AdmissionApplicationModel.calendar_id == CalendarModel.id)

        if tenant_id:
            statement = statement.where(AdmissionApplicationModel.tenant_id == tenant_id)
        
        results = self.session.exec(statement).all()
        
        admissions = []
        for result in results:
            admission_model, p_name, c_name, cal_name = result
            # Map to AdmissionResponse dictionary first
            admission_dict = admission_model.model_dump()
            admission_dict["program_name"] = p_name
            admission_dict["campus_name"] = c_name
            admission_dict["calendar_name"] = cal_name
            admissions.append(AdmissionResponse(**admission_dict))
            
        return admissions

    def get_application(self, admission_id: UUID) -> Optional[AdmissionResponse]:
        statement = select(
            AdmissionApplicationModel, 
            ProgramModel.name.label("program_name"),
            CampusModel.name.label("campus_name"),
            CalendarModel.name.label("calendar_name")
        ).outerjoin(ProgramModel, AdmissionApplicationModel.program_id == ProgramModel.id)\
         .outerjoin(CampusModel, AdmissionApplicationModel.campus_id == CampusModel.id)\
         .outerjoin(CalendarModel, AdmissionApplicationModel.calendar_id == CalendarModel.id)\
         .where(AdmissionApplicationModel.id == admission_id)
         
        result = self.session.exec(statement).first()
        if not result:
            return None
            
        admission_model, p_name, c_name, cal_name = result
        
        # Fetch Attachments
        attachments = self.attachment_service.get_attachments_for_entity("ADMISSION", admission_id)
        attachment_responses = []
        for att in attachments:
            download_url = self.attachment_service.get_download_url(att)
            att_resp = AttachmentResponse.model_validate(att)
            att_resp.downloadUrl = download_url
            attachment_responses.append(att_resp)
            
        admission_dict = admission_model.model_dump()
        admission_dict["program_name"] = p_name
        admission_dict["campus_name"] = c_name
        admission_dict["calendar_name"] = cal_name
        admission_dict["attachments"] = attachment_responses
        return AdmissionResponse(**admission_dict)

    def _get_application_model(self, admission_id: UUID) -> Optional[AdmissionApplicationModel]:
        """Internal helper to get the raw SQLModel instance for updates."""
        return self.session.get(AdmissionApplicationModel, admission_id)

    def update_status(self, admission_id: UUID, data: AdmissionUpdate) -> Optional[AdmissionApplicationModel]:
        db_admission = self._get_application_model(admission_id)
        if not db_admission:
            return None
        
        if data.status:
            db_admission.status = data.status
        if data.notes:
            db_admission.notes = data.notes
        
        db_admission.updated_at = datetime.now(timezone.utc)
        self.session.add(db_admission)
        self.session.commit()
        self.session.refresh(db_admission)
        return db_admission

    async def enroll_applicant(self, admission_id: UUID) -> Optional[AdmissionApplicationModel]:
        """
        Promotes a verified admission to a formal enrollment.
        1. Creates/gets a User for the applicant.
        2. Enrolls them in the first level of the selected program.
        3. Marks Admission as ENROLLED.
        """
        db_admission = self._get_application_model(admission_id)
        if not db_admission:
            return None
        
        if not db_admission.program_id or not db_admission.calendar_id:
            raise ValueError("Admission must have a program and calendar assigned to enroll.")

        # 1. Ensure User exists
        user_repo = UserRepository(self.session)
        user = user_repo.get_by_email(db_admission.email)
        
        is_new_user = False
        temp_password = ""
        
        if not user:
            is_new_user = True
            # Generate a random temporary password
            alphabet = string.ascii_letters + string.digits
            temp_password = ''.join(secrets.choice(alphabet) for i in range(12))
            
            hash_provider = HashProvider()
            hashed_password = hash_provider.get_password_hash(temp_password)
            
            # Split name into first and last if possible
            names = db_admission.full_name.split(" ", 1)
            first_name = names[0]
            last_name = names[1] if len(names) > 1 else ""
            
            user = User(
                email=db_admission.email,
                hashed_password=hashed_password,
                first_name=first_name,
                last_name=last_name,
                phone=db_admission.phone
            )
            user = user_repo.save(user)
        else:
            # User exists, optionally update name if missing
            if not user.first_name:
                names = db_admission.full_name.split(" ", 1)
                user.first_name = names[0]
                user.last_name = names[1] if len(names) > 1 else ""
                user = user_repo.save(user)
            
        # 2. Proceed with academic objects (Student identification is now derived from enrollments)
        # Note: We no longer create a UserRoleLink for students to maintain orthogonality

        # 2.1 Associate Profile Photo if available
        # We look for a document named "Fotos tamaño carnet" or containing "Foto" or "Profile"
        attachments = self.attachment_service.get_attachments_for_entity("ADMISSION", admission_id)
        for att in attachments:
            name_lower = att.file_name.lower()
            if "foto" in name_lower or "profile" in name_lower or "portrait" in name_lower:
                # We found a potential photo. Update initial user avatar.
                # Store the reference, not the presigned URL which is too long and expires
                user.avatar_url = f"attachment:{att.id}"
                user = user_repo.save(user)
                break

        # 2. Find first level of the program
        level_statement = select(ProgramLevelModel).where(
            ProgramLevelModel.program_id == db_admission.program_id,
            ProgramLevelModel.sequence == 1
        )
        first_level = self.session.exec(level_statement).first()
        
        if not first_level:
            # Fallback or error if no levels defined
            raise ValueError("No levels defined for this program. Cannot enroll.")

        # 3. Create Enrollment
        enrollment = EnrollmentModel(
            student_id=user.id,
            level_id=first_level.id,
            calendar_id=db_admission.calendar_id,
            tenant_id=db_admission.tenant_id,
            notes=f"Converted from Admission {db_admission.id}"
        )
        self.session.add(enrollment)
        # Flush to get enrollment.id generated
        self.session.flush()
        self.session.refresh(enrollment)

        # 4. Generate financial charges for the enrollment
        self.cost_service.generate_charges_for_enrollment(
            enrollment_id=enrollment.id, 
            tenant_id=db_admission.tenant_id
        )

        # 5. Update Admission Status
        db_admission.status = AdmissionStatus.ENROLLED
        db_admission.updated_at = datetime.now(timezone.utc)
        self.session.add(db_admission)

        self.session.commit()
        self.session.refresh(db_admission)

        # 5. Send Notification
        # Get Tenant for slug/name
        tenant_statement = select(TenantModel).where(TenantModel.id == db_admission.tenant_id)
        tenant = self.session.exec(tenant_statement).first()
        
        if tenant:
            await self.email_service.send_enrollment_finalized(
                to_email=db_admission.email,
                full_name=db_admission.full_name,
                tenant_slug=tenant.slug,
                tenant_name=tenant.name,
                is_new_user=is_new_user,
                temp_password=temp_password
            )

        return db_admission

