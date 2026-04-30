"""Apply migration 005 - fix character table columns."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text


def apply_migration():
    with engine.connect() as conn:
        # Check if columns already exist
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'characters' AND column_name = 'spouse_name'"
        ))
        if result.fetchone():
            print("Column 'spouse_name' already exists, skipping...")
        else:
            conn.execute(text("ALTER TABLE characters ADD COLUMN spouse_name VARCHAR(100)"))
            print("Column 'spouse_name' added successfully")

        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'characters' AND column_name = 'spouse_quality'"
        ))
        if result.fetchone():
            print("Column 'spouse_quality' already exists, skipping...")
        else:
            conn.execute(text("ALTER TABLE characters ADD COLUMN spouse_quality INTEGER DEFAULT 0"))
            print("Column 'spouse_quality' added successfully")

        conn.commit()
        print("Migration 005 applied successfully!")


if __name__ == "__main__":
    apply_migration()
