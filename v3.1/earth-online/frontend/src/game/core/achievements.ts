/**
 * Achievement library - single source of truth for all achievements.
 * Shared between gameEngine.ts and gameInitializer.ts.
 */

import type { Achievement } from './types';

export const achievementLibrary: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_birthday', name: '生日快乐', description: '庆祝你的第一个生日', icon: '🎂' },
  { id: 'adult', name: '长大成人', description: '度过18岁生日', icon: '🎉' },
  { id: 'middle_aged', name: '人到中年', description: '度过35岁生日', icon: '🍵' },
  { id: 'senior', name: '老年生活', description: '度过60岁生日', icon: '👴' },
  { id: 'centenarian', name: '百岁老人', description: '活到100岁', icon: '🎊' },
  { id: 'rich', name: '富甲一方', description: '累计获得100万元', icon: '💰' },
  { id: 'genius', name: '天才少年', description: '智力达到120', icon: '🧠' },
  { id: 'charmer', name: '万人迷', description: '魅力达到90', icon: '💖' },
  { id: 'creative', name: '创意无限', description: '创造力达到120', icon: '🎨' },
  { id: 'lucky', name: '幸运儿', description: '运气达到90', icon: '🍀' },
  { id: 'happy', name: '乐观派', description: '心情连续保持90+', icon: '😊' },
  { id: 'survivor', name: '幸存者', description: '健康低于10但还活着', icon: '🏥' },
  { id: 'hardworker', name: '工作狂', description: '精力低于10还在坚持', icon: '⚡' },
];

/** Pre-computed index map for O(1) achievement lookup by id. */
export const achievementIndexById = new Map(
  achievementLibrary.map((a, i) => [a.id, i])
);

export function getInitialAchievements(): Achievement[] {
  return achievementLibrary.map((a) => ({ ...a, unlocked: false }));
}

export function getAchievementIndex(id: string): number {
  return achievementIndexById.get(id) ?? -1;
}
