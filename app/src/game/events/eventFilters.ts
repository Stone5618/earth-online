import type { GameEvent, FamilyTier, PlayerStats } from '../core/types';

/**
 * 事件过滤系统
 */

export interface EventFilterOptions {
  minAge?: number;
  maxAge?: number;
  familyTier?: FamilyTier | null;
  recentEventIds?: string[];
  lastTriggeredEvents?: Record<string, number>;
  currentAge?: number;
  eventOccurrences?: Record<string, number>;
  stats?: PlayerStats;
}

/**
 * 严格的年龄验证 - 确保未成年人不会触发不合逻辑的事件
 */
export function validateAgeRequirements(event: GameEvent, age: number): boolean {
  const eventId = event.id.toLowerCase();
  const eventText = event.text.toLowerCase();

  // 基础年龄检查
  if (event.minAge > age || event.maxAge < age) {
    return false;
  }

  // 未成年人（<18岁）严格保护
  if (age < 18) {

    // 绝对不允许未成年人触发的事件类型
    const forbiddenKeywords = [
      // 婚姻相关
      'marriage', 'wedding', '求婚', '结婚', 'romance', '恋爱',
      // 购房购车相关
      'house', 'home', '购房', '买房', 'car', 'vehicle', '购车', '买车',
      // 投资/财务相关
      'investment', 'invest', '投资', 'debt', '债务', 'loan', '贷款',
      // 酒精/娱乐场所
      'alcohol', 'drink', '喝酒', '酒吧', '夜店',
      // 其他成年活动
      'retirement', '退休', 'divorce', '离婚'
    ];

    for (const keyword of forbiddenKeywords) {
      if (eventId.includes(keyword) || eventText.includes(keyword)) {
        return false;
      }
    }

    // 额外检查：某些特定事件ID模式（仅未成年人过滤）
    if (
      eventId.startsWith('chain_romance') ||
      eventId.startsWith('late_')
    ) {
      return false;
    }
  }

  // 青少年（16-17岁）可以有部分工作，但严格限制
  if (age >= 16 && age < 18) {
    const eventId = event.id.toLowerCase();
    const eventText = event.text.toLowerCase();

    // 允许的工作相关关键词（兼职/实习）
    const allowedWorkKeywords = ['兼职', '实习', 'part-time', 'internship'];
    const hasAllowedWork = allowedWorkKeywords.some(keyword => 
      eventId.includes(keyword) || eventText.includes(keyword)
    );

    // 禁止的工作相关关键词
    const forbiddenWorkKeywords = ['全职', 'full-time', 'career', '职业', 'promotion', '升职'];
    const hasForbiddenWork = forbiddenWorkKeywords.some(keyword => 
      eventId.includes(keyword) || eventText.includes(keyword)
    );

    if (hasForbiddenWork && !hasAllowedWork) {
      return false;
    }
  }

  // 结婚相关事件 - 必须至少18岁（双重保障）
  if (
    eventId.includes('marriage') ||
    eventId.includes('wedding') ||
    eventId.includes('求婚') ||
    eventId.includes('结婚') ||
    eventId.includes('romance') ||
    eventId.includes('恋爱') ||
    eventId.startsWith('chain_romance')
  ) {
    if (age < 18) {
      return false;
    }
  }

  // 购房相关事件 - 必须至少18岁（双重保障）
  if (
    eventId.includes('house') ||
    eventId.includes('home') ||
    eventId.includes('购房') ||
    eventId.includes('买房')
  ) {
    if (age < 18) {
      return false;
    }
  }

  // 购车相关事件 - 必须至少18岁（双重保障）
  if (
    eventId.includes('car') ||
    eventId.includes('vehicle') ||
    eventId.includes('购车') ||
    eventId.includes('买车')
  ) {
    if (age < 18) {
      return false;
    }
  }

  // 重大职业决策事件 - 必须至少18岁
  if (
    eventId.includes('career_choice') ||
    eventId.includes('career_promotion') ||
    eventId.includes('career_job_change') ||
    eventId.includes('职业选择') ||
    eventId.includes('升职') ||
    eventId.includes('跳槽')
  ) {
    if (age < 18) {
      return false;
    }
  }

  return true;
}

/**
 * 按年龄范围过滤事件（增强版）
 */
export function filterByAge(
  events: GameEvent[],
  age: number
): GameEvent[] {
  return events.filter(event => 
    validateAgeRequirements(event, age)
  );
}

/**
 * 按家族背景过滤事件
 */
export function filterByFamilyTier(
  events: GameEvent[],
  _familyTier: FamilyTier | null
): GameEvent[] {
  return events.filter(() => {
    // 事件条件中如果有家族背景相关，这里可以扩展
    // 目前保留家族背景信息用于 future 扩展
    return true;
  });
}

/**
 * 按冷却时间过滤事件
 */
export function filterByCooldown(
  events: GameEvent[],
  lastTriggeredEvents: Record<string, number>,
  currentAge: number
): GameEvent[] {
  return events.filter(event => {
    if (!event.cooldownYears || !(event.id in lastTriggeredEvents)) {
      return true;
    }
    const lastTriggeredAge = lastTriggeredEvents[event.id];
    const yearsSince = currentAge - lastTriggeredAge;
    return yearsSince >= event.cooldownYears;
  });
}

/**
 * 按最大出现次数过滤事件
 */
export function filterByMaxOccurrences(
  events: GameEvent[],
  eventOccurrences: Record<string, number>
): GameEvent[] {
  return events.filter(event => {
    if (!event.maxOccurrences) {
      return true;
    }
    const currentCount = eventOccurrences[event.id] || 0;
    return currentCount < event.maxOccurrences;
  });
}

/**
 * 排除近期出现过的事件（避免刷屏重复）
 * - 如果排除后一个候选都不剩，则回退为不过滤（保证总能选到事件）
 */
export function filterByRecent(
  events: GameEvent[],
  recentEventIds: string[]
): GameEvent[] {
  if (!recentEventIds || recentEventIds.length === 0) return events;
  const filtered = events.filter(e => !recentEventIds.includes(e.id));
  return filtered.length > 0 ? filtered : events;
}

/**
 * 组合过滤逻辑
 */
export function applyFilters(
  events: GameEvent[],
  options: EventFilterOptions
): GameEvent[] {
  let filteredEvents = [...events];
  
  // 优先使用严格的年龄验证
  if (options.currentAge !== undefined) {
    filteredEvents = filterByAge(filteredEvents, options.currentAge);
  } else if (options.minAge !== undefined && options.maxAge !== undefined) {
    filteredEvents = filterByAge(filteredEvents, (options.minAge + options.maxAge) / 2);
  } else if (options.minAge !== undefined) {
    filteredEvents = filterByAge(filteredEvents, options.minAge);
  }
  
  if (options.familyTier !== undefined) {
    filteredEvents = filterByFamilyTier(filteredEvents, options.familyTier);
  }
  
  if (options.lastTriggeredEvents && options.currentAge !== undefined) {
    filteredEvents = filterByCooldown(filteredEvents, options.lastTriggeredEvents, options.currentAge);
  }
  
  if (options.eventOccurrences) {
    filteredEvents = filterByMaxOccurrences(filteredEvents, options.eventOccurrences);
  }
  
  if (options.recentEventIds) {
    filteredEvents = filterByRecent(filteredEvents, options.recentEventIds);
  }
  
  return filteredEvents;
}
