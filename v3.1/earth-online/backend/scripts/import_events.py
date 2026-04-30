"""Import frontend events into database."""

import sys
import os
import json
from datetime import datetime, timezone

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.database import SessionLocal, init_db
from app.models import EventTemplate


def import_events():
    """Import events from JSON file to database."""
    db = SessionLocal()
    
    try:
        # Read exported events
        events_file = os.path.join(os.path.dirname(__file__), 'events_export.json')
        
        if not os.path.exists(events_file):
            print(f"Events file not found: {events_file}")
            print("Please run the export script first.")
            return
        
        with open(events_file, 'r', encoding='utf-8') as f:
            events = json.load(f)
        
        print(f"Found {len(events)} events to import")
        
        # Clear existing events
        db.query(EventTemplate).delete()
        db.commit()
        print("Cleared existing events")
        
        # Import events
        imported = 0
        for event in events:
            template = EventTemplate(
                title=event.get('text', '')[:200],
                description=event.get('text', ''),
                category=event.get('eventType', 'life'),
                min_age=event.get('minAge', 0),
                max_age=event.get('maxAge', 120),
                base_weight=event.get('weight', 1.0),
                difficulty_level=0.5,
                choices=event.get('choices', []),
                is_active=True,
                created_at=datetime.now(timezone.utc).isoformat(),
            )
            db.add(template)
            imported += 1
        
        db.commit()
        print(f"Successfully imported {imported} events")
        
    except Exception as e:
        print(f"Error importing events: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == '__main__':
    init_db()
    import_events()
