from unittest.mock import MagicMock, patch
import os
# Force testing mode BEFORE any imports that might use settings
os.environ["TESTING"] = "True"
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from uuid import uuid4
import io

from domain.tenants.models import TenantModel
from domain.organization.campus.models import CampusModel
from domain.academic.programs.models import ProgramModel, ProgramType
from domain.calendar.academic_period.models import CalendarModel
from domain.administrative.enrollment.admission_models import AdmissionStatus
from infrastructure.storage.s3 import S3StorageService
from datetime import date

def test_admission_three_step_flow(client: TestClient, session: Session):
    # Mock S3 Storage to avoid needing a real bucket or credentials
    with patch.object(S3StorageService, 'upload_file', return_value="mock-key"):
        # --- SETUP: Seed Data ---
        tenant = TenantModel(name="Test Tenant", slug="test-tenant")
        session.add(tenant)
        session.commit()
        session.refresh(tenant)

        campus = CampusModel(name="Test Campus", code="TEST", city="Test City", tenant_id=tenant.id)
        program = ProgramModel(
            name="Test Program", 
            tenant_id=tenant.id,
            program_type=ProgramType.TECHNICAL
        )
        session.add(campus)
        session.add(program)
        session.commit()
        session.refresh(campus)
        session.refresh(program)

        calendar = CalendarModel(
            name="Test Calendar", 
            tenant_id=tenant.id, 
            program_id=program.id,
            campus_id=campus.id,
            start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31),
            is_active=True
        )
        session.add(calendar)
        session.commit()
        session.refresh(calendar)

        tenant_slug = tenant.slug

        # --- STEP 1: Personal Information (POST) ---
        personal_data = {
            "full_name": "John Doe Integration",
            "email": "john.integration@example.com",
            "phone": "+1234567890"
        }
        response = client.post(f"/v1/administrative/admissions/public/{tenant_slug}", json=personal_data)
        assert response.status_code == 200
        data = response.json()
        admission_id = data["id"]
        assert data["full_name"] == personal_data["full_name"]
        assert data["status"] == "PENDING"

        # --- STEP 2: Career Data (PATCH) ---
        career_data = {
            "campus_id": str(campus.id),
            "program_id": str(program.id),
            "calendar_id": str(calendar.id)
        }
        response = client.patch(f"/v1/administrative/admissions/public/{tenant_slug}/{admission_id}", json=career_data)
        assert response.status_code == 200
        data = response.json()
        assert data["campus_id"] == str(campus.id)
        assert data["program_id"] == str(program.id)
        assert data["calendar_id"] == str(calendar.id)

        # --- STEP 3: Attachments (PATCH) ---
        # Prepare mock files
        file1 = (io.BytesIO(b"file1 content"), "doc1.pdf", "application/pdf")
        file2 = (io.BytesIO(b"file2 content"), "doc2.jpg", "image/jpeg")
        
        files = [
            ("files", (file1[1], file1[0], file1[2])),
            ("files", (file2[1], file2[0], file2[2]))
        ]
        
        response = client.patch(
            f"/v1/administrative/admissions/public/{tenant_slug}/{admission_id}/attachments",
            files=files
        )
        if response.status_code != 200:
            print(f"Error detail: {response.json()}")
        assert response.status_code == 200
        
        # --- STEP 4: Finalize (PATCH status to VERIFYING) ---
        finalize_data = {
            "status": "VERIFYING"
        }
        response = client.patch(f"/v1/administrative/admissions/public/{tenant_slug}/{admission_id}", json=finalize_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "VERIFYING"

        print(f"\n✅ Admission integration test passed for ID: {admission_id}")
