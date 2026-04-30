import sys
import os
from sqlalchemy import create_engine, MetaData
from sqlmodel import SQLModel

# Add src to sys.path to allow imports from domain, infrastructure, etc.
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from infrastructure.config.settings import get_settings

def reset_db():
    """
    Drops all tables in the database to allow a fresh start.
    DANGEROUS: Only use in development or before first production deployment.
    """
    settings = get_settings()
    DATABASE_URL = settings.database_url_sync
    
    print(f"Targeting Database: {DATABASE_URL}")
    
    confirm = os.getenv("CONFIRM_RESET", "false")
    if confirm != "true":
        print("Set CONFIRM_RESET=true to execute the reset.")
        return

    engine = create_engine(DATABASE_URL)
    
    # We use SQLAlchemy's MetaData to drop everything
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    print(f"Found tables: {list(metadata.tables.keys())}")
    
    if metadata.tables:
        print("Dropping all tables...")
        metadata.drop_all(bind=engine)
        print("All tables dropped.")
    else:
        print("No tables found to drop.")

if __name__ == "__main__":
    reset_db()
