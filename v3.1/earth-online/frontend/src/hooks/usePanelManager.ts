/**
 * usePanelManager - 统一面板状态管理
 * 
 * Manages all UI panel states (save, settings, guide, etc.) using a Record-based approach.
 * Eliminates duplicate state definitions across App.tsx and GameHUD.tsx.
 * 
 * Usage:
 *   const { openPanel, closePanel, togglePanel, isPanelOpen, closeAll, savePanelMode, setSavePanelMode } = usePanelManager();
 * 
 *   openPanel('save', 'load');  // opens save panel with mode='load'
 *   closePanel('save');
 *   togglePanel('settings');
 *   isPanelOpen('guide');       // returns boolean
 *   closeAll();                 // closes all panels
 */

import { useState, useCallback, useRef, useMemo } from 'react';

export type PanelKey =
  | 'save'
  | 'settings'
  | 'guide'
  | 'skills'
  | 'achievements'
  | 'family'
  | 'backgroundSelector'
  | 'login'
  | 'leaderboard';

export type SavePanelMode = 'save' | 'load';

interface UsePanelManagerOptions {
  /** Panels that should be open on initialization */
  initialOpen?: PanelKey[];
  /** Initial save panel mode */
  initialSaveMode?: SavePanelMode;
}

interface UsePanelManagerReturn {
  /** Open a panel. Use savePanelMode for save panel. */
  openPanel: (panel: PanelKey, mode?: SavePanelMode) => void;
  /** Close a panel */
  closePanel: (panel: PanelKey) => void;
  /** Toggle a panel open/closed */
  togglePanel: (panel: PanelKey, mode?: SavePanelMode) => void;
  /** Check if a panel is open */
  isPanelOpen: (panel: PanelKey) => boolean;
  /** Close all panels at once */
  closeAll: () => void;
  /** Current save panel mode (save or load) */
  savePanelMode: SavePanelMode;
  /** Set save panel mode without changing open state */
  setSavePanelMode: (mode: SavePanelMode) => void;
}

const INITIAL_PANEL_STATE: Record<PanelKey, boolean> = {
  save: false,
  settings: false,
  guide: false,
  skills: false,
  achievements: false,
  family: false,
  backgroundSelector: false,
  login: false,
  leaderboard: false,
};

export function usePanelManager(options: UsePanelManagerOptions = {}): UsePanelManagerReturn {
  const { initialOpen = [], initialSaveMode = 'load' } = options;

  const [openPanels, setOpenPanels] = useState<Record<PanelKey, boolean>>(() => {
    const state = { ...INITIAL_PANEL_STATE };
    initialOpen.forEach(panel => { state[panel] = true; });
    return state;
  });
  const [savePanelMode, setSavePanelModeState] = useState<SavePanelMode>(initialSaveMode);

  const savePanelModeRef = useRef(savePanelMode);
  savePanelModeRef.current = savePanelMode;

  const openPanel = useCallback((panel: PanelKey, mode?: SavePanelMode) => {
    setOpenPanels((prev) => ({ ...prev, [panel]: true }));
    if (panel === 'save' && mode) {
      setSavePanelModeState(mode);
    }
  }, []);

  const closePanel = useCallback((panel: PanelKey) => {
    setOpenPanels((prev) => ({ ...prev, [panel]: false }));
  }, []);

  const togglePanel = useCallback((panel: PanelKey, mode?: SavePanelMode) => {
    setOpenPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
    if (panel === 'save' && mode) {
      setSavePanelModeState(mode);
    }
  }, []);

  const isPanelOpen = useCallback(
    (panel: PanelKey) => openPanels[panel],
    [openPanels],
  );

  const closeAll = useCallback(() => {
    setOpenPanels({ ...INITIAL_PANEL_STATE });
  }, []);

  const setSavePanelMode = useCallback((mode: SavePanelMode) => {
    setSavePanelModeState(mode);
  }, []);

  return {
    openPanel,
    closePanel,
    togglePanel,
    isPanelOpen,
    closeAll,
    savePanelMode,
    setSavePanelMode,
  };
}
