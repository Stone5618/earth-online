"""New Game+ Family Inheritance System.

Calculates legacy points from a completed life and applies
inheritance bonuses to the next generation's initial state.

Features:
- Legacy score calculation from life achievements
- Family tier upgrades based on legacy
- Inherited skill bonuses for next generation
- NG+ cycle tracking and cumulative bonuses
- Special legacy events/triggers
"""

from typing import Any


LEGACY_TIERS = [
    {"min_score": 0, "tier": "E", "label": "凡人", "bonus_multiplier": 1.0, "color": "#9E9E9E"},
    {"min_score": 50, "tier": "D", "label": "普通", "bonus_multiplier": 1.1, "color": "#4CAF50"},
    {"min_score": 150, "tier": "C", "label": "良好", "bonus_multiplier": 1.2, "color": "#2196F3"},
    {"min_score": 300, "tier": "B", "label": "优秀", "bonus_multiplier": 1.35, "color": "#9C27B0"},
    {"min_score": 500, "tier": "A", "label": "卓越", "bonus_multiplier": 1.5, "color": "#FF9800"},
    {"min_score": 750, "tier": "S", "label": "传奇", "bonus_multiplier": 1.7, "color": "#F44336"},
    {"min_score": 1000, "tier": "SS", "label": "史诗", "bonus_multiplier": 2.0, "color": "#E91E63"},
    {"min_score": 1500, "tier": "SSS", "label": "神话", "bonus_multiplier": 2.5, "color": "#FFD700"},
]


def calculate_legacy_score(stats: dict, achievements: list, flags: dict) -> dict[str, Any]:
    """Calculate legacy score from a completed life.
    
    Returns dict with:
    - total_score: int
    - breakdown: dict of category scores
    - tier: str (E/DCBA/SS/SSS)
    - tier_label: str (Chinese label)
    - bonus_multiplier: float
    """
    breakdown = {}
    
    breakdown["wealth"] = max(0, (stats.get("totalMoneyEarned", 0) // 1000))
    breakdown["education"] = {
        "none": 0, "小学": 5, "初中": 15, "高中": 30,
        "大专": 50, "本科": 80, "硕士": 120, "博士": 160,
    }.get(stats.get("educationLevel", "none"), 0)
    
    breakdown["career"] = (stats.get("jobLevel", 0) * 20) + (stats.get("career", {}).get("totalExperience", 0) // 5)
    
    breakdown["family"] = 0
    if stats.get("isMarried"):
        breakdown["family"] += 30
    partner = stats.get("partner", {})
    if partner.get("has"):
        breakdown["family"] += int(partner.get("relationshipQuality", 0) // 5)
    children = stats.get("children", [])
    breakdown["family"] += len(children) * 15
    
    breakdown["skills"] = sum(stats.get("skills", {}).values()) // 10
    
    breakdown["karma"] = max(0, (stats.get("karma", 50) - 50) // 2)
    
    breakdown["achievement"] = sum(1 for a in achievements if a.get("unlocked", False)) * 10
    
    breakdown["longevity"] = max(0, stats.get("age", 0) - 20)
    
    total_score = sum(breakdown.values())
    
    tier_info = LEGACY_TIERS[0]
    for t in reversed(LEGACY_TIERS):
        if total_score >= t["min_score"]:
            tier_info = t
            break
    
    return {
        "total_score": total_score,
        "breakdown": breakdown,
        "tier": tier_info["tier"],
        "tier_label": tier_info["label"],
        "bonus_multiplier": tier_info["bonus_multiplier"],
        "color": tier_info["color"],
    }


def apply_legacy_bonuses(initial_stats: dict, legacy_data: dict, ng_plus_count: int = 0) -> dict[str, Any]:
    """Apply inheritance bonuses to new character based on legacy.
    
    Args:
        initial_stats: Base stats for new character
        legacy_data: Result from calculate_legacy_score
        ng_plus_count: Number of previous NG+ cycles
    
    Returns:
        Modified stats dict with applied bonuses
    """
    stats = dict(initial_stats)
    multiplier = legacy_data.get("bonus_multiplier", 1.0)
    
    ng_bonus = 1 + (ng_plus_count * 0.05)
    effective_multiplier = multiplier * ng_bonus
    
    stats["luck"] = min(100, stats.get("luck", 50) + int(5 * effective_multiplier))
    stats["karma"] = min(100, stats.get("karma", 50) + int(5 * effective_multiplier))
    
    skill_bonus = int(3 * effective_multiplier)
    base_skills = stats.get("skills", {})
    for skill_key in base_skills:
        base_skills[skill_key] = max(0, base_skills[skill_key] + skill_bonus)
    stats["skills"] = base_skills
    
    tier = legacy_data.get("tier", "E")
    if tier in ("S", "SS", "SSS"):
        stats["money"] = max(0, stats.get("money", 0)) + int(10000 * effective_multiplier)
    elif tier in ("A", "B"):
        stats["money"] = max(0, stats.get("money", 0)) + int(5000 * effective_multiplier)
    
    if tier in ("A", "S", "SS", "SSS"):
        stats["intelligence"] = min(100, stats.get("intelligence", 50) + int(5 * effective_multiplier))
    
    if tier in ("B", "A", "S", "SS", "SSS"):
        stats["charm"] = min(100, stats.get("charm", 50) + int(3 * effective_multiplier))
    
    return stats


def get_family_tier_upgrade(current_tier: str | None, legacy_score: int) -> str | None:
    """Determine if family tier should upgrade based on legacy score."""
    tier_order = ["IRON", "R", "SR", "SSR"]
    if current_tier is None:
        current_tier = "IRON"
    
    if current_tier not in tier_order:
        current_tier = "IRON"
    
    current_idx = tier_order.index(current_tier)
    
    if legacy_score >= 500 and current_idx < len(tier_order) - 1:
        return tier_order[current_idx + 1]
    elif legacy_score >= 200 and current_idx < len(tier_order) - 2:
        return tier_order[current_idx + 1]
    
    return current_tier


def generate_legacy_summary(legacy_data: dict) -> str:
    """Generate a human-readable legacy summary for the player."""
    tier = legacy_data.get("tier", "E")
    label = legacy_data.get("tier_label", "凡人")
    score = legacy_data.get("total_score", 0)
    multiplier = legacy_data.get("bonus_multiplier", 1.0)
    
    lines = [
        f"🏛️ 家族传承评定: {tier} - {label}",
        f"📊 传承分数: {score}",
        f"✨ 后代加成倍率: x{multiplier:.2f}",
        "",
    ]
    
    breakdown = legacy_data.get("breakdown", {})
    categories = [
        ("财富", breakdown.get("wealth", 0)),
        ("教育", breakdown.get("education", 0)),
        ("事业", breakdown.get("career", 0)),
        ("家庭", breakdown.get("family", 0)),
        ("技能", breakdown.get("skills", 0)),
        ("福报", breakdown.get("karma", 0)),
        ("成就", breakdown.get("achievement", 0)),
        ("寿命", breakdown.get("longevity", 0)),
    ]
    
    for cat_name, cat_score in categories:
        if cat_score > 0:
            lines.append(f"  {cat_name}: +{cat_score}")
    
    return "\n".join(lines)
