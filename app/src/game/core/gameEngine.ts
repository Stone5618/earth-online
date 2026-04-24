import { SKILL_COSTS, HOUSE_UPGRADES, CAR_UPGRADES } from '../../config/gameConfig';
import type { 
  GameState, 
  GameAction, 
  GameEvent, 
  PlayerStats, 
  Achievement, 
  FamilyTier,
  GameLog
} from './types';
import {
  initialState,
  getRandomTitle,
  getRandomComment
} from './gameInitializer';
import { BASE_EVENTS, applyFilters } from '../events';
import { EVENT_CHAIN_EVENTS } from '../systems/eventChainSystem';
import {
  HEALTH_TRANSITIONS,
  getHealthConditionName,
  getHealthConditionColor,
  getHealthTreatmentCost,
  calculateHealthTransition,
  getHealthImpact,
  syncHealthStatusByValue
} from '../systems/healthSystem';
import {
  calculateEconomyFactor,
  getEconomyState,
  applyEconomyToMoneyChange,
  formatMoney
} from '../systems/economySystem';
import {
  determineEnding
} from '../systems/endingSystem';
import {
  checkStartEventChains,
  startEventChain,
  getActiveChainEvent,
  advanceEventChain,
  checkAndCompleteSecretMissions,
  canAdvanceEducation,
  tryAdvanceEducation,
  shouldRetire,
  retire,
  processCareerYear,
  loseJob,
  reEmploy,
  getAvailableCareers,
  startCareer,
  canPromote,
  promote
} from '../systems';
import { handleMoneyChange } from '../systems/debtSystem';

// 导出 initialState 供其他模块使用
export { initialState };

// 重新导出系统模块的内容以保持向后兼容
export {
  HEALTH_TRANSITIONS,
  getHealthConditionName,
  getHealthConditionColor,
  getHealthTreatmentCost,
  calculateHealthTransition,
  getHealthImpact,
  syncHealthStatusByValue,
  getEconomyState,
  applyEconomyToMoneyChange,
  formatMoney,
  determineEnding
};

// ========== 工具函数 ==========

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashToSeed(parts: Array<string | number>): number {
  // Simple deterministic hash → uint32
  let h = 2166136261;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function limitChange(value: number, isMoney: boolean = false): number {
  if (isMoney) {
    if (value > 0) {
      return Math.min(value, 1000000);
    } else {
      return Math.max(value, -1000000);
    }
  } else {
    if (value > 0) {
      return Math.min(value, 30);
    } else {
      return Math.max(value, -30);
    }
  }
}

// ========== 成就系统 ==========

const achievementLibrary: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_birthday', name: '生日快乐', description: '庆祝你的第一个生日', icon: '🎂' },
  { id: 'adult', name: '长大成人', description: '度过18岁生日', icon: '🎉' },
  { id: 'middle_aged', name: '人到中年', description: '度过35岁生日', icon: '🍵' },
  { id: 'senior', name: '老年生活', description: '度过60岁生日', icon: '👴' },
  { id: 'centenarian', name: '百岁老人', description: '活到100岁', icon: '🎊' },
  { id: 'rich', name: '富甲一方', description: '累计获得100万元', icon: '💰' },
  { id: 'genius', name: '天才少年', description: '智力达到120', icon: '🧠' },
  { id: 'charmer', name: '万人迷', description: '魅力达到90', icon: '💖' },
  { id: 'creative', name: '创意无限', description: '创造力达到120', icon: '🎨' },
  { id: 'lucky', name: '幸运儿', description: '运气达到90', icon: '🍀' },
  { id: 'happy', name: '乐观派', description: '心情连续保持90+', icon: '😊' },
  { id: 'survivor', name: '幸存者', description: '健康低于10但还活着', icon: '🏥' },
  { id: 'hardworker', name: '工作狂', description: '精力低于10还在坚持', icon: '⚡' },
];

export function getInitialAchievements(): Achievement[] {
  return achievementLibrary.map((a) => ({ ...a, unlocked: false }));
}

// ========== 事件系统 ==========

// 向后兼容 - 重新导出事件模块的函数
export { resolveChoiceText, resolveStatChanges } from '../events';

// 事件库 - 从事件模块导入
export const eventLibrary: GameEvent[] = BASE_EVENTS;

