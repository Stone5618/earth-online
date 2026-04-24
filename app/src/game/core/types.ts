import type { ChallengeConfig } from '../../config/gameConfig';

export type { ChallengeConfig };

export type GamePhase = 'LANDING' | 'SPAWNING' | 'PLAYING' | 'GAMEOVER';
export type FamilyTier = 'SSR' | 'SR' | 'R' | 'IRON';
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

export type EducationLevel = 'none' | 'primary' | 'secondary' | 'bachelor' | 'master' | 'doctor';

export interface Economy {
  factor: number;
  lastUpdateAge: number;
}

export type EconomyState = 'boom' | 'normal' | 'crisis';

export interface EventChainStep {
  eventId: string;
  requiredCondition?: (state: any) => boolean;
  nextStepId: string | null;
  immediate?: boolean;
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
  condition: (state: any) => boolean;
  reward: (state: any) => any;
  completed: boolean;
}

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
  // 新增：职业系统
  career: PlayerCareerState;
  // 新增：债务系统
  debts: Debt[];
}

export interface GameLog {
  year: number;
  event: string;
  type: 'normal' | 'positive' | 'negative' | 'milestone' | 'death';
  statChanges?: Partial<PlayerStats>;
  action?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface GameState {
  phase: GamePhase;
  stats: PlayerStats;
  familyTier: FamilyTier | null;
  birthServer: string | null;
  birthTalent: string | null;
  logs: GameLog[];
  currentYear: number;
  /**
   * 当前待处理事件（持久化到存档，避免重渲染导致重掷）
   * - 存事件 id（而不是整个对象），以便兼容事件库升级
   */
  currentEventId: string | null;
  /**
   * 随机种子（用于事件选择/概率分支可复现）
   * - 仅用于游戏逻辑随机，不影响UI动画等随机性
   */
  rngSeed: number;
  achievements: Achievement[];
  newlyUnlockedAchievements: Achievement[];
  deathReason: string | null;
  finalTitle: string | null;
  finalComment: string | null;
  consecutiveHappyYears: number;
  difficulty: 'easy' | 'normal' | 'hard';
  lastTriggeredEvents: Record<string, number>;
  recentEventIds: string[];
  eventLastTriggered: Record<string, number>;
  eventOccurrences: Record<string, number>;
  version: number;
  endingsSeen: string[];
  eventChains: Record<string, EventChain>;
  secretMissions: SecretMission[];
  playTime: number;
  challenge?: ChallengeConfig;
  challengeVictory?: boolean;
}

export type SkillKey = keyof SkillTree;

export type GameAction =
  | { type: 'START_SPAWNING'; payload: { familyTier: FamilyTier; initialStats: PlayerStats; birthServer: string; birthTalent: string; challenge?: ChallengeConfig } }
  | { type: 'COMPLETE_SPAWNING' }
  | { type: 'TICK_YEAR'; payload: { action: string; statChanges: Partial<PlayerStats>; event: string; eventType: GameLog['type'] } }
  | { type: 'REST_AND_RECOVER'; payload: { statChanges: Partial<PlayerStats> } }
  | { type: 'GAME_OVER'; payload: { reason: string; title: string; comment: string } }
  | { type: 'RESET_GAME' }
  | { type: 'GO_TO_LANDING' }
  | { type: 'UPDATE_STATS'; payload: Partial<PlayerStats> }
  | { type: 'ADD_LOG'; payload: GameLog }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'CLEAR_ACHIEVEMENT_NOTIFICATIONS'; payload?: Achievement[] }
  | { type: 'LOAD_GAME'; payload: GameState }
  | { type: 'SET_DIFFICULTY'; payload: 'easy' | 'normal' | 'hard' }
  | { type: 'TRIGGER_EVENT'; payload: { eventId: string; year: number } }
  | { type: 'UPGRADE_HOUSE' }
  | { type: 'UPGRADE_CAR' }
  | { type: 'UPGRADE_JOB' }
  | { type: 'GET_PARTNER' }
  | { type: 'HAVE_CHILD'; payload: { name: string } }
  | { type: 'RETIRE' }
  | { type: 'UPGRADE_SKILL'; payload: { skill: SkillKey } }
  | { type: 'SET_CHALLENGE'; payload: ChallengeConfig | undefined }
  | { type: 'SEEK_TREATMENT' }
  | { type: 'UPDATE_HEALTH_STATUS'; payload: { healthStatus: HealthStatus } };

export type ChoiceText = string | ((stats: PlayerStats) => string);
export type StatChanges = Partial<PlayerStats> | ((stats: PlayerStats) => Partial<PlayerStats>);

export interface GameEventChoice {
  text: ChoiceText;
  statChanges: StatChanges;
  followUp?: string | ((stats: Partial<PlayerStats>) => string);
  resultMessage?: string;
  eventType?: GameLog['type'];
  disabled?: ((stats: PlayerStats) => boolean) | boolean;
  disabledReason?: string;
}

export interface GameEvent {
  id: string;
  minAge: number;
  maxAge: number;
  condition?: (stats: PlayerStats, familyTier?: FamilyTier | null) => boolean;
  cooldownYears?: number;
  maxOccurrences?: number;
  text: string;
  eventType?: GameLog['type'];
  choices: GameEventChoice[];
  weight?: number;
}

export const STAT_BOUNDS = {
  health: { min: 0, max: 999 },
  mood: { min: 0, max: 100 },
  intelligence: { min: 0, max: 200 },
  charm: { min: 0, max: 150 },
  creativity: { min: 0, max: 200 },
  luck: { min: 0, max: 150 },
  karma: { min: 0, max: 150 },
  energy: { min: 0, max: 200 },
  money: { min: -999999999, max: 999999999 },
  age: { min: 0, max: 120 }
};
