from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from decimal import Decimal

from domain.financial.schemas import StudentBalanceResponse
from domain.administrative.enrollment.schemas import EnrollmentResponse


class StudentSummaryResponse(BaseModel):
    id: UUID
    first_name: Optional[str]
    last_name: Optional[str]
    email: str
    phone: Optional[str]
    # Aggregated Info
    programs: List[str] = []
    institutions: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class StudentProfileResponse(BaseModel):
    id: UUID
    first_name: Optional[str]
    last_name: Optional[str]
    email: str
    phone: Optional[str]
    created_at: datetime
    
    # Nested rich data for tabs
    enrollments: List[EnrollmentResponse]
    financials: List[StudentBalanceResponse]

    model_config = ConfigDict(from_attributes=True)
