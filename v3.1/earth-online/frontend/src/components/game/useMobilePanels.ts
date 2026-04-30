import { useState, useCallback } from 'react';

/**
 * 移动端面板状态管理 Hook
 *
 * 统一管理PC端/移动端的面板展开/收起状态，
 * 避免在GameHUD中散落多个useState。
 */
export function useMobilePanels() {
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showMobileLogs, setShowMobileLogs] = useState(false);

  const toggleStats = useCallback(() => {
    setShowMobileStats((prev) => {
      if (prev) return false;
      setShowMobileLogs(false);
      return true;
    });
  }, []);

  const toggleLogs = useCallback(() => {
    setShowMobileLogs((prev) => {
      if (prev) return false;
      setShowMobileStats(false);
      return true;
    });
  }, []);

  const closeAll = useCallback(() => {
    setShowMobileStats(false);
    setShowMobileLogs(false);
  }, []);

  return {
    showMobileStats,
    showMobileLogs,
    toggleStats,
    toggleLogs,
    closeAll,
    setShowMobileStats,
    setShowMobileLogs,
  };
}
