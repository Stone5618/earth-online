"""Apply migration 005 - add all missing character table columns."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text


def apply_migration():
    with engine.connect() as conn:
        # List of columns to check and add
        columns_to_add = [
            ('spouse_name', 'VARCHAR(100)'),
            ('spouse_quality', 'INTEGER DEFAULT 0'),
            ('event_chains', 'JSON DEFAULT \'{}\''),
            ('trait_memory', 'JSON DEFAULT \'[]\''),
            ('recent_event_titles', 'JSON DEFAULT \'[]\''),
            ('recent_event_categories', 'JSON DEFAULT \'[]\''),
            ('causality_stack', 'JSON DEFAULT \'[]\''),
            ('flags', 'JSON DEFAULT \'{}\''),
            ('nervous_system', 'FLOAT DEFAULT 50'),
            ('sensory', 'FLOAT DEFAULT 50'),
            ('knowledge_tree', 'JSON DEFAULT \'{}\''),
            ('meta_cognition', 'FLOAT DEFAULT 20'),
            ('trauma', 'FLOAT DEFAULT 0'),
            ('value_vector', 'JSON DEFAULT \'{"wealth": 15, "power": 15, "family": 20, "freedom": 15, "knowledge": 20, "pleasure": 15}\''),
            ('reputation', 'FLOAT DEFAULT 50'),
            ('total_assets', 'FLOAT DEFAULT 0'),
            ('time_budget', 'FLOAT DEFAULT 6000'),
            ('attention', 'FLOAT DEFAULT 80'),
            ('career_level', 'VARCHAR(20) DEFAULT \'\''),
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
        print("Migration 005 completed successfully!")


if __name__ == "__main__":
    apply_migration()
