from typing import List
from uuid import UUID
from sqlmodel import Session
from fastapi import HTTPException

from infrastructure.identity.repositories.user_repository import UserRepository
from infrastructure.administrative.enrollment.repositories.enrollment_repository import EnrollmentRepository
from application.financial.payment_service import PaymentService
from domain.administrative.students.schemas import StudentSummaryResponse, StudentProfileResponse
from domain.administrative.enrollment.schemas import EnrollmentResponse
from domain.identity.models import User
from domain.tenants.models import TenantModel


class StudentDirectoryService:
    def __init__(self, session: Session):
        self._session = session
        self.user_repo = UserRepository(session)
        self.enrollment_repo = EnrollmentRepository(session)
        self.payment_service = PaymentService(session)

    def get_student_directory(self, tenant_ids: List[UUID]) -> List[StudentSummaryResponse]:
        """Returns a deduplicated list of students with summarized academic context."""
        from sqlmodel import select
        from domain.administrative.enrollment.models import EnrollmentModel
        
        # 1. Get all students who have at least one enrollment in the authorized tenants
        # Distinct User IDs to avoid duplicates in the main list
        student_ids_stmt = select(User.id)\
            .join(EnrollmentModel, EnrollmentModel.student_id == User.id)\
            .where(EnrollmentModel.tenant_id.in_(tenant_ids))\
            .distinct()
        
        student_ids = self._session.exec(student_ids_stmt).all()
        if not student_ids:
            return []

        # 2. Fetch User objects for these IDs
        users = self._session.exec(select(User).where(User.id.in_(student_ids))).all()
        
        # 3. Fetch ALL detailed enrollments for these students across these tenants
        # This allows us to aggregate program names and institutions
        all_enrollments = self.enrollment_repo.list_detailed_enrollments(None) # Get all
        # Filter in memory for authorized tenants and students
        valid_enrollments = [e for e in all_enrollments if e["tenant_id"] in tenant_ids and e["student_id"] in student_ids]

        # 4. Group enrollments by student_id for aggregation
        enrollment_lookup = {}
        for e in valid_enrollments:
            s_id = e["student_id"]
            if s_id not in enrollment_lookup:
                enrollment_lookup[s_id] = []
            enrollment_lookup[s_id].append(e)

        directory = []
        for user in users:
            student_enrollments = enrollment_lookup.get(user.id, [])
            
            # Aggregate unique programs and institutions
            programs = list(set(e["program_name"] for e in student_enrollments if e["program_name"]))
            institutions = list(set(e["tenant_name"] for e in student_enrollments if e["tenant_name"]))

            directory.append(
                StudentSummaryResponse(
                    id=user.id,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email,
                    phone=user.phone,
                    programs=programs,
                    institutions=institutions
                )
            )

        return directory

    def get_student_profile(self, student_id: UUID, tenant_ids: List[UUID]) -> StudentProfileResponse:
        """Returns the full 360 view of a student across multiple institutions."""
        user = self._session.get(User, student_id)
        if not user:
            raise HTTPException(status_code=404, detail="Student not found")

        all_enrollments = []
        financial_summaries = []

        for tenant_id in tenant_ids:
            # 1. Enrollments (Historical and active)
            tenant_enrollments = self._get_detailed_enrollments_for_student(student_id, tenant_id)
            all_enrollments.extend(tenant_enrollments)
            
            # 2. Finances (Only include if there is activity to avoid clutter)
            balance_data = self.payment_service.get_student_balance(student_id, tenant_id)
            if balance_data.total_charged > 0 or balance_data.total_paid > 0:
                financial_summaries.append(balance_data)

        # Ensure we have at least one financial summary if user exists (can be empty if no records)
        if not financial_summaries and tenant_ids:
            # Default to the first one just to show something
            financial_summaries.append(self.payment_service.get_student_balance(student_id, tenant_ids[0]))

        return StudentProfileResponse(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            phone=user.phone,
            created_at=user.created_at,
            enrollments=all_enrollments,
            financials=financial_summaries
        )

    def _get_detailed_enrollments_for_student(self, student_id: UUID, tenant_id: UUID) -> List[dict]:
        # Using the existing list_detailed_enrollments
        all_enrollments = self.enrollment_repo.list_detailed_enrollments(tenant_id)
        return [e for e in all_enrollments if e["student_id"] == student_id]

    def get_student_enrollments(self, student_id: UUID, tenant_ids: List[UUID]) -> List[EnrollmentResponse]:
        """Returns all enrollments for a student across specified tenants."""
        all_enrollments = []
        for tenant_id in tenant_ids:
            tenant_enrollments = self._get_detailed_enrollments_for_student(student_id, tenant_id)
            all_enrollments.extend([EnrollmentResponse.model_validate(e) for e in tenant_enrollments])
        return all_enrollments
