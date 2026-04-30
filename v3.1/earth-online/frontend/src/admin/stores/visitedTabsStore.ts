import { create } from 'zustand';

export interface VisitedTab {
  key: string;
  label: string;
  path: string;
  icon?: string;
}

interface VisitedTabsState {
  tabs: VisitedTab[];
  activeKey: string | null;
  addTab: (tab: VisitedTab) => void;
  removeTab: (key: string) => void;
  setActive: (key: string) => void;
  closeOthers: (key: string) => void;
  closeAll: () => void;
}

export const useVisitedTabsStore = create<VisitedTabsState>((set, get) => ({
  tabs: [],
  activeKey: null,

  addTab: (tab) =>
    set((state) => {
      const exists = state.tabs.some((t) => t.key === tab.key);
      if (exists) {
        return { activeKey: tab.key };
      }
      return {
        tabs: [...state.tabs, tab],
        activeKey: tab.key,
      };
    }),

  removeTab: (key) =>
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.key !== key);
      const newActive = state.activeKey === key
        ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].key : null)
        : state.activeKey;
      return { tabs: newTabs, activeKey: newActive };
    }),

  setActive: (key) => set({ activeKey: key }),

  closeOthers: (key) =>
    set((state) => {
      const kept = state.tabs.filter((t) => t.key === key);
      return { tabs: kept, activeKey: key };
    }),

  closeAll: () => set({ tabs: [], activeKey: null }),
}));
