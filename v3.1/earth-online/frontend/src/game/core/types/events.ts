/**
 * Event-related types: events, choices, chains, missions
 */
import type { PlayerStats, FamilyTier } from './stats';
import type { GameLog } from './game';

// ========== 事件 ==========
export type ChoiceText = string | ((stats: PlayerStats) => string);
export type StatChanges = Partial<PlayerStats> | ((stats: PlayerStats) => Partial<PlayerStats>);

export interface GameEventChoice {
  text: ChoiceText;
  statChanges: StatChanges;
  followUp?: string | ((stats: Partial<PlayerStats>) => string);
  resultMessage?: string;
  eventType?: GameLog['type'];
  disabled?: ((stats: PlayerStats) => boolean) | boolean;
  disabledReason?: string;
}

export interface GameEvent {
  id: string;
  minAge: number;
  maxAge: number;
  condition?: (stats: PlayerStats, familyTier?: FamilyTier | null) => boolean;
  cooldownYears?: number;
  maxOccurrences?: number;
  text: string;
  description?: string;
  eventType?: GameLog['type'];
  choices: GameEventChoice[];
  weight?: number;
}

// ========== 事件链 ==========
export interface EventChainStep {
  eventId: string;
  requiredCondition?: (state: any) => boolean;
  nextStepId: string | null;
  immediate?: boolean;
}

export interface EventChain {
  id: string;
  steps: EventChainStep[];
  currentStepIndex: number;
  completed: boolean;
}

// ========== 秘密任务 ==========
export interface SecretMission {
  id: string;
  description: string;
  condition: (state: any) => boolean;
  reward: (state: any) => any;
  completed: boolean;
}
