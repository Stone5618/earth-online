# -*- coding: utf-8 -*-
"""
Weekly Challenge System - Inspired by BitLife design.
Time-limited challenges to boost retention and community engagement.
"""
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, field
from enum import Enum, auto
from datetime import datetime, timedelta

from ..models import Character, User


class ChallengeStatus(Enum):
    """Challenge completion status."""
    NOT_STARTED = auto()
    IN_PROGRESS = auto()
    COMPLETED = auto()
    FAILED = auto()


class RewardType(Enum):
    """Challenge reward types."""
    BADGE = auto()
    TITLE = auto()
    BONUS_STATS = auto()
    SPECIAL_EVENT = auto()


@dataclass
class ChallengeObjective:
    """Single challenge objective."""
    id: str
    description: str
    check_func: Callable[[Character], bool]
    hint: Optional[str] = None


@dataclass
class ChallengeReward:
    """Challenge reward."""
    type: RewardType
    value: Any
    description: str


@dataclass
class WeeklyChallenge:
    """Complete weekly challenge definition."""
    id: str
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    objectives: List[ChallengeObjective]
    rewards: List[ChallengeReward]
    difficulty: int  # 1-5
    is_active: bool = True
    
    @property
    def time_remaining(self) -> timedelta:
        return self.end_date - datetime.now()
    
    @property
    def is_expired(self) -> bool:
        return datetime.now() > self.end_date


# =============================================
# Sample challenge definitions
# =============================================
def _become_millionaire_check(char: Character) -> bool:
    return (char.total_money_earned or 0) >= 1000000


def _reach_100_years_check(char: Character) -> bool:
    return char.age >= 100 and (char.is_alive or False)


def _get_married_check(char: Character) -> bool:
    return char.is_married or False


def _graduate_college_check(char: Character) -> bool:
    edu = char.education_level or "未上学"
    return edu in ["大学", "研究生"]


# Sample challenges (real system would have rotating weekly content)
SAMPLE_CHALLENGES = [
    WeeklyChallenge(
        id="first_millionaire",
        name="百万富翁",
        description="在100岁之前赚到第一个100万",
        start_date=datetime(2024, 4, 22),
        end_date=datetime(2024, 4, 29),
        objectives=[
            ChallengeObjective(
                id="earn_million",
                description="赚到100万",
                check_func=_become_millionaire_check,
                hint="尝试高薪职业或创业",
            ),
        ],
        rewards=[
            ChallengeReward(RewardType.BADGE, "💰百万富翁", "百万富翁徽章"),
            ChallengeReward(RewardType.TITLE, "商业大亨", "人生结局称号"),
        ],
        difficulty=3,
    ),
    WeeklyChallenge(
        id="centenarian",
        name="百岁老人",
        description="健康活到100岁",
        start_date=datetime(2024, 4, 29),
        end_date=datetime(2024, 5, 6),
        objectives=[
            ChallengeObjective(
                id="reach_100",
                description="活到100岁",
                check_func=_reach_100_years_check,
                hint="保持健康！",
            ),
        ],
        rewards=[
            ChallengeReward(RewardType.BADGE, "🏆长寿之星", "长寿之星徽章"),
        ],
        difficulty=2,
    ),
    WeeklyChallenge(
        id="perfect_life",
        name="完美人生",
        description="结婚、大学毕业、活到80岁",
        start_date=datetime(2024, 5, 6),
        end_date=datetime(2024, 5, 13),
        objectives=[
            ChallengeObjective(
                id="married",
                description="结婚",
                check_func=_get_married_check,
            ),
            ChallengeObjective(
                id="college",
                description="大学毕业",
                check_func=_graduate_college_check,
            ),
        ],
        rewards=[
            ChallengeReward(RewardType.BADGE, "🎖️人生赢家", "人生赢家徽章"),
            ChallengeReward(RewardType.BONUS_STATS, {"intelligence": 10}, "智力+10"),
        ],
        difficulty=4,
    ),
]


class WeeklyChallengeSystem:
    """
    Weekly challenge system to boost retention and engagement.
    - Time-limited challenges
    - Rewards and badges
    - Community sharing potential
    """
    
    def __init__(self, db=None):
        self.db = db
        # In a real system, this would come from database
        self.active_challenges = SAMPLE_CHALLENGES
    
    def get_active_challenge(self) -> Optional[WeeklyChallenge]:
        """Get the current active weekly challenge."""
        now = datetime.now()
        for challenge in self.active_challenges:
            if challenge.is_active and challenge.start_date <= now <= challenge.end_date:
                return challenge
        return None
    
    def get_challenge_by_id(self, challenge_id: str) -> Optional[WeeklyChallenge]:
        """Get a specific challenge."""
        for challenge in self.active_challenges:
            if challenge.id == challenge_id:
                return challenge
        return None
    
    def check_challenge_progress(self, char: Character, challenge: WeeklyChallenge) -> Dict[str, Any]:
        """
        Check and update challenge progress.
        
        Returns:
            Progress summary.
        """
        completed_objectives = []
        in_progress_objectives = []
        
        for objective in challenge.objectives:
            if objective.check_func(char):
                completed_objectives.append(objective)
            else:
                in_progress_objectives.append(objective)
        
        is_complete = len(completed_objectives) == len(challenge.objectives)
        
        return {
            "challenge_id": challenge.id,
            "name": challenge.name,
            "progress": f"{len(completed_objectives)}/{len(challenge.objectives)}",
            "completed": is_complete,
            "completed_objectives": [o.id for o in completed_objectives],
            "in_progress_objectives": [o.id for o in in_progress_objectives],
        }
    
    def get_user_challenge_status(self, user_id: int, challenge_id: str) -> Dict[str, Any]:
        """Get a user's challenge status."""
        if self.db is None:
            # Mock for now
            return {
                "status": ChallengeStatus.NOT_STARTED,
                "progress": 0,
                "rewards_claimed": False,
            }
        
        # Real system would query database
        return {
            "status": ChallengeStatus.IN_PROGRESS,
            "progress": 0.5,
            "rewards_claimed": False,
        }
    
    def claim_rewards(self, user_id: int, char_id: int, challenge_id: str) -> List[ChallengeReward]:
        """
        Claim rewards for completing a challenge.
        
        Returns:
            List of claimed rewards.
        """
        challenge = self.get_challenge_by_id(challenge_id)
        if not challenge:
            return []
        
        claimed_rewards = []
        
        # In a real system:
        # 1. Verify the user actually completed
        # 2. Apply rewards
        # 3. Mark rewards as claimed in DB
        claimed_rewards = challenge.rewards
        
        return claimed_rewards
    
    def get_challenge_leaderboard(self, challenge_id: str, limit: int = 10) -> List[Dict]:
        """
        Get challenge leaderboard (fastest completers).
        Good for community engagement!
        """
        # Mock leaderboard
        return [
            {"rank": 1, "user": "Player1", "completion_time": "2d 4h"},
            {"rank": 2, "user": "Player2", "completion_time": "2d 8h"},
            {"rank": 3, "user": "Player3", "completion_time": "3d 2h"},
        ]
    
    def generate_weekly_challenge(self) -> WeeklyChallenge:
        """
        Generate a new weekly challenge (content creation).
        In a real system, this would have a CMS.
        """
        # For now just rotate existing sample
        now = datetime.now()
        start = now - timedelta(days=now.weekday())  # Monday
        end = start + timedelta(days=7)
        
        idx = int(now.timestamp() % len(SAMPLE_CHALLENGES))
        challenge = SAMPLE_CHALLENGES[idx]
        
        challenge.start_date = start
        challenge.end_date = end
        
        return challenge
