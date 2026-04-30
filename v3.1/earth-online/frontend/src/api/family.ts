/**
 * Family System API Client
 * 
 * Provides type-safe API methods for marriage, family, and relationship operations.
 * Follows the same pattern as the main ApiClient for consistency.
 */

import type { 
  MarriageCandidate, 
  SpouseInfo, 
  ChildInfo, 
  FamilySummary,
  MarriageProposalData,
  ChildbirthData,
  WeddingCeremonyData 
} from '@/game/core/types/family';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  try {
    return localStorage.getItem('earth-online-token');
  } catch {
    return null;
  }
}

/**
 * Make an authenticated API request
 */
async function request<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`Family API request failed: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json() as T;
  } catch (error) {
    console.error(`Family API request error: ${path}`, error);
    return null;
  }
}

// ============================================================
// Family Summary & Info
// ============================================================

/**
 * Get family summary for a character
 */
export async function getFamilySummary(charId: number): Promise<FamilySummary | null> {
  return request<FamilySummary>('GET', `/family/summary?char_id=${charId}`);
}

/**
 * Get spouse information
 */
export async function getSpouseInfo(charId: number): Promise<SpouseInfo | null> {
  return request<SpouseInfo>('GET', `/family/spouse?char_id=${charId}`);
}

/**
 * Get children list
 */
export async function getChildren(charId: number): Promise<ChildInfo[] | null> {
  return request<ChildInfo[]>('GET', `/family/children?char_id=${charId}`);
}

/**
 * Get family tree data
 */
export async function getFamilyTree(charId: number): Promise<Record<string, unknown> | null> {
  return request<Record<string, unknown>>('GET', `/family/tree?char_id=${charId}`);
}

// ============================================================
// Marriage Operations
// ============================================================

/**
 * Find marriage candidate (trigger matchmaking)
 */
export async function findMarriageCandidate(charId: number): Promise<MarriageCandidate | null> {
  return request<MarriageCandidate>('POST', `/family/find_match?char_id=${charId}`);
}

/**
 * Accept marriage proposal
 */
export async function acceptMarriage(charId: number, candidateId: string): Promise<WeddingCeremonyData | null> {
  return request<WeddingCeremonyData>('POST', '/family/marry', {
    char_id: charId,
    candidate_id: candidateId,
  });
}

/**
 * Decline marriage proposal (just logs the decision)
 */
export async function declineMarriage(charId: number, candidateId: string): Promise<boolean> {
  const result = await request<Record<string, unknown>>('POST', '/family/decline', {
    char_id: charId,
    candidate_id: candidateId,
  });
  return result !== null;
}

// ============================================================
// Divorce & Relationship End
// ============================================================

/**
 * Initiate divorce
 */
export async function divorce(charId: number, reason?: string): Promise<boolean> {
  const result = await request<Record<string, unknown>>('POST', '/family/divorce', {
    char_id: charId,
    reason: reason || '感情破裂',
  });
  return result !== null;
}

// ============================================================
// Spouse Interactions
// ============================================================

/**
 * Interact with spouse (date, gift, talk, etc.)
 */
export async function interactWithSpouse(
  charId: number, 
  interactionType: 'date' | 'gift' | 'talk' | 'travel',
  amount?: number
): Promise<{ success: boolean; intimacy_change: number; mood_change: number } | null> {
  return request<Record<string, unknown>>('POST', '/family/interact', {
    char_id: charId,
    interaction_type: interactionType,
    amount: amount || 0,
  }) as Promise<{ success: boolean; intimacy_change: number; mood_change: number } | null>;
}

// ============================================================
// Childbirth & Child Management
// ============================================================

/**
 * Trigger childbirth event
 */
export async function triggerChildbirth(charId: number): Promise<ChildbirthData | null> {
  return request<ChildbirthData>('POST', '/family/childbirth', {
    char_id: charId,
  });
}

/**
 * Get child details
 */
export async function getChildDetails(charId: number, childId: string): Promise<ChildInfo | null> {
  return request<ChildInfo>('GET', `/family/child/${childId}?char_id=${charId}`);
}

/**
 * Interact with child (teach, play, scold, etc.)
 */
export async function interactWithChild(
  charId: number,
  childId: string,
  interactionType: 'teach' | 'play' | 'scold' | 'encourage'
): Promise<{ success: boolean; relationship_change: number } | null> {
  return request<Record<string, unknown>>('POST', '/family/child/interact', {
    char_id: charId,
    child_id: childId,
    interaction_type: interactionType,
  }) as Promise<{ success: boolean; relationship_change: number } | null>;
}

// ============================================================
// API Cache (5 minutes TTL)
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if available and not expired
 */
function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Set cache entry
 */
function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Clear all family API cache
 */
export function clearFamilyCache(): void {
  cache.clear();
}

/**
 * Get family summary with caching
 */
export async function getFamilySummaryCached(charId: number): Promise<FamilySummary | null> {
  const cacheKey = `family_summary_${charId}`;
  const cached = getCached<FamilySummary>(cacheKey);
  if (cached) return cached;

  const data = await getFamilySummary(charId);
  if (data) {
    setCache(cacheKey, data);
  }
  return data;
}

/**
 * Get children list with caching
 */
export async function getChildrenCached(charId: number): Promise<ChildInfo[] | null> {
  const cacheKey = `children_${charId}`;
  const cached = getCached<ChildInfo[]>(cacheKey);
  if (cached) return cached;

  const data = await getChildren(charId);
  if (data) {
    setCache(cacheKey, data);
  }
  return data;
}
