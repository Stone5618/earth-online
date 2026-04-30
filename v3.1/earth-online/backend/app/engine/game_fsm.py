# -*- coding: utf-8 -*-
"""
Game FSM (Finite State Machine) - Inspired by Chinese life restarter design.
Manages the entire lifecycle with clear state transitions.
"""
from enum import Enum, auto
from typing import Optional, Callable, Dict, Any
from sqlalchemy.orm import Session

from ..models import Character, Server


class GameState(Enum):
    """Game lifecycle states."""
    BIRTH = auto()       # Initialization phase
    GROWTH = auto()      # Normal growth phase (age 0-100)
    CHOICE = auto()      # Waiting for player choice
    ENDING = auto()      # Death and ending phase


class LifeStage(Enum):
    """Detailed life stages for fine-grained control."""
    INFANT = (0, 3, "婴幼儿")        # 0-3岁
    CHILD = (4, 12, "儿童")         # 4-12岁
    TEEN = (13, 17, "少年")         # 13-17岁
    YOUNG_ADULT = (18, 30, "青年")  # 18-30岁
    ADULT = (31, 50, "壮年")        # 31-50岁
    SENIOR = (51, 80, "中年")        # 51-80岁
    ELDER = (81, 120, "老年")       # 81岁以上

    @classmethod
    def get_stage(cls, age: int) -> 'LifeStage':
        """Determine life stage based on age."""
        for stage in cls:
            min_age, max_age, name = stage.value
            if min_age <= age <= max_age:
                return stage
        return cls.ELDER  # Default to elder

    @property
    def name_cn(self) -> str:
        return self.value[2]


class GameFSM:
    """
    Finite State Machine for game lifecycle control.
    Designed to be clear, maintainable, and easy to extend.
    """
    
    def __init__(self, char: Character, server: Server, db: Session):
        self.char = char
        self.server = server
        self.db = db
        self.state = self._determine_initial_state()
        
        # State transition handlers
        self._state_handlers: Dict[GameState, Callable] = {
            GameState.BIRTH: self._handle_birth,
            GameState.GROWTH: self._handle_growth,
            GameState.CHOICE: self._handle_choice,
            GameState.ENDING: self._handle_ending,
        }
    
    def _determine_initial_state(self) -> GameState:
        """Determine initial state based on character data."""
        if not self.char.is_alive:
            return GameState.ENDING
        if self.char.age <= 0:
            return GameState.BIRTH
        return GameState.GROWTH
    
    def _handle_birth(self) -> Dict[str, Any]:
        """Handle birth phase - initialize character."""
        # Birth initialization logic goes here
        # For now just transition to GROWTH
        self.state = GameState.GROWTH
        return {"action": "birth_complete", "next_state": self.state.name}
    
    def _handle_growth(self) -> Dict[str, Any]:
        """Handle growth phase - trigger events."""
        # This is where we'd trigger the hierarchical probability tree
        stage = LifeStage.get_stage(int(self.char.age))
        return {
            "action": "growth",
            "stage": stage.name,
            "stage_name": stage.name_cn,
            "age": self.char.age,
        }
    
    def _handle_choice(self) -> Dict[str, Any]:
        """Handle choice phase - wait for player input."""
        return {"action": "waiting_for_choice"}
    
    def _handle_ending(self) -> Dict[str, Any]:
        """Handle ending phase - death and summary."""
        return {"action": "ending", "is_dead": True}
    
    def transition(self, to_state: Optional[GameState] = None) -> Dict[str, Any]:
        """
        Execute current state handler and optionally transition.
        
        Args:
            to_state: Optional target state to transition to.
        """
        handler = self._state_handlers.get(self.state)
        if not handler:
            raise ValueError(f"No handler for state: {self.state}")
        
        result = handler()
        
        if to_state:
            self.state = to_state
        
        return result
    
    @property
    def current_stage(self) -> LifeStage:
        """Get current life stage based on age."""
        return LifeStage.get_stage(int(self.char.age))
    
    @property
    def is_in_early_life(self) -> bool:
        stage = self.current_stage
        return stage in [LifeStage.INFANT, LifeStage.CHILD, LifeStage.TEEN]
    
    @property
    def is_in_prime(self) -> bool:
        stage = self.current_stage
        return stage in [LifeStage.YOUNG_ADULT, LifeStage.ADULT]
