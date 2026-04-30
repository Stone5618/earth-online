"""Family-related event templates for the event engine.

These events complement the main event_data.py with relationship-focused
life events that use conditions from the family engine.
"""

FAMILY_EVENTS = [
    # ============ 恋爱 / 婚姻 ============
    {
        "title": "命中注定",
        "description": "在一次偶然的聚会中，你遇到了一位令你心动的人…",
        "category": "relationship",
        "min_age": 18,
        "max_age": 60,
        "base_weight": 8,
        "difficulty_level": 0.3,
        "required_attrs": {"is_married": False},
        "required_flags": [],
        "forbidden_flags": ["married_at"],
        "era_trigger": None,
        "choices": [
            {"text": "主动追求", "outcome_text": "你鼓起勇气表白，缘分就此开始…", "stat_changes": {"charm": 3, "mood": 15}},
            {"text": "顺其自然", "outcome_text": "你决定先做朋友，慢慢了解。", "stat_changes": {"intelligence": 2, "mood": 5}},
            {"text": "专注事业", "outcome_text": "你拒绝了这段缘分，埋头工作。", "stat_changes": {"intelligence": 5, "money": 10000}},
        ],
        "outcome_weighted": True,
        "cooldown_category": "relationship",
    },
    {
        "title": "求婚时刻",
        "description": "你和恋人感情稳定，是时候考虑未来了…",
        "category": "relationship",
        "min_age": 22,
        "max_age": 65,
        "base_weight": 7,
        "difficulty_level": 0.4,
        "required_attrs": {"is_married": False, "charm__gte": 30},
        "required_flags": ["in_relationship"],
        "forbidden_flags": ["married_at"],
        "choices": [
            {"text": "浪漫求婚", "outcome_text": "你精心准备了求婚仪式，她/他感动落泪！", "stat_changes": {"mood": 30, "charm": 5, "money": -50000}},
            {"text": "简单领证", "outcome_text": "你们决定简简单单去领证。", "stat_changes": {"mood": 20, "karma": 5, "money": -5000}},
        ],
        "cooldown_category": "relationship",
    },
    {
        "title": "婚姻危机",
        "description": "最近你和伴侣之间出现了一些矛盾…",
        "category": "relationship",
        "min_age": 25,
        "max_age": 70,
        "base_weight": 5,
        "difficulty_level": 0.6,
        "required_attrs": {"is_married": True, "mood__lte": 50},
        "choices": [
            {"text": "坦诚沟通", "outcome_text": "你和伴侣开诚布公地谈了谈，关系得到了改善。", "stat_changes": {"mood": 15, "charm": 5, "karma": 5}},
            {"text": "暂时冷静", "outcome_text": "你们决定给彼此一些空间。", "stat_changes": {"mood": 5, "intelligence": 3}},
            {"text": "争吵升级", "outcome_text": "矛盾激化，关系变得更紧张了…", "stat_changes": {"mood": -20, "health": -5}},
        ],
        "cooldown_category": "relationship",
    },
    {
        "title": "移情别恋",
        "description": "你遇到了一个更有魅力的人，心开始动摇…",
        "category": "relationship",
        "min_age": 25,
        "max_age": 65,
        "base_weight": 3,
        "difficulty_level": 0.7,
        "required_attrs": {"is_married": True, "charm__gte": 40, "karma__lte": 60},
        "choices": [
            {"text": "拒绝诱惑", "outcome_text": "你坚守了对婚姻的承诺，内心更加坚定。", "stat_changes": {"karma": 20, "mood": 5}},
            {"text": "偷偷交往", "outcome_text": "你陷入了婚外情的漩涡…", "stat_changes": {"mood": 10, "karma": -20, "charm": 5}},
        ],
        "cooldown_category": "relationship",
    },
    # ============ 育儿 ============
    {
        "title": "新生命",
        "description": "你迎来了家庭的新成员——一个可爱的宝宝！",
        "category": "family",
        "min_age": 20,
        "max_age": 45,
        "base_weight": 10,
        "difficulty_level": 0.3,
        "required_attrs": {"is_married": True},
        "required_flags": ["trying_for_baby"],
        "choices": [
            {"text": "全心投入育儿", "outcome_text": "你沉浸在为人父母的喜悦中，认真照顾宝宝。", "stat_changes": {"mood": 25, "karma": 15, "energy": -10, "money": -30000}},
            {"text": "平衡家庭事业", "outcome_text": "你请了保姆帮忙，努力平衡工作与家庭。", "stat_changes": {"mood": 15, "money": -80000, "intelligence": 3}},
        ],
        "cooldown_category": "family",
    },
    {
        "title": "育儿挑战",
        "description": "孩子到了叛逆期，很不听话…",
        "category": "family",
        "min_age": 30,
        "max_age": 55,
        "base_weight": 6,
        "difficulty_level": 0.5,
        "required_attrs": {"is_married": True},
        "required_flags": ["has_child"],
        "choices": [
            {"text": "耐心教育", "outcome_text": "你耐心引导孩子度过了叛逆期。", "stat_changes": {"intelligence": 5, "karma": 10, "mood": -5}},
            {"text": "严格管教", "outcome_text": "你采取了严格的教育方式。", "stat_changes": {"mood": -10, "karma": 3}},
            {"text": "放任自流", "outcome_text": "你决定让孩子自由发展。", "stat_changes": {"mood": 5, "karma": -5}},
        ],
        "cooldown_category": "family",
    },
    {
        "title": "子女教育选择",
        "description": "孩子到了上学的年龄，你该怎么选择学校？",
        "category": "family",
        "min_age": 28,
        "max_age": 50,
        "base_weight": 7,
        "difficulty_level": 0.4,
        "required_attrs": {"is_married": True, "money__gte": 50000},
        "required_flags": ["has_child"],
        "choices": [
            {"text": "国际学校", "outcome_text": "你选择了昂贵的国际学校，为孩子提供了最好的教育环境。", "stat_changes": {"money": -150000, "mood": 10, "karma": 5}},
            {"text": "公立学校", "outcome_text": "孩子上了公立学校，接受正常的教育。", "stat_changes": {"money": -20000, "mood": 5}},
        ],
        "cooldown_category": "family",
    },
    # ============ 离婚 ============
    {
        "title": "婚姻尽头",
        "description": "你们的感情已经无法挽回，是时候做决定了…",
        "category": "relationship",
        "min_age": 25,
        "max_age": 75,
        "base_weight": 4,
        "difficulty_level": 0.8,
        "required_attrs": {"is_married": True, "mood__lte": 30},
        "choices": [
            {"text": "和平分手", "outcome_text": "你们平静地办理了离婚手续，各自开始新生活。", "stat_changes": {"mood": -15, "karma": 5, "money": -100000}},
            {"text": "激烈争吵", "outcome_text": "离婚过程很不愉快，双方都受到了伤害。", "stat_changes": {"mood": -30, "health": -10, "money": -200000}},
            {"text": "再次尝试", "outcome_text": "你决定再给这段婚姻一次机会。", "stat_changes": {"mood": 5, "karma": 10}},
        ],
        "cooldown_category": "relationship",
        "cooldown_years": 5,
    },
    # ============ 社交 ============
    {
        "title": "社交圈",
        "description": "你认识了几个志同道合的新朋友！",
        "category": "social",
        "min_age": 15,
        "max_age": 80,
        "base_weight": 8,
        "difficulty_level": 0.2,
        "required_attrs": {"charm__gte": 20},
        "choices": [
            {"text": "一起创业", "outcome_text": "你和朋友一起创业，事业更上一层楼！", "stat_changes": {"money": 50000, "charm": 5, "creativity": 8}},
            {"text": "经常聚会", "outcome_text": "你们经常聚会，社交圈越来越大。", "stat_changes": {"mood": 15, "charm": 8}},
            {"text": "保持联系", "outcome_text": "你们保持友好但不过于亲密的关系。", "stat_changes": {"mood": 8, "charm": 3}},
        ],
        "cooldown_category": "social",
    },
    {
        "title": "豪门恩怨",
        "description": "家族内部爆发了财产纠纷…",
        "category": "family",
        "min_age": 30,
        "max_age": 90,
        "base_weight": 3,
        "difficulty_level": 0.7,
        "required_attrs": {"money__gte": 500000},
        "forbidden_flags": ["poor_family"],
        "choices": [
            {"text": "据理力争", "outcome_text": "你通过法律手段维护了自己的权益。", "stat_changes": {"money": 200000, "karma": -10, "mood": -5}},
            {"text": "家族和解", "outcome_text": "你以家族利益为重，选择和解。", "stat_changes": {"money": 50000, "karma": 15, "mood": 10}},
        ],
        "cooldown_category": "family",
    },
]

def seed_family_events(db):
    """Insert family event templates into the database."""
    from ..models import EventTemplate

    existing = db.query(EventTemplate).filter(EventTemplate.category.in_(["relationship", "family", "social"])).count()
    if existing > 0:
        print(f"[family] {existing} family events already exist, skipping seed.")
        return

    for ev in FAMILY_EVENTS:
        template = EventTemplate(
            title=ev["title"],
            description=ev["description"],
            category=ev["category"],
            min_age=ev["min_age"],
            max_age=ev["max_age"],
            base_weight=ev["base_weight"],
            difficulty_level=ev["difficulty_level"],
            required_attrs=ev.get("required_attrs", {}),
            required_flags=ev.get("required_flags", []),
            forbidden_flags=ev.get("forbidden_flags", []),
            choices=ev.get("choices", []),
            cooldown_category=ev.get("cooldown_category"),
            is_active=True,
        )
        db.add(template)

    db.commit()
    print(f"[family] Seeded {len(FAMILY_EVENTS)} family event templates.")
