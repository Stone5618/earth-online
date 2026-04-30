/**
 * 游戏属性颜色配置 - 全局唯一数据源 (Single Source of Truth)
 *
 * 所有组件必须从此文件引用属性颜色，禁止硬编码 hex 值。
 * 修改历史:
 *   v3.1 - 统一四源分裂: StatPanel / DecisionPanel / GameHUD / tailwind.config
 */

import type { LucideIcon } from 'lucide-react';
import { Smile, Frown } from 'lucide-react';

/** 静态属性颜色 */
export const ATTR = {
  health: '#EF5350',
  energy: '#FFA726',
  gold: '#FFD700',
  intellect: '#42A5F5',
  charm: '#EC407A',
  creativity: '#FF69B4',
  luck: '#00FF88',
} as const;

export type AttrKey = keyof typeof ATTR;

/**
 * 心情动态颜色 - 根据心情值返回对应颜色
 *
 * @param value - 心情数值 (0-100)
 * @returns 对应的十六进制颜色值
 */
export function getMoodColor(value: number): string {
  if (value >= 70) return '#66BB6A';
  if (value >= 40) return '#FFA726';
  return '#EF5350';
}

/**
 * 获取任意属性的标准颜色
 *
 * @param key - 属性名称 ('health' | 'energy' | 'mood' | 'gold' | 'intellect' | 'charm')
 * @param value - 可选数值(仅mood需要)
 * @returns 十六进制颜色值
 */
export function attrColor(key: string, value?: number): string {
  const lowerKey = key.toLowerCase();

  if (lowerKey === 'mood') {
    return getMoodColor(value ?? 50);
  }

  const staticColors: Record<string, string> = {
    health: ATTR.health,
    energy: ATTR.energy,
    money: ATTR.gold,
    gold: ATTR.gold,
    totalMoneyEarned: ATTR.gold,
    totalassets: ATTR.gold,
    intelligence: ATTR.intellect,
    intellect: ATTR.intellect,
    charm: ATTR.charm,
    creativity: ATTR.creativity,
    luck: ATTR.luck,
  };

  return staticColors[lowerKey] ?? '#9E9E9E';
}

/** 心情信息对象 (含图标和标签) */
export interface MoodInfo {
  color: string;
  label: string;
  icon: React.ElementType;
}

/**
 * 获取完整的心情信息
 */
export function getMoodInfo(value: number): MoodInfo {
  if (value >= 70) return { color: '#66BB6A', label: '开心', icon: Smile };
  if (value >= 40) return { color: '#FFA726', label: '一般', icon: Smile };
  return { color: '#EF5350', label: '沮丧', icon: Frown };
}

/** 属性显示标签映射 */
export const ATTR_LABELS: Record<string, string> = {
  health: '健康',
  energy: '精力',
  mood: '心情',
  money: '金币',
  gold: '金币',
  intelligence: '智力',
  intellect: '智力',
  charm: '魅力',
};

// ========== P2-04: 年龄头像渐进系统 ==========

/** 年龄段对应的头像表情 */
export interface AgeAvatar {
  emoji: string;
  label: string;
  colorClass: string;
}

/**
 * 根据年龄返回对应的头像信息
 *
 * @param age - 当前年龄
 * @returns 头像对象(emoji/标签/颜色类名)
 */
export function getAgeAvatar(age: number): AgeAvatar {
  if (age <= 5) return { emoji: '🍼', label: '婴幼儿', colorClass: 'text-pink-300' };
  if (age <= 12) return { emoji: '👦', label: '儿童', colorClass: 'text-blue-300' };
  if (age <= 17) return { emoji: '🧒', label: '青少年', colorClass: 'text-green-300' };
  if (age <= 30) return { emoji: '🧑', label: '青年', colorClass: 'text-holo-blue' };
  if (age <= 50) return { emoji: '👨‍💼', label: '中年', colorClass: 'text-yellow-400' };
  if (age <= 70) return { emoji: '👴', label: '中老年', colorClass: 'text-orange-400' };
  return { emoji: '🧓', label: '高龄', colorClass: 'text-red-300' };
}

// ========== P2-05: 服务器氛围配色系统 ==========

export type ServerRegion = 'asia' | 'europe' | 'north_america' | 'default';

export interface ServerTheme {
  id: ServerRegion;
  name: string;
  /** 主色调覆盖 */
  accentColor: string;
  /** 辅助色 */
  secondaryColor: string;
  /** 背景色调整 */
  bgTint: string;
  /** 图标/装饰元素 */
  iconEmoji: string;
  /** 描述标签 */
  description: string;
}

/**
 * 服务器氛围主题配置
 *
 * 基于出生服务器的UI微调方案，增强世界观代入感
 */
export const SERVER_THEMES: Record<ServerRegion, ServerTheme> = {
  default: {
    id: 'default',
    name: '默认',
    accentColor: '#00D2FF',
    secondaryColor: '#A855F7',
    bgTint: '',
    iconEmoji: '🌐',
    description: '标准全息界面',
  },
  asia: {
    id: 'asia',
    name: '亚洲服务器',
    accentColor: '#FF6B6B',
    secondaryColor: '#FFD700',
    bgTint: 'rgba(255, 50, 50, 0.02)',
    iconEmoji: '🏯',
    description: '东方韵味',
  },
  europe: {
    id: 'europe',
    name: '欧洲服务器',
    accentColor: '#60A5FA',
    secondaryColor: '#C4B5FD',
    bgTint: 'rgba(100, 100, 200, 0.02)',
    iconEmoji: '🏰',
    description: '古典欧陆',
  },
  north_america: {
    id: 'north_america',
    name: '北美服务器',
    accentColor: '#34D399',
    secondaryColor: '#67E8F9',
    bgTint: 'rgba(50, 200, 100, 0.02)',
    iconEmoji: '🗽',
    description: '自由大陆',
  },
};

/**
 * 从服务器名称推断区域类型
 */
export function inferServerRegion(serverName: string | null): ServerRegion {
  if (!serverName) return 'default';
  const lower = serverName.toLowerCase();
  if (lower.includes('中国') || lower.includes('日本') || lower.includes('韩国') || lower.includes('亚洲') || lower.includes('asia')) return 'asia';
  if (lower.includes('欧洲') || lower.includes('英国') || lower.includes('德国') || lower.includes('法国') || lower.includes('europe')) return 'europe';
  if (lower.includes('北美') || lower.includes('美国') || lower.includes('加拿大') || lower.includes('america')) return 'north_america';
  return 'default';
}

/**
 * 获取当前服务器主题
 */
export function getServerTheme(serverName: string | null): ServerTheme {
  const region = inferServerRegion(serverName);
  return SERVER_THEMES[region];
}
