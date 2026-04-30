import enum
from typing import Optional
from decimal import Decimal
from uuid import UUID, uuid4
from datetime import date, datetime, timezone
from sqlmodel import SQLModel, Field, Column, Enum as SAEnum, Numeric


class CostItemStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class ChargeStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    PAID = "PAID"
    WAIVED = "WAIVED"
    CANCELLED = "CANCELLED"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    TRANSFER = "TRANSFER"
    CHECK = "CHECK"
    CARD = "CARD"
    OTHER = "OTHER"


class CircularizationStatus(str, enum.Enum):
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ProgramCostItem(SQLModel, table=True):
    """
    Catalog of costs per program/level.
    Costs are snapshots — changing them does NOT affect existing EnrollmentCharges.
    """
    __tablename__ = "program_cost_items"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    program_id: UUID = Field(index=True, foreign_key="programs.id")
    level_id: Optional[UUID] = Field(default=None, index=True, foreign_key="program_levels.id")
    name: str = Field(nullable=False)
    description: Optional[str] = None
    amount: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    is_recurring: bool = Field(default=False)
    is_active: bool = Field(default=True)
    effective_from: date = Field(nullable=False)
    effective_until: Optional[date] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class EnrollmentCharge(SQLModel, table=True):
    """
    Immutable financial charge generated at enrollment time.
    The amount is copied from ProgramCostItem and NEVER changes.
    """
    __tablename__ = "enrollment_charges"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    enrollment_id: UUID = Field(index=True, foreign_key="enrollments.id")
    cost_item_id: Optional[UUID] = Field(default=None, foreign_key="program_cost_items.id")
    tenant_id: UUID = Field(index=True)
    description: str = Field(nullable=False)  # snapshot of cost item name
    amount: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))  # immutable snapshot
    due_date: Optional[date] = Field(default=None)
    status: ChargeStatus = Field(
        default=ChargeStatus.PENDING,
        sa_column=Column(SAEnum(ChargeStatus), nullable=False)
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Payment(SQLModel, table=True):
    """
    A payment applied to a student's overall balance.
    Not linked to a specific charge — payments reduce the total balance.
    """
    __tablename__ = "payments"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_id: UUID = Field(index=True, foreign_key="users.id")
    tenant_id: UUID = Field(index=True)
    amount: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    payment_method: PaymentMethod = Field(
        sa_column=Column(SAEnum(PaymentMethod), nullable=False)
    )
    reference: Optional[str] = Field(default=None)
    notes: Optional[str] = Field(default=None)
    paid_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    registered_by: UUID = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CircularizationRun(SQLModel, table=True):
    """
    Audit record for each balance statement circularization run.
    """
    __tablename__ = "circularization_runs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    run_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    initiated_by: UUID = Field(foreign_key="users.id")
    status: CircularizationStatus = Field(
        default=CircularizationStatus.RUNNING,
        sa_column=Column(SAEnum(CircularizationStatus), nullable=False)
    )
    total_students: int = Field(default=0)
    emails_sent: int = Field(default=0)
    notes: Optional[str] = None
    completed_at: Optional[datetime] = Field(default=None)
