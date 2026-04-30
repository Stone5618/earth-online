"""Seed data - create default servers."""

from .database import SessionLocal, init_db
from .models import Server

SERVERS = [
    {
        "name": "华夏共和国",
        "description": "集体主义、教育内卷、家庭纽带深厚的东方古国。",
        "difficulty": 0.7,
        "culture_tags": ["collectivism", "education_focused", "family_ties"],
        "economy_type": "emerging",
        "welfare_level": 0.4,
        "law_index": 0.8,
        "gender_equality": 0.6,
        "social_mood": 50,
        "global_vars": {"unemployment": 5.0, "inflation": 2.0, "gdp_growth": 4.5, "housing_index": 150.0},
    },
    {
        "name": "自由联邦",
        "description": "个人主义、多元文化、高风险高回报的机遇之国。",
        "difficulty": 0.5,
        "culture_tags": ["individualism", "multicultural", "high_risk"],
        "economy_type": "developed",
        "welfare_level": 0.3,
        "law_index": 0.7,
        "gender_equality": 0.8,
        "social_mood": 55,
        "global_vars": {"unemployment": 4.0, "inflation": 3.0, "gdp_growth": 2.5, "housing_index": 120.0},
    },
    {
        "name": "北欧联合王国",
        "description": "平等主义、高福利、环保意识领先的人间天堂。",
        "difficulty": 0.3,
        "culture_tags": ["egalitarianism", "high_welfare", "eco_friendly"],
        "economy_type": "developed",
        "welfare_level": 0.9,
        "law_index": 0.9,
        "gender_equality": 0.95,
        "social_mood": 70,
        "global_vars": {"unemployment": 3.0, "inflation": 1.5, "gdp_growth": 1.8, "housing_index": 180.0},
    },
    {
        "name": "战乱之地",
        "description": "宗教保守、部族冲突、资源匮乏的绝望之地。",
        "difficulty": 0.9,
        "culture_tags": ["religious_conservative", "tribal_conflict", "resource_scarce"],
        "economy_type": "least_developed",
        "welfare_level": 0.1,
        "law_index": 0.2,
        "gender_equality": 0.2,
        "social_mood": 25,
        "global_vars": {"unemployment": 40.0, "inflation": 25.0, "gdp_growth": -2.0, "housing_index": 30.0},
    },
]


def seed():
    init_db()
    db = SessionLocal()
    try:
        existing = db.query(Server).count()
        if existing > 0:
            print(f"Already {existing} servers, skipping seed.")
            return
        for s in SERVERS:
            db.add(Server(**s))
        db.commit()
        print(f"Seeded {len(SERVERS)} servers.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
