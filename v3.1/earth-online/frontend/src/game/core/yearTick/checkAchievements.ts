import type { Achievement } from '../types';
import { getAchievementIndex } from '../achievements';

export interface AchievementResult {
  updatedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
}

export function checkAchievements(
  newAge: number,
  newTotalMoneyEarned: number,
  newIntelligence: number,
  newCharm: number,
  newCreativity: number,
  newLuck: number,
  newConsecutiveHappyYears: number,
  newHealth: number,
  newEnergy: number,
  currentAchievements: Achievement[]
): AchievementResult {
  let updatedAchievements = [...currentAchievements];
  const newlyUnlocked: Achievement[] = [];

  const checkAchievement = (id: string) => {
    const idx = getAchievementIndex(id);
    if (idx < 0) return;
    const achievement = updatedAchievements[idx];
    if (achievement && !achievement.unlocked) {
      updatedAchievements = updatedAchievements.map((a, i) =>
        i === idx ? { ...a, unlocked: true } : a
      );
      newlyUnlocked.push({ ...achievement, unlocked: true });
    }
  };

  if (newAge === 1) checkAchievement('first_birthday');
  if (newAge === 18) checkAchievement('adult');
  if (newAge === 35) checkAchievement('middle_aged');
  if (newAge === 60) checkAchievement('senior');
  if (newAge === 100) checkAchievement('centenarian');
  if (newTotalMoneyEarned >= 1000000) checkAchievement('rich');
  if (newIntelligence >= 120) checkAchievement('genius');
  if (newCharm >= 90) checkAchievement('charmer');
  if (newCreativity >= 120) checkAchievement('creative');
  if (newLuck >= 90) checkAchievement('lucky');
  if (newConsecutiveHappyYears >= 5) checkAchievement('happy');
  if (newHealth > 0 && newHealth < 10) checkAchievement('survivor');
  if (newEnergy < 10) checkAchievement('hardworker');

  return { updatedAchievements, newlyUnlocked };
}
