/**
 * Stats-related types: player properties, household, skills
 */
import type { HealthStatus, EducationLevel, PlayerCareerState, Debt, SkillTree } from './systems';

// ========== 基础属性类型 ==========
export type FamilyTier = 'SSR' | 'SR' | 'R' | 'IRON';

export interface PlayerStats {
  age: number;
  health: number;
  maxHealth: number;
  money: number;
  energy: number;
  maxEnergy: number;
  mood: number;
  intelligence: number;
  charm: number;
  creativity: number;
  luck: number;
  karma: number;
  totalMoneyEarned: number;
  isMarried: boolean;
  houseLevel: 0 | 1 | 2 | 3 | 4;
  carLevel: 0 | 1 | 2 | 3;
  jobLevel: 0 | 1 | 2 | 3 | 4 | 5;
  partner: Partner;
  children: Child[];
  skillPoints: number;
  skills: SkillTree;
  familyOccupation: string | null;
  selectedTalent: string | null;
  selectedFlaw: string | null;
  healthStatus: HealthStatus;
  educationLevel: EducationLevel;
  economyFactor: number;
  retired: boolean;
  isUnemployed: boolean;
  // 职业系统
  career: {
    currentCareer: string | null;
    currentLevel: number;
    totalExperience: number;
    yearsInCurrentCareer: number;
    previousCareers: string[];
  };
  careerLevel: number;
  // 资产系统
  totalAssets: number;
  house: Housing | null;
  car: Car | null;
  // 债务系统
  debts: Debt[];
  // 家族系统
  familyName: string | null;
  familyReputation: number;
  // 社交资本
  socialCapital: number;
  // 物理属性
  physicalFitness: number;
  // 情绪稳定性
  emotionalStability: number;
}

export interface Partner {
  has: boolean;
  name?: string;
  relationshipQuality: number;
  marriageYears?: number;
}

export interface Child {
  name: string;
  age: number;
  trait?: string;
}

export interface Housing {
  level: 0 | 1 | 2 | 3 | 4;
  name: string;
  comfort: number;
}

export interface Car {
  level: 0 | 1 | 2 | 3;
  name: string;
  prestige: number;
}

export interface Job {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  title: string;
  income: number;
  industry: string;
}
