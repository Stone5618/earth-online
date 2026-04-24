

import type { SkillTree } from '../types/game';
import type { PlayerStats, CareerInfo, CareerType, FamilyOccupation, FamilyTier } from '../game/core/types';

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

// ========== 天赋配置 ==========
export const TALENTS: Talent[] = [
  { id: 'genius', name: '神童', description: '智力极高但体弱多病', effect: (s) => ({ ...s, intelligence: s.intelligence + 30, health: s.health - 10, maxHealth: s.maxHealth - 10 }) },
  { id: 'social_butterfly', name: '社交蝴蝶', description: '魅力超凡', effect: (s) => ({ ...s, charm: s.charm + 25, mood: s.mood + 15 }) },
  { id: 'iron_body', name: '铁打筋骨', description: '身体异常强健', effect: (s) => ({ ...s, health: s.health + 30, maxHealth: s.maxHealth + 30, energy: s.energy + 20, maxEnergy: s.maxEnergy + 20 }) },
  { id: 'born_rich', name: '天生我财', description: '财运极佳', effect: (s) => ({ ...s, money: s.money + 100000, totalMoneyEarned: s.totalMoneyEarned + 100000, luck: s.luck + 10 }) },
  { id: 'late_bloomer', name: '大器晚成', description: '前期平庸，后期爆发', effect: (s) => ({ ...s, intelligence: s.intelligence - 10, karma: s.karma + 20 }) },
  { id: 'creative_soul', name: '艺术灵魂', description: '创造力惊人', effect: (s) => ({ ...s, creativity: s.creativity + 30, charm: s.charm + 10 }) },
  { id: 'lucky_star', name: '幸运星', description: '运气极好', effect: (s) => ({ ...s, luck: s.luck + 25, karma: s.karma + 10 }) },
];

// ========== 缺陷配置 ==========
export const FLAWS: Flaw[] = [
  { id: 'weak_body', name: '体弱多病', description: '身体虚弱但运气不错', effect: (s) => ({ ...s, health: s.health - 20, maxHealth: s.maxHealth - 20, luck: s.luck + 15 }) },
  { id: 'poor_start', name: '穷困潦倒', description: '出生贫穷，但有骨气', effect: (s) => ({ ...s, money: s.money - 5000, karma: s.karma + 20 }) },
  { id: 'loner', name: '天煞孤星', description: '孤独但聪明', effect: (s) => ({ ...s, charm: s.charm - 20, intelligence: s.intelligence + 15, creativity: s.creativity + 10 }) },
  { id: 'anxious', name: '社恐达人', description: '社交焦虑但智力超群', effect: (s) => ({ ...s, intelligence: s.intelligence + 25, charm: s.charm - 15, mood: s.mood - 10 }) },
  { id: 'clumsy', name: '笨手笨脚', description: '笨拙但善良', effect: (s) => ({ ...s, creativity: s.creativity - 10, karma: s.karma + 15, charm: s.charm + 5 }) },
];

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
export const HOUSE_UPGRADES = [
  { level: 0 as const, name: '无家可归', cost: 0, comfort: -10 },
  { level: 1 as const, name: '租房', cost: 2000, comfort: 5 },
  { level: 2 as const, name: '公寓', cost: 20000, comfort: 15, requirements: { jobLevel: 2 } },
  { level: 3 as const, name: '联排', cost: 100000, comfort: 25, requirements: { jobLevel: 3, charm: 60 } },
  { level: 4 as const, name: '别墅', cost: 500000, comfort: 40, requirements: { jobLevel: 4, intelligence: 80 } },
];

