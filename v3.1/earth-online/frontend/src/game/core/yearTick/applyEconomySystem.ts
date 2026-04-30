import { calculateEconomyFactor, getEconomyState, applyEconomyToMoneyChange } from '../../systems/economySystem';
import type { GameLog } from '../types';

export interface EconomyResult {
  newEconomyFactor: number;
  currentEconomyState: string;
  newEconomyState: string;
  economyStateChanged: boolean;
  economyLogEntry: GameLog[];
}

export function applyEconomySystem(newAge: number, currentEconomyFactor: number): EconomyResult {
  const newEconomyFactor = calculateEconomyFactor(newAge);
  const currentEconomyState = getEconomyState(currentEconomyFactor);
  const newEconomyState = getEconomyState(newEconomyFactor);
  const economyStateChanged = currentEconomyState !== newEconomyState;
  
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
  
  return {
    newEconomyFactor,
    currentEconomyState,
    newEconomyState,
    economyStateChanged,
    economyLogEntry,
  };
}
