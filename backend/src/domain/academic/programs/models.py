import enum
from typing import Optional, List
from sqlmodel import SQLModel, Field, Column, Enum as SAEnum, JSON
from uuid import UUID, uuid4
from datetime import datetime, timezone


class ProgramType(str, enum.Enum):
    K12 = "K12"
    TECHNICAL = "TECHNICAL"


class ProgramModel(SQLModel, table=True):
    __tablename__ = "programs"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(index=True)
    name: str = Field(index=True)
    description: Optional[str] = None
    program_type: ProgramType = Field(
        sa_column=Column(SAEnum(ProgramType), nullable=False)
    )
    # Configuration fields (previously ProgramConfig)
    total_levels: int = Field(default=1)                    # e.g. 13 for K-12, 6 for Technical
    level_label: str = Field(default="Level")              # e.g. "Grade", "Semester", "Level"
    degree_title: Optional[str] = None                    # e.g. "Bachiller", "Técnico Superior"
    credits_per_level: Optional[int] = None               # Technical only
    required_documents: list = Field(default=[], sa_column=Column(JSON))
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProgramLevelModel(SQLModel, table=True):
    __tablename__ = "program_levels"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    program_id: UUID = Field(index=True, foreign_key="programs.id")
    tenant_id: UUID = Field(index=True)   # denormalized, cross-context ref
    name: str                                                        # e.g. "Grade 6", "Semester 2"
    sequence: int                                                    # 1 = first level
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
