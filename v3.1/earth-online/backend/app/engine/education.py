"""Education chain engine - tracks and evolves character education through life stages."""

from sqlalchemy.orm import Session

# Education level constants
EDUCATION_NONE = "未上学"
EDUCATION_PRIMARY = "小学"
EDUCATION_JUNIOR = "初中"
EDUCATION_SENIOR = "高中"
EDUCATION_UNIVERSITY = "大学"
EDUCATION_GRADUATE = "研究生"

# Adult education levels
ADULT_EDUCATION_SELF_STUDY = "自考"
ADULT_EDUCATION_NIGHT_SCHOOL = "夜校"
ADULT_EDUCATION_ONLINE = "网课"
ADULT_EDUCATION_CERTIFICATE = "职业资格证"

EDUCATION_STAGES = [
    # (level_name, min_age, max_age, annual_tuition, min_intelligence, requires_previous, description)
    (EDUCATION_PRIMARY,    6,  12, 0,         0,   True,  "小学义务教育，基础文化知识"),
    (EDUCATION_JUNIOR,     12, 15, 0,         40,  True,  "初中义务教育，承上启下"),
    (EDUCATION_SENIOR,     15, 18, 10000,     55,  True,  "高中教育，决定大学的关键阶段"),
    (EDUCATION_UNIVERSITY, 18, 22, 50000,     70,  True,  "大学教育，专业知识和社交网络"),
    (EDUCATION_GRADUATE,   22, 25, 30000,     85,  True,  "研究生教育，专业深造"),
]

# Secondary school entrance exam threshold
GAOKAO_BASE_SCORE = 450  # Total score for university admission
GAOKAO_MAX_SCORE = 750   # Maximum possible score


def get_education_level(char) -> str:
    """Get current education level string from character."""
    return getattr(char, "education_level", EDUCATION_NONE) or EDUCATION_NONE


def get_education_year(char) -> int:
    """Get current years in this education level."""
    return getattr(char, "education_year", 0) or 0


def calculate_exam_score(intelligence, creativity, luck) -> int:
    """Calculate exam score based on character attributes."""
    i = max(0, intelligence or 50)
    c = max(0, creativity or 50)
    l = max(0, luck or 50)
    base = i * 5
    creative_bonus = c * 0.5
    luck_bonus = l * 1.5
    random_factor = __import__("random").uniform(-30, 30)
    return max(0, min(GAOKAO_MAX_SCORE, int(base + creative_bonus + luck_bonus + random_factor)))


def can_enroll_next_level(char, db: Session = None) -> tuple[bool, str]:
    """Check if character can enroll in the next education level."""
    current = get_education_level(char)
    age = int(char.age)
    
    # Find current stage index
    current_idx = -1
    for i, (name, _, _, _, _, _, _) in enumerate(EDUCATION_STAGES):
        if name == current:
            current_idx = i
            break
    
    if current_idx >= len(EDUCATION_STAGES) - 1:
        return False, "已经完成了最高学历"
    
    next_stage = EDUCATION_STAGES[current_idx + 1]
    next_name, min_age, max_age, tuition, min_intel, requires_prev, desc = next_stage
    
    # Check age
    if age < min_age:
        return False, f"年龄不足，需要至少{min_age}岁才能进入{next_name}"
    
    if age > max_age:
        return False, f"年龄已超过{next_name}的入学年龄上限({max_age}岁)"
    
    # Check intelligence
    if char.intelligence < min_intel:
        return False, f"智力不足({int(getattr(char, 'intelligence', 0))}/{min_intel})，无法进入{next_name}"
    
    # Check tuition
    if char.money < tuition:
        return False, f"资金不足，{next_name}需要学费{tuition}元"
    
    return True, f"可以进入{next_name}"


