
import type { GameState, PlayerStats, EventChain, EventChainStep } from '../core/types';

export interface EventChainConfig {
  id: string;
  name: string;
  description: string;
  steps: EventChainStepDefinition[];
  startCondition: (state: GameState) => boolean;
}

export interface EventChainStepDefinition {
  eventId: string;
  requiredCondition?: (stats: PlayerStats) => boolean;
  nextStepId?: string;
  immediate?: boolean; // 是否可以在同一年连续执行
}

// 事件链配置
export const EVENT_CHAIN_CONFIGS: EventChainConfig[] = [
  // 事件链1：失业复职
  {
    id: 'unemployment_recovery',
    name: '失业复职',
    description: '从失业到重新找到工作的旅程',
    startCondition: (state) => state.stats.jobLevel === 0 && state.stats.age >= 20 && state.stats.age <= 50,
    steps: [
      {
        eventId: 'chain_unemployment_1',
        nextStepId: 'chain_unemployment_2',
        immediate: false, // 需要隔一年
      },
      {
        eventId: 'chain_unemployment_2',
        nextStepId: 'chain_unemployment_3',
        immediate: true, // 同一年
      },
      {
        eventId: 'chain_unemployment_3',
        nextStepId: 'chain_unemployment_4',
        immediate: true, // 同一年
      },
      {
        eventId: 'chain_unemployment_4',
      },
    ],
  },
  // 事件链2：恋爱结婚
  {
    id: 'romance_marriage',
    name: '恋爱结婚',
    description: '从初恋到步入婚姻殿堂',
    startCondition: (state) => !state.stats.isMarried && state.stats.age >= 18 && state.stats.age <= 40,
    steps: [
      {
        eventId: 'chain_romance_1',
        nextStepId: 'chain_romance_2',
      },
      {
        eventId: 'chain_romance_2',
        nextStepId: 'chain_romance_3',
      },
      {
        eventId: 'chain_romance_3',
      },
    ],
  },
  // 事件链3：疾病治疗
  {
    id: 'illness_recovery',
    name: '疾病治疗',
    description: '从生病到恢复健康',
    startCondition: (state) => 
      state.stats.age >= 6 && // 6岁前不会触发这个事件链
      state.stats.healthStatus.condition !== 'healthy' && 
      state.stats.healthStatus.condition !== 'disabled',
    steps: [
      {
        eventId: 'chain_illness_1',
        nextStepId: 'chain_illness_2',
        immediate: true,
      },
      {
        eventId: 'chain_illness_2',
        nextStepId: 'chain_illness_3',
        immediate: true,
      },
      {
        eventId: 'chain_illness_3',
      },
    ],
  },
];

