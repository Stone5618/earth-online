
import type { GameState, PlayerStats, EducationLevel } from '../core/types';

// 教育阶段配置
export interface EducationStage {
  level: EducationLevel;
  name: string;
  description: string;
  minAge: number;
  requiredIntelligence: number;
  requiredMoney: number;
  bonuses: Partial<PlayerStats>;
  unlockedJobLevel: number;
}

// 完整的教育阶段配置
export const EDUCATION_STAGES: EducationStage[] = [
  {
    level: 'none',
    name: '未受教育',
    description: '没有接受过正规教育',
    minAge: 0,
    requiredIntelligence: 0,
    requiredMoney: 0,
    bonuses: {},
    unlockedJobLevel: 0
  },
  {
    level: 'primary',
    name: '小学',
    description: '完成初等教育',
    minAge: 6,
    requiredIntelligence: 40,
    requiredMoney: 1000,
    bonuses: { intelligence: 10, creativity: 5 },
    unlockedJobLevel: 1
  },
  {
    level: 'secondary',
    name: '中学',
    description: '完成中等教育',
    minAge: 12,
    requiredIntelligence: 60,
    requiredMoney: 5000,
    bonuses: { intelligence: 15, creativity: 10, karma: 5 },
    unlockedJobLevel: 2
  },
  {
    level: 'bachelor',
    name: '本科',
    description: '完成高等教育学士学位',
    minAge: 18,
    requiredIntelligence: 90,
    requiredMoney: 50000,
    bonuses: { intelligence: 30, creativity: 20, charm: 10, skillPoints: 5 },
    unlockedJobLevel: 3
  },
  {
    level: 'master',
    name: '硕士',
    description: '完成研究生教育',
    minAge: 22,
    requiredIntelligence: 120,
    requiredMoney: 100000,
    bonuses: { intelligence: 40, creativity: 25, charm: 15, skillPoints: 8 },
    unlockedJobLevel: 4
  },
  {
    level: 'doctor',
    name: '博士',
    description: '完成博士学位',
    minAge: 25,
    requiredIntelligence: 150,
    requiredMoney: 200000,
    bonuses: { intelligence: 60, creativity: 40, charm: 20, skillPoints: 12, luck: 10 },
    unlockedJobLevel: 5
  }
];

// 检查是否可以升学
export function canAdvanceEducation(state: GameState): boolean {
  const currentLevel = state.stats.educationLevel;
  const currentIndex = EDUCATION_STAGES.findIndex(s => s.level === currentLevel);
  
  // 已到最高级
  if (currentIndex >= EDUCATION_STAGES.length - 1) {
    return false;
  }
  
  const nextStage = EDUCATION_STAGES[currentIndex + 1];
  
  // 检查条件
  return state.stats.age >= nextStage.minAge &&
         state.stats.intelligence >= nextStage.requiredIntelligence &&
         state.stats.money >= nextStage.requiredMoney;
}

// 尝试升学
export function tryAdvanceEducation(state: GameState): { 
  success: boolean;
  newState: GameState;
  stage: EducationStage | null;
} {
  if (!canAdvanceEducation(state)) {
    return { success: false, newState: state, stage: null };
  }
  
  const currentLevel = state.stats.educationLevel;
  const currentIndex = EDUCATION_STAGES.findIndex(s => s.level === currentLevel);
  const nextStage = EDUCATION_STAGES[currentIndex + 1];
  
  // 应用教育阶段
  const newStats = {
    ...state.stats,
    educationLevel: nextStage.level,
    money: state.stats.money - nextStage.requiredMoney,
    // 应用属性加成
    ...applyBonuses(state.stats, nextStage.bonuses)
  };
  
  const newState: GameState = {
    ...state,
    stats: newStats
  };
  
  return {
    success: true,
    newState,
    stage: nextStage
  };
}

// 应用教育阶段的属性加成
function applyBonuses(stats: PlayerStats, bonuses: Partial<PlayerStats>): Partial<PlayerStats> {
  const result: Partial<PlayerStats> = {};
  
  for (const [key, value] of Object.entries(bonuses)) {
    if (value !== undefined) {
      const statKey = key as keyof PlayerStats;
      
      // 处理数字类型，在原来基础上累加
      if (typeof value === 'number' && typeof stats[statKey] === 'number') {
        result[statKey] = (stats[statKey] as number) + value as any;
      }
    }
  }
  
  return result;
}

// 获取当前教育阶段信息
export function getCurrentEducationStage(state: GameState): EducationStage {
  return EDUCATION_STAGES.find(s => s.level === state.stats.educationLevel) || EDUCATION_STAGES[0];
}

// 获取下一教育阶段信息（如果有）
export function getNextEducationStage(state: GameState): EducationStage | null {
  const currentIndex = EDUCATION_STAGES.findIndex(s => s.level === state.stats.educationLevel);
  
  if (currentIndex < EDUCATION_STAGES.length - 1) {
    return EDUCATION_STAGES[currentIndex + 1];
  }
  
  return null;
}

