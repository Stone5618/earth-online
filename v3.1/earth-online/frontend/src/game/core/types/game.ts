/**
 * Game state and action types
 */
import type { PlayerStats, FamilyTier } from './stats';
import type { SkillKey } from './systems';
import type { HealthStatus } from './systems';
import type { EventChain, SecretMission, GameEvent } from './events';
import type { ChallengeConfig } from '../../../config/gameConfig';

// ========== 游戏阶段 ==========
export type GamePhase = 'LANDING' | 'SPAWNING' | 'PLAYING' | 'GAMEOVER';

// ========== 难度 ==========
export type Difficulty = 'easy' | 'normal' | 'hard';

// ========== 游戏日志 ==========
export interface GameLog {
  year: number;
  event: string;
  type: 'normal' | 'positive' | 'negative' | 'milestone' | 'death';
  statChanges?: Partial<PlayerStats>;
  action?: string;
}

// ========== 成就 ==========
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

// ========== 完整游戏状态 ==========
export interface GameState {
  phase: GamePhase;
  stats: PlayerStats;
  familyTier: FamilyTier | null;
  birthServer: string | null;
  birthTalent: string | null;
  logs: GameLog[];
  currentYear: number;
  currentEventId: string | null;
  rngSeed: number;
  achievements: Achievement[];
  newlyUnlockedAchievements: Achievement[];
  deathReason: string | null;
  finalTitle: string | null;
  finalComment: string | null;
  consecutiveHappyYears: number;
  difficulty: 'easy' | 'normal' | 'hard';
  lastTriggeredEvents: Record<string, number>;
  recentEventIds: string[];
  eventLastTriggered: Record<string, number>;
  eventOccurrences: Record<string, number>;
  version: number;
  endingsSeen: string[];
  eventChains: Record<string, EventChain>;
  secretMissions: SecretMission[];
  playTime: number;
  challenge?: ChallengeConfig;
  challengeVictory?: boolean;
  ngPlusCount?: number;
  legacyData?: LegacyData | null;
  // 角色信息
  characterName?: string;
  familyName?: string;
  gender?: 'male' | 'female';
}

export interface LegacyBreakdown {
  wealth: number;
  education: number;
  career: number;
  family: number;
  skills: number;
  karma: number;
  achievement: number;
  longevity: number;
}

export interface LegacyData {
  total_score: number;
  tier: string;
  tier_label: string;
  bonus_multiplier: number;
  color: string;
  breakdown: LegacyBreakdown;
  ng_plus_count: number;
}

// ========== Game Action ==========
export type GameAction =
  | { type: 'START_SPAWNING'; payload: { familyTier: FamilyTier; initialStats: PlayerStats; birthServer: string; birthTalent: string; challenge?: ChallengeConfig; characterName?: string; familyName?: string; gender?: 'male' | 'female' } }
  | { type: 'COMPLETE_SPAWNING' }
  | { type: 'TICK_YEAR'; payload: { action: string; statChanges: Partial<PlayerStats>; event: string; eventType: GameLog['type'] } }
  | { type: 'REST_AND_RECOVER'; payload: { statChanges: Partial<PlayerStats> } }
  | { type: 'GAME_OVER'; payload: { reason: string; title: string; comment: string } }
  | { type: 'RESET_GAME' }
  | { type: 'GO_TO_LANDING' }
  | { type: 'UPDATE_STATS'; payload: Partial<PlayerStats> }
  | { type: 'ADD_LOG'; payload: GameLog }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'CLEAR_ACHIEVEMENT_NOTIFICATIONS'; payload?: Achievement[] }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'SET_DIFFICULTY'; payload: 'easy' | 'normal' | 'hard' }
  | { type: 'TRIGGER_EVENT'; payload: { eventId: string; year: number } }
  | { type: 'UPGRADE_HOUSE' }
  | { type: 'UPGRADE_CAR' }
  | { type: 'UPGRADE_JOB' }
  | { type: 'GET_PARTNER' }
  | { type: 'HAVE_CHILD'; payload: { name: string } }
  | { type: 'RETIRE' }
  | { type: 'UPGRADE_SKILL'; payload: { skill: SkillKey } }
  | { type: 'SET_CHALLENGE'; payload: ChallengeConfig | undefined }
  | { type: 'SEEK_TREATMENT' }
  | { type: 'UPDATE_HEALTH_STATUS'; payload: { healthStatus: HealthStatus } }
  | { type: 'UPDATE_MARRIAGE_STATUS'; payload: { candidate?: { name: string; age: number; quality: number }; isMarried: boolean } }
  | { type: 'START_NG_PLUS'; payload: { legacyData: LegacyData; ngPlusCount: number } };

// ========== 属性范围 ==========
export const STAT_BOUNDS = {
  health: { min: 0, max: 999 },
  mood: { min: 0, max: 100 },
  intelligence: { min: 0, max: 200 },
  charm: { min: 0, max: 150 },
  creativity: { min: 0, max: 200 },
  luck: { min: 0, max: 150 },
  karma: { min: 0, max: 150 },
  energy: { min: 0, max: 200 },
  money: { min: -999999999, max: 999999999 },
  age: { min: 0, max: 120 }
};
