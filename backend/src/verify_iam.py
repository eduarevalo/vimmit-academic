import sys
import os
from fastapi.testclient import TestClient

# Add src to path
sys.path.append(os.path.abspath("backend/src"))

from main import app
from infrastructure.persistence.database import init_db

def test_iam_flow():
    # 1. Initialize Database
    init_db()
    client = TestClient(app)
    
    email = "test@example.com"
    password = "password123"

    print("--- Testing IAM Flow ---")

    # 2. Register User
    print(f"\n[SIGNUP] Registering {email}...")
    response = client.post("/api/v1/identity/users", json={"email": email, "password": password})
    if response.status_code == 201:
        print("User registered successfully!")
    else:
        print(f"Failed to register: {response.json()}")
        return

    # 3. Login
    print(f"\n[LOGIN] Logging in as {email}...")
    response = client.post("/api/v1/identity/auth/token", data={"username": email, "password": password})
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"Login successful! Token: {token[:20]}...")
    else:
        print(f"Login failed: {response.json()}")
        return

    # 4. Access Protected Route (Placeholder /me)
    print("\n[PROTECTED] Accessing /api/v1/identity/auth/me...")
    response = client.get("/api/v1/identity/auth/me", headers={"Authorization": f"Bearer {token}"})
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    # Remove old DB if exists
    if os.path.exists("test.db"):
        os.remove("test.db")
    test_iam_flow()
