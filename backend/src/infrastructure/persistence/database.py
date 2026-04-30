from typing import Generator
from sqlmodel import Session, create_engine, SQLModel
from infrastructure.config.settings import get_settings

settings = get_settings()

DATABASE_URL = settings.database_url_sync
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Create the singleton engine
engine = create_engine(
    DATABASE_URL, 
    connect_args=connect_args,
    # Standard connection pooling for production
    pool_pre_ping=True
)

def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.
    """
    with Session(engine) as session:
        yield session

def init_db(target_engine=None):
    """
    Utility to create tables (used primarily in development).
    In production, we use Alembic migrations.
    """
    # Import models to ensure they are registered
    import infrastructure.persistence.models  # noqa
    db_engine = target_engine or engine
    SQLModel.metadata.create_all(db_engine)
