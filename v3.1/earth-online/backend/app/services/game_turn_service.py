"""Game turn orchestration service.

Extracts the annual game tick logic from the router into a dedicated service layer,
delegating sub-systems (aging, family, education, career, achievements, death) to
their respective modules while maintaining a clear orchestration flow.
"""

from typing import Any, Optional

from sqlalchemy.orm import Session

from ..models import Character, Server, EventTemplate
from ..schemas import EventChoice
from ..engine.events import make_choice
from ..engine.event_template_cache import get_cached_templates
from ..engine.aging import apply_health_decay, check_death
from ..engine.npc import age_npcs_for_character
from ..engine.education import auto_education_tick, get_education_level
from ..engine.career import apply_annual_finance, find_available_careers, apply_career
from .scoring_service import calculate_life_score


class GameTurnService:
    """Orchestrates a single game turn (annual tick).

    Responsibilities:
    1. Resolve event template
    2. Apply choice effects
    3. Run sub-system ticks (health, NPC, family, education, career)
    4. Check achievements
    5. Check death and generate final summary
    6. Return a structured outcome dict
    """

    def __init__(self, char: Character, server: Optional[Server], db: Session, old_state: dict):
        self.char = char
        self.server = server
        self.db = db
        self.old_state = old_state
        self.outcome: dict[str, Any] = {}

    # ================================================================
    # Public entry point
    # ================================================================

    def execute_turn(self, body: EventChoice) -> dict[str, Any]:
        """Execute a full game turn and return the outcome dict."""
        if body.event_title == "你来到了这个世界":
            self._handle_birth(body)
        else:
            self._handle_normal_turn(body)

        self._finalize()
        return self.outcome

    # ================================================================
    # Birth
    # ================================================================

    def _handle_birth(self, body: EventChoice) -> None:
        current_flags = dict(self.char.flags or {})
        current_flags["has_had_birth_event"] = True
        self.char.flags = current_flags

        stats = {"mood": 5, "health": 5} if body.option_index == 0 else {"intelligence": 3, "mood": 3}
        for attr, value in stats.items():
            current = getattr(self.char, attr, 0)
            setattr(self.char, attr, max(0, current + value))

        self.char.age += 1

        self.outcome = {
            "outcome_text": "你出生了！",
            "stat_changes": stats,
        }

    # ================================================================
    # Normal turn (non-birth)
    # ================================================================

    def _handle_normal_turn(self, body: EventChoice) -> None:
        event_data = self._resolve_event(body)
        self.outcome = make_choice(self.char, event_data, body.option_index)

        self._tick_health()
        self._tick_npcs()
        self._tick_family()
        self._tick_education()
        self._tick_career_and_finance()
        self._tick_achievements()
        self._tick_server_year()
        self._tick_death()

    # ================================================================
    # Event resolution
    # ================================================================

    def _resolve_event(self, body: EventChoice) -> dict:
        if body.event_id:
            ev_db = self.db.query(EventTemplate).filter(EventTemplate.id == body.event_id).first()
            if ev_db:
                return ev_db.to_dict()

        if body.event_title:
            templates = get_cached_templates(self.db)
            for ev in templates:
                if ev.get("title") == body.event_title:
                    return ev

        return {
            "title": body.event_title or "未知事件",
            "choices": [
                {"stat_changes": {"mood": 2, "karma": 1}, "follow_up": "你认真度过了这一年。"},
                {"stat_changes": {"mood": 5, "energy": 5}, "follow_up": "你放松了一下，心情不错。"},
            ],
        }

    # ================================================================
    # Sub-system ticks
    # ================================================================

    def _tick_health(self) -> None:
        health_loss = apply_health_decay(self.char)
        self.outcome["health_loss"] = round(health_loss, 2)

    def _tick_npcs(self) -> None:
        age_npcs_for_character(self.char, self.db)

    def _tick_family(self) -> None:
        if not self.char.is_married and int(self.char.age) >= 18:
            try:
                from ..engine.family import find_spouse_candidate
                candidate = find_spouse_candidate(self.char, self.server, self.db)
                if candidate:
                    self.outcome["marriage_candidate"] = candidate
            except ImportError:
                pass

        if self.char.is_married and 20 <= int(self.char.age) <= 45:
            try:
                from ..engine.family import check_childbirth, record_childbirth
                child = check_childbirth(self.char.id, self.char.age, self.db)
                if child:
                    record_childbirth(self.char.id, child, self.db)
                    # Ensure correct data format for frontend
                    self.outcome["childbirth"] = {
                        "name": str(child.get("name", "新生儿")),
                        "gender": child.get("gender", "male"),
                        "born_at": int(child.get("born_at", self.char.age)),
                        "traits": [],  # Will be populated by frontend or separate API
                    }
            except ImportError:
                pass

    def _tick_education(self) -> None:
        edu_result = auto_education_tick(self.char, self.db)
        if edu_result.get("graduated"):
            self.outcome["education_graduation"] = edu_result.get("new_level") or edu_result.get("message", "")
        self.outcome["education_level"] = get_education_level(self.char)

    def _tick_career_and_finance(self) -> None:
        if int(self.char.age) < 18:
            return

        finance = apply_annual_finance(self.char)
        self.outcome["finance"] = finance

        career_id = getattr(self.char, "occupation", "") or "unemployed"
        if career_id == "unemployed" and int(self.char.age) >= 22:
            available = find_available_careers(self.char)
            if available:
                best = max(available, key=lambda c: c["base_salary"])
                apply_career(self.char, best["id"])
                self.outcome["career_start"] = f"开始{best['name']}工作"

    def _tick_achievements(self) -> None:
        achievements = self._check_achievements()
        self.outcome["achievements_unlocked"] = achievements

    def _tick_server_year(self) -> None:
        if self.server and self.char.age % 10 == 0:
            gv = dict(self.server.global_vars or {})
            gv["year"] = gv.get("year", 0) + 1
            self.server.global_vars = gv

    def _tick_death(self) -> None:
        is_dead, death_reason = check_death(self.char)
        if not is_dead:
            return

        self.char.is_alive = False
        self.char.death_age = self.char.age
        self.char.death_reason = death_reason
        self.outcome["is_dead"] = True
        self.outcome["death_reason"] = death_reason

        title = self._generate_final_title()
        self.char.final_title = title
        self.char.final_comment = self._generate_life_summary()
        self.outcome["final_title"] = title
        self.outcome["final_comment"] = self.char.final_comment
        self.outcome["life_score"] = calculate_life_score(self._score_input())

    # ================================================================
    # Finalization
    # ================================================================

    def _finalize(self) -> None:
        new_state = self._char_snapshot(self.char)
        self.outcome["character"] = new_state
        self.outcome["character_diff"] = self._compute_state_diff(self.old_state, new_state)

    @staticmethod
    def _char_snapshot(char: Character) -> dict:
        return {
            "age": char.age,
            "health": char.health,
            "mood": char.mood,
            "money": char.money,
            "energy": char.energy,
            "intelligence": char.intelligence,
            "charm": char.charm,
            "creativity": char.creativity,
            "luck": char.luck,
            "karma": char.karma,
            "is_married": char.is_married,
            "total_money_earned": char.total_money_earned or 0,
            "max_health": char.max_health,
            "max_energy": char.max_energy,
        }

    @staticmethod
    def _compute_state_diff(old: dict, new: dict) -> dict:
        diff = {}
        for key, new_val in new.items():
            old_val = old.get(key)
            if old_val != new_val:
                diff[key] = new_val
        return diff

    # ================================================================
    # Internal helpers (moved from router)
    # ================================================================

    def _check_achievements(self) -> list[str]:
        current_flags = dict(self.char.flags) if self.char.flags else {}
        earned = list(current_flags.get("achievements", []))
        newly_unlocked = []

        # ===== Age milestones =====
        checks = [
            ("birth", 0, 1),
            ("first_birthday", 1, 2),
            ("toddler", 3, 6),
            ("kid", 6, 13),
            ("teen", 13, 18),
            ("adult", 18, 35),
            ("middle_aged", 35, 60),
            ("senior", 60, 80),
            ("elder", 80, 100),
            ("centenarian", 100, 999),
        ]
        for ach_id, lo, hi in checks:
            if lo <= self.char.age < hi and ach_id not in earned:
                newly_unlocked.append(ach_id)
                earned.append(ach_id)

        # ===== Stat-based achievements =====
        stat_checks = [
            ("charmer", lambda c: c.charm and c.charm >= 90),
            ("genius", lambda c: c.intelligence and c.intelligence >= 120),
            ("creative", lambda c: c.creativity and c.creativity >= 120),
            ("lucky", lambda c: c.luck and c.luck >= 90),
            ("survivor", lambda c: c.health and c.health <= 15),
        ]
        for ach_id, fn in stat_checks:
            if fn(self.char) and ach_id not in earned:
                newly_unlocked.append(ach_id)
                earned.append(ach_id)

        # ===== Wealth milestones =====
        money = self.char.total_money_earned or 0
        wealth_tiers = [
            ("first_100", 100),
            ("first_1000", 1_000),
            ("ten_thousandaire", 10_000),
            ("hundred_thousandaire", 100_000),
            ("millionaire", 1_000_000),
            ("multi_millionaire", 5_000_000),
            ("deca_millionaire", 10_000_000),
            ("billionaire", 100_000_000),
        ]
        for ach_id, threshold in wealth_tiers:
            if money >= threshold and ach_id not in earned:
                newly_unlocked.append(ach_id)
                earned.append(ach_id)

        # ===== Education milestones =====
        edu = self.char.education_level or ""
        edu_achievements = [
            ("kindergarten_grad", "幼儿园"),
            ("primary_grad", "小学"),
            ("middle_grad", "初中"),
            ("high_grad", "高中"),
            ("college_grad", "大学"),
            ("bachelor_grad", "本科"),
            ("master_grad", "研究生"),
            ("phd_grad", "博士"),
        ]
        for ach_id, edu_level in edu_achievements:
            if edu == edu_level and ach_id not in earned:
                newly_unlocked.append(ach_id)
                earned.append(ach_id)

        # ===== Career milestones =====
        occ = self.char.occupation or ""
        if occ and occ != "unemployed" and "first_job" not in earned:
            newly_unlocked.append("first_job")
            earned.append("first_job")
        career_years = getattr(self.char, "career_years", 0) or 0
        if career_years >= 10 and "veteran_worker" not in earned:
            newly_unlocked.append("veteran_worker")
            earned.append("veteran_worker")
        if career_years >= 30 and "career_master" not in earned:
            newly_unlocked.append("career_master")
            earned.append("career_master")

        # ===== Marriage & family =====
        if self.char.is_married and "newlywed" not in earned:
            newly_unlocked.append("newlywed")
            earned.append("newlywed")
        children = (self.char.flags or {}).get("children", [])
        if len(children) >= 1 and "first_child" not in earned:
            newly_unlocked.append("first_child")
            earned.append("first_child")
        if len(children) >= 3 and "big_family" not in earned:
            newly_unlocked.append("big_family")
            earned.append("big_family")

        # ===== Karma & moral =====
        karma = getattr(self.char, "karma", 50) or 50
        if karma >= 80 and "good_soul" not in earned:
            newly_unlocked.append("good_soul")
            earned.append("good_soul")
        if karma >= 100 and "saint" not in earned:
            newly_unlocked.append("saint")
            earned.append("saint")
        if karma <= 20 and "dark_heart" not in earned:
            newly_unlocked.append("dark_heart")
            earned.append("dark_heart")

        # ===== Trauma & resilience =====
        trauma = getattr(self.char, "trauma", 0) or 0
        if trauma >= 50 and "scarred_soul" not in earned:
            newly_unlocked.append("scarred_soul")
            earned.append("scarred_soul")
        if trauma >= 50 and self.char.mood and self.char.mood >= 60 and "resilient" not in earned:
            newly_unlocked.append("resilient")
            earned.append("resilient")

        # ===== Special feats =====
        mood = getattr(self.char, "mood", 50) or 50
        health = getattr(self.char, "health", 50) or 50
        if health >= 100 and "perfect_health" not in earned:
            newly_unlocked.append("perfect_health")
            earned.append("perfect_health")
        if mood >= 100 and "eternal_optimist" not in earned:
            newly_unlocked.append("eternal_optimist")
            earned.append("eternal_optimist")
        if self.char.energy and self.char.energy >= 100 and "boundless_energy" not in earned:
            newly_unlocked.append("boundless_energy")
            earned.append("boundless_energy")
        if (self.char.luck or 0) >= 100 and "fortune_favored" not in earned:
            newly_unlocked.append("fortune_favored")
            earned.append("fortune_favored")
        if (self.char.intelligence or 0) >= 100 and (self.char.charm or 0) >= 100 and "double_threat" not in earned:
            newly_unlocked.append("double_threat")
            earned.append("double_threat")
        if (self.char.creativity or 0) >= 100 and (self.char.intelligence or 0) >= 100 and "visionary" not in earned:
            newly_unlocked.append("visionary")
            earned.append("visionary")

        # ===== Life milestones =====
        age = int(self.char.age) or 0
        if age >= 50 and money >= 1000000 and "midlife_success" not in earned:
            newly_unlocked.append("midlife_success")
            earned.append("midlife_success")
        if age >= 70 and not self.char.is_alive is False and "golden_years" not in earned:
            newly_unlocked.append("golden_years")
            earned.append("golden_years")

        # ===== New Game Plus =====
        n_plus = (self.char.flags or {}).get("ng_plus_count", 0)
        if n_plus >= 1 and "reincarnator" not in earned:
            newly_unlocked.append("reincarnator")
            earned.append("reincarnator")
        if n_plus >= 5 and "legend_soul" not in earned:
            newly_unlocked.append("legend_soul")
            earned.append("legend_soul")

        # ===== Rare combinations =====
        if occ == "entrepreneur" and money >= 1000000 and "self_made" not in earned:
            newly_unlocked.append("self_made")
            earned.append("self_made")
        if occ == "programmer" and (self.char.intelligence or 0) >= 150 and "code_wizard" not in earned:
            newly_unlocked.append("code_wizard")
            earned.append("code_wizard")
        if occ == "artist" and (self.char.creativity or 0) >= 150 and "artistic_genius" not in earned:
            newly_unlocked.append("artistic_genius")
            earned.append("artistic_genius")
        if occ == "doctor" and (self.char.intelligence or 0) >= 130 and (self.char.karma or 50) >= 80 and "healer" not in earned:
            newly_unlocked.append("healer")
            earned.append("healer")

        if newly_unlocked:
            current_flags["achievements"] = earned
            self.char.flags = current_flags

        return newly_unlocked

    def _generate_final_title(self) -> str:
        age = int(self.char.age) or 0
        money = self.char.total_money_earned or 0
        edu = self.char.education_level or "未上学"
        occupation = self.char.occupation or ""

        if edu == "研究生":
            edu_title = "高学历"
        elif edu == "大学":
            edu_title = "文化人"
        elif edu == "未上学":
            edu_title = "没文化"
        else:
            edu_title = "普通"

        if money >= 10000000:
            wealth_title = "富豪"
        elif money >= 1000000:
            wealth_title = "中产"
        elif money >= 100000:
            wealth_title = "小康"
        else:
            wealth_title = "清贫"

        if "entrepreneur" in occupation:
            career_title = "企业家"
        elif "programmer" in occupation or "doctor" in occupation:
            career_title = "精英"
        elif occupation and occupation != "unemployed":
            career_title = "打工人"
        else:
            career_title = "闲人"

        if age >= 100:
            age_title = "百岁老人"
        elif age >= 80:
            age_title = "长寿老人"
        elif age >= 60:
            age_title = "普通人"
        else:
            age_title = "短命鬼"

        return "·".join([edu_title, wealth_title, career_title, age_title])

    def _generate_life_summary(self) -> str:
        age = int(self.char.death_age or self.char.age or 0)
        money = self.char.total_money_earned or 0
        achievements = (self.char.flags or {}).get("achievements", [])
        occupation = getattr(self.char, "occupation", "") or ""
        edu = getattr(self.char, "education_level", "未上学") or "未上学"

        lines = []

        if age <= 12:
            lines.append("你还没来得及好好看看这个世界。")
        elif age <= 30:
            lines.append("你走得太早了，还有很多未完成的梦想。")
        elif age <= 60:
            lines.append("你走完了大半生，留下了许多回忆。")
        elif age <= 80:
            lines.append("你度过了充实的一生，寿终正寝。")
        else:
            lines.append("你活到了耄耋之年，是真正的长寿之人。")

        if money >= 10000000:
            lines.append(f"财富方面，你积累了巨额财富（{money:,.0f}元），足以载入史册。")
        elif money >= 1000000:
            lines.append(f"你积累了可观的财富（{money:,.0f}元），生活优渥。")
        elif money >= 100000:
            lines.append(f"你日子过得还算宽裕，一生赚了约{money:,.0f}元。")
        elif money >= 1000:
            lines.append("你一生平平淡淡，勉强糊口。")
        else:
            lines.append("你一生清贫，但精神富足。")

        if occupation and occupation != "unemployed":
            lines.append(f"职业上，你是一名{occupation}。")
        if edu != "未上学":
            lines.append(f"你受过{edu}教育。")

        if achievements:
            unlocked = len(achievements)
            lines.append(f"你的一生解锁了{unlocked}个成就，经历了精彩纷呈的人生。")

        mood = getattr(self.char, "mood", 50) or 50
        if mood >= 80:
            lines.append("整体而言，你的一生充满快乐。")
        elif mood <= 30:
            lines.append("可惜的是，你的一生似乎不太快乐。")
        else:
            lines.append("你的人生有苦有甜，平凡而真实。")

        return " ".join(lines)

    def _score_input(self) -> dict:
        return {
            "age": self.char.death_age or self.char.age,
            "mood": (self.char.flags or {}).get("mood", 50),
            "education": (self.char.flags or {}).get("education", 0),
            "career": (self.char.flags or {}).get("career_level", 0),
            "money": self.char.total_money_earned or 0,
            "achievements": len((self.char.flags or {}).get("achievements", [])),
        }
