"""Seed all event templates from Python source files into database.

Run after alembic upgrade to populate all event_templates rows with new fields.
Usage: python -m app.seed_events
"""

from datetime import datetime

from .database import SessionLocal
from .models import EventTemplate
from .engine.event_data import get_all_templates
from .engine.family_events import FAMILY_EVENTS


def _merge_events():
    events = get_all_templates()
    seen_titles = {e["title"] for e in events}
    for fe in FAMILY_EVENTS:
        if fe["title"] not in seen_titles:
            events.append(fe)
    return events


def _normalize_choices(event):
    choices = event.get("choices", [])
    normalized = []
    for c in choices:
        nc = {
            "text": c.get("text", ""),
            "stat_changes": c.get("stat_changes") or c.get("statChanges", {}),
            "follow_up": c.get("follow_up") or c.get("outcome_text", ""),
        }
        if c.get("difficulty_mod") is not None:
            nc["difficulty_mod"] = c["difficulty_mod"]
        if c.get("consequences") is not None:
            nc["consequences"] = c["consequences"]
        normalized.append(nc)
    return normalized


def seed_events(force=False):
    db = SessionLocal()
    all_events = _merge_events()
    print(f"[seed_events] Total events from Python sources: {len(all_events)}")

    try:
        existing = db.query(EventTemplate).count()
        if existing > 0:
            print(f"[seed_events] Database already has {existing} events.")
            if force:
                db.query(EventTemplate).delete()
                db.commit()
                print("[seed_events] Cleared existing events.")
            else:
                print("[seed_events] Keeping existing events. Use --force to re-seed.")
                return

        created = 0
        for ev in all_events:
            template = EventTemplate(
                title=ev.get("title", ""),
                description=ev.get("description", ""),
                category=ev.get("category", "life"),
                min_age=ev.get("min_age", 0),
                max_age=ev.get("max_age", 120),
                required_culture_tags=ev.get("required_culture_tags", []),
                forbidden_culture_tags=ev.get("forbidden_culture_tags", []),
                required_attrs=ev.get("required_attrs", {}),
                forbidden_attrs=ev.get("forbidden_attrs", {}),
                required_flags=ev.get("required_flags", []),
                forbidden_flags=ev.get("forbidden_flags", []),
                cooldown_category=ev.get("cooldown_category"),
                cooldown_years=ev.get("cooldown_years", 0),
                is_chain_event=ev.get("is_chain_event", False),
                chain_id=ev.get("chain_id"),
                step_id=ev.get("step_id"),
                immediate=ev.get("immediate", False),
                era_trigger=ev.get("era_trigger"),
                outcome_weighted=ev.get("outcome_weighted", False),
                base_weight=ev.get("base_weight", 1.0),
                difficulty_level=ev.get("difficulty_level", 0.5),
                choices=_normalize_choices(ev),
                causality_effects=ev.get("causality_effects", []),
                is_active=True,
                created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            )
            db.add(template)
            created += 1

        db.commit()
        print(f"[seed_events] Seeded {created} event templates.")

        cat_counts = {}
        for ev in all_events:
            cat = ev.get("category", "life")
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
        for cat, count in sorted(cat_counts.items()):
            print(f"  {cat}: {count}")

    finally:
        db.close()


if __name__ == "__main__":
    import sys
    force = "--force" in sys.argv
    seed_events(force=force)
