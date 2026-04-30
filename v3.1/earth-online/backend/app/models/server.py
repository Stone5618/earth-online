"""Server (country) model."""

from sqlalchemy import Column, Integer, String, Float, Boolean, JSON

from ..database import Base


class Server(Base):
    __tablename__ = "servers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(500), default="")
    difficulty = Column(Float, default=0.5)  # 0.3~0.9
    culture_tags = Column(JSON, default=list)
    economy_type = Column(String(50), default="developing")  # developed/emerging/developing
    welfare_level = Column(Float, default=0.5)
    law_index = Column(Float, default=0.7)
    gender_equality = Column(Float, default=0.6)
    social_mood = Column(Float, default=50)
    global_vars = Column(JSON, default=lambda: {
        "unemployment": 5.0,
        "inflation": 2.0,
        "gdp_growth": 3.0,
        "housing_index": 100.0,
    })
    is_active = Column(Boolean, default=True)

    def to_dict(self, include_global_vars=False):
        d = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "difficulty": self.difficulty,
            "culture_tags": self.culture_tags or [],
            "economy_type": self.economy_type,
            "welfare_level": self.welfare_level,
            "law_index": self.law_index,
            "gender_equality": self.gender_equality,
            "social_mood": self.social_mood,
            "is_active": self.is_active,
        }
        if include_global_vars:
            d["global_vars"] = self.global_vars
        return d
