"""Shared test configuration."""
import pytest
import os
import sys
from typing import Generator

# CRITICAL: Set test mode before ANY app module is imported
os.environ["TESTING"] = "1"

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db


@pytest.fixture(scope="session")
def test_engine():
    """Create a shared in-memory test database engine."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    def _on_connect(dbapi_conn, connection_record):
        try:
            dbapi_conn.execute("PRAGMA journal_mode=WAL")
        except Exception:
            pass
    
    event.listen(engine, "connect", _on_connect)
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session(test_engine) -> Generator:
    """Create a fresh database session for each test with automatic rollback."""
    connection = test_engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