// 计算教育带来的收入加成
export function getEducationIncomeMultiplier(state: GameState): number {
  const stage = getCurrentEducationStage(state);
  
  // 基于教育阶段提供收入加成
  switch (stage.level) {
    case 'primary':
      return 1.1; // 小学教育+10%收入
    case 'secondary':
      return 1.25; // 中学教育+25%
    case 'bachelor':
      return 1.5; // 本科+50%
    case 'master':
      return 1.8; // 硕士+80%
    case 'doctor':
      return 2.5; // 博士+150%
    default:
      return 1.0;
  }
}

// 教育相关事件
export const EDUCATION_EVENTS = [
  {
    id: 'start_primary_school',
    minAge: 6,
    maxAge: 8,
    text: '【小学】到了上小学的年纪！',
    eventType: 'milestone',
    weight: 15,
    choices: [
      { text: '高高兴兴上学去', statChanges: { intelligence: 5, mood: 8, karma: 3 }, followUp: '你开心地开始了小学生活！' },
      { text: '有些紧张', statChanges: { intelligence: 3, charm: 2, mood: 3 }, followUp: '虽然有些紧张，但你还是适应了！' },
    ],
  },
  {
    id: 'primary_school_exam',
    minAge: 9,
    maxAge: 11,
    text: '【考试】期末考试来临！',
    weight: 10,
    choices: [
      { text: '认真复习', statChanges: { intelligence: 10, creativity: 5, energy: -5 }, followUp: '考试成绩优秀！' },
      { text: '随便复习下', statChanges: { intelligence: 3, luck: 2, mood: 5 }, followUp: '考试成绩一般，但你尽力了！' },
    ],
  },
  {
    id: 'start_secondary_school',
    minAge: 12,
    maxAge: 14,
    text: '【中学】上中学了！',
    eventType: 'milestone',
    weight: 15,
    choices: [
      { text: '努力学习', statChanges: { intelligence: 15, creativity: 10, karma: 5, energy: -8 }, followUp: '你成为了尖子生！' },
      { text: '平衡发展', statChanges: { intelligence: 8, charm: 8, creativity: 5, mood: 10 }, followUp: '你全面发展，人缘很好！' },
    ],
  },
  {
    id: 'college_entrance_exam',
    minAge: 17,
    maxAge: 19,
    text: '【高考】人生重要的高考来临！',
    eventType: 'milestone',
    weight: 20,
    choices: [
      { text: '全力冲刺', statChanges: { intelligence: 20, creativity: 10, energy: -15, mood: -5 }, followUp: '你考上了理想的大学！' },
      { text: '正常发挥', statChanges: { intelligence: 10, luck: 8, mood: 3 }, followUp: '发挥正常，顺利上大学！' },
    ],
  },
  {
    id: 'start_university',
    minAge: 18,
    maxAge: 20,
    text: '【大学】考上大学了！',
    eventType: 'milestone',
    weight: 15,
    choices: [
      { text: '积极参与社团', statChanges: { intelligence: 15, charm: 10, creativity: 8, skillPoints: 3 }, followUp: '大学生活丰富多彩！' },
      { text: '专注学业', statChanges: { intelligence: 25, creativity: 12, skillPoints: 5 }, followUp: '学术成就显著！' },
    ],
  },
  {
    id: 'graduate_university',
    minAge: 22,
    maxAge: 24,
    text: '【毕业】大学毕业了！',
    eventType: 'milestone',
    weight: 15,
    choices: [
      { text: '参加校招找工作', statChanges: { intelligence: 10, charm: 8, karma: 5 }, followUp: '你积极参加校招，获得了多个工作机会！' },
      { text: '考公务员/事业单位', statChanges: { intelligence: 12, karma: 8 }, followUp: '你决定考公务员，追求稳定的生活！' },
      { text: '继续深造读研究生', statChanges: { intelligence: 15, creativity: 10, skillPoints: 3 }, followUp: '你成功考取了研究生，继续深造！' },
      { text: '自主创业', statChanges: { intelligence: 5, charm: 10, karma: 5, entrepreneurship: 10 }, followUp: '你决定利用所学知识自主创业！' },
    ],
  },
  {
    id: 'start_postgraduate',
    minAge: 22,
    maxAge: 26,
    text: '【研究生】继续深造，读研究生！',
    eventType: 'milestone',
    weight: 10,
    choices: [
      { text: '专心科研', statChanges: { intelligence: 30, creativity: 20, skillPoints: 8, energy: -10 }, followUp: '你在科研上有了突破！' },
      { text: '实践与科研结合', statChanges: { intelligence: 20, charm: 12, skillPoints: 5 }, followUp: '你全面发展！' },
    ],
  },
  {
    id: 'get_phd',
    minAge: 25,
    maxAge: 30,
    text: '【博士】终于成为博士！',
    eventType: 'milestone',
    weight: 8,
    choices: [
      { text: '学术道路', statChanges: { intelligence: 50, creativity: 35, luck: 15, skillPoints: 12 }, followUp: '你成为了学术新星！' },
      { text: '业界应用', statChanges: { intelligence: 35, charm: 20, money: 100000, skillPoints: 8 }, followUp: '你在业界取得成功！' },
    ],
  },
];

export default {
  EDUCATION_STAGES,
  canAdvanceEducation,
  tryAdvanceEducation,
  getCurrentEducationStage,
  getNextEducationStage,
  getEducationIncomeMultiplier,
  EDUCATION_EVENTS
};
