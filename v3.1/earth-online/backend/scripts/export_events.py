"""Export frontend events to JSON for database import."""

import sys
import os
import json
import re

# Add frontend src to path
frontend_path = os.path.join(os.path.dirname(__file__), '../../frontend/src')
sys.path.insert(0, frontend_path)


def extract_events_from_file(file_path):
    """Extract event objects from TypeScript file."""
    events = []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find event objects
    # This is a basic extraction - for production, use AST parsing
    event_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"]\s*,'
    
    # Find all event IDs
    ids = re.findall(event_pattern, content)
    
    return ids


def main():
    """Export all events to JSON."""
    events_dir = os.path.join(frontend_path, 'game/events')
    
    all_events = []
    
    # Process each event file
    event_files = [
        'event_base.ts',
        'event_health.ts', 
        'event_consumption.ts',
        'event_teen.ts',
        'event_career.ts',
        'event_mid.ts',
        'event_late.ts'
    ]
    
    for filename in event_files:
        file_path = os.path.join(events_dir, filename)
        if os.path.exists(file_path):
            ids = extract_events_from_file(file_path)
            print(f"Found {len(ids)} events in {filename}")
            all_events.extend(ids)
        else:
            print(f"File not found: {file_path}")
    
    print(f"\nTotal events found: {len(all_events)}")
    print("Event IDs:", all_events[:10], "...")
    
    # Save to JSON (placeholder - actual implementation needs proper parsing)
    output = {
        "count": len(all_events),
        "events": all_events,
        "note": "Full event extraction requires TypeScript AST parsing"
    }
    
    output_file = os.path.join(os.path.dirname(__file__), 'events_export.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved to {output_file}")


if __name__ == '__main__':
    main()