// 事件链事件定义（临时占位，实际应该添加到eventLibrary）
// 这些是事件链相关事件的基础模板，实际内容需要完善
export const EVENT_CHAIN_EVENTS: { [key: string]: any } = {
  'chain_unemployment_1': {
    id: 'chain_unemployment_1',
    minAge: 22,
    maxAge: 60,
    text: '【失业】公司裁员，你不幸失去了工作...',
    eventType: 'negative',
    choices: [
      { text: '立即投简历，积极找工作', statChanges: { mood: -5, intelligence: 3, karma: 2 }, followUp: '你开始积极寻找新机会。' },
      { text: '先休息一段时间再做打算', statChanges: { mood: 5, energy: 10, money: -2000 }, followUp: '你决定调整一下状态。' },
    ],
  },
  'chain_unemployment_2': {
    id: 'chain_unemployment_2',
    minAge: 22,
    maxAge: 60,
    text: '【找工作】你投递了很多简历，终于收到面试通知了！',
    choices: [
      { text: '降低期望，抓住机会', statChanges: { karma: 3, mood: -2 }, followUp: '你积极准备面试！' },
      { text: '继续寻找更合适的机会', statChanges: { intelligence: 5, skillPoints: 2, money: -3000 }, followUp: '你一边找一边充电。' },
    ],
  },
  'chain_unemployment_3': {
    id: 'chain_unemployment_3',
    minAge: 22,
    maxAge: 60,
    text: '【面试】今天是重要的面试！好好表现！',
    choices: [
      { text: '充分准备，全力以赴', statChanges: { intelligence: 4, charm: 3, mood: 5 }, followUp: '你信心满满地去面试。' },
      { text: '保持轻松心态', statChanges: { charm: 5, mood: 8 }, followUp: '你觉得面试表现还可以。' },
    ],
  },
  'chain_unemployment_4': {
    id: 'chain_unemployment_4',
    minAge: 22,
    maxAge: 60,
    text: '【入职】太棒了！面试通过，你被录用了！',
    eventType: 'positive',
    choices: [
      { text: '努力工作，做出成绩', statChanges: { jobLevel: 1, money: 10000, karma: 5, intelligence: 3, energy: -5 }, followUp: '你决定在新岗位上好好干！' },
    ],
  },
  
  'chain_romance_1': {
    id: 'chain_romance_1',
    minAge: 18,
    maxAge: 40,
    text: '【偶遇】你在咖啡馆/图书馆遇到了一个让你心动的人...',
    choices: [
      { text: '主动打招呼', statChanges: { charm: 5, mood: 10 }, followUp: '对方对你也有好感！' },
      { text: '偷偷观察', statChanges: { creativity: 3, mood: 5 }, followUp: '你没有勇气上前。' },
    ],
  },
  'chain_romance_2': {
    id: 'chain_romance_2',
    minAge: 18,
    maxAge: 42,
    text: '【约会】你们开始约会了！',
    choices: [
      { text: '浪漫约会', statChanges: { charm: 8, mood: 15, money: -2000 }, followUp: '约会非常甜蜜！' },
      { text: '简约相处', statChanges: { karma: 5, mood: 8 }, followUp: '你们享受着简单的快乐。' },
    ],
  },
  'chain_romance_3': {
    id: 'chain_romance_3',
    minAge: 20,
    maxAge: 45,
    text: '【求婚】是时候考虑结婚了！',
    eventType: 'milestone',
    choices: [
      { text: '浪漫求婚', statChanges: { isMarried: true, charm: 10, mood: 20, karma: 10, money: -50000 }, followUp: '你们步入了婚姻的殿堂！' },
      { text: '先继续恋爱', statChanges: { charm: 3, mood: 5 }, followUp: '你们决定再相处一段时间。' },
    ],
  },
  
  'chain_illness_1': {
    id: 'chain_illness_1',
    minAge: 6,
    maxAge: 120,
    text: '【就医】你决定去医院检查身体...',
    choices: [
      { text: '积极治疗', statChanges: { health: 15, money: -3000, mood: -5 }, followUp: '你积极配合治疗。' },
      { text: '先回家休养', statChanges: { mood: 3, energy: 10 }, followUp: '你决定先休息一下。' },
    ],
  },
  'chain_illness_2': {
    id: 'chain_illness_2',
    minAge: 6,
    maxAge: 120,
    text: '【康复中】治疗正在进行中...',
    choices: [
      { text: '按时吃药', statChanges: { health: 20, money: -1500 }, followUp: '你恢复得很好！' },
      { text: '锻炼辅助', statChanges: { health: 15, energy: 10, skills: { fitness: 1 } as any }, followUp: '你开始注重身体锻炼。' },
    ],
  },
  'chain_illness_3': {
    id: 'chain_illness_3',
    minAge: 6,
    maxAge: 120,
    text: '【康复】恭喜！你完全康复了！',
    eventType: 'positive',
    choices: [
      { text: '庆祝一下', statChanges: { health: 30, mood: 15, karma: 5, money: -2000 }, followUp: '你更加珍惜健康了！' },
    ],
  },
};

