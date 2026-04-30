/**
 * 技能元数据定义 - 单一数据源
 * 供 SkillsPanel 和 ChoiceResultModal 等组件使用
 */

import { Zap, TrendingUp, HeartPulse, MessageSquare, Heart, Briefcase, Dumbbell, Car, Utensils, Palette as PaletteIcon, Music, Sparkles, GraduationCap, Trophy } from 'lucide-react';
import type { SkillKey } from '@/game/gameState';

export interface SkillInfo {
  icon: React.ElementType;
  name: string;
  description: string;
  color: string;
}

export const SKILL_META: Record<SkillKey, SkillInfo> = {
  programming: {
    icon: Zap,
    name: '编程',
    description: '掌握编程技术，提高收入和创业成功率',
    color: '#00D2FF',
  },
  investing: {
    icon: TrendingUp,
    name: '投资',
    description: '学习投资，提高理财能力',
    color: '#FFD700',
  },
  medicine: {
    icon: HeartPulse,
    name: '医疗',
    description: '了解医学知识，提高健康恢复能力',
    color: '#FF4B4B',
  },
  speech: {
    icon: MessageSquare,
    name: '演讲',
    description: '提升口才和表达能力',
    color: '#FF69B4',
  },
  romance: {
    icon: Heart,
    name: '恋爱',
    description: '掌握恋爱技巧，提升魅力',
    color: '#FF1493',
  },
  management: {
    icon: Briefcase,
    name: '管理',
    description: '学习管理，提高事业成功率',
    color: '#8B5CF6',
  },
  fitness: {
    icon: Dumbbell,
    name: '健身',
    description: '坚持锻炼，提高身体素质',
    color: '#00FF88',
  },
  driving: {
    icon: Car,
    name: '驾驶',
    description: '学习驾驶，提升出行便利性',
    color: '#3B82F6',
  },
  cooking: {
    icon: Utensils,
    name: '烹饪',
    description: '掌握烹饪技巧，提升生活品质',
    color: '#F59E0B',
  },
  painting: {
    icon: PaletteIcon,
    name: '绘画',
    description: '培养艺术细胞，提升创造力',
    color: '#EC4899',
  },
  music: {
    icon: Music,
    name: '音乐',
    description: '学习音乐，提升艺术修养',
    color: '#A855F7',
  },
  entrepreneurship: {
    icon: Sparkles,
    name: '创业',
    description: '学习创业，提升商业能力',
    color: '#F97316',
  },
  academics: {
    icon: GraduationCap,
    name: '学术',
    description: '深耕学术领域，提升专业能力',
    color: '#10B981',
  },
  athletics: {
    icon: Trophy,
    name: '体育',
    description: '发展体育特长，提升身体素质',
    color: '#06B6D4',
  },
};

/** 技能名称映射，用于 ChoiceResultModal 等组件 */
export const SKILL_LABELS: Record<string, string> = {
  programming: '编程',
  investing: '投资',
  medicine: '医疗',
  speech: '演讲',
  romance: '恋爱',
  management: '管理',
  fitness: '健身',
  driving: '驾驶',
  cooking: '烹饪',
  painting: '绘画',
  music: '音乐',
  entrepreneurship: '创业',
  academics: '学术',
  athletics: '体育',
};
