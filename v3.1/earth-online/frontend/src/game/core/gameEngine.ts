import { SKILL_COSTS, HOUSE_UPGRADES, CAR_UPGRADES } from '../../config/gameConfig';
import type { 
  GameState, 
  GameAction, 
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
import {
  achievementLibrary,
  achievementIndexById,
  getInitialAchievements,
  getAchievementIndex,
} from './achievements';
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
import {
  extractBaseStatChanges,
  calculateRawChanges,
  calculateIntermediateHealth,
} from './yearTick/calculateBaseStats';
import {
  getBaseDifficultyModifiers,
  applyConditionalModifiers,
  applyChallengeIncomeMultiplier,
  applyDiff,
} from './yearTick/applyDifficultyModifiers';
import {
  applyHealthSystem,
} from './yearTick/applyHealthSystem';
import {
  applyEconomySystem,
} from './yearTick/applyEconomySystem';
import { checkAchievements } from './yearTick/checkAchievements';
import { buildHealthLogEntry } from './yearTick/buildLogEntries';
import { checkGameOver } from './yearTick/checkGameOver';
import { processCareerYearTick } from './yearTick/applyCareerSystem';

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

// ========== 成就系统（已迁移至 achievements.ts） ==========
// 复用 achievements.ts 中的定义，消除重复代码

// ========== 事件系统 ==========
// 事件完全由后端管理，前端不再维护事件库

// 工具函数：解析选项文本（支持函数类型）
export function resolveChoiceText(text: string | ((stats: PlayerStats) => string), stats: PlayerStats): string {
  return typeof text === 'function' ? text(stats) : text;
}

// 工具函数：解析属性变化（支持函数类型）
export function resolveStatChanges(
  changes: Partial<PlayerStats> | ((stats: PlayerStats) => Partial<PlayerStats>),
  stats: PlayerStats
): Partial<PlayerStats> {
  return typeof changes === 'function' ? changes(stats) : changes;
}

// ========== Game Reducer ==========

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_SPAWNING': {
      let initialStats = action.payload.initialStats;
      if (action.payload.challenge?.initialStats) {
        initialStats = { ...initialStats, ...action.payload.challenge.initialStats };
      }
      // 应用角色姓名和家族名
      if (action.payload.characterName) {
        initialStats = { ...initialStats };
      }
      if (action.payload.familyName) {
        initialStats = { ...initialStats, familyName: action.payload.familyName };
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
        // 保存角色信息到state以便后续使用
        characterName: action.payload.characterName,
        familyName: action.payload.familyName,
        gender: action.payload.gender,
      };
    }

    case 'COMPLETE_SPAWNING':
      return {
        ...state,
        phase: 'PLAYING',
        currentEventId: null,
      };

    case 'SET_CHALLENGE':
      return {
        ...state,
        challenge: action.payload,
      };

    case 'TICK_YEAR': {
      const newAge = state.stats.age + 1;
      
      const baseStatChanges = extractBaseStatChanges(action.payload.statChanges);
      const careerResult = processCareerYearTick(state.stats);
      const healthResult = applyHealthSystem(state, action.payload.statChanges, careerResult);
      const economyResult = applyEconomySystem(newAge, state.stats.economyFactor);
      
      const rawChanges = calculateRawChanges(baseStatChanges, healthResult.healthImpact, careerResult);
      const diffModifiers = applyConditionalModifiers(
        getBaseDifficultyModifiers(state.difficulty),
        state.stats
      );
      
      const finalMoneyMultiplier = applyChallengeIncomeMultiplier(state, healthResult.healthImpact.incomeMultiplier);
      rawChanges.rawMoneyChange *= finalMoneyMultiplier;
      
      const healthAfterDiff = applyDiff(rawChanges.rawHealthChange, rawChanges.rawHealthChange > 0, diffModifiers);
      const energyAfterDiff = applyDiff(rawChanges.rawEnergyChange * healthResult.healthImpact.energyMultiplier, rawChanges.rawEnergyChange > 0, diffModifiers);
      let moneyAfterDiff = applyDiff(rawChanges.rawMoneyChange, rawChanges.rawMoneyChange > 0, diffModifiers);
      moneyAfterDiff = applyEconomyToMoneyChange(moneyAfterDiff, economyResult.newEconomyFactor);
      const moodAfterDiff = applyDiff(rawChanges.rawMoodChange * healthResult.healthImpact.moodMultiplier, rawChanges.rawMoodChange > 0, diffModifiers);
      const intelligenceAfterDiff = applyDiff(rawChanges.rawIntelligenceChange, rawChanges.rawIntelligenceChange > 0, diffModifiers);
      const charmAfterDiff = applyDiff(rawChanges.rawCharmChange, rawChanges.rawCharmChange > 0, diffModifiers);
      const creativityAfterDiff = applyDiff(rawChanges.rawCreativityChange, rawChanges.rawCreativityChange > 0, diffModifiers);
      const luckAfterDiff = applyDiff(rawChanges.rawLuckChange, rawChanges.rawLuckChange > 0, diffModifiers);
      const karmaAfterDiff = applyDiff(rawChanges.rawKarmaChange, rawChanges.rawKarmaChange > 0, diffModifiers);
      
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
      
      const newHealth = clamp(state.stats.health + totalHealthChange, 0, Math.max(state.stats.maxHealth, 999));
      const newEnergy = clamp(state.stats.energy + energyChange + 10, 0, Math.max(state.stats.maxEnergy, 200));
      const newMoney = state.stats.money + moneyChange;
      const newTotalMoneyEarned = state.stats.totalMoneyEarned + Math.max(0, moneyAfterDiff);
      const newMood = clamp(state.stats.mood + moodChange, 0, 100);
      const newIntelligence = clamp(state.stats.intelligence + intelligenceChange, 0, 200);
      const newCharm = clamp(state.stats.charm + charmChange, 0, 150);
      const newCreativity = clamp(state.stats.creativity + creativityChange, 0, 200);
      const newLuck = clamp(state.stats.luck + luckChange, 0, 150);
      const newKarma = clamp(state.stats.karma + karmaChange, 0, 150);
      const newConsecutiveHappyYears = newMood >= 90 ? state.consecutiveHappyYears + 1 : 0;
      
      const achievementResult = checkAchievements(
        newAge, newTotalMoneyEarned, newIntelligence, newCharm, newCreativity,
        newLuck, newConsecutiveHappyYears, newHealth, newEnergy, state.achievements
      );
      
      const healthLogEntry = buildHealthLogEntry(newAge, healthResult.healthStatusChanged, healthResult.newHealthStatus);
      
      const gameOverResult = checkGameOver(
        state, newAge, newHealth, newEnergy, newMoney, newMood,
        newIntelligence, newCharm, newCreativity, newLuck, newKarma,
        newTotalMoneyEarned, baseStatChanges.isMarried, economyResult.newEconomyFactor,
        healthResult.newHealthStatus, careerResult, baseStatChanges,
        action.payload, economyResult.economyLogEntry, healthLogEntry,
        achievementResult.updatedAchievements, achievementResult.newlyUnlocked,
        newConsecutiveHappyYears
      );
      
      if (gameOverResult.shouldGameOver) {
        return gameOverResult.newState;
      }

      const mergedSkills = { ...state.stats.skills };
      if (baseStatChanges.skills) {
        for (const [skillName, skillValue] of Object.entries(baseStatChanges.skills)) {
          if (typeof skillValue === 'number') {
            mergedSkills[skillName as keyof typeof mergedSkills] = Math.max(
              0,
              Math.min(10, (mergedSkills[skillName as keyof typeof mergedSkills] || 0) + skillValue)
            );
          }
        }
      }

      const preStats: PlayerStats = {
        ...state.stats,
        ...careerResult.newStats,
        age: newAge,
        health: Math.max(0, newHealth),
        maxHealth: state.stats.maxHealth,
        energy: newEnergy,
        maxEnergy: state.stats.maxEnergy,
        money: newMoney,
        mood: newMood,
        intelligence: newIntelligence,
        charm: newCharm,
        creativity: newCreativity,
        luck: newLuck,
        karma: newKarma,
        totalMoneyEarned: newTotalMoneyEarned,
        isMarried: baseStatChanges.isMarried !== undefined ? baseStatChanges.isMarried : state.stats.isMarried,
        economyFactor: economyResult.newEconomyFactor,
        healthStatus: healthResult.newHealthStatus,
        skillPoints: state.stats.skillPoints + careerResult.extraSkillPoints + (baseStatChanges.skillPoints || 0),
        skills: mergedSkills,
        houseLevel: baseStatChanges.houseLevel !== undefined ? baseStatChanges.houseLevel as 0|1|2|3|4 : state.stats.houseLevel,
        carLevel: baseStatChanges.carLevel !== undefined ? baseStatChanges.carLevel as 0|1|2|3 : state.stats.carLevel,
        jobLevel: baseStatChanges.jobLevel !== undefined ? baseStatChanges.jobLevel as 0|1|2|3|4|5 : state.stats.jobLevel,
        isUnemployed: baseStatChanges.isUnemployed !== undefined ? baseStatChanges.isUnemployed : state.stats.isUnemployed,
        career: baseStatChanges.career !== undefined ? baseStatChanges.career : state.stats.career,
        partner: baseStatChanges.partner !== undefined ? baseStatChanges.partner : state.stats.partner,
        children: baseStatChanges.children !== undefined ? baseStatChanges.children : state.stats.children,
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
          ...economyResult.economyLogEntry,
          ...healthLogEntry,
          ...state.logs.slice(0, 79 - economyResult.economyLogEntry.length - healthLogEntry.length),
        ],
        achievements: achievementResult.updatedAchievements,
        newlyUnlockedAchievements: achievementResult.newlyUnlocked,
        consecutiveHappyYears: newConsecutiveHappyYears,
        currentEventId: null,
      };

      return stateAfterTick;
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

    case 'UPDATE_MARRIAGE_STATUS': {
      const { candidate, isMarried } = action.payload;
      return {
        ...state,
        stats: {
          ...state.stats,
          isMarried: isMarried,
          partner: candidate ? {
            has: true,
            name: candidate.name,
            relationshipQuality: candidate.quality,
            marriageYears: 0,
          } : state.stats.partner,
        },
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

    case 'START_NG_PLUS': {
      const legacyStats = state.stats;
      const ngPlusCount = (state.ngPlusCount || 0) + 1;
      
      const baseStats = {
        ...initialState.stats,
        luck: Math.min(150, initialState.stats.luck + Math.round(5 * action.payload.legacyData.bonus_multiplier * (1 + (ngPlusCount - 1) * 0.05))),
        karma: Math.min(150, initialState.stats.karma + Math.round(5 * action.payload.legacyData.bonus_multiplier * (1 + (ngPlusCount - 1) * 0.05))),
      };
      
      const bonusSkills = { ...initialState.stats.skills };
      const skillBonus = Math.round(3 * action.payload.legacyData.bonus_multiplier * (1 + (ngPlusCount - 1) * 0.05));
      Object.keys(bonusSkills).forEach((key) => {
        bonusSkills[key as keyof typeof bonusSkills] = Math.max(0, bonusSkills[key as keyof typeof bonusSkills] + skillBonus);
      });
      baseStats.skills = bonusSkills;
      
      if (['S', 'SS', 'SSS'].includes(action.payload.legacyData.tier)) {
        baseStats.money = Math.max(0, initialState.stats.money + Math.round(10000 * action.payload.legacyData.bonus_multiplier * (1 + (ngPlusCount - 1) * 0.05)));
      } else if (['A', 'B'].includes(action.payload.legacyData.tier)) {
        baseStats.money = Math.max(0, initialState.stats.money + Math.round(5000 * action.payload.legacyData.bonus_multiplier * (1 + (ngPlusCount - 1) * 0.05)));
      }
      
      if (['A', 'S', 'SS', 'SSS'].includes(action.payload.legacyData.tier)) {
        baseStats.intelligence = Math.min(100, initialState.stats.intelligence + Math.round(5 * action.payload.legacyData.bonus_multiplier * (1 + (ngPlusCount - 1) * 0.05)));
      }
      
      if (['B', 'A', 'S', 'SS', 'SSS'].includes(action.payload.legacyData.tier)) {
        baseStats.charm = Math.min(100, initialState.stats.charm + Math.round(3 * action.payload.legacyData.bonus_multiplier * (1 + (ngPlusCount - 1) * 0.05)));
      }
      
      return {
        ...initialState,
        stats: baseStats,
        phase: 'LANDING',
        ngPlusCount,
        legacyData: action.payload.legacyData,
        achievements: [...initialState.achievements],
        eventChains: {},
        secretMissions: [...initialState.secretMissions],
        endingsSeen: [...(state.endingsSeen || [])],
        version: initialState.version,
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
        characterName: (loaded as any).characterName ?? initialState.characterName,
        familyName: (loaded as any).familyName ?? initialState.familyName,
        gender: (loaded as any).gender ?? initialState.gender,
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
