"""Pydantic schemas for API."""

from pydantic import BaseModel, Field, model_validator
from typing import Optional, Any
from datetime import datetime


# --- Auth ---
class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=6, max_length=128)  # Unified: min 6 chars for all users


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int = 900  # 15 minutes in seconds


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# --- User Profile ---
class UserProfile(BaseModel):
    id: int
    username: str
    display_name: Optional[str] = None
    avatar_color: str = "#3b82f6"
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    avatar_color: Optional[str] = Field(None, max_length=20)
    bio: Optional[str] = Field(None, max_length=500)


# --- Game Save ---
class GameSaveOut(BaseModel):
    id: int
    slot: int
    character_name: Optional[str] = None
    age: Optional[int] = None
    char_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GameSaveIn(BaseModel):
    slot: int = Field(ge=1, le=3)
    save_data: dict[str, Any]
    character_name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = None
    char_id: Optional[int] = None


# --- Server ---
class ServerOut(BaseModel):
    id: int
    name: str
    description: str
    difficulty: float
    culture_tags: list
    economy_type: str
    welfare_level: float
    law_index: float
    gender_equality: float
    social_mood: float
    is_active: bool
    global_vars: Optional[dict] = None

    class Config:
        from_attributes = True


# --- Character ---
class CharacterCreate(BaseModel):
    server_id: int
    name: str = Field(min_length=1, max_length=100)


class CharacterPublic(BaseModel):
    id: int
    name: str
    server_id: int
    age: float
    health: float
    max_health: float
    money: float
    total_money_earned: float
    energy: float
    max_energy: float
    mood: float
    intelligence: float
    charm: float
    creativity: float
    luck: float
    karma: float
    is_married: bool
    family_tier: str
    birth_server: str
    birth_talent: str
    occupation: str
    education_level: str = "未上学"
    education_year: int = 0
    career_years: int = 0
    is_alive: bool
    is_active: bool

    class Config:
        from_attributes = True


class CharacterFull(CharacterPublic):
    """Extended character schema with additional stats not exposed in CharacterPublic."""
    career_level: str = ""
    appearance: float
    physical_fitness: float
    immune_system: float
    emotional_stability: float
    self_esteem: float
    social_capital: float
    reputation: float
    class_position: float
    total_assets: float
    meta_cognition: float
    trauma: float


# --- Time Allocation ---
class TimeAllocation(BaseModel):
    study: int = Field(ge=0, le=100)
    social: int = Field(ge=0, le=100)
    exercise: int = Field(ge=0, le=100)
    side_hustle: int = Field(ge=0, le=100)
    family: int = Field(ge=0, le=100)
    leisure: int = Field(ge=0, le=100)


# --- Game ---
class EventChoice(BaseModel):
    event_id: Optional[int] = None  # Database event template ID (preferred)
    event_title: str = ""  # Fallback for non-DB events
    option_index: int = Field(ge=0)


class CareerRequest(BaseModel):
    career_id: str = Field(..., min_length=1, max_length=100)


class GameEventOut(BaseModel):
    event_id: int
    title: str
    description: str
    options: list


class ChoiceResult(BaseModel):
    outcome_text: str
    attribute_changes: dict
    new_age: float
    is_dead: bool
    achievements_unlocked: list = []
    global_notification: str = ""


# --- Admin ---
class EventTemplateSchema(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    category: str = Field(default="life", pattern=r"^(life|career|health|education|wealth|relationship|family|social|milestone|era)$")
    min_age: int = Field(ge=0, le=120)
    max_age: int = Field(ge=0, le=120)
    base_weight: float = Field(gt=0, le=10.0)
    difficulty_level: float = Field(ge=0.0, le=1.0)
    required_attrs: dict = {}
    required_flags: list = []
    forbidden_flags: list = []
    required_culture_tags: list = []
    forbidden_culture_tags: list = []
    cooldown_category: Optional[str] = Field(default=None, max_length=50)
    era_trigger: Optional[str] = Field(default=None, max_length=100)
    choices: list = []
    causality_effects: list = []
    is_active: bool = True

    @model_validator(mode="after")
    def validate_age_range(self) -> "EventTemplateSchema":
        if self.min_age > self.max_age:
            raise ValueError("min_age 不能大于 max_age")
        return self

    class Config:
        extra = "forbid"  # Prevent field injection
