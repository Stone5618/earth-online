// gameConfig.ts — re-exports from split files for backward compatibility
// All existing imports from 'config/gameConfig' still work untouched.

// Keep original imports


import type { SkillTree } from '../types/game';
import type { PlayerStats, CareerInfo, CareerType, FamilyOccupation, FamilyTier } from '../game/core/types';


// Keep original local types
// 本地定义的类型
export interface Ending {
  id: string;
  name: string;
  priority: number;
  condition: (stats: PlayerStats) => boolean;
  description: string;
  icon: string;
}

export interface ChallengeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  initialStats?: Partial<PlayerStats>;
  rules?: {
    maxAge?: number;
    incomeMultiplier?: number;
    skillPointsMultiplier?: number;
    disableRomance?: boolean;
    healthMultiplier?: number;
  };
  victoryCondition: (stats: PlayerStats) => boolean;
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  effect: (stats: PlayerStats) => Partial<PlayerStats>;
}

export interface Flaw {
  id: string;
  name: string;
  description: string;
  effect: (stats: PlayerStats) => Partial<PlayerStats>;
}

// ========== 家庭职业配置（扩展版） ==========
export const FAMILY_OCCUPATIONS: Record<FamilyOccupation, { name: string; passiveBonus: string; description: string; statBonus: Partial<PlayerStats> }> = {
  // 政府/公共服务类
  civil_servant: { name: '公务员世家', passiveBonus: '稳定加成', description: '出生于公务员家庭，政治资源丰富', statBonus: { money: 80000, totalMoneyEarned: 80000, intelligence: 10, karma: 10, skillPoints: 2, skills: { speech: 1 } as any } },
  police: { name: '警察世家', passiveBonus: '正义感', description: '警察家庭，正义感强烈', statBonus: { money: 50000, totalMoneyEarned: 50000, health: 20, maxHealth: 20, karma: 15, skills: { athletics: 1 } as any } },
  teacher_family: { name: '教师世家', passiveBonus: '教育加成', description: '教育世家，学习能力强', statBonus: { money: 60000, totalMoneyEarned: 60000, intelligence: 15, creativity: 10, skillPoints: 3, skills: { academics: 1 } as any } },
  doctor_family: { name: '医生世家', passiveBonus: '医疗资源', description: '医生家庭，健康有保障', statBonus: { money: 100000, totalMoneyEarned: 100000, health: 15, maxHealth: 15, intelligence: 10, skills: { medicine: 1 } as any } },
  
  // 专业技术类
  lawyer: { name: '律师世家', passiveBonus: '口才加成', description: '律师家庭，能言善辩', statBonus: { money: 150000, totalMoneyEarned: 150000, intelligence: 12, charm: 8, skillPoints: 2, skills: { speech: 2 } as any } },
  engineer: { name: '工程师世家', passiveBonus: '技术加成', description: '工程师家庭，动手能力强', statBonus: { money: 120000, totalMoneyEarned: 120000, intelligence: 15, creativity: 8, skillPoints: 2, skills: { athletics: 1 } as any } },
  programmer_family: { name: '程序员世家', passiveBonus: '编程天赋', description: '程序员家庭，计算机天赋', statBonus: { money: 150000, totalMoneyEarned: 150000, intelligence: 18, creativity: 10, skillPoints: 3, skills: { programming: 2 } as any } },
  scientist: { name: '科研世家', passiveBonus: '科研能力', description: '科研家庭，探索精神', statBonus: { money: 200000, totalMoneyEarned: 200000, intelligence: 20, creativity: 12, skillPoints: 3, skills: { academics: 2 } as any } },
  
  // 商业/金融类
  business: { name: '商人世家', passiveBonus: '收入 +10%', description: '商业世家，金钱敏锐', statBonus: { money: 300000, totalMoneyEarned: 300000, intelligence: 8, skillPoints: 3, skills: { entrepreneurship: 1 } as any } },
  finance: { name: '金融世家', passiveBonus: '投资加成', description: '金融世家，投资天赋', statBonus: { money: 500000, totalMoneyEarned: 500000, intelligence: 10, skillPoints: 2, skills: { investing: 2 } as any } },
  entrepreneur: { name: '企业家世家', passiveBonus: '创业资源', description: '企业家家庭，创业基因', statBonus: { money: 800000, totalMoneyEarned: 800000, charm: 10, skillPoints: 3, skills: { entrepreneurship: 2, management: 1 } as any } },
  
  // 文化/艺术/体育类
  artist: { name: '艺人世家', passiveBonus: '艺术天赋', description: '艺术家庭，天赋异禀', statBonus: { money: 200000, totalMoneyEarned: 200000, charm: 15, creativity: 20, skillPoints: 2, skills: { music: 1, painting: 1 } as any } },
  athlete: { name: '体育世家', passiveBonus: '运动天赋', description: '体育世家，运动健将', statBonus: { money: 100000, totalMoneyEarned: 100000, health: 25, maxHealth: 25, charm: 8, skillPoints: 2, skills: { athletics: 2, fitness: 1 } as any } },
  writer: { name: '文学世家', passiveBonus: '写作天赋', description: '文学家庭，才华横溢', statBonus: { money: 80000, totalMoneyEarned: 80000, intelligence: 12, creativity: 20, skillPoints: 2, skills: { academics: 1 } as any } },
  designer: { name: '设计世家', passiveBonus: '设计能力', description: '设计家庭，审美出众', statBonus: { money: 150000, totalMoneyEarned: 150000, creativity: 25, charm: 8, skillPoints: 2, skills: { painting: 2 } as any } },
  
  // 传统/基础类
  farmer: { name: '农民世家', passiveBonus: '朴实勤劳', description: '农民家庭，脚踏实地', statBonus: { money: 10000, totalMoneyEarned: 10000, health: 15, maxHealth: 15, karma: 10, mood: 10 } },
  worker: { name: '工人世家', passiveBonus: '动手能力', description: '工人家庭，动手能力强', statBonus: { money: 20000, totalMoneyEarned: 20000, health: 20, maxHealth: 20, skillPoints: 2, skills: { athletics: 1, fitness: 1 } as any } },
  craftsman: { name: '手艺世家', passiveBonus: '传统技艺', description: '手艺人家庭，精益求精', statBonus: { money: 30000, totalMoneyEarned: 30000, creativity: 15, health: 10, maxHealth: 10, skillPoints: 2, skills: { cooking: 1 } as any } },
  
  // 特殊/神秘类
  scholar: { name: '书香门第', passiveBonus: '智慧加成', description: '世代书香，学识渊博', statBonus: { money: 150000, totalMoneyEarned: 150000, intelligence: 20, creativity: 10, skillPoints: 3, skills: { academics: 2 } as any } },
  military: { name: '军武世家', passiveBonus: '体魄强健', description: '军人世家，身体强健', statBonus: { money: 120000, totalMoneyEarned: 120000, health: 30, maxHealth: 30, energy: 20, maxEnergy: 20, skillPoints: 2, skills: { fitness: 2, athletics: 1 } as any } },
  hermit: { name: '隐士世家', passiveBonus: '运气智慧', description: '隐士家庭，神秘莫测', statBonus: { money: 50000, totalMoneyEarned: 50000, intelligence: 15, luck: 20, karma: 15, skillPoints: 2 } },
  adventurer: { name: '冒险世家', passiveBonus: '探索精神', description: '冒险家家庭，勇于探索', statBonus: { money: 80000, totalMoneyEarned: 80000, health: 15, maxHealth: 15, luck: 15, skillPoints: 2, skills: { athletics: 1, fitness: 1 } as any } },
};