def apply_education_effects(char, level_name: str, year_progress: int = 1):
    """Apply annual education effects to character stats."""
    effects = {
        EDUCATION_PRIMARY:    {"intelligence": 3, "creativity": 2, "energy": -5, "mood": -2},
        EDUCATION_JUNIOR:    {"intelligence": 4, "social_capital": 2, "energy": -8, "mood": -3},
        EDUCATION_SENIOR:    {"intelligence": 6, "health": -2, "energy": -15, "mood": -8, "creativity": -2},
        EDUCATION_UNIVERSITY: {"intelligence": 5, "creativity": 4, "social_capital": 5, "charm": 3, 
                               "energy": -10, "money": -5000},
        EDUCATION_GRADUATE:  {"intelligence": 6, "creativity": 3, "social_capital": 3, 
                               "energy": -12, "money": -3000},
    }
    
    changes = effects.get(level_name, {})
    for attr, delta in changes.items():
        current = getattr(char, attr, 0) or 0
        new_val = current + delta * year_progress
        
        # Clamp values
        if attr in ("health", "mood", "energy"):
            new_val = max(0, min(100, new_val))
        elif attr == "intelligence":
            new_val = max(0, min(150, new_val))
        elif attr == "creativity":
            new_val = max(0, min(150, new_val))
        elif attr in ("charm",):
            new_val = max(0, min(100, new_val))
        elif attr == "social_capital":
            new_val = max(0, new_val)
        elif attr == "money":
            new_val = max(0, new_val)
        
        setattr(char, attr, round(new_val, 2))
    
    # Update education year
    edu_year = get_education_year(char)
    setattr(char, "education_year", edu_year + year_progress)
    
    return {k: round(v * year_progress, 2) for k, v in changes.items()}


def enroll_education(char, target_level: str, db: Session = None) -> tuple[bool, str, dict]:
    """Enroll character in a specific education level."""
    current = get_education_level(char)
    
    # Find target stage
    target_info = None
    for stage in EDUCATION_STAGES:
        if stage[0] == target_level:
            target_info = stage
            break
    
    if not target_info:
        return False, f"未知的教育阶段: {target_level}", {}
    
    name, min_age, max_age, tuition, min_intel, requires_prev, desc = target_info
    
    # Age check
    if int(char.age) < min_age:
        return False, f"年龄不足", {}
    
    # Intelligence check
    if char.intelligence < min_intel:
        return False, f"智力不足({int(char.intelligence)}/{min_intel})", {}
    
    # Tuition payment
    if tuition > 0:
        if char.money < tuition:
            return False, f"资金不足，{name}需要学费{tuition}元", {}
        char.money -= tuition
    
    # Set new level
    setattr(char, "education_level", target_level)
    setattr(char, "education_year", 0)
    
    # Apply enrollment bonus
    bonus = {"intelligence": 2, "mood": 5}
    for attr, delta in bonus.items():
        current = getattr(char, attr, 0)
        setattr(char, attr, min(max(0, current + delta), 150 if attr == "intelligence" else 100))
    
    return True, f"成功进入{name}！开始了新的学习生涯。", {"tuition_paid": tuition}


