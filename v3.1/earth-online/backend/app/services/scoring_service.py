"""Unified scoring service - single source of truth for life score calculation."""

from ..models.character import Character


def calculate_life_score(char: Character) -> float:
    """
    Unified life score calculation used by game_router, leaderboard_router, and reincarnation_router.
    Score is based on age, wealth, achievements, skills, education, occupation, and family.
    """
    score = 0.0

    # Age bonus (up to 500 points)
    age = char.death_age or char.age or 0
    score += min(age * 5, 500)

    # Wealth milestones
    money = char.total_money_earned or 0
    if money >= 10_000_000:
        score += 300
    elif money >= 1_000_000:
        score += 200
    elif money >= 100_000:
        score += 100
    elif money >= 10_000:
        score += 50
    else:
        score += 10

    # Achievements
    achievements = (char.flags or {}).get("achievements", [])
    score += len(achievements) * 30

    # Average of core skills
    avg_stat = (
        (char.mood or 50)
        + (char.intelligence or 50)
        + (char.charm or 50)
        + (char.creativity or 50)
        + (char.luck or 50)
        + (char.karma or 50)
    ) / 6
    score += avg_stat * 2

    # Marriage bonus
    if char.is_married:
        score += 50

    # Education
    edu_scores = {'研究生': 150, '大学': 100, '高中': 60, '初中': 30, '小学': 10, '未上学': 0}
    score += edu_scores.get(char.education_level or '未上学', 0)

    # Occupation
    occupation = char.occupation or ''
    if occupation and occupation != 'unemployed':
        score += 80
        if 'entrepreneur' in occupation:
            score += 100
        elif 'programmer' in occupation or 'doctor' in occupation:
            score += 50

    # Children
    children = char.children_ids or []
    score += len(children) * 40

    return round(score, 1)
