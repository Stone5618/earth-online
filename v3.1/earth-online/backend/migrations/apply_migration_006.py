"""Apply migration 006 - add family, assets and career columns."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text


def apply_migration():
    with engine.connect() as conn:
        columns_to_add = [
            ("career_title", "VARCHAR(100) DEFAULT ''"),
            ("house_level", "INTEGER DEFAULT 0"),
            ("car_level", "INTEGER DEFAULT 0"),
            ("house_name", "VARCHAR(100)"),
            ("car_name", "VARCHAR(100)"),
            ("debts", "JSON DEFAULT '[]'"),
            ("family_name", "VARCHAR(100)"),
            ("family_reputation", "FLOAT DEFAULT 50"),
            ("children_data", "JSON DEFAULT '[]'"),
        ]

        for col_name, col_type in columns_to_add:
            result = conn.execute(text(
                f"SELECT column_name FROM information_schema.columns "
                f"WHERE table_name = 'characters' AND column_name = '{col_name}'"
            ))
            if result.fetchone():
                print(f"Column '{col_name}' already exists, skipping...")
            else:
                conn.execute(text(f"ALTER TABLE characters ADD COLUMN {col_name} {col_type}"))
                print(f"Column '{col_name}' added successfully")

        conn.commit()
        print("Migration 006 applied successfully!")


if __name__ == "__main__":
    apply_migration()
