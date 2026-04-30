/**
 * Systems-related types: career, education, health, economy, debt
 */

// ========== 家庭职业类型（扩展） ==========
export type FamilyOccupation = 
  // 政府/公共服务类
  | 'civil_servant' | 'police' | 'teacher_family' | 'doctor_family'
  // 专业技术类
  | 'lawyer' | 'engineer' | 'programmer_family' | 'scientist'
  // 商业/金融类
  | 'business' | 'finance' | 'entrepreneur'
  // 文化/艺术/体育类
  | 'artist' | 'athlete' | 'writer' | 'designer'
  // 传统/基础类
  | 'farmer' | 'worker' | 'craftsman'
  // 特殊/神秘类
  | 'scholar' | 'military' | 'hermit' | 'adventurer';

// ========== 职业领域类型 ==========
export type CareerField = 'government' | 'tech' | 'business' | 'arts' | 'service';

// ========== 具体职业类型 ==========
export type CareerType =
  // 政府/公共服务领域
  | 'civil_servant' | 'police_career' | 'teacher_career' | 'doctor_career'
  // 专业技术领域
  | 'programmer' | 'lawyer_career' | 'engineer_career' | 'scientist_career'
  // 商业/金融领域
  | 'finance_career' | 'entrepreneur_career' | 'sales'
  // 文化/艺术/体育领域
  | 'celebrity' | 'athlete_career' | 'author' | 'designer_career'
  // 传统/服务领域
  | 'chef';

// ========== 职业等级信息 ==========
export interface CareerLevel {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  title: string;
  income: number;
  requiredSkills?: Partial<SkillTree>;
  requiredYears?: number;
  requiredEducation?: EducationLevel;
}

// ========== 职业完整信息 ==========
export interface CareerInfo {
  id: CareerType;
  name: string;
  field: CareerField;
  description: string;
  levels: CareerLevel[];
  specialEffect?: string;
  startingAge: number;
}

// ========== 玩家职业状态 ==========
export interface PlayerCareerState {
  currentCareer: CareerType | null;
  currentLevel: number;
  totalExperience: number;
  yearsInCurrentCareer: number;
  previousCareers: CareerType[];
}

// ========== 技能 ==========
export interface SkillTree {
  programming: number;
  investing: number;
  medicine: number;
  speech: number;
  romance: number;
  management: number;
  fitness: number;
  driving: number;
  cooking: number;
  painting: number;
  music: number;
  entrepreneurship: number;
  academics: number;
  athletics: number;
}

export type SkillKey = keyof SkillTree;

// ========== 教育 ==========
export type EducationLevel = 'none' | 'primary' | 'secondary' | 'bachelor' | 'master' | 'doctor';

// ========== 健康 ==========
export type Illness = 'healthy' | 'minor_ill' | 'major_ill' | 'injured' | 'disabled';

export interface HealthStatus {
  condition: Illness;
  duration: number;
  treatmentCost?: number;
}

export interface HealthTransition {
  from: Illness;
  to: Illness;
  probability: number;
  ageRange: [number, number];
  minHealth?: number;
  maxHealth?: number;
}

// ========== 经济 ==========
export interface Economy {
  factor: number;
  lastUpdateAge: number;
}

export type EconomyState = 'boom' | 'normal' | 'crisis';

// ========== 债务 ==========
export interface Debt {
  id: string;
  amount: number;
  remaining: number;
  interestRate: number;
  monthlyPayment: number;
  termMonths: number;
  startAge: number;
  description: string;
}
