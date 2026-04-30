/**
 * Event Fetcher — 后端事件获取与构建
 * 
 * Handles:
 * - Fetching events from backend API
 * - Building currentEvent from backend response
 * - Managing fetch state (lock, cancel)
 * - Retry with exponential backoff (max 3 attempts)
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../../api/client';
import type { GameEvent, PlayerStats, GameState } from '../types';
import { safeRender, safeNumber } from '@/lib/safeRender';

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

interface EventOption {
  text: string;
  hint?: string;
  stat_changes?: Record<string, number>;
  follow_up?: string;
}

interface EventData {
  id?: number;
  title?: string;
  description?: string;
  min_age?: number;
  max_age?: number;
  options?: EventOption[];
  stat_changes?: Record<string, number>;
}

export interface BackendResponse {
  event?: EventData;
  character?: Record<string, unknown>;
  server_context?: Record<string, unknown>;
  is_dead?: boolean;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch event with exponential backoff retry logic
 */
async function fetchEventWithRetry(
  charId: number,
  signal: AbortSignal,
): Promise<BackendResponse | null> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await api.getNextEvent(charId);

      // Check if request was cancelled during the await
      if (signal.aborted) return null;
      
      // Handle API errors
      if (error) {
        lastError = error;
        if (attempt >= MAX_RETRIES) break;
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[EventFetcher] 获取事件失败 (尝试 ${attempt}/${MAX_RETRIES})，${delay}ms 后重试...`,
          error.message,
        );
        await sleep(delay);
        if (signal.aborted) return null;
        continue;
      }

      if (!data) return null;

      return data as BackendResponse;
    } catch (err) {
      lastError = err;

      // If cancelled, stop retrying
      if (signal.aborted) return null;

      // If this is the last attempt, don't sleep
      if (attempt >= MAX_RETRIES) break;

      // Exponential backoff: 1s, 2s, 4s
      const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `[EventFetcher] 获取事件失败 (尝试 ${attempt}/${MAX_RETRIES})，${delay}ms 后重试...`,
        err,
      );
      await sleep(delay);

      // Check cancellation after sleep
      if (signal.aborted) return null;
    }
  }

  // All retries exhausted
  console.error('[EventFetcher] 获取事件失败，已达到最大重试次数', lastError);
  throw lastError;
}

interface EventFetcherReturn {
  currentEvent: GameEvent | null;
  backendEventResponse: BackendResponse | null;
  onlineEventTitle: string | null;
  onlineEventChoices: Array<{ text: string; hint?: string }> | null;
  setOnlineEventTitle: (title: string | null) => void;
  setOnlineEventChoices: (choices: Array<{ text: string; hint?: string }> | null) => void;
}

/**
 * Creates event fetching hooks and computed currentEvent
 */
export function useEventFetcher(
  statePhase: GameState['phase'],
  charId: number | null,
  showToast?: (message: string, type: 'error' | 'success' | 'info' | 'loading') => void,
  isPaused = false,
): EventFetcherReturn {
  const [backendEventResponse, setBackendEventResponse] = useState<BackendResponse | null>(null);
  const [onlineEventTitle, setOnlineEventTitle] = useState<string | null>(null);
  const [onlineEventChoices, setOnlineEventChoices] = useState<Array<{ text: string; hint?: string }> | null>(null);
  const fetchLockRef = useRef(false);
  const isMountedRef = useRef(true);

  // Use ref to access showToast without dependency issues
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Fetch event from backend with retry logic
  useEffect(() => {
    if (!charId || statePhase !== 'PLAYING') return;
    if (isPaused) return;
    if (fetchLockRef.current) return;
    if (onlineEventTitle !== null) return;

    const abortController = new AbortController();
    fetchLockRef.current = true;

    (async () => {
      try {
        const resp = await fetchEventWithRetry(charId, abortController.signal);
        if (abortController.signal.aborted) {
          return;
        }
        if (!isMountedRef.current) {
          return;
        }
        if (!resp) {
          fetchLockRef.current = false;
          return;
        }
        setBackendEventResponse(resp);
        if (resp.event) {
          setOnlineEventTitle(resp.event.title || null);
          setOnlineEventChoices(
            (resp.event.options || []).map((o: EventOption) => ({ 
              text: o.text, 
              hint: o.hint 
            }))
          );
        }
      } catch (err) {
        if (abortController.signal.aborted || !isMountedRef.current) {
          return;
        }
        console.error('[EventFetcher] Error fetching event after retries:', err);
        showToastRef.current?.('获取事件失败，请稍后重试', 'error');
      } finally {
        fetchLockRef.current = false;
      }
    })();

    return () => { 
      abortController.abort(); 
      // Don't reset fetchLockRef here - let the finally block handle it
    };
  }, [statePhase, onlineEventTitle, charId, isPaused]);

  // Build currentEvent from backend data
  const currentEvent = useMemo((): GameEvent | null => {
    if (statePhase !== 'PLAYING') return null;

    if (charId && onlineEventTitle && backendEventResponse) {
      const eventData = backendEventResponse.event || {};
      const backendChoices = eventData.options || [];

      // Safely extract text fields (defensive against object values)
      const eventText = safeRender(eventData.title) ||
                        safeRender(eventData.description) ||
                        safeRender(onlineEventTitle, '未知事件');

      // Validate and sanitize stat_changes
      const sanitizeStatChanges = (changes: unknown): Record<string, number> => {
        if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
          return {};
        }
        const result: Record<string, number> = {};
        for (const [key, value] of Object.entries(changes)) {
          const num = safeNumber(value);
          // Only keep finite numbers
          if (Number.isFinite(num)) {
            result[key] = num;
          }
        }
        return result;
      };

      // Validate backend choices
      const validateChoice = (o: EventOption | any, index: number) => {
        // Ensure o is an object
        if (!o || typeof o !== 'object') {
          return {
            text: `选择 ${index + 1}`,
            statChanges: {} as Record<string, number>,
            followUp: '',
          };
        }

        return {
          text: safeRender(o.text, `选择 ${index + 1}`),
          statChanges: sanitizeStatChanges(o.stat_changes),
          followUp: safeRender(o.hint || o.follow_up, ''),
        };
      };

      return {
        id: `backend_evt_${safeRender(eventData.id)}_${eventText}`,
        minAge: safeNumber(eventData.min_age, 0),
        maxAge: safeNumber(eventData.max_age, 999),
        text: eventText,
        description: safeRender(eventData.description, ''),
        eventType: 'normal' as const,
        choices: (backendChoices.length > 0 ? backendChoices : (onlineEventChoices || []))
          .map((o: EventOption | any, i: number) => validateChoice(o, i)),
      } as GameEvent;
    }

    return null;
  }, [statePhase, onlineEventTitle, onlineEventChoices, backendEventResponse, charId]);

  return {
    currentEvent,
    backendEventResponse,
    onlineEventTitle,
    onlineEventChoices,
    setOnlineEventTitle,
    setOnlineEventChoices,
  };
}

/**
 * Clears the online event state after a choice is made
 */
export function clearOnlineEvent(
  setOnlineEventTitle: (title: string | null) => void,
  setOnlineEventChoices: (choices: Array<{ text: string; hint?: string }> | null) => void,
): void {
  setOnlineEventTitle(null);
  setOnlineEventChoices(null);
}
