import type { GameLog } from '../types';
import { getHealthConditionName, getHealthConditionColor } from '../../systems/healthSystem';

export function buildHealthLogEntry(
  newAge: number,
  healthStatusChanged: boolean,
  newHealthStatus: any
): GameLog[] {
  if (!healthStatusChanged) return [];

  return [
    {
      year: newAge,
      event: `【健康变化】健康状态变为：${getHealthConditionName(newHealthStatus.condition)}${newHealthStatus.duration > 0 ? `，持续 ${newHealthStatus.duration} 年` : ''}`,
      type: newHealthStatus.condition === 'healthy' ? 'positive' : 'negative',
    },
  ];
}
