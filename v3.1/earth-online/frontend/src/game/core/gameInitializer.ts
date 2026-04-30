import { GAME_CONFIG } from '../../config/gameConfig';
import type {
  FamilyTier,
  GameState,
  PlayerStats,
  FamilyOccupation
} from './types';
import {
  applyBirthEffects
} from '../systems/birthSystem';
import {
  initializeSecretMissions
} from '../systems/secretMissionSystem';
import { getInitialAchievements } from './achievements';

// 出生配置接口
export interface BirthConfig {
  familyTier: FamilyTier;
  familyOccupation: FamilyOccupation | null;
  selectedTalent: string | null;
  selectedFlaw: string | null;
  characterName?: string;
  familyName?: string;
  gender?: 'male' | 'female';
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 成就系统已迁移至 achievements.ts
export { getInitialAchievements } from './achievements';

export function generateFamilyTier(): FamilyTier {
  const roll = Math.random() * 100;
  // 报告建议：提高SSR/SR可获得性，让更多玩家体验内容
  if (roll < 1) return 'SSR';    // 1%
  if (roll < 11) return 'SR';    // 10%
  if (roll < 71) return 'R';     // 60%
  return 'IRON';                 // 29%
}

export function generateInitialStats(tier: FamilyTier, birthConfig?: BirthConfig): PlayerStats {
  const baseStats: PlayerStats = {
    age: 0,
    health: 100,
    maxHealth: 100,
    money: 0,
    energy: 100,
    maxEnergy: 100,
    mood: 50,
    intelligence: randomInt(40, 70),
    charm: randomInt(40, 70),
    creativity: randomInt(40, 70),
    luck: randomInt(40, 60),
    karma: randomInt(30, 70),
    totalMoneyEarned: 0,
    isMarried: false,
    houseLevel: 0,
    carLevel: 0,
    jobLevel: 0,
    partner: { has: false, relationshipQuality: 50 },
    children: [],
    skillPoints: 0,
    skills: {
      programming: 0,
      investing: 0,
      medicine: 0,
      speech: 0,
      romance: 0,
      management: 0,
      fitness: 0,
      driving: 0,
      cooking: 0,
      painting: 0,
      music: 0,
      entrepreneurship: 0,
      academics: 0,
      athletics: 0,
    },
    familyOccupation: null,
    selectedTalent: null,
    selectedFlaw: null,
    healthStatus: { condition: 'healthy', duration: 0 },
    educationLevel: 'none',
    economyFactor: calculateEconomyFactor(0),
    retired: false,
    isUnemployed: false,
    career: {
      currentCareer: null,
      currentLevel: 0,
      totalExperience: 0,
      yearsInCurrentCareer: 0,
      previousCareers: [],
    },
    careerLevel: 0,
    totalAssets: 0,
    house: null,
    car: null,
    debts: [],
    familyName: birthConfig?.familyName || null,
    familyReputation: 50,
    socialCapital: 50,
    physicalFitness: 50,
    emotionalStability: 50,
  };

  let tierStats: PlayerStats;
  switch (tier) {
    case 'SSR':
      tierStats = {
        ...baseStats,
        money: 1000000,
        health: 100,
        maxHealth: 120,
        intelligence: randomInt(80, 100),
        charm: randomInt(80, 100),
        creativity: randomInt(75, 95),
        luck: randomInt(70, 90),
        mood: 80,
        karma: randomInt(70, 100),
        totalMoneyEarned: 1000000,
      };
      break;
    case 'SR':
      tierStats = {
        ...baseStats,
        money: 100000,
        intelligence: randomInt(65, 85),
        charm: randomInt(65, 85),
        creativity: randomInt(60, 80),
        luck: randomInt(55, 75),
        mood: 70,
        karma: randomInt(55, 80),
        totalMoneyEarned: 100000,
      };
      break;
    case 'R':
      tierStats = {
        ...baseStats,
        money: 10000,
        intelligence: randomInt(50, 70),
        charm: randomInt(50, 70),
        creativity: randomInt(50, 70),
        luck: randomInt(45, 65),
        totalMoneyEarned: 10000,
      };
      break;
    default:
      tierStats = baseStats;
  }

  // 应用出生配置
  if (birthConfig) {
    tierStats.familyOccupation = birthConfig.familyOccupation;
    tierStats.selectedTalent = birthConfig.selectedTalent;
    tierStats.selectedFlaw = birthConfig.selectedFlaw;
    
    // 应用出生效果
    return applyBirthEffects(tierStats, birthConfig);
  }

  return tierStats;
}

export function getRandomTitle(age: number, stats: PlayerStats): string {
  if (stats.health <= 0) return '早夭者';
  if (stats.money > 10000000) return '亿万富豪';
  if (stats.intelligence > 140) return '天才';
  if (stats.charm > 95) return '万人迷';
  if (stats.creativity > 140) return '艺术大师';
  if (stats.karma > 95) return '圣人';
  if (age >= 100) return '人瑞';
  if (age >= 80) return '长寿老人';
  if (stats.money < 0) return '穷光蛋';
  return '普通人';
}

export function getRandomComment(title: string): string {
  const comments: Record<string, string[]> = {
    '亿万富豪': ['有钱能使鬼推磨', '你的人生是爽文剧本'],
    '天才': ['上帝赏饭吃', '智商碾压众生'],
    '万人迷': ['颜值即正义', '走到哪都是焦点'],
    '圣人': ['人间天使', '你是好人'],
    '人瑞': ['这体质，绝了', '可以申请吉尼斯了'],
    '早夭者': ['天妒英才', '人生有时就是这么残酷'],
    '穷光蛋': ['运气守恒，下辈子好运', '至少你收获了贫穷'],
    '普通人': ['平凡是福', '也是大多数人的人生'],
  };
  const list = comments[title] || ['这就是人生啊。'];
  return list[Math.floor(Math.random() * list.length)];
}

export function calculateEconomyFactor(age: number): number {
  const period = GAME_CONFIG.ECONOMY_CYCLE_YEARS;
  const wave = Math.sin((age / period) * Math.PI * 2) * 0.2;
  return Math.round((1 + wave) * 100) / 100;
}

export const initialState: GameState = {
  phase: 'LANDING',
  stats: {
    age: 0,
    health: 100,
    maxHealth: 100,
    money: 0,
    energy: 100,
    maxEnergy: 100,
    mood: 50,
    intelligence: 50,
    charm: 50,
    creativity: 50,
    luck: 50,
    karma: 50,
    totalMoneyEarned: 0,
    isMarried: false,
    houseLevel: 0,
    carLevel: 0,
    jobLevel: 0,
    partner: { has: false, relationshipQuality: 50 },
    children: [],
    skillPoints: 0,
    skills: {
      programming: 0,
      investing: 0,
      medicine: 0,
      speech: 0,
      romance: 0,
      management: 0,
      fitness: 0,
      driving: 0,
      cooking: 0,
      painting: 0,
      music: 0,
      entrepreneurship: 0,
      academics: 0,
      athletics: 0,
    },
    familyOccupation: null,
    selectedTalent: null,
    selectedFlaw: null,
    healthStatus: { condition: 'healthy', duration: 0 },
    educationLevel: 'none',
    economyFactor: calculateEconomyFactor(0),
    retired: false,
    isUnemployed: false,
    career: {
      currentCareer: null,
      currentLevel: 0,
      totalExperience: 0,
      yearsInCurrentCareer: 0,
      previousCareers: [],
    },
    careerLevel: 0,
    totalAssets: 0,
    house: null,
    car: null,
    debts: [],
    familyName: null,
    familyReputation: 50,
    socialCapital: 50,
    physicalFitness: 50,
    emotionalStability: 50,
  },
  familyTier: null,
  birthServer: null,
  birthTalent: null,
  logs: [],
  currentYear: 0,
  currentEventId: null,
  rngSeed: 0,
  achievements: getInitialAchievements(),
  newlyUnlockedAchievements: [],
  deathReason: null,
  finalTitle: null,
  finalComment: null,
  consecutiveHappyYears: 0,
  difficulty: 'normal',
  lastTriggeredEvents: {},
  recentEventIds: [],
  eventLastTriggered: {},
  eventOccurrences: {},
  version: 2,
  endingsSeen: [],
  eventChains: {},
  secretMissions: initializeSecretMissions(),
  playTime: 0,
  challenge: undefined,
  challengeVictory: undefined,
  ngPlusCount: 0,
  legacyData: null,
  characterName: undefined,
  familyName: undefined,
  gender: undefined,
};
