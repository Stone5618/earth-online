import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FontSize = 'small' | 'normal' | 'large';

// Settings interface
interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  particlesEnabled: boolean;
  animationsEnabled: boolean;
  showAvatars: boolean;
  showAges: boolean;
  fontSize: FontSize;
  highContrast: boolean;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  musicEnabled: true,
  particlesEnabled: true,
  animationsEnabled: true,
  showAvatars: true,
  showAges: true,
  fontSize: 'normal',
  highContrast: false,
};

// Context value interface
interface SettingsContextValue {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
});

// Provider props
interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  // Load settings from localStorage on mount
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('earth-online-settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore errors, use defaults
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('earth-online-settings', JSON.stringify(settings));
  }, [settings]);

  // Update settings with partial changes
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Reset settings to default
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Hook for using the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
