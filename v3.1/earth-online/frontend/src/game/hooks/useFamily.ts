/**
 * useFamily Hook
 * 
 * Encapsulates all family-related business logic:
 * - Marriage proposal acceptance/decline
 * - Spouse interactions
 * - Childbirth handling
 * - Divorce process
 * - Family data fetching
 * 
 * This hook bridges GameContext state with the Family API,
 * providing a clean interface for UI components.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameState } from '@/game/GameContext';
import { useOnlineAwareGame } from '@/game/OnlineAwareGameProvider';
import { useToast } from '@/components/game/ToastNotification';
import {
  getFamilySummary,
  acceptMarriage,
  declineMarriage,
  divorce as apiDivorce,
  interactWithSpouse,
  triggerChildbirth,
  clearFamilyCache,
  findMarriageCandidate,
} from '@/api/family';
import {
  emitMarriageAccepted,
  emitChildbirth,
  emitDivorce,
  emitSpouseInteraction,
} from '@/components/game/family/events';
import type {
  FamilySummary,
  SpouseInfo,
  ChildInfo,
  MarriageCandidate,
  WeddingCeremonyData,
  ChildbirthData,
} from '@/game/core/types/family';

interface UseFamilyReturn {
  // Family data
  familySummary: FamilySummary | null;
  isLoading: boolean;
  refreshFamilyData: () => Promise<void>;
  
  // Marriage operations
  acceptProposal: (candidateId: string) => Promise<WeddingCeremonyData | null>;
  declineProposal: (candidateId: string) => Promise<boolean>;
  findNewCandidate: () => Promise<MarriageCandidate | null>;
  
  // Spouse operations
  interactWithSpouse: (
    type: 'date' | 'gift' | 'talk' | 'travel',
    amount?: number
  ) => Promise<boolean>;
  
  // Divorce
  initiateDivorce: (reason?: string) => Promise<boolean>;
  
  // Childbirth
  handleChildbirth: () => Promise<ChildbirthData | null>;
}

export function useFamily(): UseFamilyReturn {
  const { state } = useGameState();
  const { showToast } = useToast();
  const { backendCharId } = useOnlineAwareGame();
  const [familySummary, setFamilySummary] = useState<FamilySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Refresh family data from backend
   */
  const refreshFamilyData = useCallback(async () => {
    if (!backendCharId) return;

    setIsLoading(true);
    try {
      const summary = await getFamilySummary(backendCharId);
      if (isMountedRef.current && summary) {
        setFamilySummary(summary);
      }
    } catch (error) {
      console.error('Failed to refresh family data:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [backendCharId]);

  /**
   * Accept marriage proposal
   */
  const acceptProposal = useCallback(async (candidateId: string): Promise<WeddingCeremonyData | null> => {
    if (!backendCharId) {
      showToast('无法接受求婚：角色信息缺失', 'error');
      return null;
    }

    setIsLoading(true);
    try {
      const ceremony = await acceptMarriage(backendCharId, candidateId);
      if (ceremony) {
        // Emit event for other components to react
        emitMarriageAccepted(candidateId, ceremony.spouse.name);
        
        // Clear cache and refresh
        clearFamilyCache();
        await refreshFamilyData();
        
        showToast(`💍 婚礼完成！${ceremony.spouse.name} 成为了你的配偶`, 'success');
        return ceremony;
      } else {
        showToast('结婚失败，请稍后重试', 'error');
        return null;
      }
    } catch (error) {
      console.error('Failed to accept marriage:', error);
      showToast('结婚失败，发生未知错误', 'error');
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [showToast, refreshFamilyData, backendCharId]);

  /**
   * Decline marriage proposal
   */
  const declineProposal = useCallback(async (candidateId: string): Promise<boolean> => {
    if (!backendCharId) return false;

    try {
      const success = await declineMarriage(backendCharId, candidateId);
      if (success) {
        showToast('你婉拒了这段缘分', 'info');
      }
      return success;
    } catch (error) {
      console.error('Failed to decline marriage:', error);
      return false;
    }
  }, [showToast, backendCharId]);

  /**
   * Find new marriage candidate
   */
  const findNewCandidate = useCallback(async (): Promise<MarriageCandidate | null> => {
    if (!backendCharId) return null;

    setIsLoading(true);
    try {
      const candidate = await findMarriageCandidate(backendCharId);
      if (candidate) {
        showToast(`💞 你遇到了 ${candidate.name}，契合度：${candidate.compatibility}%`, 'info');
      }
      return candidate;
    } catch (error) {
      console.error('Failed to find marriage candidate:', error);
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [showToast, backendCharId]);

  /**
   * Interact with spouse
   */
  const handleSpouseInteraction = useCallback(async (
    type: 'date' | 'gift' | 'talk' | 'travel',
    amount?: number
  ): Promise<boolean> => {
    if (!backendCharId) return false;

    try {
      const result = await interactWithSpouse(backendCharId, type, amount);
      if (result && result.success) {
        emitSpouseInteraction(type, result.intimacy_change);
        
        // Update local state
        if (isMountedRef.current && familySummary?.spouse) {
          setFamilySummary({
            ...familySummary,
            spouse: {
              ...familySummary.spouse,
              intimacy: Math.max(0, Math.min(100, 
                familySummary.spouse.intimacy + result.intimacy_change
              )),
            },
          });
        }
        
        const messages = {
          date: '约会很愉快',
          gift: '礼物送到了心坎上',
          talk: '深入的交谈增进了感情',
          travel: '旅行让你们重温了初心',
        };
        showToast(`💕 ${messages[type]}，亲密度 ${result.intimacy_change > 0 ? '+' : ''}${result.intimacy_change}`, 'success');
        return true;
      } else {
        showToast('互动失败，请稍后重试', 'error');
        return false;
      }
    } catch (error) {
      console.error('Failed to interact with spouse:', error);
      showToast('互动失败，发生未知错误', 'error');
      return false;
    }
  }, [showToast, familySummary, backendCharId]);

  /**
   * Initiate divorce
   */
  const initiateDivorce = useCallback(async (reason?: string): Promise<boolean> => {
    if (!backendCharId) return false;

    const spouseName = familySummary?.spouse?.name || '配偶';
    
    try {
      const success = await apiDivorce(backendCharId, reason);
      if (success) {
        emitDivorce(reason || '感情破裂', spouseName);
        
        // Clear cache and refresh
        clearFamilyCache();
        await refreshFamilyData();
        
        showToast(`💔 你与 ${spouseName} 的婚姻结束了`, 'error');
        return true;
      } else {
        showToast('离婚失败，请稍后重试', 'error');
        return false;
      }
    } catch (error) {
      console.error('Failed to initiate divorce:', error);
      showToast('离婚失败，发生未知错误', 'error');
      return false;
    }
  }, [showToast, familySummary, refreshFamilyData, backendCharId]);

  /**
   * Handle childbirth event
   */
  const handleChildbirth = useCallback(async (): Promise<ChildbirthData | null> => {
    if (!backendCharId) return null;

    try {
      const child = await triggerChildbirth(backendCharId);
      if (child) {
        emitChildbirth(child.name, child.gender, child.born_at);
        
        // Clear cache and refresh
        clearFamilyCache();
        await refreshFamilyData();
        
        showToast(`👶 ${child.name} 出生了！欢迎这个小生命`, 'success');
        return child;
      } else {
        showToast('未能生育，请稍后再试', 'info');
        return null;
      }
    } catch (error) {
      console.error('Failed to handle childbirth:', error);
      showToast('生育失败，发生未知错误', 'error');
      return null;
    }
  }, [showToast, refreshFamilyData, backendCharId]);

  // Auto-refresh family data when character changes
  useEffect(() => {
    if (backendCharId) {
      refreshFamilyData();
    }
  }, [state.stats.age, refreshFamilyData, backendCharId]);

  return {
    familySummary,
    isLoading,
    refreshFamilyData,
    acceptProposal,
    declineProposal,
    findNewCandidate,
    interactWithSpouse: handleSpouseInteraction,
    initiateDivorce,
    handleChildbirth,
  };
}