def auto_education_tick(char, db: Session = None) -> dict:
    """Automatically advance education each year if character is in school.
    Returns result dict with events and changes."""
    current = get_education_level(char)
    age = int(char.age)
    results = {"graduated": False, "new_level": None, "changes": {}, "message": ""}
    
    if current == EDUCATION_NONE:
        # Auto-enroll at age 6
        if age >= 6 and age <= 12:
            success, msg, changes = enroll_education(char, EDUCATION_PRIMARY, db)
            if success:
                results["new_level"] = EDUCATION_PRIMARY
                results["message"] = msg
                results["changes"] = changes
        return results
    
    # Find current stage
    current_idx = -1
    for i, stage in enumerate(EDUCATION_STAGES):
        if stage[0] == current:
            current_idx = i
            break
    
    if current_idx < 0:
        return results
    
    # Apply annual effects
    changes = apply_education_effects(char, current)
    results["changes"] = changes
    
    # Check auto-graduation
    stage = EDUCATION_STAGES[current_idx]
    _, min_age, max_age, _, _, _, _ = stage
    
    # High school graduation exam (age 18)
    if current == EDUCATION_SENIOR and age >= 18:
        score = calculate_exam_score(char.intelligence, char.creativity, char.luck)
        if score >= GAOKAO_BASE_SCORE:
            success, msg, ch = enroll_education(char, EDUCATION_UNIVERSITY, db)
            if success:
                results["graduated"] = True
                results["new_level"] = EDUCATION_UNIVERSITY
                results["gaokao_score"] = score
                results["message"] = f"高考成绩{score}分！{msg}"
            else:
                results["graduated"] = True
                results["gaokao_score"] = score
                results["message"] = f"高考成绩{score}分，达到大学线但无法入学：{msg}"
    
    # University graduation (after age 22) -> auto enroll graduate or finish
    elif current == EDUCATION_UNIVERSITY and age >= 22:
        # Try to enroll graduate, otherwise just graduate
        success, msg, ch = enroll_education(char, EDUCATION_GRADUATE, db)
        if success:
            results["graduated"] = True
            results["new_level"] = EDUCATION_GRADUATE
            results["message"] = f"大学顺利毕业！{msg}"
        else:
            results["graduated"] = True
            results["message"] = "大学顺利毕业！获得了学士学位。"
            char.education_level = EDUCATION_UNIVERSITY + "毕业"
            char.education_year = 0
    
    # Junior high -> entrance to senior high (age 15-16)
    elif current == EDUCATION_JUNIOR and age >= 15:
        score = calculate_exam_score(char.intelligence, char.creativity, char.luck)
        if score >= 300:  # 中考及格线
            success, msg, ch = enroll_education(char, EDUCATION_SENIOR, db)
            if success:
                results["graduated"] = True
                results["new_level"] = EDUCATION_SENIOR
                results["exam_score"] = score
                results["message"] = f"中考成绩{score}分！{msg}"
            else:
                results["graduated"] = True
                results["exam_score"] = score
                results["message"] = f"中考成绩{score}分，但无法上高中：{msg}"
    
    # Primary school graduation -> auto enroll junior high
    elif current == EDUCATION_PRIMARY and age >= 12:
        success, msg, ch = enroll_education(char, EDUCATION_JUNIOR, db)
        if success:
            results["graduated"] = True
            results["new_level"] = EDUCATION_JUNIOR
            results["message"] = f"小学毕业了！{msg}"
        else:
            results["graduated"] = True
            results["message"] = "小学毕业了，但无法进入初中。"
    
    # Graduate completion
    elif current == EDUCATION_GRADUATE and age >= 25:
        results["graduated"] = True
        results["message"] = "研究生毕业！获得了硕士/博士学位。"
        char.education_level = EDUCATION_GRADUATE + "毕业"
        char.education_year = 0
    
    # ===== Adult education paths (for characters who missed traditional schooling) =====
    # Self-study exam path: available to anyone age 18+
    elif current == EDUCATION_NONE and age >= 18 and age <= 50:
        if char.intelligence and char.intelligence >= 30:
            # Can enroll in self-study program
            setattr(char, "education_level", ADULT_EDUCATION_SELF_STUDY)
            setattr(char, "education_year", 0)
            results["graduated"] = False
            results["new_level"] = ADULT_EDUCATION_SELF_STUDY
            results["message"] = "你报名了自考课程！通过自学也能获得学历。"
    
    # Self-study progression (slow but cheap)
    elif current == ADULT_EDUCATION_SELF_STUDY:
        edu_year = get_education_year(char)
        intel = getattr(char, "intelligence", 50) or 50
        if edu_year >= 3 and intel >= 60:
            # Graduated to junior equivalent
            setattr(char, "education_level", EDUCATION_JUNIOR)
            setattr(char, "education_year", 0)
            results["graduated"] = True
            results["new_level"] = EDUCATION_JUNIOR
            results["message"] = "自考成功！你获得了同等学力，可以继续升学。"
        else:
            # Apply modest stat gains
            changes = {"intelligence": 2, "energy": -5}
            for attr, delta in changes.items():
                current_val = getattr(char, attr, 0) or 0
                new_val = max(0, min(100 if attr == "energy" else 150, current_val + delta))
                setattr(char, attr, new_val)
            results["changes"] = changes
    
    # Night school path
    elif current == ADULT_EDUCATION_NIGHT_SCHOOL:
        edu_year = get_education_year(char)
        if edu_year >= 2:
            setattr(char, "education_level", EDUCATION_SENIOR)
            setattr(char, "education_year", 0)
            results["graduated"] = True
            results["new_level"] = EDUCATION_SENIOR
            results["message"] = "夜校毕业了！你获得了高中同等学历。"
        else:
            changes = {"intelligence": 3, "charm": 2, "energy": -8, "money": -1000}
            for attr, delta in changes.items():
                current_val = getattr(char, attr, 0) or 0
                if attr == "money":
                    new_val = max(0, current_val + delta)
                else:
                    new_val = max(0, min(100 if attr == "energy" else 150, current_val + delta))
                setattr(char, attr, new_val)
            results["changes"] = changes
    
    # Online education path
    elif current == ADULT_EDUCATION_ONLINE:
        edu_year = get_education_year(char)
        if edu_year >= 1:
            cert_level = (char.flags or {}).get("online_cert_level", 0)
            if cert_level < 3:
                current_flags = dict(char.flags or {})
                current_flags["online_cert_level"] = cert_level + 1
                char.flags = current_flags
                results["message"] = "你完成了一门在线课程，获得了证书。"
            else:
                results["message"] = "你已经完成了所有在线课程。"
        changes = {"intelligence": 1, "creativity": 1, "energy": -3, "money": -500}
        for attr, delta in changes.items():
            current_val = getattr(char, attr, 0) or 0
            if attr == "money":
                new_val = max(0, current_val + delta)
            else:
                new_val = max(0, min(100 if attr in ("energy", "mood") else 150, current_val + delta))
            setattr(char, attr, new_val)
        results["changes"] = changes
    
    return results


