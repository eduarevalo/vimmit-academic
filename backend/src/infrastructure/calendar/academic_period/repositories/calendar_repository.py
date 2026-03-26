from typing import List, Optional
from uuid import UUID
from sqlmodel import Session, select
from domain.calendar.academic_period.models import CalendarModel, TermModel


class CalendarRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_id_and_tenant(self, calendar_id: UUID, tenant_id: UUID) -> Optional[CalendarModel]:
        return self._session.exec(
            select(CalendarModel).where(
                CalendarModel.id == calendar_id,
                CalendarModel.tenant_id == tenant_id,
            )
        ).first()

    def list_by_program_and_campus(
        self, program_id: UUID, campus_id: UUID, tenant_id: UUID, active_only: bool = True
    ) -> List[CalendarModel]:
        stmt = select(CalendarModel).where(
            CalendarModel.program_id == program_id,
            CalendarModel.campus_id == campus_id,
            CalendarModel.tenant_id == tenant_id,
        )
        if active_only:
            stmt = stmt.where(CalendarModel.is_active == True)
        return list(self._session.exec(stmt).all())

    def list_by_tenant(self, tenant_id: UUID, active_only: bool = True) -> List[CalendarModel]:
        stmt = select(CalendarModel).where(CalendarModel.tenant_id == tenant_id)
        if active_only:
            stmt = stmt.where(CalendarModel.is_active == True)
        return list(self._session.exec(stmt).all())

    def list_by_tenant_enriched(self, tenant_id: UUID, active_only: bool = True) -> List[dict]:
        from domain.academic.programs.models import ProgramModel
        from domain.organization.campus.models import CampusModel

        stmt = (
            select(CalendarModel, ProgramModel.name.label("program_name"), CampusModel.name.label("campus_name"))
            .join(ProgramModel, CalendarModel.program_id == ProgramModel.id)
            .join(CampusModel, CalendarModel.campus_id == CampusModel.id)
            .where(CalendarModel.tenant_id == tenant_id)
        )
        if active_only:
            stmt = stmt.where(CalendarModel.is_active == True)

        results = self._session.exec(stmt).all()
        enriched = []
        for cal, p_name, c_name in results:
            # We convert to dict and inject names so it matches CalendarResponse
            cal_dict = cal.model_dump()
            cal_dict["program_name"] = p_name
            cal_dict["campus_name"] = c_name
            enriched.append(cal_dict)
        return enriched

    def save(self, calendar: CalendarModel) -> CalendarModel:
        self._session.add(calendar)
        self._session.commit()
        self._session.refresh(calendar)
        return calendar

    def delete(self, calendar: CalendarModel) -> None:
        self._session.delete(calendar)
        self._session.commit()


class TermRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_by_id_and_tenant(self, term_id: UUID, tenant_id: UUID) -> Optional[TermModel]:
        return self._session.exec(
            select(TermModel).where(
                TermModel.id == term_id,
                TermModel.tenant_id == tenant_id,
            )
        ).first()

    def list_by_calendar_and_level(
        self, calendar_id: UUID, level_id: UUID
    ) -> List[TermModel]:
        return list(self._session.exec(
            select(TermModel).where(
                TermModel.calendar_id == calendar_id,
                TermModel.level_id == level_id,
            ).order_by(TermModel.sequence)
        ).all())

    def list_by_calendar(self, calendar_id: UUID) -> List[TermModel]:
        return list(self._session.exec(
            select(TermModel)
            .where(TermModel.calendar_id == calendar_id)
            .order_by(TermModel.sequence)
        ).all())

    def save(self, term: TermModel) -> TermModel:
        self._session.add(term)
        self._session.commit()
        self._session.refresh(term)
        return term

    def delete(self, term: TermModel) -> None:
        self._session.delete(term)
        self._session.commit()
