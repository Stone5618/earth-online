import type { PlayerStats } from '../core/types';
import { HOUSE_UPGRADES, CAR_UPGRADES, JOB_UPGRADES } from '../../config/gameConfig';

/**
 * 需求升级系统 - 管理住房、汽车、职业的升级
 */

/**
 * 检查是否可以升级住房
 */
export function canUpgradeHouse(stats: PlayerStats): boolean {
  const currentLevel = stats.houseLevel;
  if (currentLevel >= 4) return false;
  
  const nextUpgrade = HOUSE_UPGRADES[currentLevel + 1];
  if (!nextUpgrade) return false;
  
  if (stats.money < nextUpgrade.cost) return false;
  
  if (nextUpgrade.requirements) {
    if (nextUpgrade.requirements.jobLevel && stats.jobLevel < nextUpgrade.requirements.jobLevel) {
      return false;
    }
    if (nextUpgrade.requirements.charm && stats.charm < nextUpgrade.requirements.charm) {
      return false;
    }
  }
  
  return true;
}

/**
 * 获取住房升级费用
 */
export function getHouseUpgradeCost(stats: PlayerStats): number {
  const currentLevel = stats.houseLevel;
  const nextUpgrade = HOUSE_UPGRADES[currentLevel + 1];
  return nextUpgrade?.cost || 0;
}

/**
 * 检查是否可以升级汽车
 */
export function canUpgradeCar(stats: PlayerStats): boolean {
  const currentLevel = stats.carLevel;
  if (currentLevel >= 3) return false;
  
  const nextUpgrade = CAR_UPGRADES[currentLevel + 1];
  if (!nextUpgrade) return false;
  
  return stats.money >= nextUpgrade.cost;
}

/**
 * 获取汽车升级费用
 */
export function getCarUpgradeCost(stats: PlayerStats): number {
  const currentLevel = stats.carLevel;
  const nextUpgrade = CAR_UPGRADES[currentLevel + 1];
  return nextUpgrade?.cost || 0;
}

/**
 * 检查是否可以升级职业
 */
export function canUpgradeJob(stats: PlayerStats): boolean {
  const currentLevel = stats.jobLevel;
  if (currentLevel >= 5) return false;
  if (stats.retired) return false; // 退休后不能升级
  
  const nextUpgrade = JOB_UPGRADES[currentLevel + 1];
  if (!nextUpgrade) return false;
  
  return true;
}

/**
 * 获取职业收入
 */
export function getJobIncome(stats: PlayerStats): number {
  if (stats.retired) {
    return 0; // 退休后没有工作收入
  }
  const jobUpgrade = JOB_UPGRADES[stats.jobLevel];
  return jobUpgrade?.income || 0;
}

/**
 * 获取住房舒适度加成
 */
export function getHouseComfortBonus(stats: PlayerStats): number {
  const houseUpgrade = HOUSE_UPGRADES[stats.houseLevel];
  return houseUpgrade?.comfort || 0;
}

/**
 * 获取汽车威望加成
 */
export function getCarPrestigeBonus(stats: PlayerStats): number {
  const carUpgrade = CAR_UPGRADES[stats.carLevel];
  return carUpgrade?.prestige || 0;
}

/**
 * 获取当前住房信息
 */
export function getCurrentHouseInfo(stats: PlayerStats) {
  return HOUSE_UPGRADES[stats.houseLevel];
}

/**
 * 获取当前汽车信息
 */
export function getCurrentCarInfo(stats: PlayerStats) {
  return CAR_UPGRADES[stats.carLevel];
}

/**
 * 获取当前职业信息
 */
export function getCurrentJobInfo(stats: PlayerStats) {
  return JOB_UPGRADES[stats.jobLevel];
}

export default {
  canUpgradeHouse,
  getHouseUpgradeCost,
  canUpgradeCar,
  getCarUpgradeCost,
  canUpgradeJob,
  getJobIncome,
  getHouseComfortBonus,
  getCarPrestigeBonus,
  getCurrentHouseInfo,
  getCurrentCarInfo,
  getCurrentJobInfo
};