// 检查是否有可以开始的事件链
export function checkStartEventChains(state: GameState): string[] {
  const startableChains: string[] = [];
  
  for (const config of EVENT_CHAIN_CONFIGS) {
    // 检查是否已经在进行中
    if (state.eventChains[config.id]) continue;
    
    // 检查开始条件
    if (config.startCondition(state)) {
      startableChains.push(config.id);
    }
  }
  
  return startableChains;
}

// 开始一个事件链
export function startEventChain(chainId: string): EventChain | null {
  const config = EVENT_CHAIN_CONFIGS.find(c => c.id === chainId);
  if (!config) return null;
  
  const steps: EventChainStep[] = config.steps.map((step) => ({
    eventId: step.eventId,
    requiredCondition: step.requiredCondition,
    nextStepId: step.nextStepId || null,
    immediate: step.immediate,
  }));
  
  return {
    id: chainId,
    steps,
    currentStepIndex: 0,
    completed: false,
  };
}

/**
 * 检查是否有可以立即执行的事件链步骤（用于同一年连续执行）
 */
export function getImmediateNextEventId(afterEventId: string, state: GameState): string | null {
  let tempState = advanceEventChain(state, afterEventId);
  let nextEvent = getActiveChainEvent(tempState);
  
  // 检查这个下一步是否是 immediate
  if (nextEvent) {
    for (const chain of Object.values(state.eventChains)) {
      if (chain.completed) continue;
      
      const step = chain.steps[chain.currentStepIndex];
      if (!step) continue;
      
      if (step.eventId === afterEventId && step.immediate) {
        return nextEvent;
      }
    }
  }
  
  return null;
}

// 同一年连续执行事件（用于测试用）
export function processImmediateEvent(state: GameState, eventId: string): GameState {
  return advanceEventChain(state, eventId);
}

// 获取当前应该触发的事件链事件
export function getActiveChainEvent(state: GameState): string | null {
  for (const chain of Object.values(state.eventChains)) {
    if (chain.completed) continue;
    
    const currentStep = chain.steps[chain.currentStepIndex];
    if (!currentStep) continue;
    
    // 检查条件
    if (currentStep.requiredCondition) {
      if (!currentStep.requiredCondition(state.stats)) continue;
    }
    
    return currentStep.eventId;
  }
  
  return null;
}

// 推进事件链到下一步
export function advanceEventChain(state: GameState, eventId: string): GameState {
  const newState = { ...state };
  const newEventChains = { ...state.eventChains };
  
  for (const [chainId, chain] of Object.entries(newEventChains)) {
    if (chain.completed) continue;
    
    const currentStep = chain.steps[chain.currentStepIndex];
    if (!currentStep || currentStep.eventId !== eventId) continue;
    
    // 检查是否有下一步
    if (currentStep.nextStepId) {
      // 找到下一步的索引
      const nextStepIndex = chain.steps.findIndex(
        (step, idx) => idx > chain.currentStepIndex || step.eventId === currentStep.nextStepId
      );
      
      if (nextStepIndex !== -1 && nextStepIndex < chain.steps.length) {
        newEventChains[chainId] = {
          ...chain,
          currentStepIndex: nextStepIndex,
        };
      } else {
        // 没有下一步，完成事件链
        newEventChains[chainId] = {
          ...chain,
          completed: true,
        };
      }
    } else {
      // 没有nextStepId，完成事件链
      newEventChains[chainId] = {
        ...chain,
        completed: true,
      };
    }
  }
  
  return {
    ...newState,
    eventChains: newEventChains,
  };
}

// 获取事件链的进度
export function getChainProgress(chain: EventChain): number {
  if (chain.completed) return 100;
  return Math.round((chain.currentStepIndex / chain.steps.length) * 100);
}

export default {
  EVENT_CHAIN_CONFIGS,
  EVENT_CHAIN_EVENTS,
  checkStartEventChains,
  startEventChain,
  getActiveChainEvent,
  advanceEventChain,
  getChainProgress,
};