export function selectEvent(
  age: number, 
  stats: PlayerStats, 
  familyTier: FamilyTier | null,
  lastTriggeredEvents: Record<string, number>,
  recentEventIds: string[],
  _currentYear: number,
  gameState?: GameState
): GameEvent | null {
  // 优先检查是否有活跃的事件链事件
  if (gameState) {
    const activeChainEventId = getActiveChainEvent(gameState);
    if (activeChainEventId) {
      // 从EVENT_CHAIN_EVENTS中查找，因为它们不在BASE_EVENTS中
      const chainEvent = EVENT_CHAIN_EVENTS[activeChainEventId as keyof typeof EVENT_CHAIN_EVENTS];
      if (chainEvent) {
        return chainEvent as GameEvent;
      }
    }
  }

  // 使用新的事件过滤系统
  const candidates = applyFilters(eventLibrary, {
    minAge: age,
    maxAge: age,
    familyTier,
    recentEventIds,
    lastTriggeredEvents,
    currentAge: age,
    eventOccurrences: gameState?.eventOccurrences
  }).filter(event => {
    if (event.condition && !event.condition(stats, familyTier)) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // 按权重随机选择
  const totalWeight = candidates.reduce((sum, e) => sum + (e.weight || 1), 0);
  const seed = gameState?.rngSeed ?? 0;
  const rng = mulberry32(hashToSeed([seed, 'event', age, familyTier ?? 'none', gameState?.currentYear ?? 0]));
  let random = rng() * totalWeight;

  for (const event of candidates) {
    random -= (event.weight || 1);
    if (random <= 0) {
      return event;
    }
  }

  return candidates[0];
}

function pickNextEventId(nextState: GameState): string | null {
  if (nextState.phase !== 'PLAYING') return null;
  const nextEvent = selectEvent(
    nextState.stats.age,
    nextState.stats,
    nextState.familyTier,
    nextState.lastTriggeredEvents,
    nextState.recentEventIds,
    nextState.currentYear,
    nextState
  );
  return nextEvent?.id ?? null;
}

// ========== Game Reducer ==========

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_SPAWNING': {
      let initialStats = action.payload.initialStats;
      if (action.payload.challenge?.initialStats) {
        initialStats = { ...initialStats, ...action.payload.challenge.initialStats };
      }
      return {
        ...state,
        phase: 'SPAWNING',
        familyTier: action.payload.familyTier,
        birthServer: action.payload.birthServer,
        birthTalent: action.payload.birthTalent,
        stats: initialStats,
        challenge: action.payload.challenge,
        challengeVictory: undefined,
        currentEventId: null,
        rngSeed: state.rngSeed || (Date.now() >>> 0),
      };
    }

    case 'COMPLETE_SPAWNING':
      return {
        ...state,
        phase: 'PLAYING',
        currentEventId: state.currentEventId ?? pickNextEventId({ ...state, phase: 'PLAYING' }),
      };

    case 'SET_CHALLENGE':
      return {
        ...state,
        challenge: action.payload,
      };

    case 'TICK_YEAR': {
      const newAge = state.stats.age + 1;
      
      // 提取 statChanges 中的需求相关状态
      const { houseLevel, carLevel, jobLevel, isUnemployed, career, partner, children, debts, skills, skillPoints, ...restStatChanges } = action.payload.statChanges;
      
      // 处理职业年度变化
      const careerResult = processCareerYear(state.stats);
      
      const newEconomyFactor = calculateEconomyFactor(newAge);
      const currentEconomyState = getEconomyState(state.stats.economyFactor);
      const newEconomyState = getEconomyState(newEconomyFactor);
      const economyStateChanged = currentEconomyState !== newEconomyState;
      
      let newHealthStatus = calculateHealthTransition(state.stats.healthStatus, careerResult.newStats);
      const healthImpact = getHealthImpact(newHealthStatus);
      
      // 确保健康状态与健康值同步
      const rawHealthChange = (restStatChanges.health || 0) + (healthImpact.statChanges.health || 0) + careerResult.healthBonus;
      const intermediateHealth = clamp(
        state.stats.health + rawHealthChange + (state.stats.energy <= 0 ? -10 : 0) + (newAge >= 35 ? -2 : 0),
        0,
        Math.max(state.stats.maxHealth, 999)
      );
      newHealthStatus = syncHealthStatusByValue(newHealthStatus, intermediateHealth);
      
      const healthStatusChanged = newHealthStatus.condition !== state.stats.healthStatus.condition;
      
      const difficultyMultipliers = {
        easy: { positive: 1.3, negative: 0.7 },
        normal: { positive: 1, negative: 1 },
        hard: { positive: 0.8, negative: 1.3 },
      };
      let diff = { ...difficultyMultipliers[state.difficulty] };
      
      let finalMoneyMultiplier = healthImpact.incomeMultiplier;
      
      if (state.challenge?.rules) {
        if (state.challenge.rules.incomeMultiplier) {
          finalMoneyMultiplier = state.challenge.rules.incomeMultiplier * finalMoneyMultiplier;
        }
      }
      
      if (state.stats.health < 30) {
        diff.negative = Math.min(diff.negative * 0.8, 1);
      }
      
      if (state.stats.money > 100000) {
        diff.positive = Math.max(diff.positive * 0.85, 0.7);
      }
      
      if (state.stats.mood < 30) {
        diff.positive = Math.min(diff.positive * 1.2, 1.5);
      }
      
      const applyDiff = (value: number, isPositive: boolean) => {
        return Math.round(value * (isPositive ? diff.positive : diff.negative));
      };
      const rawEnergyChange = (restStatChanges.energy || 0) + (healthImpact.statChanges.energy || 0);
      const rawMoneyChange = ((restStatChanges.money || 0) * finalMoneyMultiplier) + (healthImpact.statChanges.money || 0) + careerResult.extraIncome;
      const rawMoodChange = (restStatChanges.mood || 0) * healthImpact.moodMultiplier + (healthImpact.statChanges.mood || 0);
      const rawIntelligenceChange = (restStatChanges.intelligence || 0) + (healthImpact.statChanges.intelligence || 0);
      const rawCharmChange = (restStatChanges.charm || 0) + (healthImpact.statChanges.charm || 0);
      const rawCreativityChange = (restStatChanges.creativity || 0) + (healthImpact.statChanges.creativity || 0);
      const rawLuckChange = (restStatChanges.luck || 0) + (healthImpact.statChanges.luck || 0);
      const rawKarmaChange = (restStatChanges.karma || 0) + (healthImpact.statChanges.karma || 0);
      const isMarriedChange = state.challenge?.rules?.disableRomance ? false : restStatChanges.isMarried;
      
      const healthAfterDiff = applyDiff(rawHealthChange, rawHealthChange > 0);
      const energyAfterDiff = applyDiff(rawEnergyChange * healthImpact.energyMultiplier, rawEnergyChange > 0);
      let moneyAfterDiff = applyDiff(rawMoneyChange, rawMoneyChange > 0);
      moneyAfterDiff = applyEconomyToMoneyChange(moneyAfterDiff, newEconomyFactor);
      const moodAfterDiff = applyDiff(rawMoodChange, rawMoodChange > 0);
      const intelligenceAfterDiff = applyDiff(rawIntelligenceChange, rawIntelligenceChange > 0);
      const charmAfterDiff = applyDiff(rawCharmChange, rawCharmChange > 0);
      const creativityAfterDiff = applyDiff(rawCreativityChange, rawCreativityChange > 0);
      const luckAfterDiff = applyDiff(rawLuckChange, rawLuckChange > 0);
      const karmaAfterDiff = applyDiff(rawKarmaChange, rawKarmaChange > 0);
      
      const healthChange = limitChange(healthAfterDiff, false);
      const energyChange = limitChange(energyAfterDiff, false);
      const moneyChange = limitChange(moneyAfterDiff, true);
      const moodChange = limitChange(moodAfterDiff, false);
      const intelligenceChange = limitChange(intelligenceAfterDiff, false);
      const charmChange = limitChange(charmAfterDiff, false);
      const creativityChange = limitChange(creativityAfterDiff, false);
      const luckChange = limitChange(luckAfterDiff, false);
      const karmaChange = limitChange(karmaAfterDiff, false);
      
      const totalHealthChange = healthChange +
        (state.stats.energy <= 0 ? -10 : 0) +
        (newAge >= 35 ? -2 : 0);
      
      const newHealth = clamp(
        state.stats.health + totalHealthChange,
        0,
        Math.max(state.stats.maxHealth, 999)
      );
      const newEnergy = clamp(
        state.stats.energy + energyChange + 10,
        0,
        Math.max(state.stats.maxEnergy, 200)
      );
      const newMoney = state.stats.money + moneyChange;
      const newTotalMoneyEarned = state.stats.totalMoneyEarned + Math.max(0, moneyAfterDiff);
      const newMood = clamp(
        state.stats.mood + moodChange,
        0,
        100
      );
      const newIntelligence = clamp(
        state.stats.intelligence + intelligenceChange,
        0,
        200
      );
      const newCharm = clamp(
        state.stats.charm + charmChange,
        0,
        150
      );
      const newCreativity = clamp(
        state.stats.creativity + creativityChange,
        0,
        200
      );
      const newLuck = clamp(
        state.stats.luck + luckChange,
        0,
        150
      );
      const newKarma = clamp(
        state.stats.karma + karmaChange,
        0,
        150
      );

      const newConsecutiveHappyYears = newMood >= 90 ? state.consecutiveHappyYears + 1 : 0;

      let updatedAchievements = [...state.achievements];
      const newlyUnlocked: Achievement[] = [];
      const checkAchievement = (id: string) => {
        const achievement = updatedAchievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
          updatedAchievements = updatedAchievements.map(a => 
            a.id === id ? { ...a, unlocked: true } : a
          );
          newlyUnlocked.push({ ...achievement, unlocked: true });
        }
      };
      
      if (newAge === 1) checkAchievement('first_birthday');
      if (newAge === 18) checkAchievement('adult');
      if (newAge === 35) checkAchievement('middle_aged');
      if (newAge === 60) checkAchievement('senior');
      if (newAge === 100) checkAchievement('centenarian');
      if (newTotalMoneyEarned >= 1000000) checkAchievement('rich');
      if (newIntelligence >= 120) checkAchievement('genius');
      if (newCharm >= 90) checkAchievement('charmer');
      if (newCreativity >= 120) checkAchievement('creative');
      if (newLuck >= 90) checkAchievement('lucky');
      if (newConsecutiveHappyYears >= 5) checkAchievement('happy');
      if (newHealth > 0 && newHealth < 10) checkAchievement('survivor');
      if (newEnergy < 10) checkAchievement('hardworker');

      const economyLogEntry: GameLog[] = economyStateChanged 
        ? [
            {
              year: newAge,
              event: newEconomyState === 'boom' 
                ? '【经济繁荣】市场火热，收入增加！' 
                : newEconomyState === 'crisis' 
                  ? '【经济危机】市场低迷，收入减少...' 
                  : '【经济恢复】市场回归正常',
              type: newEconomyState === 'boom' ? 'positive' : newEconomyState === 'crisis' ? 'negative' : 'normal',
            },
          ]
        : [];
      
      const healthLogEntry: GameLog[] = healthStatusChanged
        ? [
            {
              year: newAge,
              event: `【健康变化】健康状态变为：${getHealthConditionName(newHealthStatus.condition)}${newHealthStatus.duration > 0 ? `，持续 ${newHealthStatus.duration} 年` : ''}`,
              type: newHealthStatus.condition === 'healthy' ? 'positive' : 'negative',
            },
          ]
        : [];

      const maxAge = state.challenge?.rules?.maxAge || 100;
      if (newHealth <= 0 || newAge >= maxAge) {
        const title = getRandomTitle(newAge, { ...state.stats, health: newHealth, age: newAge });
        let challengeVictory: boolean | undefined = undefined;
        if (state.challenge) {
          const finalStats = {
            ...state.stats,
            age: newAge,
            health: Math.max(0, newHealth),
            energy: newEnergy,
            money: newMoney,
            mood: newMood,
            intelligence: newIntelligence,
            charm: newCharm,
            creativity: newCreativity,
            luck: newLuck,
            karma: newKarma,
            totalMoneyEarned: newTotalMoneyEarned,
            isMarried: isMarriedChange !== undefined ? isMarriedChange : state.stats.isMarried,
            economyFactor: newEconomyFactor,
          };
          challengeVictory = state.challenge.victoryCondition(finalStats);
        }
        const preStats = {
          ...careerResult.newStats,
          age: newAge,
          health: Math.max(0, newHealth),
          energy: newEnergy,
          money: newMoney,
          mood: newMood,
          intelligence: newIntelligence,
          charm: newCharm,
          creativity: newCreativity,
          luck: newLuck,
          karma: newKarma,
          totalMoneyEarned: newTotalMoneyEarned,
          isMarried: isMarriedChange !== undefined ? isMarriedChange : state.stats.isMarried,
          economyFactor: newEconomyFactor,
          healthStatus: newHealthStatus,
          skillPoints: state.stats.skillPoints + careerResult.extraSkillPoints,
          houseLevel: houseLevel !== undefined ? houseLevel : state.stats.houseLevel,
          carLevel: carLevel !== undefined ? carLevel : state.stats.carLevel,
          jobLevel: jobLevel !== undefined ? jobLevel : state.stats.jobLevel,
          isUnemployed: isUnemployed !== undefined ? isUnemployed : state.stats.isUnemployed,
          career: career !== undefined ? career : state.stats.career,
          partner: partner !== undefined ? partner : state.stats.partner,
          children: children !== undefined ? children : state.stats.children,
          debts: action.payload.statChanges?.debts !== undefined ? action.payload.statChanges.debts : state.stats.debts,
        };
        
        const finalStats = handleMoneyChange(preStats, '年度支出');
        
        return {
          ...state,
          phase: 'GAMEOVER',
          stats: finalStats,
          currentYear: state.currentYear + 1,
          logs: [
            {
              year: newAge,
              event: action.payload.event,
              type: action.payload.eventType,
              statChanges: action.payload.statChanges,
              action: action.payload.action,
            },
            ...economyLogEntry,
            ...healthLogEntry,
            ...state.logs.slice(0, 79 - economyLogEntry.length - healthLogEntry.length),
          ],
          achievements: updatedAchievements,
          newlyUnlockedAchievements: newlyUnlocked,
          deathReason: newHealth <= 0 ? '健康值归零' : '寿终正寝',
          finalTitle: title,
          finalComment: getRandomComment(title),
          consecutiveHappyYears: newConsecutiveHappyYears,
          challengeVictory,
          currentEventId: null,
        };
      }

      // 合并技能变化
      const mergedSkills = { ...state.stats.skills };
      if (skills) {
        for (const [skillName, skillValue] of Object.entries(skills)) {
          if (typeof skillValue === 'number') {
            mergedSkills[skillName as keyof typeof mergedSkills] = Math.max(
              0,
              Math.min(
                10,
                (mergedSkills[skillName as keyof typeof mergedSkills] || 0) + skillValue
              )
            );
          }
        }
      }

      const preStats = {
        ...careerResult.newStats,
        age: newAge,
        health: Math.max(0, newHealth),
        energy: newEnergy,
        money: newMoney,
        mood: newMood,
        intelligence: newIntelligence,
        charm: newCharm,
        creativity: newCreativity,
        luck: newLuck,
        karma: newKarma,
        totalMoneyEarned: newTotalMoneyEarned,
        isMarried: isMarriedChange !== undefined ? isMarriedChange : state.stats.isMarried,
        economyFactor: newEconomyFactor,
        healthStatus: newHealthStatus,
        skillPoints: state.stats.skillPoints + careerResult.extraSkillPoints + (skillPoints || 0),
        skills: mergedSkills,
        houseLevel: houseLevel !== undefined ? houseLevel : state.stats.houseLevel,
        carLevel: carLevel !== undefined ? carLevel : state.stats.carLevel,
        jobLevel: jobLevel !== undefined ? jobLevel : state.stats.jobLevel,
        isUnemployed: isUnemployed !== undefined ? isUnemployed : state.stats.isUnemployed,
        career: career !== undefined ? career : state.stats.career,
        partner: partner !== undefined ? partner : state.stats.partner,
        children: children !== undefined ? children : state.stats.children,
        debts: action.payload.statChanges?.debts !== undefined ? action.payload.statChanges.debts : state.stats.debts,
      };
      
      const finalStats = handleMoneyChange(preStats, '年度支出');
      
      const stateAfterTick: GameState = {
        ...state,
        stats: finalStats,
        currentYear: state.currentYear + 1,
        logs: [
          {
            year: newAge,
            event: action.payload.event,
            type: action.payload.eventType,
            statChanges: action.payload.statChanges,
            action: action.payload.action,
          },
          ...economyLogEntry,
          ...healthLogEntry,
          ...state.logs.slice(0, 79 - economyLogEntry.length - healthLogEntry.length),
        ],
        achievements: updatedAchievements,
        newlyUnlockedAchievements: newlyUnlocked,
        consecutiveHappyYears: newConsecutiveHappyYears,
        currentEventId: state.currentEventId,
      };

      return {
        ...stateAfterTick,
        currentEventId: pickNextEventId(stateAfterTick),
      };
    }

    case 'REST_AND_RECOVER': {
      // 废弃的action，保留用于向后兼容
      const { statChanges } = action.payload;
      // 休息应当推进一年，避免无限刷
      const newAge = state.stats.age + 1;
      // 应用年龄带来的健康衰减
      const healthChangeFromAge = newAge >= 35 ? -2 : 0;
      
      const preStats = {
        ...state.stats,
        age: newAge,
        health: clamp(
          state.stats.health + limitChange(statChanges.health || 0) + healthChangeFromAge,
          0,
          Math.max(state.stats.maxHealth, 999)
        ),
        energy: clamp(
          state.stats.energy + limitChange(statChanges.energy || 0),
          0,
          Math.max(state.stats.maxEnergy, 200)
        ),
        mood: clamp(
          state.stats.mood + limitChange(statChanges.mood || 0),
          0,
          100
        ),
        money: state.stats.money + limitChange(statChanges.money || 0),
      };
      
      const finalStats = handleMoneyChange(preStats, '休息恢复');
      
      return {
        ...state,
        stats: finalStats,
      };
    }

    case 'GAME_OVER':
      return {
        ...state,
        phase: 'GAMEOVER',
        deathReason: action.payload.reason,
        finalTitle: action.payload.title,
        finalComment: action.payload.comment,
      };

    case 'RESET_GAME':
      return {
        ...initialState,
        phase: 'LANDING',
      };

    case 'GO_TO_LANDING':
      return {
        ...state,
        phase: 'LANDING',
        currentEventId: null,
      };

    case 'UPDATE_STATS': {
      const preStats = {
        ...state.stats,
        ...action.payload,
      };
      
      const finalStats = handleMoneyChange(preStats, '状态更新');
      
      return {
        ...state,
        stats: finalStats,
      };
    }

    case 'UPGRADE_HOUSE': {
        const nextLevel = Math.min(state.stats.houseLevel + 1, 4) as 0 | 1 | 2 | 3 | 4;
        const nextUpgrade = HOUSE_UPGRADES[nextLevel];
        if (!nextUpgrade) return state;

        const newStats = handleMoneyChange(
          {
            ...state.stats,
            houseLevel: nextLevel,
            money: state.stats.money - nextUpgrade.cost,
          },
          '购房/升级房屋'
        );

        return {
          ...state,
          stats: newStats,
        };
      }

      case 'UPGRADE_CAR': {
        const nextLevel = Math.min(state.stats.carLevel + 1, 3) as 0 | 1 | 2 | 3;
        const nextUpgrade = CAR_UPGRADES[nextLevel];
        if (!nextUpgrade) return state;

        const newStats = handleMoneyChange(
          {
            ...state.stats,
            carLevel: nextLevel,
            money: state.stats.money - nextUpgrade.cost,
          },
          '购车/升级车辆'
        );

        return {
          ...state,
          stats: newStats,
        };
      }

      case 'UPGRADE_JOB': {
        const nextLevel = Math.min(state.stats.jobLevel + 1, 5) as 0 | 1 | 2 | 3 | 4 | 5;
        const jobCost = 5000 * (state.stats.jobLevel + 1);
        if (state.stats.retired) return state;

        const newStats = handleMoneyChange(
          {
            ...state.stats,
            jobLevel: nextLevel,
            money: state.stats.money - jobCost,
          },
          '升职相关费用'
        );

        return {
          ...state,
          stats: newStats,
        };
      }

    case 'GET_PARTNER':
      return {
        ...state,
        stats: {
          ...state.stats,
          partner: { has: true, relationshipQuality: 70 },
          isMarried: true,
        },
      };

    case 'HAVE_CHILD':
      return {
        ...state,
        stats: {
          ...state.stats,
          children: [
            ...state.stats.children,
            { name: action.payload.name, age: 0 },
          ],
        },
      };

    case 'RETIRE':
      return {
        ...state,
        stats: {
          ...state.stats,
          retired: true,
        },
      };

    case 'UPGRADE_SKILL': {
      const { skill } = action.payload;
      const currentLevel = state.stats.skills[skill];
      const cost = SKILL_COSTS[(currentLevel + 1) as keyof typeof SKILL_COSTS];

      if (currentLevel >= 5 || state.stats.skillPoints < cost) {
        return state;
      }

      return {
        ...state,
        stats: {
          ...state.stats,
          skillPoints: state.stats.skillPoints - cost,
          skills: {
            ...state.stats.skills,
            [skill]: currentLevel + 1,
          },
        },
      };
    }

    case 'SEEK_TREATMENT': {
      const treatmentCost = getHealthTreatmentCost(state.stats.healthStatus.condition, state.stats);
      
      if (state.stats.money < treatmentCost) {
        return state;
      }
      
      const treatedHealthStatus = calculateHealthTransition(
        state.stats.healthStatus,
        state.stats,
        true
      );
      
      // 根据当前健康状态和健康值计算恢复效果
      // 健康值越低，恢复越显著，范围在 30-50 之间
      let healthBase = 30;
      switch (state.stats.healthStatus.condition) {
        case 'major_ill':
          healthBase = 45;
          break;
        case 'injured':
          healthBase = 40;
          break;
        case 'disabled':
          healthBase = 35;
          break;
        case 'minor_ill':
          healthBase = 35;
          break;
        default:
          healthBase = 30;
      }
      
      const healthRecovery = healthBase + Math.max(0, (100 - state.stats.health) / 3);
      const clampedHealthRecovery = Math.min(healthRecovery, 55);
      
      // 心情恢复 15-25 点
      const moodBase = 15;
      let moodBonus = 0;
      switch (state.stats.healthStatus.condition) {
        case 'major_ill':
        case 'disabled':
          moodBonus = 10;
          break;
        case 'injured':
        case 'minor_ill':
          moodBonus = 6;
          break;
        default:
          moodBonus = 3;
      }
      
      const moodRecovery = moodBase + moodBonus;
      
      return {
        ...state,
        stats: {
          ...state.stats,
          healthStatus: treatedHealthStatus,
          money: state.stats.money - treatmentCost,
          health: clamp(
            state.stats.health + clampedHealthRecovery,
            0,
            Math.max(state.stats.maxHealth, 999)
          ),
          mood: clamp(
            state.stats.mood + moodRecovery,
            0,
            100
          ),
          energy: clamp(
            state.stats.energy + Math.floor(clampedHealthRecovery / 2),
            0,
            Math.max(state.stats.maxEnergy, 200)
          ),
        },
      };
    }

    case 'UPDATE_HEALTH_STATUS': {
      return {
        ...state,
        stats: {
          ...state.stats,
          healthStatus: action.payload.healthStatus,
        },
      };
    }

    case 'ADD_LOG':
      return {
        ...state,
        logs: [action.payload, ...state.logs.slice(0, 79)],
      };

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: state.achievements.map((a) =>
          a.id === action.payload ? { ...a, unlocked: true } : a
        ),
      };

    case 'LOAD_GAME': {
      const loaded = action.payload;
      
      const mergedStats: PlayerStats = {
        ...initialState.stats,
        ...(loaded.stats || {}),
      };
      
      const mergedAchievements = Array.isArray(loaded.achievements) && loaded.achievements.length > 0
        ? loaded.achievements
        : [...initialState.achievements];
      
      const mergedLogs = Array.isArray(loaded.logs) ? loaded.logs : [];
      
      const mergedLastTriggeredEvents = typeof loaded.lastTriggeredEvents === 'object' && loaded.lastTriggeredEvents !== null
        ? loaded.lastTriggeredEvents
        : {};
      
      const mergedRecentEventIds = Array.isArray(loaded.recentEventIds) ? loaded.recentEventIds : [];
      
      const mergedEventLastTriggered = typeof loaded.eventLastTriggered === 'object' && loaded.eventLastTriggered !== null
        ? loaded.eventLastTriggered
        : {};
      
      const mergedEventOccurrences = typeof (loaded as any).eventOccurrences === 'object' && (loaded as any).eventOccurrences !== null
        ? (loaded as any).eventOccurrences
        : {};
      
      return {
        phase: loaded.phase || initialState.phase,
        stats: mergedStats,
        familyTier: loaded.familyTier ?? initialState.familyTier,
        birthServer: loaded.birthServer ?? initialState.birthServer,
        birthTalent: loaded.birthTalent ?? initialState.birthTalent,
        logs: mergedLogs,
        currentYear: loaded.currentYear ?? initialState.currentYear,
        currentEventId: (loaded as any).currentEventId ?? null,
        rngSeed: (loaded as any).rngSeed ?? initialState.rngSeed,
        achievements: mergedAchievements,
        newlyUnlockedAchievements: [],
        deathReason: loaded.deathReason ?? initialState.deathReason,
        finalTitle: loaded.finalTitle ?? initialState.finalTitle,
        finalComment: loaded.finalComment ?? initialState.finalComment,
        consecutiveHappyYears: loaded.consecutiveHappyYears ?? initialState.consecutiveHappyYears,
        difficulty: loaded.difficulty || initialState.difficulty,
        lastTriggeredEvents: mergedLastTriggeredEvents,
        recentEventIds: mergedRecentEventIds,
        eventLastTriggered: mergedEventLastTriggered,
        eventOccurrences: mergedEventOccurrences,
        version: (loaded as any).version ?? initialState.version,
        endingsSeen: (loaded as any).endingsSeen ?? initialState.endingsSeen,
        eventChains: (loaded as any).eventChains ?? initialState.eventChains,
        secretMissions: (loaded as any).secretMissions ?? initialState.secretMissions,
        playTime: (loaded as any).playTime ?? initialState.playTime,
        challenge: (loaded as any).challenge ?? initialState.challenge,
        challengeVictory: (loaded as any).challengeVictory ?? initialState.challengeVictory,
      };
    }

    case 'CLEAR_ACHIEVEMENT_NOTIFICATIONS':
      return {
        ...state,
        newlyUnlockedAchievements: action.payload || [],
      };

    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.payload,
      };

    case 'TRIGGER_EVENT': {
      const eventId = action.payload.eventId;
      const year = action.payload.year;
      
      let newState = { ...state };
      
      // 处理职业相关事件
      if (eventId === 'career_unemployment') {
        // 失业事件：调用 loseJob 函数，但稳定职业不会失业
        if (newState.stats.career?.currentCareer) {
          const careerType = newState.stats.career.currentCareer;
          const stableCareers = ['civil_servant', 'police_career', 'teacher_career', 'doctor_career'];
          
          // 只有非稳定职业才会失业
          if (!stableCareers.includes(careerType)) {
            const jobResult = loseJob(newState.stats);
            newState.stats = jobResult.newStats;
          }
        }
      } else if (eventId === 'career_reemployment_success') {
        // 再就业成功事件：随机选择一个可用职业并重新就业
        const availableCareers = getAvailableCareers(newState.stats.age, newState.stats);
        if (availableCareers.length > 0) {
          // 随机选择一个职业
          const randomIndex = Math.floor(Math.random() * availableCareers.length);
          const selectedCareer = availableCareers[randomIndex];
          const jobResult = reEmploy(newState.stats, selectedCareer);
          if (jobResult.success) {
            newState.stats = jobResult.newStats;
          }
        }
      } else if (eventId === 'career_get_job' || eventId === 'career_looking_for_job' || eventId === 'career_choice_18') {
        // 入职相关事件：随机选择一个可用职业并开始工作
        const availableCareers = getAvailableCareers(newState.stats.age, newState.stats);
        if (availableCareers.length > 0 && !newState.stats.career?.currentCareer) {
          // 随机选择一个职业
          const randomIndex = Math.floor(Math.random() * availableCareers.length);
          const selectedCareer = availableCareers[randomIndex];
          const jobResult = startCareer(newState.stats, selectedCareer);
          if (jobResult.success) {
            newState.stats = jobResult.newStats;
          }
        }
      } else if (eventId === 'graduate_university') {
        // 大学毕业事件：随机选择一个职业开始工作
        const availableCareers = getAvailableCareers(newState.stats.age, newState.stats);
        if (availableCareers.length > 0 && !newState.stats.career?.currentCareer) {
          // 优先选择稳定职业（如公务员），如果有的话
          let selectedCareer;
          const stableCareer = availableCareers.find(c => c === 'civil_servant');
          if (stableCareer) {
            selectedCareer = stableCareer;
          } else {
            // 否则随机选择一个职业
            const randomIndex = Math.floor(Math.random() * availableCareers.length);
            selectedCareer = availableCareers[randomIndex];
          }
          
          if (selectedCareer) {
            const jobResult = startCareer(newState.stats, selectedCareer);
            if (jobResult.success) {
              newState.stats = jobResult.newStats;
            }
          }
        }
      } else if (eventId === 'career_promotion' || eventId === 'career_promote_1') {
        // 升职事件
        if (newState.stats.career?.currentCareer) {
          // 检查是否可以晋升
          if (canPromote(newState.stats)) {
            const promotionResult = promote(newState.stats);
            if (promotionResult.success) {
              newState.stats = promotionResult.newStats;
            }
          }
        }
      }
      
      // 推进事件链
      newState = advanceEventChain(newState, eventId);
      
      // 检查是否有可以开始的事件链
      const startableChains = checkStartEventChains(newState);
      const newEventChains = { ...newState.eventChains };
      
      for (const chainId of startableChains) {
        if (!newEventChains[chainId]) {
          const newChain = startEventChain(chainId);
          if (newChain) {
            newEventChains[chainId] = newChain;
          }
        }
      }
      
      // 检查和完成隐藏任务
      const missionResult = checkAndCompleteSecretMissions(newState);
      newState = missionResult.updatedState;
      
      // 检查是否可以升学（50%概率自动升学）
      if (canAdvanceEducation(newState) && Math.random() < 0.5) {
        const educationResult = tryAdvanceEducation(newState);
        if (educationResult.success) {
          newState = educationResult.newState;
        }
      }
      
      // 检查是否应该退休
      if (shouldRetire(newState)) {
        newState = retire(newState);
      }
      
      const newRecentEventIds = [eventId, ...newState.recentEventIds.filter(id => id !== eventId)];
      const trimmedRecentEventIds = newRecentEventIds.slice(0, 12);
      
      // 更新事件出现次数
      const currentOccurrences = newState.eventOccurrences[eventId] || 0;
      
      return {
        ...newState,
        eventChains: newEventChains,
        lastTriggeredEvents: {
          ...newState.lastTriggeredEvents,
          [eventId]: year,
        },
        recentEventIds: trimmedRecentEventIds,
        eventLastTriggered: {
          ...newState.eventLastTriggered,
          [eventId]: newState.currentYear,
        },
        eventOccurrences: {
          ...newState.eventOccurrences,
          [eventId]: currentOccurrences + 1
        }
      };
    }

    default:
      return state;
  }
}
