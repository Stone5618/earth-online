# -*- coding: utf-8 -*-
"""Auto-generated event templates - merged from childhood, adolescence, adulthood and later life events."""

from .childhood_events import CHILDHOOD_EVENTS
from .adolescence_events import ADOLESCENCE_EVENTS
from .adulthood_events import ADULTHOOD_EVENTS
from .laterlife_events import LATERLIFE_EVENTS
from .moral_dilemmas import MORAL_DILEMMAS
from .universal_events import UNIVERSAL_EVENTS


def get_all_templates():
    """Get all merged event templates from all life stages."""
    all_events = []
    all_events.extend(CHILDHOOD_EVENTS)
    all_events.extend(ADOLESCENCE_EVENTS)
    all_events.extend(ADULTHOOD_EVENTS)
    all_events.extend(LATERLIFE_EVENTS)
    all_events.extend(MORAL_DILEMMAS)
    all_events.extend(UNIVERSAL_EVENTS)
    return all_events


# For backward compatibility - merged events are loaded dynamically
EVENT_TEMPLATES = get_all_templates()