// ========== 汽车配置 ==========
export const CAR_UPGRADES = [
  { level: 0 as const, name: '无车', cost: 0, prestige: 0 },
  { level: 1 as const, name: '二手', cost: 10000, prestige: 5 },
  { level: 2 as const, name: '新车', cost: 50000, prestige: 15 },
  { level: 3 as const, name: '豪车', cost: 200000, prestige: 35 },
];

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
export const ENDINGS: Ending[] = [
  { id: 'death_health', name: '病入膏肓', priority: 100, condition: (s) => s.health <= 0, description: '你的健康归零，生命消逝了...', icon: '💀' },
  { id: 'death_old', name: '寿终正寝', priority: 99, condition: (s) => s.age >= 120, description: '你度过了漫长而精彩的一生...', icon: '👴' },
  { id: 'rich', name: '家财万贯', priority: 95, condition: (s) => s.money >= 1000000, description: '你成为了一代富豪，享尽荣华富贵！', icon: '💰' },
  { id: 'family_happy', name: '天伦之乐', priority: 90, condition: (s) => s.partner.has && s.children.length >= 2 && s.houseLevel >= 3 && s.mood >= 80, description: '你拥有了完美的家庭，幸福美满！', icon: '👨‍👩‍👧‍👦' },
  { id: 'career_success', name: '行业翘楚', priority: 85, condition: (s) => s.jobLevel === 5 && s.money >= 500000, description: '你在事业上达到了巅峰，成为了行业领袖！', icon: '🏆' },
  { id: 'genius', name: '旷世奇才', priority: 80, condition: (s) => s.intelligence >= 180 && s.creativity >= 120, description: '你的才华无人能及，名垂青史！', icon: '🧠' },
  { id: 'evil', name: '恶贯满盈', priority: 75, condition: (s) => s.karma <= 20, description: '你坏事做尽，最终恶有恶报...', icon: '👿' },
  { id: 'saint', name: '圣人转世', priority: 70, condition: (s) => s.karma >= 130, description: '你善良仁慈，是真正的圣人！', icon: '✨' },
  { id: 'poor_old', name: '穷困潦倒', priority: 65, condition: (s) => s.money <= 0 && s.age >= 60, description: '你在贫穷中度过了一生，令人唏嘘...', icon: '🏚️' },
  { id: 'lonely_old', name: '孤老一生', priority: 60, condition: (s) => s.age >= 80 && !s.partner.has && s.children.length === 0, description: '你孤独地度过了一生，无依无靠...', icon: '🏠' },
  { id: 'wanderer', name: '浪迹天涯', priority: 55, condition: (s) => s.houseLevel === 0 && s.carLevel >= 1 && !s.partner.has && s.mood >= 80 && s.health >= 80, description: '你自由自在地浪迹天涯，无拘无束！', icon: '🌍' },
  { id: 'artist_master', name: '艺术大师', priority: 50, condition: (s) => s.creativity >= 150, description: '你成为了一代艺术大师，作品流传千古！', icon: '🎨' },
  { id: 'powerful_couple', name: '神仙眷侣', priority: 88, condition: (s) => s.partner.has && s.partner.relationshipQuality === 100 && s.houseLevel >= 4, description: '你和伴侣是令人羡慕的神仙眷侣！', icon: '💕' },
  { id: 'big_family', name: '儿孙满堂', priority: 82, condition: (s) => s.children.length >= 3 && s.age >= 70, description: '你儿孙满堂，享尽天伦之乐！', icon: '👨‍👩‍👧‍👦👶' },
  { id: 'early_retirement', name: '提前退休', priority: 78, condition: (s) => s.retired && s.age <= 55 && s.money >= 300000, description: '你早早实现了财务自由，享受生活！', icon: '🏖️' },
  { id: 'all_needs_max', name: '人生赢家', priority: 97, condition: (s) => s.houseLevel === 4 && s.carLevel === 3 && s.jobLevel === 5 && s.partner.has && s.money >= 1000000, description: '你达成了所有人生目标，是真正的人生赢家！', icon: '👑' },
];

// ========== 挑战模式配置 ==========
// ChallengeConfig 类型已在 gameState.ts 中定义

