
import type { GameState, PlayerStats } from '../core/types';
import { getEducationIncomeMultiplier } from './educationSystem';

// 退休相关配置
export const RETIREMENT_AGE = 60;

// 计算退休养老金
export function calculateRetirementPension(state: GameState): number {
  if (!state.stats.retired) {
    return 0;
  }
  
  // 基于工作年限、职业等级、教育水平计算养老金
  const workingYears = Math.min(state.stats.age - 18, 40); // 18-60岁工作
  const educationFactor = getEducationIncomeMultiplier(state);
  
  // 基础养老金 + 贡献
  const basePension = 10000;
  const workContribution = workingYears * 500;
  const jobContribution = state.stats.jobLevel * 5000;
  
  const totalPension = (basePension + workContribution + jobContribution) * educationFactor;
  
  return Math.round(totalPension);
}

// 检查是否应该退休
export function shouldRetire(state: GameState): boolean {
  return state.stats.age >= RETIREMENT_AGE && !state.stats.retired;
}

// 执行退休
export function retire(state: GameState): GameState {
  const newStats: PlayerStats = {
    ...state.stats,
    retired: true,
    // 退休后保留工作等级
    jobLevel: state.stats.jobLevel
  };
  
  return {
    ...state,
    stats: newStats
  };
}

// 检查是否可以职业晋升（退休后不能晋升）
export function canJobPromote(state: GameState): boolean {
  if (state.stats.retired) {
    return false;
  }
  
  return state.stats.jobLevel < 5;
}

// 退休相关事件
export const RETIREMENT_EVENTS = [
  {
    id: 'retirement_party',
    minAge: 60,
    maxAge: 62,
    text: '【退休派对】终于退休了，大家来庆祝！',
    eventType: 'milestone',
    weight: 15,
    choices: [
      { text: '感谢大家', statChanges: { charm: 10, mood: 20, karma: 8 }, followUp: '派对非常成功，大家都很开心！' },
      { text: '低调庆祝', statChanges: { mood: 10, health: 5, karma: 3 }, followUp: '简单温馨的退休仪式！' },
    ],
  },
  {
    id: 'travel_the_world',
    minAge: 60,
    maxAge: 120,
    text: '【旅行】趁现在环游世界！',
    weight: 10,
    choices: [
      { text: '豪华游', statChanges: { mood: 25, creativity: 15, karma: 8, money: -50000 }, followUp: '你玩得非常开心！' },
      { text: '经济实惠游', statChanges: { mood: 15, creativity: 10, karma: 5, money: -10000 }, followUp: '你也玩得很满足！' },
    ],
  },
  {
    id: 'learn_new_hobby',
    minAge: 60,
    maxAge: 120,
    text: '【爱好】学习新爱好！',
    weight: 12,
    choices: [
      { text: '学绘画', statChanges: { creativity: 20, mood: 15, skillPoints: 3 }, followUp: '你画出了不错的作品！' },
      { text: '学乐器', statChanges: { creativity: 18, mood: 12, skillPoints: 2 }, followUp: '你音乐水平提升了！' },
    ],
  },
  {
    id: 'spend_time_with_grandchildren',
    minAge: 60,
    maxAge: 120,
    text: '【家人】和孙子孙女一起玩！',
    weight: 15,
    choices: [
      { text: '带他们去公园', statChanges: { mood: 20, karma: 10, health: 8 }, followUp: '你和孩子们玩得特别开心！' },
      { text: '在家讲故事', statChanges: { mood: 15, creativity: 8, charm: 5 }, followUp: '温馨的家庭时光！' },
    ],
  },
  {
    id: 'volunteer_work',
    minAge: 60,
    maxAge: 120,
    text: '【志愿】做志愿者工作！',
    weight: 10,
    choices: [
      { text: '社区服务', statChanges: { karma: 20, mood: 12, charm: 8 }, followUp: '你帮助了很多人！' },
      { text: '环保志愿', statChanges: { karma: 15, health: 5, luck: 5 }, followUp: '你为环保做了贡献！' },
    ],
  },
  {
    id: 'health_checkup',
    minAge: 60,
    maxAge: 120,
    text: '【体检】定期体检！',
    weight: 12,
    choices: [
      { text: '全面检查', statChanges: { health: 30, money: -10000, karma: 5 }, followUp: '你身体非常健康！' },
      { text: '基础检查', statChanges: { health: 15, money: -3000 }, followUp: '身体状况良好！' },
    ],
  },
  {
    id: 'garden_planting',
    minAge: 60,
    maxAge: 120,
    text: '【园艺】种花种草！',
    weight: 8,
    choices: [
      { text: '建花园', statChanges: { health: 15, mood: 15, creativity: 8, money: -8000 }, followUp: '你的花园非常漂亮！' },
      { text: '简单种植', statChanges: { health: 8, mood: 10, creativity: 4 }, followUp: '你享受园艺的快乐！' },
    ],
  },
  {
    id: 'book_reading_club',
    minAge: 60,
    maxAge: 120,
    text: '【阅读】加入读书俱乐部！',
    weight: 10,
    choices: [
      { text: '积极参与', statChanges: { intelligence: 15, creativity: 10, charm: 8, mood: 12 }, followUp: '你结交了很多新朋友！' },
      { text: '安静阅读', statChanges: { intelligence: 10, creativity: 8, mood: 8 }, followUp: '你享受阅读时光！' },
    ],
  },
];

export default {
  RETIREMENT_AGE,
  calculateRetirementPension,
  shouldRetire,
  retire,
  canJobPromote,
  RETIREMENT_EVENTS
};
