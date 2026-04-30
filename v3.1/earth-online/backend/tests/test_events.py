"""
Tests for event library and event data validation.
"""
import pytest
import sys
sys.path.insert(0, '.')

from app.engine.event_data import get_all_templates
from app.engine.childhood_events import CHILDHOOD_EVENTS
from app.engine.adolescence_events import ADOLESCENCE_EVENTS
from app.engine.adulthood_events import ADULTHOOD_EVENTS
from app.engine.laterlife_events import LATERLIFE_EVENTS


class TestEventLibrary:
    """Test event library loading and validation."""

    def test_get_all_templates(self):
        """Test that we can load all event templates."""
        events = get_all_templates()
        assert isinstance(events, list)
        assert len(events) > 0
        print(f"\nLoaded {len(events)} events total")

    def test_event_categories(self):
        """Test that all events have valid categories."""
        events = get_all_templates()
        valid_categories = {
            'health', 'family', 'milestone', 'life',
            'education', 'social', 'relationship',
            'career', 'wealth', 'moral_dilemma', 'era'
        }

        for event in events:
            assert 'category' in event
            assert event['category'] in valid_categories, \
                f"Invalid category: {event['category']} for event {event.get('title')}"

    def test_event_age_ranges(self):
        """Test that events have valid age ranges."""
        events = get_all_templates()

        for event in events:
            assert 'min_age' in event
            assert 'max_age' in event
            min_age = event['min_age']
            max_age = event['max_age']

            assert min_age >= 0
            assert max_age <= 120
            assert min_age <= max_age, \
                f"Invalid age range for {event.get('title')}: {min_age}-{max_age}"

    def test_event_required_fields(self):
        """Test that all events have required fields."""
        events = get_all_templates()
        required_fields = ['title', 'category', 'description', 'min_age', 'max_age']

        for event in events:
            for field in required_fields:
                assert field in event, f"Missing {field} in event: {event}"

    def test_event_choices_format(self):
        """Test that event choices are properly formatted."""
        events = get_all_templates()

        for event in events:
            if 'choices' in event and event['choices']:
                assert isinstance(event['choices'], list)
                for choice in event['choices']:
                    assert isinstance(choice, dict)

    def test_event_lifecycle_coverage(self):
        """Test that all lifecycle stages have events."""
        events = get_all_templates()

        age_groups = {
            '0-5': 0,
            '6-12': 0,
            '13-18': 0,
            '19-30': 0,
            '31-50': 0,
            '51+': 0
        }

        for event in events:
            min_age = event['min_age']
            max_age = event['max_age']

            if min_age <= 5 and max_age >= 0:
                age_groups['0-5'] += 1
            if min_age <= 12 and max_age >= 6:
                age_groups['6-12'] += 1
            if min_age <= 18 and max_age >= 13:
                age_groups['13-18'] += 1
            if min_age <= 30 and max_age >= 19:
                age_groups['19-30'] += 1
            if min_age <= 50 and max_age >= 31:
                age_groups['31-50'] += 1
            if max_age >= 51:
                age_groups['51+'] += 1

        print("\nAge group coverage:")
        for group, count in age_groups.items():
            print(f"  {group}: {count} events")
            assert count > 0, f"No events for age group {group}"

    def test_individual_event_files(self):
        """Test that individual event files are loaded correctly."""
        assert isinstance(CHILDHOOD_EVENTS, list)
        assert len(CHILDHOOD_EVENTS) > 0

        assert isinstance(ADOLESCENCE_EVENTS, list)
        assert len(ADOLESCENCE_EVENTS) > 0

        assert isinstance(ADULTHOOD_EVENTS, list)
        assert len(ADULTHOOD_EVENTS) > 0

        assert isinstance(LATERLIFE_EVENTS, list)
        assert len(LATERLIFE_EVENTS) > 0

        print(f"\nChildhood: {len(CHILDHOOD_EVENTS)}")
        print(f"Adolescence: {len(ADOLESCENCE_EVENTS)}")
        print(f"Adulthood: {len(ADULTHOOD_EVENTS)}")
        print(f"Later life: {len(LATERLIFE_EVENTS)}")
