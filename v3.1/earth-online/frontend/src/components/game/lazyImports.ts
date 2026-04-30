/**
 * Lazy-loaded game panel components - 统一导入入口
 *
 * 所有需要 lazy import 这些面板组件的地方必须从此文件导入，
 * 禁止在各自文件中重复定义 lazy()，避免构建产物出现重复 chunk。
 */

import { lazy } from 'react';

export const SkillsPanel = lazy(() => import('./SkillsPanel').then(m => ({ default: m.SkillsPanel })));
export const AchievementPanel = lazy(() => import('./AchievementPanel').then(m => ({ default: m.AchievementPanel })));
export const SaveSlotPanel = lazy(() => import('./SaveSlotPanel').then(m => ({ default: m.SaveSlotPanel })));
export const SettingsPanel = lazy(() => import('./SettingsPanel').then(m => ({ default: m.SettingsPanel })));
