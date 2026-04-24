import type { PlayerStats, ChallengeConfig } from '../core/types';
import { CHALLENGES } from '../../config/gameConfig';

/**
 * 挑战模式系统 - 管理挑战配置、胜利条件判定等
 */

/**
 * 获取所有可用挑战
 */
export function getAvailableChallenges(): ChallengeConfig[] {
  return CHALLENGES;
}

/**
 * 检查挑战胜利条件
 */
export function checkChallengeVictory(stats: PlayerStats, challenge: ChallengeConfig): boolean {
  return challenge.victoryCondition(stats);
}

/**
 * 应用挑战初始状态
 */
export function applyChallengeInitialStats(stats: PlayerStats, challenge?: ChallengeConfig): PlayerStats {
  if (!challenge || !challenge.initialStats) {
    return { ...stats };
  }
  
  return {
    ...stats,
    ...challenge.initialStats
  };
}

/**
 * 检查挑战是否禁用浪漫
 */
export function isRomanceDisabled(challenge?: ChallengeConfig): boolean {
  return challenge?.rules?.disableRomance || false;
}

/**
 * 获取挑战收入倍数
 */
export function getChallengeIncomeMultiplier(challenge?: ChallengeConfig): number {
  return challenge?.rules?.incomeMultiplier || 1.0;
}

/**
 * 获取挑战最大年龄
 */
export function getChallengeMaxAge(challenge?: ChallengeConfig): number | undefined {
  return challenge?.rules?.maxAge;
}

/**
 * 获取挑战技能点倍数
 */
export function getChallengeSkillPointMultiplier(challenge?: ChallengeConfig): number {
  return challenge?.rules?.skillPointsMultiplier || 1.0;
}

/**
 * 获取挑战健康倍数
 */
export function getChallengeHealthMultiplier(challenge?: ChallengeConfig): number {
  return challenge?.rules?.healthMultiplier || 1.0;
}

/**
 * 根据ID获取挑战
 */
export function getChallengeById(id: string): ChallengeConfig | undefined {
  return CHALLENGES.find(c => c.id === id);
}

export default {
  getAvailableChallenges,
  checkChallengeVictory,
  applyChallengeInitialStats,
  isRomanceDisabled,
  getChallengeIncomeMultiplier,
  getChallengeMaxAge,
  getChallengeSkillPointMultiplier,
  getChallengeHealthMultiplier,
  getChallengeById
};
