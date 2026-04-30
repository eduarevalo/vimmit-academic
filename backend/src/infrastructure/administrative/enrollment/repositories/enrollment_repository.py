from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from domain.administrative.enrollment.models import EnrollmentModel, EnrollmentStatus
from domain.identity.models import User
from domain.calendar.academic_period.models import CalendarModel
from domain.academic.programs.models import ProgramLevelModel, ProgramModel
from domain.tenants.models import TenantModel


class EnrollmentRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_id_and_tenant(self, enrollment_id: UUID, tenant_id: UUID) -> Optional[EnrollmentModel]:
        return self._session.exec(
            select(EnrollmentModel).where(
                EnrollmentModel.id == enrollment_id,
                EnrollmentModel.tenant_id == tenant_id,
            )
        ).first()

    def get_by_student_level_calendar(
        self, student_id: UUID, level_id: UUID, calendar_id: UUID
    ) -> Optional[EnrollmentModel]:
        """Returns existing enrollment for the unique (student, level, calendar) triple."""
        return self._session.exec(
            select(EnrollmentModel).where(
                EnrollmentModel.student_id == student_id,
                EnrollmentModel.level_id == level_id,
                EnrollmentModel.calendar_id == calendar_id,
            )
        ).first()

    def list_by_calendar(self, calendar_id: UUID, tenant_id: UUID) -> List[EnrollmentModel]:
        return list(self._session.exec(
            select(EnrollmentModel).where(
                EnrollmentModel.calendar_id == calendar_id,
                EnrollmentModel.tenant_id == tenant_id,
            )
        ).all())

    def list_by_student_and_tenant(
        self, student_id: UUID, tenant_id: UUID
    ) -> List[EnrollmentModel]:
        return list(self._session.exec(
            select(EnrollmentModel).where(
                EnrollmentModel.student_id == student_id,
                EnrollmentModel.tenant_id == tenant_id,
            )
        ).all())

    def list_by_student(self, student_id: UUID) -> List[EnrollmentModel]:
        """List all enrollments for a student across all tenants."""
        return list(self._session.exec(
            select(EnrollmentModel).where(EnrollmentModel.student_id == student_id)
        ).all())

    def save(self, enrollment: EnrollmentModel) -> EnrollmentModel:
        self._session.add(enrollment)
        self._session.commit()
        self._session.refresh(enrollment)
        return enrollment

    def list_detailed_enrollments(
        self, tenant_id: UUID, calendar_id: Optional[UUID] = None, status: Optional[str] = None
    ) -> List[dict]:
        """
        Returns enrollments with student, program, level, and calendar names.
        """
        statement = select(
            EnrollmentModel,
            (User.first_name + " " + User.last_name).label("student_name"),
            ProgramModel.name.label("program_name"),
            ProgramLevelModel.name.label("level_name"),
            CalendarModel.name.label("calendar_name"),
            TenantModel.name.label("tenant_name")
        ).join(User, EnrollmentModel.student_id == User.id)\
         .join(ProgramLevelModel, EnrollmentModel.level_id == ProgramLevelModel.id)\
         .join(ProgramModel, ProgramLevelModel.program_id == ProgramModel.id)\
         .join(CalendarModel, EnrollmentModel.calendar_id == CalendarModel.id)\
         .join(TenantModel, EnrollmentModel.tenant_id == TenantModel.id)\
         .where(EnrollmentModel.tenant_id == tenant_id if tenant_id else True)
        
        if calendar_id:
            statement = statement.where(EnrollmentModel.calendar_id == calendar_id)
            
        if status:
            statement = statement.where(EnrollmentModel.status == status)
            
        results = self._session.exec(statement).all()
        
        enrollments = []
        for row in results:
            model, s_name, p_name, l_name, c_name, t_name = row
            enroll_dict = model.model_dump()
            enroll_dict["student_name"] = s_name
            enroll_dict["program_name"] = p_name
            enroll_dict["level_name"] = l_name
            enroll_dict["calendar_name"] = c_name
            enroll_dict["tenant_name"] = t_name
            enrollments.append(enroll_dict)
            
        return enrollments

