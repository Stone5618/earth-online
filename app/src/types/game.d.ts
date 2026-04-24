
// ========== 基础属性 ==========
export interface BaseStats {
  health: number;       // 0-999
  happiness: number;    // 0-100
  intelligence: number; // 0-200
  strength: number;     // 0-100
  money: number;        // 0-999,999,999
  charm: number;        // 0-150
  karma: number;        // 0-150
  creativity: number;   // 0-200
  luck: number;         // 0-150
  age: number;          // 0-120
  energy: number;       // 0-200
  skillPoints: number;  // 技能点数
}

// ========== 重大需求 ==========
export interface Housing {
  level: 0 | 1 | 2 | 3 | 4; // 0=无家,1=租房,2=公寓,3=联排,4=别墅
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

export interface Partner {
  has: boolean;
  name?: string;
  quality: number;      // 0-100
  marriageYears?: number;
}

export interface Child {
  name: string;
  age: number;
  trait?: string;
}

export interface MajorNeeds {
  house: Housing;
  car: Car;
  job: Job;
  partner: Partner;
  children: Child[];
}

// ========== 技能树（含流派） ==========
export interface SkillTree {
  // 智力流
  programming: number;  // 0-5
  investing: number;
  medicine: number;
  // 社交流
  speech: number;
  romance: number;
  management: number;
  // 生存流
  fitness: number;
  driving: number;
  cooking: number;
  // 扩展流派
  painting: number;     // 艺术流
  music: number;
  entrepreneurship: number; // 创业流
  academics: number;    // 学术流
  athletics: number;    // 体育流
}

// ========== 出生背景 ==========
export type FamilyOccupation = 'business' | 'scholar' | 'military' | 'artist' | 'farmer';

export interface Talent {
  id: string;
  name: string;
  effect: (stats: BaseStats) => BaseStats;
}

export interface Flaw {
  id: string;
  name: string;
  effect: (stats: BaseStats) => BaseStats;
}

export interface FamilyBackground {
  occupation: FamilyOccupation;
  talent: Talent;
  flaw?: Flaw;
}

// ========== 事件链与隐藏任务 ==========
export interface EventChainStep {
  eventId: string;
  requiredCondition?: (state: GameState) => boolean;
  nextStepId: string | null;
}

export interface EventChain {
  id: string;
  steps: EventChainStep[];
  currentStepIndex: number;
  completed: boolean;
}

export interface SecretMission {
  id: string;
  description: string;
  condition: (state: GameState) => boolean;
  reward: (state: GameState) => GameState;
  completed: boolean;
}

// ========== 健康系统 ==========
export type Illness = 'healthy' | 'minor_ill' | 'major_ill' | 'injured' | 'disabled';

export interface HealthStatus {
  condition: Illness;
  duration: number;      // 剩余回合数
  treatmentCost?: number;
}

// ========== 教育系统 ==========
export type EducationLevel = 'none' | 'primary' | 'secondary' | 'bachelor' | 'master' | 'doctor';

// ========== 经济周期 ==========
export interface Economy {
  factor: number;       // 0.8 ~ 1.2
  lastUpdateAge: number;
}

// ========== 结局系统 ==========
export interface Ending {
  id: string;
  name: string;
  priority: number;
  condition: (state: GameState) => boolean;
  description: string;
  icon: string;
}

// ========== 挑战模式 ==========
export interface ChallengeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  initialStats?: Partial<BaseStats>;
  rules?: Partial<GameState>;
  victoryCondition: (state: GameState) => boolean;
}

// ========== 全局游戏状态 ==========
export interface GameState {
  version: number;
  base: BaseStats;
  needs: MajorNeeds;
  skills: SkillTree;
  background: FamilyBackground;
  challenge?: ChallengeConfig;
  achievements: string[];
  endingsSeen: string[];
  eventChains: Record<string, EventChain>;
  secretMissions: SecretMission[];
  healthStatus: HealthStatus;
  education: EducationLevel;
  economy: Economy;
  recentEvents: string[];
  gameOver: boolean;
  ending?: Ending;
  playTime: number;
  // P2 扩展预留
  unlockedPerks?: string[];   // 轮回永久天赋
}

