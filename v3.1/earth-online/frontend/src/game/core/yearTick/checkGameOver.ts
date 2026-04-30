import type { GameState, PlayerStats, GameLog, HealthStatus } from '../types';
import { getRandomTitle, getRandomComment } from '../gameInitializer';
import { handleMoneyChange } from '../../systems/debtSystem';

export type GameOverResult = 
  | { shouldGameOver: false }
  | { shouldGameOver: true; newState: GameState };

export function checkGameOver(
  state: GameState,
  newAge: number,
  newHealth: number,
  newEnergy: number,
  newMoney: number,
  newMood: number,
  newIntelligence: number,
  newCharm: number,
  newCreativity: number,
  newLuck: number,
  newKarma: number,
  newTotalMoneyEarned: number,
  isMarriedChange: boolean | undefined,
  newEconomyFactor: number,
  newHealthStatus: any,
  careerResult: { newStats: Partial<PlayerStats>; extraSkillPoints: number },
  baseStatChanges: {
    houseLevel?: number;
    carLevel?: number;
    jobLevel?: number;
    isUnemployed?: boolean;
    career?: any;
    partner?: any;
    children?: any[];
    debts?: any;
    skills?: Partial<PlayerStats['skills']>;
    skillPoints?: number;
  },
  actionPayload: { event: string; eventType: string; statChanges: Record<string, any>; action?: string },
  economyLogEntry: GameLog[],
  healthLogEntry: GameLog[],
  updatedAchievements: any[],
  newlyUnlocked: any[],
  newConsecutiveHappyYears: number
): GameOverResult {
  const maxAge = state.challenge?.rules?.maxAge || 100;
  
  if (newHealth > 0 && newAge < maxAge) {
    return { shouldGameOver: false };
  }

  const title = getRandomTitle(newAge, { ...state.stats, health: newHealth, age: newAge });
  let challengeVictory: boolean | undefined = undefined;
  
  if (state.challenge) {
    const finalStats = {
      ...state.stats,
      age: newAge,
      health: Math.max(0, newHealth),
      energy: newEnergy,
      money: newMoney,
      mood: newMood,
      intelligence: newIntelligence,
      charm: newCharm,
      creativity: newCreativity,
      luck: newLuck,
      karma: newKarma,
      totalMoneyEarned: newTotalMoneyEarned,
      isMarried: isMarriedChange !== undefined ? isMarriedChange : state.stats.isMarried,
      economyFactor: newEconomyFactor,
    };
    challengeVictory = state.challenge.victoryCondition(finalStats);
  }

  const preStats: PlayerStats = {
    ...state.stats,
    ...careerResult.newStats,
    age: newAge,
    health: Math.max(0, newHealth),
    maxHealth: state.stats.maxHealth,
    energy: newEnergy,
    maxEnergy: state.stats.maxEnergy,
    money: newMoney,
    mood: newMood,
    intelligence: newIntelligence,
    charm: newCharm,
    creativity: newCreativity,
    luck: newLuck,
    karma: newKarma,
    totalMoneyEarned: newTotalMoneyEarned,
    isMarried: isMarriedChange !== undefined ? isMarriedChange : state.stats.isMarried,
    economyFactor: newEconomyFactor,
    healthStatus: newHealthStatus as HealthStatus,
    skillPoints: state.stats.skillPoints + careerResult.extraSkillPoints,
    houseLevel: baseStatChanges.houseLevel !== undefined ? baseStatChanges.houseLevel as 0|1|2|3|4 : state.stats.houseLevel,
    carLevel: baseStatChanges.carLevel !== undefined ? baseStatChanges.carLevel as 0|1|2|3 : state.stats.carLevel,
    jobLevel: baseStatChanges.jobLevel !== undefined ? baseStatChanges.jobLevel as 0|1|2|3|4|5 : state.stats.jobLevel,
    isUnemployed: baseStatChanges.isUnemployed !== undefined ? baseStatChanges.isUnemployed : state.stats.isUnemployed,
    career: baseStatChanges.career !== undefined ? baseStatChanges.career : state.stats.career,
    partner: baseStatChanges.partner !== undefined ? baseStatChanges.partner : state.stats.partner,
    children: baseStatChanges.children !== undefined ? baseStatChanges.children : state.stats.children,
    debts: actionPayload.statChanges?.debts !== undefined ? actionPayload.statChanges.debts : state.stats.debts,
  };

  const finalStats = handleMoneyChange(preStats, '年度支出');

  return {
    shouldGameOver: true,
    newState: {
      ...state,
      phase: 'GAMEOVER',
      stats: finalStats,
      currentYear: state.currentYear + 1,
      logs: [
        {
          year: newAge,
          event: actionPayload.event,
          type: actionPayload.eventType as GameLog['type'],
          statChanges: actionPayload.statChanges,
          action: actionPayload.action,
        },
        ...economyLogEntry,
        ...healthLogEntry,
        ...state.logs.slice(0, 79 - economyLogEntry.length - healthLogEntry.length),
      ],
      achievements: updatedAchievements,
      newlyUnlockedAchievements: newlyUnlocked,
      deathReason: newHealth <= 0 ? '健康值归零' : '寿终正寝',
      finalTitle: title,
      finalComment: getRandomComment(title),
      consecutiveHappyYears: newConsecutiveHappyYears,
      challengeVictory,
      currentEventId: null,
    },
  };
}
