"""Apply migration 004 - add remark and tags columns."""
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
            "WHERE table_name = 'users' AND column_name = 'remark'"
        ))
        if result.fetchone():
            print("Column 'remark' already exists, skipping...")
        else:
            conn.execute(text("ALTER TABLE users ADD COLUMN remark VARCHAR(500)"))
            print("Column 'remark' added successfully")

        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'users' AND column_name = 'tags'"
        ))
        if result.fetchone():
            print("Column 'tags' already exists, skipping...")
        else:
            conn.execute(text("ALTER TABLE users ADD COLUMN tags JSON DEFAULT '[]'"))
            print("Column 'tags' added successfully")

        conn.commit()
        print("Migration 004 applied successfully!")


if __name__ == "__main__":
    apply_migration()
