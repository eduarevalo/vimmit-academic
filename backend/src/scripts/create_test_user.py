import sys
import os
from sqlmodel import Session, select

# Add src to sys.path to allow imports from domain, infrastructure, etc.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from domain.identity.models import User
from infrastructure.security.hash_provider import HashProvider
from infrastructure.persistence.database import engine

def create_test_user():
    # Ensure tables exist
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)
    
    test_email = "test@vimmit.com"
    test_password = "password123"
    
    with Session(engine) as session:
        # Check if user already exists
        statement = select(User).where(User.email == test_email)
        existing_user = session.exec(statement).first()
        
        if existing_user:
            print(f"User {test_email} already exists.")
            return

        # Create new test user
        print(f"Creating test user: {test_email}")
        hashed_password = HashProvider.get_password_hash(test_password)
        user = User(
            email=test_email,
            hashed_password=hashed_password,
            is_active=True
        )
        
        session.add(user)
        session.commit()
        print("Test user created successfully.")

if __name__ == "__main__":
    create_test_user()
