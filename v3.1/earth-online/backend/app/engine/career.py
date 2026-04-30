"""Career system - job matching, salary calculation, and career progression."""

from ..utils import rng

# ===== Inflation System =====
# Annual inflation rate for salary and expense adjustments (2-4% realistic range)
INFLATION_RATE = 0.03  # 3% base inflation


def calculate_inflation_multiplier(years_in_game: int) -> float:
    """Calculate cumulative inflation multiplier over game years.

    Uses compound interest formula: (1 + rate)^years
    """
    return (1 + INFLATION_RATE) ** years_in_game


# Career definitions: (id, name, min_education, min_intelligence, min_charm, min_physical,
#                     base_salary, salary_growth, stress_per_year, description)
CAREERS = [
    {
        "id": "unemployed",
        "name": "无业",
        "min_education": None,
        "min_intelligence": 0,
        "min_charm": 0,
        "min_physical": 0,
        "base_salary": 0,
        "salary_growth": 0,
        "stress_per_year": 0,
        "description": "没有工作，靠积蓄或家人支持生活。",
    },
    {
        "id": "worker",
        "name": "普通工人",
        "min_education": "初中",
        "min_intelligence": 30,
        "min_charm": 0,
        "min_physical": 30,
        "base_salary": 40000,
        "salary_growth": 3000,
        "stress_per_year": 2,
        "description": "体力劳动为主，稳定但收入不高。",
    },
    {
        "id": "technician",
        "name": "技术工人",
        "min_education": "高中",
        "min_intelligence": 45,
        "min_charm": 0,
        "min_physical": 25,
        "base_salary": 60000,
        "salary_growth": 5000,
        "stress_per_year": 3,
        "description": "掌握一门技术，收入不错还稳定。",
    },
    {
        "id": "clerk",
        "name": "办公室职员",
        "min_education": "高中",
        "min_intelligence": 40,
        "min_charm": 30,
        "min_physical": 0,
        "base_salary": 50000,
        "salary_growth": 4000,
        "stress_per_year": 4,
        "description": "朝九晚五的办公室工作，稳定但上升空间有限。",
    },
    {
        "id": "civil_servant",
        "name": "公务员",
        "min_education": "大学",
        "min_intelligence": 55,
        "min_charm": 40,
        "min_physical": 0,
        "base_salary": 80000,
        "salary_growth": 6000,
        "stress_per_year": 2,
        "description": "铁饭碗，福利好，但晋升需要论资排辈。",
    },
    {
        "id": "teacher",
        "name": "教师",
        "min_education": "大学",
        "min_intelligence": 60,
        "min_charm": 45,
        "min_physical": 0,
        "base_salary": 70000,
        "salary_growth": 5000,
        "stress_per_year": 5,
        "description": "教书育人，社会地位高，但工作压力不小。",
    },
    {
        "id": "programmer",
        "name": "程序员",
        "min_education": "大学",
        "min_intelligence": 70,
        "min_charm": 0,
        "min_physical": 0,
        "base_salary": 150000,
        "salary_growth": 15000,
        "stress_per_year": 8,
        "description": "高薪高压，35岁是一道坎。",
    },
    {
        "id": "doctor",
        "name": "医生",
        "min_education": "研究生",
        "min_intelligence": 75,
        "min_charm": 30,
        "min_physical": 0,
        "base_salary": 180000,
        "salary_growth": 20000,
        "stress_per_year": 10,
        "description": "高学历高收入，但工作强度极大。",
    },
    {
        "id": "artist",
        "name": "自由艺术家",
        "min_education": "高中",
        "min_intelligence": 40,
        "min_charm": 30,
        "min_physical": 0,
        "base_salary": 30000,
        "salary_growth": 5000,
        "stress_per_year": 6,
        "description": "靠创意和魅力吃饭，收入波动大。",
    },
    {
        "id": "entrepreneur",
        "name": "创业者",
        "min_education": "高中",
        "min_intelligence": 50,
        "min_charm": 40,
        "min_physical": 0,
        "base_salary": 0,  # Variable income
        "salary_growth": 0,
        "stress_per_year": 12,
        "description": "高风险高回报，可能一夜暴富也可能血本无归。",
    },
]

# Career levels with salary multipliers
CAREER_LEVELS = [
    ("初级", 1.0, 0),
    ("中级", 1.5, 5),    # Need 5 years in career
    ("高级", 2.2, 12),   # Need 12 years
    ("专家", 3.0, 20),   # Need 20 years
    ("总监", 4.0, 30),   # Need 30 years
]


def get_career(char) -> dict:
    """Get the character's current career info."""
    career_id = getattr(char, "occupation", "") or "unemployed"
    for c in CAREERS:
        if c["id"] == career_id:
            return c
    return CAREERS[0]  # Default to unemployed


def get_career_years(char) -> int:
    """Get years in current career."""
    return getattr(char, "career_years", 0) or 0


def get_career_level(char) -> tuple[str, float]:
    """Get current career level and salary multiplier."""
    years = get_career_years(char)
    level_idx = 0
    for i, (name, mult, min_years) in enumerate(CAREER_LEVELS):
        if years >= min_years:
            level_idx = i
    return CAREER_LEVELS[level_idx][0], CAREER_LEVELS[level_idx][1]


