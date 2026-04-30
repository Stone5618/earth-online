/**
 * Game Actions — 游戏操作逻辑
 * 
 * Encapsulates all game action handlers:
 * - tickYear (advance year with choice)
 * - restAndRecover
 * - determineEventType
 * - Signal checking (marriage, childbirth, death)
 */

import { startTransition } from 'react';
import { api } from '../../../api/client';
import type { GameEvent, PlayerStats, GameState } from '../types';

export interface ChoiceResultData {
  outcomeText: string;
  statChanges: Partial<PlayerStats>;
}

export interface BackendChoiceResult {
  stat_changes?: Record<string, number>;
  outcome_text?: string;
  event_type?: string;
  marriage_candidate?: { name: string; age: number; quality: number };
  childbirth?: { name: string; gender: string; born_at: number };
  is_dead?: boolean;
  death_reason?: string;
  final_title?: string;
  character?: Record<string, unknown>;
  character_diff?: Record<string, unknown>;
}

/**
 * Determines the type of event based on stat changes
 */
export function determineEventType(statChanges: Partial<PlayerStats>): 'normal' | 'positive' | 'negative' | 'milestone' {
  let score = 0;
  const weights = { health: 3, energy: 2, money: 2, mood: 2, intelligence: 1, charm: 1, creativity: 1, luck: 1, karma: 1 };
  
  for (const [key, value] of Object.entries(statChanges)) {
    const weight = weights[key as keyof typeof weights] || 1;
    score += (Number(value) || 0) * weight;
  }
  
  if (score > 20) return 'positive';
  if (score < -20) return 'negative';
  return 'normal';
}

/**
 * Advances the year by processing a choice
 * Handles both online (API) and fallback local modes
 */
export async function tickYear(
  params: {
    choiceIndex: number;
    event: GameEvent;
    resolvedActionText: string;
    resolvedStatChanges: Partial<PlayerStats>;
    resolvedLogEventText: string;
    currentAge: number;
    charId: number | null;
  },
  dispatch: React.Dispatch<any>,
  onSignal?: (signal: 'marriage' | 'childbirth', data: any) => void,
  onDeath?: (deathReason: string, finalTitle: string) => void,
  onClearOnlineEvent?: () => void,
): Promise<ChoiceResultData | null> {
  const { choiceIndex, event, resolvedActionText, resolvedStatChanges, resolvedLogEventText, currentAge, charId } = params;

  if (charId) {
    const { data: backendResult, error } = await api.makeChoice(charId, event.text, choiceIndex);
    if (backendResult && !error) {
      return processBackendResult(
        backendResult as BackendChoiceResult,
        resolvedActionText,
        resolvedStatChanges,
        resolvedLogEventText,
        currentAge,
        event,
        dispatch,
        onSignal,
        onDeath,
        onClearOnlineEvent,
      );
    }
  }

  // Fallback to local logic
  const choice = event.choices[choiceIndex];
  if (!choice) return null;

  const eventType = (choice as any).eventType || event.eventType || determineEventType(resolvedStatChanges);
  
  startTransition(() => {
    dispatch({ type: 'TRIGGER_EVENT', payload: { eventId: event.id, year: currentAge } });
    dispatch({
      type: 'TICK_YEAR',
      payload: {
        action: resolvedActionText,
        statChanges: resolvedStatChanges,
        event: resolvedLogEventText,
        eventType,
      },
    });
  });

  return { outcomeText: resolvedLogEventText, statChanges: resolvedStatChanges };
}

/**
 * Processes the backend choice result
 */
function processBackendResult(
  backendResult: BackendChoiceResult,
  fallbackActionText: string,
  fallbackStatChanges: Partial<PlayerStats>,
  fallbackLogText: string,
  currentAge: number,
  event: GameEvent,
  dispatch: React.Dispatch<any>,
  onSignal?: (signal: 'marriage' | 'childbirth', data: any) => void,
  onDeath?: (deathReason: string, finalTitle: string) => void,
  onClearOnlineEvent?: () => void,
): ChoiceResultData | null {
  const backendStats = backendResult.stat_changes as Partial<PlayerStats> | undefined;
  const backendOutcome = backendResult.outcome_text;
  const backendEventType = backendResult.event_type;

  // Check marriage candidate signal
  const mc = backendResult.marriage_candidate;
  if (mc && onSignal) {
    onSignal('marriage', mc);
  }

  // Check childbirth signal
  const cb = backendResult.childbirth;
  if (cb && onSignal) {
    onSignal('childbirth', cb);
  }

  // Check is_dead
  if (backendResult.is_dead && onDeath) {
    const deathReason = backendResult.death_reason || '未知';
    const finalTitle = backendResult.final_title || '';
    onDeath(deathReason, finalTitle);
    return null;
  }

  // Clear online event for next fetch
  onClearOnlineEvent?.();

  const finalStatChanges = backendStats || fallbackStatChanges;
  
  // Extract character state changes from backend (for marriage, career, etc.)
  const characterDiff = backendResult.character_diff as Record<string, unknown> | undefined;
  if (characterDiff) {
    // Merge character diff into stat changes for frontend state sync
    Object.entries(characterDiff).forEach(([key, value]) => {
      if (key === 'is_married' && typeof value === 'boolean') {
        (finalStatChanges as Record<string, unknown>)['isMarried'] = value;
      }
    });
  }
  
  startTransition(() => {
    dispatch({ type: 'TRIGGER_EVENT', payload: { eventId: event.id, year: currentAge } });
    dispatch({
      type: 'TICK_YEAR',
      payload: {
        action: backendOutcome || fallbackActionText,
        statChanges: finalStatChanges,
        event: backendOutcome || fallbackLogText,
        eventType: backendEventType || determineEventType(backendStats || {}),
      },
    });
  });

  return {
    outcomeText: backendOutcome || fallbackLogText,
    statChanges: finalStatChanges,
  };
}

/**
 * Rest and recover action
 */
export function restAndRecover(
  state: { money: number; age: number },
  dispatch: React.Dispatch<any>,
): void {
  const moneyCost = Math.max(0, Math.floor(state.money * 0.1));
  const statChanges: Partial<PlayerStats> = {
    energy: 25,
    health: 5,
    mood: 5,
    money: -moneyCost,
  };
  
  startTransition(() => {
    dispatch({ type: 'TRIGGER_EVENT', payload: { eventId: 'rest_year', year: state.age } });
    dispatch({
      type: 'TICK_YEAR',
      payload: {
        action: '休息恢复',
        statChanges,
        event: moneyCost > 0 ? '你选择休息恢复，花了些钱犒劳自己' : '你在家好好休息了一下',
        eventType: 'positive',
      },
    });
  });
}
