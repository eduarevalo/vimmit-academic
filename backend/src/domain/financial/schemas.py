from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict

from domain.financial.models import (
    ChargeStatus, PaymentMethod, CircularizationStatus, CostItemStatus
)


# ─── Program Cost Items ──────────────────────────────────────────────────────

class ProgramCostItemCreate(BaseModel):
    program_id: UUID
    level_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    amount: Decimal
    is_recurring: bool = False
    effective_from: date
    effective_until: Optional[date] = None


class ProgramCostItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[Decimal] = None
    is_recurring: Optional[bool] = None
    effective_until: Optional[date] = None
    is_active: Optional[bool] = None


class ProgramCostItemResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    program_id: UUID
    level_id: Optional[UUID] = None
    name: str
    description: Optional[str] = None
    amount: Decimal
    is_recurring: bool
    is_active: bool
    effective_from: date
    effective_until: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Enrollment Charges ──────────────────────────────────────────────────────

class EnrollmentChargeResponse(BaseModel):
    id: UUID
    enrollment_id: UUID
    cost_item_id: Optional[UUID] = None
    tenant_id: UUID
    description: str
    amount: Decimal
    due_date: Optional[date] = None
    status: ChargeStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Payments ────────────────────────────────────────────────────────────────

class PaymentCreate(BaseModel):
    amount: Decimal
    payment_method: PaymentMethod
    reference: Optional[str] = None
    notes: Optional[str] = None
    paid_at: Optional[datetime] = None


class PaymentResponse(BaseModel):
    id: UUID
    student_id: UUID
    tenant_id: UUID
    amount: Decimal
    payment_method: PaymentMethod
    reference: Optional[str] = None
    notes: Optional[str] = None
    paid_at: datetime
    registered_by: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ─── Balance ─────────────────────────────────────────────────────────────────

class StudentBalanceResponse(BaseModel):
    student_id: UUID
    student_name: str
    student_email: str
    tenant_id: UUID
    tenant_name: str
    currency: str
    total_charged: Decimal
    total_paid: Decimal
    balance: Decimal  # total_charged - total_paid
    charges: List[EnrollmentChargeResponse]
    payments: List[PaymentResponse]


# ─── Circularization ─────────────────────────────────────────────────────────

class CircularizationRunResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    run_date: datetime
    initiated_by: UUID
    status: CircularizationStatus
    total_students: int
    emails_sent: int
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