def get_adult_education_options(char) -> list[dict]:
    """Get available adult education options for characters age 18+."""
    age = int(char.age) or 0
    current = get_education_level(char)
    
    # Don't offer if already in traditional education
    if current in [EDUCATION_PRIMARY, EDUCATION_JUNIOR, EDUCATION_SENIOR, 
                   EDUCATION_UNIVERSITY, EDUCATION_GRADUATE]:
        return []
    
    options = []
    
    if age >= 18 and current in [EDUCATION_NONE, ADULT_EDUCATION_SELF_STUDY]:
        options.append({
            "id": "self_study",
            "name": "自考",
            "description": "通过自学参加国家考试，成本低但进度慢。3年后可获得同等学力。",
            "cost": 2000,
            "duration_years": 3,
            "min_intelligence": 30,
            "outcome": EDUCATION_JUNIOR if current == EDUCATION_NONE else None,
        })
    
    if age >= 18 and age <= 45 and current in [EDUCATION_NONE, EDUCATION_PRIMARY]:
        options.append({
            "id": "night_school",
            "name": "夜校",
            "description": "利用晚上时间上学，平衡工作与学习。2年可获得高中同等学历。",
            "cost": 15000,
            "duration_years": 2,
            "min_intelligence": 20,
            "outcome": EDUCATION_SENIOR,
        })
    
    if age >= 18 and current in [EDUCATION_NONE, EDUCATION_PRIMARY, EDUCATION_JUNIOR]:
        options.append({
            "id": "online",
            "name": "网课",
            "description": "灵活在线学习，获得职业技能证书。每年可完成一门课程。",
            "cost": 5000,
            "duration_years": 1,
            "min_intelligence": 0,
            "outcome": ADULT_EDUCATION_CERTIFICATE,
        })
    
    return options
