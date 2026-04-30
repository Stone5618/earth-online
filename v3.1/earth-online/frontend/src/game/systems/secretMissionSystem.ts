
import type { GameState, PlayerStats, SecretMission } from '../core/types';

// 隐藏任务配置定义
export interface SecretMissionConfig {
  id: string;
  name: string;
  description: string;
  condition: (state: GameState) => boolean;
  reward: (stats: PlayerStats) => Partial<PlayerStats>;
}

// 5个隐藏任务配置
export const SECRET_MISSION_CONFIGS: SecretMissionConfig[] = [
  // 任务1: 天才少年
  {
    id: 'genius_mission',
    name: '天才少年',
    description: '在10岁前智力达到150',
    condition: (state) => state.stats.age <= 10 && state.stats.intelligence >= 150,
    reward: (stats) => ({
      intelligence: stats.intelligence + 20,
      skillPoints: 10,
      karma: stats.karma + 10
    })
  },
  
  // 任务2: 社交达人
  {
    id: 'social_butterfly_mission',
    name: '社交达人',
    description: '在20岁前魅力达到120并结婚',
    condition: (state) => state.stats.age <= 20 && state.stats.charm >= 120 && state.stats.isMarried,
    reward: (stats) => ({
      charm: stats.charm + 30,
      mood: 100,
      karma: stats.karma + 15
    })
  },
  
  // 任务3: 白手起家
  {
    id: 'self_made_millionaire_mission',
    name: '白手起家',
    description: '家庭背景为IRON但在30岁前拥有100万',
    condition: (state) => state.familyTier === 'IRON' && state.stats.age <= 30 && state.stats.money >= 1000000,
    reward: (stats) => ({
      money: stats.money + 500000,
      luck: stats.luck + 20,
      creativity: stats.creativity + 20
    })
  },
  
  // 任务4: 铁人体质
  {
    id: 'iron_man_mission',
    name: '铁人体质',
    description: '连续5年健康值保持在150以上',
    condition: (state) => {
      // 由于我们没有详细的历史记录，简化为当前健康值在200以上且年龄在20岁以上
      return state.stats.health >= 200 && state.stats.age >= 20;
    },
    reward: (stats) => ({
      maxHealth: stats.maxHealth + 100,
      health: stats.health + 50,
      maxEnergy: stats.maxEnergy + 50,
      energy: stats.energy + 30
    })
  },
  
  // 任务5: 完美人生
  {
    id: 'perfect_life_mission',
    name: '完美人生',
    description: '拥有最高级房子、车子、工作，并且结婚有2个孩子以上',
    condition: (state) => 
      state.stats.houseLevel === 4 &&
      state.stats.carLevel === 3 &&
      state.stats.jobLevel === 5 &&
      state.stats.isMarried &&
      state.stats.children.length >= 2,
    reward: (stats) => ({
      money: stats.money + 2000000,
      karma: stats.karma + 50,
      luck: stats.luck + 30,
      mood: 100
    })
  }
];

// 初始化隐藏任务
export function initializeSecretMissions(): SecretMission[] {
  return SECRET_MISSION_CONFIGS.map(config => ({
    id: config.id,
    description: config.description,
    condition: config.condition as any,
    reward: config.reward as any,
    completed: false
  }));
}

// 检查并完成隐藏任务
export function checkAndCompleteSecretMissions(state: GameState): { 
  updatedState: GameState;
  completedMissions: SecretMission[];
} {
  const completedMissions: SecretMission[] = [];
  let updatedMissions = [...state.secretMissions];
  let updatedStats = { ...state.stats };
  
  for (let i = 0; i < updatedMissions.length; i++) {
    const mission = updatedMissions[i];
    if (mission.completed) continue;
    
    const config = SECRET_MISSION_CONFIGS.find(c => c.id === mission.id);
    if (!config) continue;
    
    // 检查是否满足条件
    if (config.condition(state)) {
      // 标记任务完成
      updatedMissions[i] = { ...mission, completed: true };
      completedMissions.push(updatedMissions[i]);
      
      // 应用奖励
      const reward = config.reward(updatedStats);
      updatedStats = applyReward(updatedStats, reward);
    }
  }
  
  const updatedState: GameState = {
    ...state,
    secretMissions: updatedMissions,
    stats: updatedStats
  };
  
  return { updatedState, completedMissions };
}

// 应用奖励到玩家属性
function applyReward(stats: PlayerStats, reward: Partial<PlayerStats>): PlayerStats {
  const newStats = { ...stats };
  
  // 直接使用Object.assign，更安全
  return { ...newStats, ...reward };
}

// 获取任务进度描述
export function getMissionProgressText(mission: SecretMission, state: GameState): string {
  const config = SECRET_MISSION_CONFIGS.find(c => c.id === mission.id);
  if (!config) return '';
  
  // 根据不同任务返回进度描述
  switch (mission.id) {
    case 'genius_mission':
      return `当前智力: ${state.stats.intelligence}/150, 年龄: ${state.stats.age}/10`;
    case 'social_butterfly_mission':
      return `当前魅力: ${state.stats.charm}/120, 结婚: ${state.stats.isMarried ? '✅' : '❌'}, 年龄: ${state.stats.age}/20`;
    case 'self_made_millionaire_mission':
      return `家庭背景: ${state.familyTier === 'IRON' ? '✅' : '❌'}, 金钱: ${Math.round(state.stats.money/10000)}万/100万, 年龄: ${state.stats.age}/30`;
    case 'iron_man_mission':
      return `当前健康: ${state.stats.health}/200, 年龄: ${state.stats.age}/20`;
    case 'perfect_life_mission':
      return `房子: ${state.stats.houseLevel}/4, 车子: ${state.stats.carLevel}/3, 工作: ${state.stats.jobLevel}/5, 结婚: ${state.stats.isMarried ? '✅' : '❌'}, 孩子: ${state.stats.children.length}/2`;
    default:
      return '';
  }
}

export default {
  SECRET_MISSION_CONFIGS,
  initializeSecretMissions,
  checkAndCompleteSecretMissions,
  getMissionProgressText
};