export const CHALLENGES: ChallengeConfig[] = [
  {
    id: 'poor',
    name: '赤贫挑战',
    description: '初始金钱=0，所有收入+30%，目标攒够100万',
    icon: '💸',
    initialStats: { money: 0, totalMoneyEarned: 0 },
    rules: { incomeMultiplier: 1.3 },
    victoryCondition: (s) => s.money >= 1000000,
  },
  {
    id: 'short_life',
    name: '短命挑战',
    description: '寿命上限50岁，目标50岁前拥有3项重大需求满级',
    icon: '⏱️',
    initialStats: {},
    rules: { maxAge: 50 },
    victoryCondition: (s) => 
      (s.houseLevel >= 4 ? 1 : 0) +
      (s.carLevel >= 3 ? 1 : 0) +
      (s.jobLevel >= 5 ? 1 : 0) >= 3,
  },
  {
    id: 'loner',
    name: '天煞孤星',
    description: '无法结婚/恋爱，目标达成职业满级并攒够500万',
    icon: '🏔️',
    initialStats: {},
    rules: { disableRomance: true, incomeMultiplier: 1.5 },
    victoryCondition: (s) => s.jobLevel >= 5 && s.money >= 5000000,
  },
  {
    id: 'academic',
    name: '学术霸主',
    description: '智力初始80，目标智力达到200',
    icon: '📚',
    initialStats: { intelligence: 80 },
    rules: {},
    victoryCondition: (s) => s.intelligence >= 200,
  },
  {
    id: 'quick_rich',
    name: '暴富挑战',
    description: '30岁前赚到1000万',
    icon: '💰',
    initialStats: {},
    rules: { maxAge: 30, incomeMultiplier: 2.0 },
    victoryCondition: (s) => s.money >= 10000000,
  },
];