def _normalize_education_level(edu: str) -> str:
    """Normalize education level string to the base level for comparison."""
    if not edu:
        return "未上学"
    edu = edu.strip()
    # Handle "XX毕业", "XX在读" etc.
    for base in ["研究生", "大学", "高中", "初中", "小学"]:
        if edu.startswith(base):
            return base
    return "未上学"


def find_available_careers(char) -> list[dict]:
    """Find careers the character qualifies for based on stats and education."""
    edu_raw = getattr(char, "education_level", "未上学") or "未上学"
    edu = _normalize_education_level(edu_raw)
    intel = getattr(char, "intelligence", 0) or 0
    charm = getattr(char, "charm", 0) or 0
    physical = getattr(char, "physical_fitness", 0) or 0
    
    # Education hierarchy for comparison
    edu_order = {
        "未上学": 0, "小学": 1, "初中": 2, "高中": 3,
        "大学": 4, "研究生": 5,
    }
    char_edu_level = edu_order.get(edu, 0)
    
    available = []
    for c in CAREERS:
        if c["id"] == "unemployed":
            continue
        
        # Education check
        if c["min_education"]:
            min_edu_level = edu_order.get(c["min_education"], 0)
            if char_edu_level < min_edu_level:
                continue
        
        # Stat checks
        if intel < c["min_intelligence"]:
            continue
        if charm < c["min_charm"]:
            continue
        if physical < c["min_physical"]:
            continue
        
        available.append(c)
    
    return available


def calculate_annual_salary(char) -> int:
    """Calculate yearly salary based on career, level, and attributes."""
    career = get_career(char)
    if career["id"] == "unemployed":
        return 0

    if career["id"] == "entrepreneur":
        # Variable income based on luck + intelligence
        luck = getattr(char, "luck", 50) or 50
        intel = getattr(char, "intelligence", 50) or 50
        base = (luck * 3000 + intel * 2000)
        # High variance
        variance = rng.random_float(0.2, 3.0)
        return int(base * variance)

    level_name, salary_mult = get_career_level(char)
    base = career["base_salary"]
    growth = career["salary_growth"] * get_career_years(char)

    # Stat bonuses
    intel_bonus = max(0, (getattr(char, "intelligence", 50) or 50) - 50) * 500
    charm_bonus = max(0, (getattr(char, "charm", 50) or 50) - 50) * 300

    # Apply inflation adjustment
    age = int(getattr(char, "age", 18) or 18)
    inflation_mult = calculate_inflation_multiplier(max(0, age - 18))

    return int((base + growth + intel_bonus + charm_bonus) * salary_mult * inflation_mult)


def calculate_yearly_expenses(char) -> int:
    """Calculate total yearly living expenses with inflation adjustment."""
    age = int(char.age) or 0

    # Basic living costs (base values)
    if age < 6:
        base_cost = 20000  # Childcare
    elif age < 18:
        base_cost = 15000  # Dependent
    elif age < 25:
        base_cost = 30000  # Student/young adult
    elif age < 60:
        base_cost = 50000  # Working adult
    else:
        base_cost = 35000  # Retiree

    # Apply inflation based on character's age (proxy for years passed)
    inflation_mult = calculate_inflation_multiplier(max(0, age - 18))
    return int(base_cost * inflation_mult)


def apply_annual_finance(char) -> dict:
    """Apply annual income and expenses. Called during make_choice."""
    income = calculate_annual_salary(char)
    expenses = calculate_yearly_expenses(char)
    
    net = income - expenses
    
    # Apply salary
    char.money = max(0, (char.money or 0) + net)
    
    # Track total earned
    if income > 0:
        char.total_money_earned = (char.total_money_earned or 0) + income
    
    # Stress effects from career
    career = get_career(char)
    stress = career["stress_per_year"]
    if stress > 0 and getattr(char, "occupation", "") and get_career_years(char) > 0:
        health_loss = stress * 0.3
        mood_loss = stress * 0.5
        char.health = max(0, (char.health or 100) - health_loss)
        char.mood = max(0, (char.mood or 50) - mood_loss)
    
    # Auto increment career years if employed
    if getattr(char, "occupation", "") and career["id"] != "unemployed":
        char.career_years = (char.career_years or 0) + 1
    
    return {
        "income": income,
        "expenses": expenses,
        "net_income": net,
        "stress_damage": {"health": stress * 0.3 if career["id"] != "unemployed" else 0,
                          "mood": stress * 0.5 if career["id"] != "unemployed" else 0},
    }


def apply_career(char, career_id: str) -> tuple[bool, str]:
    """Set character's career."""
    # Find career
    career = None
    for c in CAREERS:
        if c["id"] == career_id:
            career = c
            break
    
    if not career:
        return False, f"未知的职业: {career_id}"
    
    # Check eligibility
    available = find_available_careers(char)
    if career not in available:
        return False, f"不符合{career['name']}的要求"
    
    char.occupation = career_id
    char.career_years = 0
    
    return True, f"开始了{career['name']}生涯！"
