import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

// OscillatorType is from Web Audio API

interface SoundContextType {
  playSound: (type: 'achievement' | 'click' | 'success' | 'error' | 'tick') => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

// Generate simple beep sounds using Web Audio API
function createBeep(frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') {
  return () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.log('Audio not supported');
    }
  };
}

const sounds = {
  achievement: () => {
    const beep1 = createBeep(523.25, 0.15);
    const beep2 = createBeep(659.25, 0.15);
    const beep3 = createBeep(783.99, 0.3);
    beep1();
    setTimeout(beep2, 150);
    setTimeout(beep3, 300);
  },
  click: createBeep(440, 0.05),
  success: () => {
    const beep1 = createBeep(523.25, 0.1);
    const beep2 = createBeep(659.25, 0.2);
    beep1();
    setTimeout(beep2, 100);
  },
  error: createBeep(200, 0.2, 'square'),
  tick: createBeep(300, 0.05, 'triangle'),
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('earth-online-sound');
    if (saved !== null) {
      setIsSoundEnabled(saved === 'true');
    }
  }, []);

  const playSound = useCallback((type: keyof typeof sounds) => {
    if (isSoundEnabled) {
      sounds[type]();
    }
  }, [isSoundEnabled]);

  const toggleSound = useCallback(() => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    localStorage.setItem('earth-online-sound', newState.toString());
  }, [isSoundEnabled]);

  return (
    <SoundContext.Provider value={{ playSound, isSoundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
}
