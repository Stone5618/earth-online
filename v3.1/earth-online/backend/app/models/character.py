"""Character (player) model and related schema."""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, ForeignKey, Index, DateTime
from sqlalchemy.orm import relationship

from ..database import Base


class Character(Base):
    __tablename__ = "characters"
    __table_args__ = (
        Index('idx_characters_server_alive_age', 'server_id', 'is_alive', 'age'),
        Index('idx_characters_death_age_desc', 'death_age'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    server_id = Column(Integer, ForeignKey("servers.id"), nullable=False)
    name = Column(String(100), nullable=False)
    is_alive = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    # 原9维 (PlayerStats)
    age = Column(Float, default=0)
    health = Column(Float, default=100)
    max_health = Column(Float, default=100)
    money = Column(Float, default=0)
    total_money_earned = Column(Float, default=0)
    energy = Column(Float, default=100)
    max_energy = Column(Float, default=100)
    mood = Column(Float, default=50)
    intelligence = Column(Float, default=50)
    charm = Column(Float, default=50)
    creativity = Column(Float, default=50)
    luck = Column(Float, default=50)
    karma = Column(Float, default=50)
    is_married = Column(Boolean, default=False)
    spouse_name = Column(String(100), nullable=True, comment="配偶角色名称")
    spouse_quality = Column(Integer, default=0, comment="配偶关系质量 (0-100)")

    # 后端隐藏属性
    appearance = Column(Float, default=50)
    physical_fitness = Column(Float, default=50)
    immune_system = Column(Float, default=50)
    nervous_system = Column(Float, default=50)
    sensory = Column(Float, default=50)
    knowledge_tree = Column(JSON, default=dict)
    meta_cognition = Column(Float, default=20)
    emotional_stability = Column(Float, default=50)
    self_esteem = Column(Float, default=50)
    trauma = Column(Float, default=0)
    value_vector = Column(JSON, default=lambda: {
        "wealth": 15, "power": 15, "family": 20,
        "freedom": 15, "knowledge": 20, "pleasure": 15,
    })
    social_capital = Column(Float, default=10)
    reputation = Column(Float, default=50)
    class_position = Column(Float, default=20)
    total_assets = Column(Float, default=0)
    time_budget = Column(Float, default=6000)
    attention = Column(Float, default=80)

    # 基因潜力
    gene_potentials = Column(JSON, default=dict)

    # 出生信息
    family_tier = Column(String(10), default="IRON")  # SSR/SR/R/IRON
    birth_server = Column(String(100), default="")
    birth_talent = Column(String(100), default="")

    # 游戏状态
    occupation = Column(String(100), default="")
    flags = Column(JSON, default=dict)
    causality_stack = Column(JSON, default=list)
    recent_event_categories = Column(JSON, default=list)
    recent_event_titles = Column(JSON, default=list)
    trait_memory = Column(JSON, default=list)  # recent outcomes
    event_chains = Column(JSON, default=dict)  # 事件链状态：{chain_id: {current_step_index: 0, completed: false}}

    # 关系
    spouse_id = Column(Integer, nullable=True)

    # 家庭
    children_ids = Column(JSON, default=list)

    # 死亡信息
    death_age = Column(Float, nullable=True)
    death_reason = Column(String(200), nullable=True)
    final_title = Column(String(100), nullable=True)
    final_comment = Column(String(200), nullable=True)

    # 教育系统
    education_level = Column(String(50), default="未上学")
    education_year = Column(Integer, default=0)

    # 职业系统
    career_years = Column(Integer, default=0)
    career_level = Column(String(20), default="")
    career_title = Column(String(100), default="", comment="当前职业名称")

    # 资产系统
    house_level = Column(Integer, default=0, comment="房屋等级 0-4")
    car_level = Column(Integer, default=0, comment="车辆等级 0-3")
    house_name = Column(String(100), nullable=True, comment="房屋名称")
    car_name = Column(String(100), nullable=True, comment="车辆名称")

    # 债务系统
    debts = Column(JSON, default=list, comment="债务列表")

    # 家族系统
    family_name = Column(String(100), nullable=True, comment="家族名称")
    family_reputation = Column(Float, default=50, comment="家族声望 0-100")

    # 子女系统
    children_data = Column(JSON, default=list, comment="子女详细信息")

    # 时间分配
    last_time_allocation = Column(JSON, nullable=True)

    # 时间戳
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    server = relationship("Server")

    def to_public_dict(self):
        """Return public-facing stats (original 9 dims + basic info)."""
        return {
            "id": self.id,
            "name": self.name,
            "server_id": self.server_id,
            "age": self.age,
            "health": self.health,
            "max_health": self.max_health,
            "money": self.money,
            "total_money_earned": self.total_money_earned,
            "energy": self.energy,
            "max_energy": self.max_energy,
            "mood": self.mood,
            "intelligence": self.intelligence,
            "charm": self.charm,
            "creativity": self.creativity,
            "luck": self.luck,
            "karma": self.karma,
            "is_married": self.is_married,
            "family_tier": self.family_tier,
            "birth_server": self.birth_server,
            "birth_talent": self.birth_talent,
            "occupation": self.occupation,
            "education_level": self.education_level or "未上学",
            "education_year": self.education_year or 0,
            "career_years": self.career_years or 0,
            "is_alive": self.is_alive,
            "is_active": self.is_active,
        }

    def to_full_dict(self):
        d = self.to_public_dict()
        d.update({
            "appearance": self.appearance,
            "physical_fitness": self.physical_fitness,
            "immune_system": self.immune_system,
            "emotional_stability": self.emotional_stability,
            "self_esteem": self.self_esteem,
            "education_level": self.education_level or "未上学",
            "education_year": self.education_year or 0,
            "career_years": self.career_years or 0,
            "career_level": self.career_level or "",
            "career_title": self.career_title or "",
            "social_capital": self.social_capital,
            "reputation": self.reputation,
            "class_position": self.class_position,
            "total_assets": self.total_assets,
            "meta_cognition": self.meta_cognition,
            "trauma": self.trauma,
            # 资产系统
            "house_level": self.house_level or 0,
            "car_level": self.car_level or 0,
            "house_name": self.house_name or "",
            "car_name": self.car_name or "",
            "debts": self.debts or [],
            # 家族系统
            "family_name": self.family_name or "",
            "family_reputation": self.family_reputation or 50,
            # 子女系统
            "children_data": self.children_data or [],
        })
        return d
    
    def to_dict(self):
        """用于后台管理系统的完整字典表示。"""
        return self.to_full_dict()
