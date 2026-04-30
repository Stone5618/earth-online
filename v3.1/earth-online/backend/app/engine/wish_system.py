# -*- coding: utf-8 -*-
"""Life wish list system for Earth Online.

Characters can set life goals/wishes at different life stages.
Fulfilled wishes grant bonus karma, mood, and life score.
"""

from ..utils import rng

# Wish categories and their definitions
WISH_CATEGORIES = {
    "wealth": {
        "label": "财富",
        "icon": "💰",
        "wishes": [
            {"id": "wish_wealth_1", "text": "存到第一桶金（10万元）", "target_money": 100000, "reward": {"karma": 5, "mood": 10}},
            {"id": "wish_wealth_2", "text": "成为百万富翁", "target_money": 1000000, "reward": {"karma": 10, "mood": 15}},
            {"id": "wish_wealth_3", "text": "实现财务自由", "target_money": 10000000, "reward": {"karma": 15, "mood": 20}},
        ],
    },
    "education": {
        "label": "学业",
        "icon": "📚",
        "wishes": [
            {"id": "wish_edu_1", "text": "完成中学教育", "target_education": "初中", "reward": {"intelligence": 5, "mood": 5}},
            {"id": "wish_edu_2", "text": "考上大学", "target_education": "大学", "reward": {"intelligence": 10, "mood": 10}},
            {"id": "wish_edu_3", "text": "获得研究生学历", "target_education": "研究生", "reward": {"intelligence": 15, "mood": 15}},
        ],
    },
    "family": {
        "label": "家庭",
        "icon": "👨‍👩‍👧",
        "wishes": [
            {"id": "wish_family_1", "text": "找到真爱", "require_married": True, "reward": {"charm": 5, "mood": 15, "karma": 5}},
            {"id": "wish_family_2", "text": "组建家庭", "require_married": True, "reward": {"mood": 10, "karma": 5}},
            {"id": "wish_family_3", "text": "养育孩子", "require_children": True, "reward": {"mood": 15, "karma": 10}},
        ],
    },
    "career": {
        "label": "事业",
        "icon": "💼",
        "wishes": [
            {"id": "wish_career_1", "text": "找到一份稳定工作", "require_employed": True, "reward": {"mood": 10}},
            {"id": "wish_career_2", "text": "成为行业专家", "require_career_level": 3, "reward": {"intelligence": 10, "mood": 10}},
            {"id": "wish_career_3", "text": "创业成功", "require_occupation": "entrepreneur", "reward": {"money": 500000, "mood": 20}},
        ],
    },
    "health": {
        "label": "健康",
        "icon": "❤️",
        "wishes": [
            {"id": "wish_health_1", "text": "保持健康到老年", "require_health_60": True, "reward": {"mood": 15, "karma": 5}},
            {"id": "wish_health_2", "text": "活到80岁以上", "require_age": 80, "reward": {"mood": 20, "karma": 10}},
        ],
    },
    "travel": {
        "label": "旅行",
        "icon": "✈️",
        "wishes": [
            {"id": "wish_travel_1", "text": "去一次远方旅行", "require_travel_event": True, "reward": {"mood": 15, "charm": 5}},
            {"id": "wish_travel_2", "text": "环游世界", "require_travel_count": 5, "reward": {"mood": 25, "charm": 10}},
        ],
    },
}


def get_available_wishes(char, age: int) -> list[dict]:
    """Get wishes available for the character's current age/stage."""
    available = []
    
    for category_key, category_data in WISH_CATEGORIES.items():
        # Filter by age appropriateness
        for wish in category_data["wishes"]:
            is_available = True
            
            # Age restrictions
            if wish["id"].startswith("wish_wealth") and age < 18:
                is_available = False
            if wish["id"].startswith("wish_career") and age < 22:
                is_available = False
            if wish["id"].startswith("wish_family") and age < 18:
                is_available = False
            
            if is_available:
                available.append({
                    **wish,
                    "category": category_key,
                    "category_label": category_data["label"],
                    "category_icon": category_data["icon"],
                })
    
    return available


def check_wish_fulfillment(char, wishes: list[dict]) -> list[dict]:
    """Check which wishes have been fulfilled."""
    fulfilled = []
    money = char.total_money_earned or 0
    edu = char.education_level or ""
    age = int(char.age) or 0
    health = getattr(char, "health", 50) or 50
    
    for wish in wishes:
        is_fulfilled = False
        
        # Check money-based wishes
        if "target_money" in wish:
            is_fulfilled = money >= wish["target_money"]
        
        # Check education-based wishes
        elif "target_education" in wish:
            edu_levels = ["未上学", "小学", "初中", "高中", "大学", "研究生"]
            target_idx = edu_levels.index(wish["target_education"]) if wish["target_education"] in edu_levels else -1
            current_idx = edu_levels.index(edu) if edu in edu_levels else -1
            is_fulfilled = current_idx >= target_idx
        
        # Check marriage-based wishes
        elif wish.get("require_married") and char.is_married:
            is_fulfilled = True
        
        # Check children-based wishes
        elif wish.get("require_children"):
            children = (char.flags or {}).get("children", [])
            is_fulfilled = len(children) > 0
        
        # Check employment-based wishes
        elif wish.get("require_employed") and char.occupation and char.occupation != "unemployed":
            is_fulfilled = True
        
        # Check career level wishes
        elif "require_career_level" in wish:
            career_years = getattr(char, "career_years", 0) or 0
            is_fulfilled = career_years >= wish["require_career_level"]
        
        # Check specific occupation
        elif "require_occupation" in wish:
            is_fulfilled = (char.occupation or "") == wish["require_occupation"]
        
        # Check health at age 60
        elif wish.get("require_health_60") and age >= 60 and health > 50:
            is_fulfilled = True
        
        # Check age-based wishes
        elif "require_age" in wish:
            is_fulfilled = age >= wish["require_age"]
        
        # Check travel events
        elif wish.get("require_travel_event"):
            travel_flags = (char.flags or {}).get("travel_count", 0)
            is_fulfilled = travel_flags > 0
        
        elif wish.get("require_travel_count"):
            travel_flags = (char.flags or {}).get("travel_count", 0)
            is_fulfilled = travel_flags >= wish["require_travel_count"]
        
        if is_fulfilled:
            fulfilled.append(wish)
    
    return fulfilled


def apply_wish_rewards(char, fulfilled_wishes: list[dict]) -> dict:
    """Apply rewards from fulfilled wishes and return summary."""
    total_rewards = {}
    
    for wish in fulfilled_wishes:
        reward = wish.get("reward", {})
        for attr, value in reward.items():
            total_rewards[attr] = total_rewards.get(attr, 0) + value
            
            # Apply to character
            current = getattr(char, attr, 0) or 0
            if attr == "money":
                setattr(char, attr, max(0, current + value))
            elif attr == "karma":
                setattr(char, attr, min(150, current + value))
            else:
                setattr(char, attr, max(0, min(150, current + value)))
    
    return total_rewards
