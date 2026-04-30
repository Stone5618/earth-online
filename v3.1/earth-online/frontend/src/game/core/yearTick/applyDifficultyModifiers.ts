import type { GameState, Difficulty } from '../types';

export interface DifficultyModifiers {
  positive: number;
  negative: number;
}

export function getBaseDifficultyModifiers(difficulty: Difficulty): DifficultyModifiers {
  const multipliers = {
    easy: { positive: 1.3, negative: 0.7 },
    normal: { positive: 1, negative: 1 },
    hard: { positive: 0.8, negative: 1.3 },
  };
  return { ...multipliers[difficulty] };
}

export function applyConditionalModifiers(
  modifiers: DifficultyModifiers,
  stats: { health: number; money: number; mood: number }
): DifficultyModifiers {
  let diff = { ...modifiers };
  
  if (stats.health < 30) {
    diff.negative = Math.min(diff.negative * 0.8, 1);
  }
  
  if (stats.money > 100000) {
    diff.positive = Math.max(diff.positive * 0.85, 0.7);
  }
  
  if (stats.mood < 30) {
    diff.positive = Math.min(diff.positive * 1.2, 1.5);
  }
  
  return diff;
}

export function applyChallengeIncomeMultiplier(
  state: GameState,
  currentMultiplier: number
): number {
  let finalMoneyMultiplier = currentMultiplier;
  
  if (state.challenge?.rules) {
    if (state.challenge.rules.incomeMultiplier) {
      finalMoneyMultiplier = state.challenge.rules.incomeMultiplier * finalMoneyMultiplier;
    }
  }
  
  return finalMoneyMultiplier;
}

export function applyDiff(value: number, isPositive: boolean, modifiers: DifficultyModifiers): number {
  return Math.round(value * (isPositive ? modifiers.positive : modifiers.negative));
}