// ========== 职业系统配置 ==========
export const CAREERS: Record<CareerType, CareerInfo> = {
  // 政府/公共服务领域
  civil_servant: {
    id: 'civil_servant',
    name: '公务员',
    field: 'government',
    description: '稳定的职业，社会地位高',
    startingAge: 18,
    specialEffect: '收入稳定，不受经济周期影响',
    levels: [
      { level: 1, title: '科员', income: 30000, requiredEducation: 'secondary' },
      { level: 2, title: '副科级', income: 50000, requiredYears: 3 },
      { level: 3, title: '正科级', income: 80000, requiredYears: 3, requiredEducation: 'bachelor' },
      { level: 4, title: '副处级', income: 120000, requiredYears: 4, requiredSkills: { speech: 2, management: 1 } },
      { level: 5, title: '正处级', income: 180000, requiredYears: 4 },
      { level: 6, title: '副厅级', income: 280000, requiredYears: 5, requiredSkills: { speech: 3, management: 2 } },
      { level: 7, title: '正厅级', income: 450000, requiredYears: 5 },
      { level: 8, title: '副部级', income: 700000, requiredYears: 6, requiredSkills: { speech: 4, management: 3, academics: 2 } },
      { level: 9, title: '正部级', income: 1200000, requiredYears: 6 },
      { level: 10, title: '副国级', income: 2500000, requiredYears: 8, requiredSkills: { speech: 5, management: 5, academics: 3 } },
    ],
  },
  police_career: {
    id: 'police_career',
    name: '警察',
    field: 'government',
    description: '维护治安的职业',
    startingAge: 18,
    specialEffect: '健康恢复速度+20%',
    levels: [
      { level: 1, title: '警员', income: 35000, requiredSkills: { fitness: 1 } },
      { level: 2, title: '警长', income: 55000, requiredYears: 2 },
      { level: 3, title: '派出所所长', income: 90000, requiredYears: 3 },
      { level: 4, title: '大队长', income: 140000, requiredYears: 4, requiredSkills: { management: 1, fitness: 2 } },
      { level: 5, title: '支队长', income: 220000, requiredYears: 4 },
      { level: 6, title: '总队长', income: 350000, requiredYears: 5, requiredSkills: { management: 2 } },
      { level: 7, title: '副厅长', income: 550000, requiredYears: 5 },
      { level: 8, title: '厅长', income: 900000, requiredYears: 6, requiredSkills: { management: 3, speech: 2 } },
      { level: 9, title: '副部长', income: 1500000, requiredYears: 6 },
      { level: 10, title: '部长', income: 3000000, requiredYears: 8, requiredSkills: { management: 5, speech: 3 } },
    ],
  },
  teacher_career: {
    id: 'teacher_career',
    name: '教师',
    field: 'government',
    description: '教书育人的职业',
    startingAge: 18,
    specialEffect: '每年额外获得2点技能点',
    levels: [
      { level: 1, title: '助教', income: 32000, requiredEducation: 'bachelor' },
      { level: 2, title: '讲师', income: 58000, requiredYears: 2, requiredSkills: { speech: 1 } },
      { level: 3, title: '副教授', income: 95000, requiredYears: 3, requiredEducation: 'master' },
      { level: 4, title: '教授', income: 150000, requiredYears: 4, requiredSkills: { speech: 2, academics: 2 } },
      { level: 5, title: '系主任', income: 240000, requiredYears: 4 },
      { level: 6, title: '院长', income: 380000, requiredYears: 5, requiredSkills: { management: 2, speech: 3 } },
      { level: 7, title: '副校长', income: 600000, requiredYears: 5 },
      { level: 8, title: '校长', income: 1000000, requiredYears: 6, requiredEducation: 'doctor', requiredSkills: { management: 3 } },
      { level: 9, title: '院士', income: 1800000, requiredYears: 6 },
      { level: 10, title: '教育部长', income: 3500000, requiredYears: 8, requiredSkills: { management: 5, academics: 4 } },
    ],
  },
  doctor_career: {
    id: 'doctor_career',
    name: '医生',
    field: 'government',
    description: '救死扶伤的职业',
    startingAge: 18,
    specialEffect: '医疗费用-50%',
    levels: [
      { level: 1, title: '住院医师', income: 40000, requiredEducation: 'bachelor', requiredSkills: { medicine: 1 } },
      { level: 2, title: '主治医师', income: 70000, requiredYears: 3, requiredSkills: { medicine: 2 } },
      { level: 3, title: '副主任医师', income: 120000, requiredYears: 4, requiredEducation: 'master' },
      { level: 4, title: '主任医师', income: 200000, requiredYears: 5, requiredSkills: { medicine: 3 } },
      { level: 5, title: '科室主任', income: 320000, requiredYears: 5 },
      { level: 6, title: '副院长', income: 500000, requiredYears: 6, requiredSkills: { management: 2, medicine: 4 } },
      { level: 7, title: '院长', income: 800000, requiredYears: 6, requiredEducation: 'doctor' },
      { level: 8, title: '院士', income: 1400000, requiredYears: 7 },
      { level: 9, title: '医学泰斗', income: 2500000, requiredYears: 7, requiredSkills: { medicine: 5 } },
      { level: 10, title: '卫生部长', income: 5000000, requiredYears: 8, requiredSkills: { management: 5, medicine: 5 } },
    ],
  },
  // 专业技术领域
  programmer: {
    id: 'programmer',
    name: '程序员',
    field: 'tech',
    description: '写代码的职业',
    startingAge: 18,
    specialEffect: '每年有机会获得额外收入',
    levels: [
      { level: 1, title: '实习生', income: 20000, requiredSkills: { programming: 1 } },
      { level: 2, title: '初级工程师', income: 45000, requiredYears: 1, requiredSkills: { programming: 2 } },
      { level: 3, title: '中级工程师', income: 90000, requiredYears: 2, requiredSkills: { programming: 3 } },
      { level: 4, title: '高级工程师', income: 180000, requiredYears: 3 },
      { level: 5, title: '架构师', income: 320000, requiredYears: 4, requiredSkills: { programming: 4, management: 1 } },
      { level: 6, title: '技术总监', income: 500000, requiredYears: 4 },
      { level: 7, title: 'CTO', income: 850000, requiredYears: 5, requiredSkills: { management: 2, programming: 5 } },
      { level: 8, title: '联合创始人', income: 1600000, requiredYears: 5 },
      { level: 9, title: 'CEO', income: 3000000, requiredYears: 6, requiredSkills: { management: 4, entrepreneurship: 2 } },
      { level: 10, title: '行业大佬', income: 6000000, requiredYears: 8, requiredSkills: { management: 5, entrepreneurship: 3, programming: 5 } },
    ],
  },
  lawyer_career: {
    id: 'lawyer_career',
    name: '律师',
    field: 'tech',
    description: '法律专业职业',
    startingAge: 18,
    specialEffect: '有机会获得额外收入',
    levels: [
      { level: 1, title: '实习律师', income: 28000, requiredEducation: 'bachelor', requiredSkills: { speech: 1 } },
      { level: 2, title: '律师', income: 60000, requiredYears: 2 },
      { level: 3, title: '合伙人', income: 120000, requiredYears: 3, requiredSkills: { speech: 2 } },
      { level: 4, title: '高级合伙人', income: 200000, requiredYears: 4 },
      { level: 5, title: '律所主任', income: 350000, requiredYears: 5, requiredSkills: { management: 1, speech: 3 } },
      { level: 6, title: '大律师', income: 550000, requiredYears: 5, requiredEducation: 'master' },
      { level: 7, title: '法官', income: 900000, requiredYears: 6 },
      { level: 8, title: '大法官', income: 1500000, requiredYears: 6, requiredSkills: { speech: 4, management: 2 } },
      { level: 9, title: '首席大法官', income: 2800000, requiredYears: 7 },
      { level: 10, title: '司法部长', income: 5500000, requiredYears: 8, requiredSkills: { speech: 5, management: 5 } },
    ],
  },
  engineer_career: {
    id: 'engineer_career',
    name: '工程师',
    field: 'tech',
    description: '技术开发职业',
    startingAge: 18,
    specialEffect: '工作稳定',
    levels: [
      { level: 1, title: '助理工程师', income: 32000, requiredEducation: 'secondary', requiredSkills: { athletics: 1 } },
      { level: 2, title: '工程师', income: 60000, requiredYears: 2 },
      { level: 3, title: '高级工程师', income: 100000, requiredYears: 3, requiredEducation: 'bachelor' },
      { level: 4, title: '主任工程师', income: 170000, requiredYears: 4 },
      { level: 5, title: '技术专家', income: 280000, requiredYears: 5 },
      { level: 6, title: '总工程师', income: 450000, requiredYears: 5, requiredSkills: { management: 1 } },
      { level: 7, title: '副总裁', income: 750000, requiredYears: 6 },
      { level: 8, title: '总裁', income: 1300000, requiredYears: 6, requiredSkills: { management: 3 } },
      { level: 9, title: '院士', income: 2300000, requiredYears: 7, requiredEducation: 'master' },
      { level: 10, title: '工程院院长', income: 4500000, requiredYears: 8, requiredSkills: { management: 5 } },
    ],
  },
  scientist_career: {
    id: 'scientist_career',
    name: '科学家',
    field: 'tech',
    description: '科研工作者',
    startingAge: 18,
    specialEffect: '科研突破有机会获得巨额奖金',
    levels: [
      { level: 1, title: '研究员', income: 35000, requiredEducation: 'bachelor', requiredSkills: { academics: 1 } },
      { level: 2, title: '副研究员', income: 65000, requiredYears: 3 },
      { level: 3, title: '研究员', income: 110000, requiredYears: 4, requiredEducation: 'master', requiredSkills: { academics: 2 } },
      { level: 4, title: '首席研究员', income: 190000, requiredYears: 5 },
      { level: 5, title: '实验室主任', income: 310000, requiredYears: 5 },
      { level: 6, title: '研究所长', income: 500000, requiredYears: 6, requiredSkills: { management: 1, academics: 3 } },
      { level: 7, title: '院士', income: 850000, requiredYears: 7, requiredEducation: 'doctor' },
      { level: 8, title: '科学院院士', income: 1500000, requiredYears: 7 },
      { level: 9, title: '诺贝尔奖得主', income: 2800000, requiredYears: 8, requiredSkills: { academics: 5 } },
      { level: 10, title: '科学院院长', income: 5200000, requiredYears: 8, requiredSkills: { management: 5, academics: 5 } },
    ],
  },
  // 商业/金融领域
  finance_career: {
    id: 'finance_career',
    name: '金融从业者',
    field: 'business',
    description: '金融行业工作',
    startingAge: 18,
    specialEffect: '投资成功率+15%',
    levels: [
      { level: 1, title: '实习生', income: 25000, requiredSkills: { investing: 1 } },
      { level: 2, title: '分析师', income: 55000, requiredYears: 1 },
      { level: 3, title: '高级分析师', income: 105000, requiredYears: 3, requiredEducation: 'bachelor' },
      { level: 4, title: '投资经理', income: 190000, requiredYears: 4, requiredSkills: { investing: 2 } },
      { level: 5, title: '基金经理', income: 350000, requiredYears: 5 },
      { level: 6, title: '合伙人', income: 600000, requiredYears: 5, requiredSkills: { investing: 3, management: 1 } },
      { level: 7, title: '董事总经理', income: 1000000, requiredYears: 6 },
      { level: 8, title: 'CEO', income: 1800000, requiredYears: 7, requiredSkills: { management: 3, investing: 4 } },
      { level: 9, title: '金融巨头', income: 3500000, requiredYears: 7 },
      { level: 10, title: '央行行长', income: 6500000, requiredYears: 8, requiredSkills: { management: 5, investing: 5 } },
    ],
  },
  entrepreneur_career: {
    id: 'entrepreneur_career',
    name: '企业家',
    field: 'business',
    description: '创业的职业',
    startingAge: 18,
    specialEffect: '有机会获得巨额收入，但也有风险',
    levels: [
      { level: 1, title: '打工仔', income: 15000 },
      { level: 2, title: '创业者', income: 30000, requiredSkills: { entrepreneurship: 1 } },
      { level: 3, title: '小老板', income: 70000, requiredYears: 2 },
      { level: 4, title: '企业家', income: 160000, requiredYears: 4, requiredSkills: { entrepreneurship: 2, management: 1 } },
      { level: 5, title: '知名企业家', income: 300000, requiredYears: 5 },
      { level: 6, title: '行业领袖', income: 550000, requiredYears: 5, requiredSkills: { management: 2, entrepreneurship: 3 } },
      { level: 7, title: '商业巨头', income: 1100000, requiredYears: 6 },
      { level: 8, title: '首富', income: 2200000, requiredYears: 7, requiredSkills: { management: 4, entrepreneurship: 4 } },
      { level: 9, title: '亚洲首富', income: 4200000, requiredYears: 7 },
      { level: 10, title: '世界首富', income: 8000000, requiredYears: 8, requiredSkills: { management: 5, entrepreneurship: 5, investing: 3 } },
    ],
  },
  sales: {
    id: 'sales',
    name: '销售',
    field: 'business',
    description: '销售产品的职业',
    startingAge: 18,
    specialEffect: '业绩好有提成',
    levels: [
      { level: 1, title: '销售代表', income: 22000, requiredSkills: { speech: 1 } },
      { level: 2, title: '销售主管', income: 48000, requiredYears: 2 },
      { level: 3, title: '销售经理', income: 95000, requiredYears: 3, requiredSkills: { speech: 2, management: 1 } },
      { level: 4, title: '大区经理', income: 170000, requiredYears: 4 },
      { level: 5, title: '销售总监', income: 290000, requiredYears: 5, requiredSkills: { management: 2, speech: 3 } },
      { level: 6, title: '副总裁', income: 480000, requiredYears: 5 },
      { level: 7, title: '总裁', income: 800000, requiredYears: 6, requiredSkills: { management: 3 } },
      { level: 8, title: 'CEO', income: 1450000, requiredYears: 7 },
      { level: 9, title: '营销大师', income: 2700000, requiredYears: 7, requiredSkills: { speech: 5, management: 4 } },
      { level: 10, title: '商业传奇', income: 5000000, requiredYears: 8, requiredSkills: { management: 5, speech: 5, entrepreneurship: 2 } },
    ],
  },
  // 文化/艺术/体育领域
  celebrity: {
    id: 'celebrity',
    name: '艺人',
    field: 'arts',
    description: '演艺行业',
    startingAge: 16,
    specialEffect: '魅力加成+20%',
    levels: [
      { level: 1, title: '练习生', income: 12000, requiredSkills: { music: 1, speech: 1 } },
      { level: 2, title: '新人', income: 30000, requiredYears: 1 },
      { level: 3, title: '歌手/演员', income: 70000, requiredYears: 2 },
      { level: 4, title: '知名艺人', income: 150000, requiredYears: 3, requiredSkills: { music: 2, speech: 2 } },
      { level: 5, title: '一线明星', income: 300000, requiredYears: 4 },
      { level: 6, title: '顶流', income: 600000, requiredYears: 5, requiredSkills: { music: 4 } },
      { level: 7, title: '巨星', income: 1200000, requiredYears: 5 },
      { level: 8, title: '天王天后', income: 2400000, requiredYears: 6, requiredSkills: { music: 5, speech: 4 } },
      { level: 9, title: '传奇人物', income: 4500000, requiredYears: 7 },
      { level: 10, title: '艺术大师', income: 8500000, requiredYears: 8, requiredSkills: { music: 5, painting: 5, speech: 5 } },
    ],
  },
  athlete_career: {
    id: 'athlete_career',
    name: '运动员',
    field: 'arts',
    description: '体育职业',
    startingAge: 16,
    specialEffect: '健康恢复+30%，但职业生涯较短',
    levels: [
      { level: 1, title: '青训', income: 18000, requiredSkills: { fitness: 2, athletics: 1 } },
      { level: 2, title: '职业选手', income: 48000, requiredYears: 1 },
      { level: 3, title: '主力', income: 95000, requiredYears: 2 },
      { level: 4, title: '明星选手', income: 180000, requiredYears: 3, requiredSkills: { fitness: 3, athletics: 2 } },
      { level: 5, title: '全明星', income: 350000, requiredYears: 4 },
      { level: 6, title: 'MVP', income: 650000, requiredYears: 5, requiredSkills: { fitness: 4, athletics: 3 } },
      { level: 7, title: '世界冠军', income: 1200000, requiredYears: 5 },
      { level: 8, title: '奥运冠军', income: 2200000, requiredYears: 6, requiredSkills: { fitness: 5, athletics: 4 } },
      { level: 9, title: '大满贯得主', income: 4000000, requiredYears: 7 },
      { level: 10, title: '体育传奇', income: 7500000, requiredYears: 8, requiredSkills: { fitness: 5, athletics: 5 } },
    ],
  },
  author: {
    id: 'author',
    name: '作家',
    field: 'arts',
    description: '写作职业',
    startingAge: 18,
    specialEffect: '书籍版税有额外收入',
    levels: [
      { level: 1, title: '业余写作', income: 10000, requiredSkills: { academics: 1, speech: 1 } },
      { level: 2, title: '签约作者', income: 30000, requiredYears: 2 },
      { level: 3, title: '知名作家', income: 65000, requiredYears: 3 },
      { level: 4, title: '畅销书作家', income: 130000, requiredYears: 4, requiredSkills: { academics: 3 } },
      { level: 5, title: '文学奖得主', income: 250000, requiredYears: 5 },
      { level: 6, title: '文学大师', income: 450000, requiredYears: 6, requiredSkills: { academics: 4, speech: 2 } },
      { level: 7, title: '文豪', income: 800000, requiredYears: 6 },
      { level: 8, title: '文坛泰斗', income: 1500000, requiredYears: 7, requiredSkills: { academics: 5, speech: 3 } },
      { level: 9, title: '文学宗师', income: 2800000, requiredYears: 7 },
      { level: 10, title: '诺贝尔奖得主', income: 5500000, requiredYears: 8, requiredSkills: { academics: 5, speech: 5 } },
    ],
  },
  designer_career: {
    id: 'designer_career',
    name: '设计师',
    field: 'arts',
    description: '设计职业',
    startingAge: 18,
    specialEffect: '设计作品有额外收入',
    levels: [
      { level: 1, title: '助理设计师', income: 22000, requiredSkills: { painting: 1, management: 1 } },
      { level: 2, title: '设计师', income: 48000, requiredYears: 2 },
      { level: 3, title: '高级设计师', income: 95000, requiredYears: 3, requiredSkills: { painting: 2, management: 2 } },
      { level: 4, title: '设计总监', income: 170000, requiredYears: 4 },
      { level: 5, title: '知名设计师', income: 300000, requiredYears: 5, requiredSkills: { painting: 3, management: 3 } },
      { level: 6, title: '设计大师', income: 520000, requiredYears: 5 },
      { level: 7, title: '设计泰斗', income: 900000, requiredYears: 6, requiredSkills: { painting: 4, management: 4 } },
      { level: 8, title: '国际大奖得主', income: 1700000, requiredYears: 7 },
      { level: 9, title: '设计宗师', income: 3200000, requiredYears: 7, requiredSkills: { painting: 5, management: 5 } },
      { level: 10, title: '行业教父', income: 6000000, requiredYears: 8, requiredSkills: { painting: 5, management: 3 } },
    ],
  },
  // 传统/服务领域
  chef: {
    id: 'chef',
    name: '厨师',
    field: 'service',
    description: '烹饪职业',
    startingAge: 18,
    specialEffect: '食物有额外效果',
    levels: [
      { level: 1, title: '学徒', income: 18000, requiredSkills: { cooking: 1 } },
      { level: 2, title: '帮厨', income: 38000, requiredYears: 2 },
      { level: 3, title: '厨师', income: 70000, requiredYears: 3, requiredSkills: { cooking: 2 } },
      { level: 4, title: '主厨', income: 120000, requiredYears: 4 },
      { level: 5, title: '厨师长', income: 210000, requiredYears: 5, requiredSkills: { cooking: 3, management: 1 } },
      { level: 6, title: '行政总厨', income: 380000, requiredYears: 5 },
      { level: 7, title: '米其林主厨', income: 700000, requiredYears: 6, requiredSkills: { cooking: 4, management: 2 } },
      { level: 8, title: '食神', income: 1350000, requiredYears: 7 },
      { level: 9, title: '美食泰斗', income: 2600000, requiredYears: 7, requiredSkills: { cooking: 5, management: 4 } },
      { level: 10, title: '餐饮帝王', income: 5000000, requiredYears: 8, requiredSkills: { cooking: 5, management: 4, entrepreneurship: 5 } },
    ],
  },
};

// ========== 其他配置 ==========
export const GAME_CONFIG = {
  RECENT_EVENTS_LENGTH: 10,
  ECONOMY_CYCLE_YEARS: 5,
  MAX_HEALTH: 999,
  MAX_MONEY: 999999999,
  MAX_AGE: 120,
  SKILL_POINTS_PER_YEAR: 2,
};
