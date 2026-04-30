// Re-export all types from split modules for backward compatibility
import type { ChallengeConfig } from '../../config/gameConfig';

export type { ChallengeConfig };

// Add missing types
export type Talent = {
  id: string;
  name: string;
  description: string;
  effect: (stats: any) => any;
};

export type Flaw = {
  id: string;
  name: string;
  description: string;
  effect: (stats: any) => any;
};

export type Ending = {
  id: string;
  name: string;
  priority: number;
  condition: (stats: any) => boolean;
  description: string;
  icon: string;
};

// Stats
export type {
  FamilyTier,
  PlayerStats,
  Partner,
  Child,
  Housing,
  Car,
  Job,
} from './types/stats';

// Systems
export type {
  FamilyOccupation,
  CareerField,
  CareerType,
  CareerLevel,
  CareerInfo,
  PlayerCareerState,
  SkillTree,
  SkillKey,
  EducationLevel,
  Illness,
  HealthStatus,
  HealthTransition,
  Economy,
  EconomyState,
  Debt,
} from './types/systems';

// Events
export type {
  ChoiceText,
  StatChanges,
  GameEventChoice,
  GameEvent,
  EventChainStep,
  EventChain,
  SecretMission,
} from './types/events';

// Game
export type {
  GamePhase,
  Difficulty,
  GameLog,
  Achievement,
  GameState,
  GameAction,
} from './types/game';
export { STAT_BOUNDS } from './types/game';
