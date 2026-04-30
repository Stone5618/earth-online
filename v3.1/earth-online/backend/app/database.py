"""Database engine and session configuration."""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool

from .config import settings

# Optimized database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_timeout=30,
    poolclass=QueuePool,
)


def _on_connect(dbapi_conn, connection_record):
    """Set pragmas for SQLite to optimize performance."""
    cursor = dbapi_conn.cursor()
    # WAL mode for better concurrent read/write
    cursor.execute("PRAGMA journal_mode=WAL")
    # Reasonable cache size (4MB)
    cursor.execute("PRAGMA cache_size=-4000")
    # Sync every 1000 pages for a balance of speed/safety
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()


if "sqlite" in settings.DATABASE_URL:
    event.listen(engine, "connect", _on_connect)
    # Note: SQLite-specific pragmas are set on connection
    # PostgreSQL uses different connection parameters (handled in DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
