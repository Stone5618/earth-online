import type { PlayerStats } from '../core/types';

/**
 * 经济系统 - 管理经济周期、收入计算等
 */

export type EconomyState = 'boom' | 'normal' | 'crisis';

/**
 * 计算经济因子（周期性波动）
 */
export function calculateEconomyFactor(age: number): number {
  const period = 10; // 经济周期10年
  const wave = Math.sin((age / period) * Math.PI * 2) * 0.2;
  return Math.round((1 + wave) * 100) / 100;
}

/**
 * 获取经济状态
 */
export function getEconomyState(factor: number): EconomyState {
  if (factor >= 1.1) return 'boom';
  if (factor <= 0.9) return 'crisis';
  return 'normal';
}

/**
 * 应用经济因子到金钱变化
 */
export function applyEconomyToMoneyChange(moneyChange: number, economyFactor: number): number {
  return Math.round(moneyChange * economyFactor);
}

/**
 * 格式化金钱显示
 */
export function formatMoney(money: number): string {
  const isNegative = money < 0;
  const absMoney = Math.abs(money);
  
  let formatted = '';
  if (absMoney < 1000) {
    formatted = absMoney.toString();
  } else if (absMoney >= 1000 && absMoney < 10000) {
    formatted = (absMoney / 1000).toFixed(1) + '千';
  } else if (absMoney >= 10000 && absMoney < 1000000) {
    formatted = (absMoney / 10000).toFixed(1) + '万';
  } else if (absMoney >= 1000000 && absMoney < 100000000) {
    formatted = (absMoney / 1000000).toFixed(1) + 'M';
  } else {
    formatted = (absMoney / 100000000).toFixed(1) + 'B';
  }
  
  return isNegative ? '-' + formatted : formatted;
}

/**
 * 获取经济状态描述
 */
export function getEconomyStateDescription(state: EconomyState): string {
  const descriptions: Record<EconomyState, string> = {
    boom: '经济繁荣',
    normal: '经济正常',
    crisis: '经济危机'
  };
  return descriptions[state];
}

/**
 * 获取经济状态图标
 */
export function getEconomyStateIcon(state: EconomyState): string {
  const icons: Record<EconomyState, string> = {
    boom: '📈',
    normal: '➡️',
    crisis: '📉'
  };
  return icons[state];
}

/**
 * 计算养老金（基于职业等级）
 */
export function calculatePension(stats: PlayerStats): number {
  const basePension = 5000;
  const jobLevelBonus = stats.jobLevel * 3000;
  return basePension + jobLevelBonus;
}

export default {
  calculateEconomyFactor,
  getEconomyState,
  applyEconomyToMoneyChange,
  formatMoney,
  getEconomyStateDescription,
  getEconomyStateIcon,
  calculatePension
};
