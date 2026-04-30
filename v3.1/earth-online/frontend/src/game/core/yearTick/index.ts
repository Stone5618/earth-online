export {
  extractBaseStatChanges,
  calculateRawChanges,
  calculateIntermediateHealth,
} from './calculateBaseStats';
export type { BaseStatChanges, CareerYearResult } from './calculateBaseStats';

export {
  getBaseDifficultyModifiers,
  applyConditionalModifiers,
  applyChallengeIncomeMultiplier,
  applyDiff,
} from './applyDifficultyModifiers';
export type { DifficultyModifiers } from './applyDifficultyModifiers';

export {
  applyHealthSystem,
} from './applyHealthSystem';
export type { HealthSystemResult } from './applyHealthSystem';

export {
  applyEconomySystem,
} from './applyEconomySystem';
export type { EconomyResult } from './applyEconomySystem';

export {
  processCareerYearTick,
} from './applyCareerSystem';
export type { CareerYearResult as CareerYearTickResult } from './applyCareerSystem';

export { checkAchievements } from './checkAchievements';
export type { AchievementResult } from './checkAchievements';

export { buildHealthLogEntry } from './buildLogEntries';

export { checkGameOver } from './checkGameOver';
export type { GameOverResult } from './checkGameOver';