// Re-exported from split files
export { TALENTS, FLAWS, ENDINGS, CHALLENGES } from './endings';
export { CAREERS } from './careers';

// Remaining local config
// ========== 技能树配置 ==========
export const INITIAL_SKILL_TREE: SkillTree = {
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
};

export const SKILL_COSTS = {
  0: 0,
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  5: 25,
};

// ========== 家族职业与出身等级绑定配置 ==========
export const FAMILY_OCCUPATION_TIER_BINDING: Record<FamilyOccupation, { tiers: FamilyTier[]; moneyMultiplier: Record<FamilyTier, number> }> = {
  // 政府/公共服务类
  civil_servant: { tiers: ['SSR', 'SR', 'R'], moneyMultiplier: { 'SSR': 3, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  police: { tiers: ['SR', 'R', 'IRON'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  teacher_family: { tiers: ['SSR', 'SR', 'R'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  doctor_family: { tiers: ['SSR', 'SR', 'R'], moneyMultiplier: { 'SSR': 3, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  
  // 专业技术类
  lawyer: { tiers: ['SSR', 'SR', 'R'], moneyMultiplier: { 'SSR': 3, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  engineer: { tiers: ['SR', 'R', 'IRON'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  programmer_family: { tiers: ['SSR', 'SR', 'R'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  scientist: { tiers: ['SSR', 'SR'], moneyMultiplier: { 'SSR': 3, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  
  // 商业/金融类
  business: { tiers: ['SSR', 'SR', 'R'], moneyMultiplier: { 'SSR': 3, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  finance: { tiers: ['SSR', 'SR'], moneyMultiplier: { 'SSR': 3.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  entrepreneur: { tiers: ['SSR'], moneyMultiplier: { 'SSR': 4, 'SR': 2.5, 'R': 1.5, 'IRON': 0.5 } },
  
  // 文化/艺术/体育类
  artist: { tiers: ['SSR', 'SR', 'R'], moneyMultiplier: { 'SSR': 3, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  athlete: { tiers: ['SR', 'R', 'IRON'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  writer: { tiers: ['SR', 'R', 'IRON'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  designer: { tiers: ['SR', 'R'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  
  // 传统/基础类
  farmer: { tiers: ['R', 'IRON'], moneyMultiplier: { 'SSR': 1.5, 'SR': 1.5, 'R': 1, 'IRON': 1 } },
  worker: { tiers: ['R', 'IRON'], moneyMultiplier: { 'SSR': 1.5, 'SR': 1.5, 'R': 1, 'IRON': 1 } },
  craftsman: { tiers: ['SR', 'R', 'IRON'], moneyMultiplier: { 'SSR': 2, 'SR': 1.5, 'R': 1, 'IRON': 0.8 } },
  
  // 特殊/神秘类
  scholar: { tiers: ['SSR', 'SR'], moneyMultiplier: { 'SSR': 3, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  military: { tiers: ['SSR', 'SR', 'R'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
  hermit: { tiers: ['SSR', 'SR'], moneyMultiplier: { 'SSR': 2, 'SR': 1.5, 'R': 1, 'IRON': 0.8 } },
  adventurer: { tiers: ['SR', 'R'], moneyMultiplier: { 'SSR': 2.5, 'SR': 2, 'R': 1, 'IRON': 0.5 } },
};

// ========== 住房配置 ==========
// ========== 住房配置 ==========
export const HOUSE_UPGRADES = [
  { level: 0 as const, name: '无家可归', cost: 0, comfort: -10 },
  { level: 1 as const, name: '租房', cost: 2000, comfort: 5 },
  { level: 2 as const, name: '公寓', cost: 20000, comfort: 15, requirements: { jobLevel: 2 } },
  { level: 3 as const, name: '联排', cost: 100000, comfort: 25, requirements: { jobLevel: 3, charm: 60 } },
  { level: 4 as const, name: '别墅', cost: 500000, comfort: 40, requirements: { jobLevel: 4, intelligence: 80 } },
];

// ========== 汽车配置 ==========
// ========== 汽车配置 ==========
export const CAR_UPGRADES = [
  { level: 0 as const, name: '无车', cost: 0, prestige: 0 },
  { level: 1 as const, name: '二手', cost: 10000, prestige: 5 },
  { level: 2 as const, name: '新车', cost: 50000, prestige: 15 },
  { level: 3 as const, name: '豪车', cost: 200000, prestige: 35 },
];

// ========== 职业配置 ==========
// ========== 职业配置 ==========
export const JOB_UPGRADES = [
  { level: 0 as const, title: '无业', income: 0 },
  { level: 1 as const, title: '兼职', income: 2000 },
  { level: 2 as const, title: '正式', income: 5000 },
  { level: 3 as const, title: '主管', income: 15000 },
  { level: 4 as const, title: '经理', income: 30000 },
  { level: 5 as const, title: '高管/创业', income: 100000 },
];

// ========== 结局配置（≥12种） ==========
export const GAME_CONFIG = {
  RECENT_EVENTS_LENGTH: 10,
  ECONOMY_CYCLE_YEARS: 5,
  MAX_HEALTH: 999,
  MAX_MONEY: 999999999,
  MAX_AGE: 120,
  SKILL_POINTS_PER_YEAR: 2,
};
