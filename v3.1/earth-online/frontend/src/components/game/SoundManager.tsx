import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

// ============================================================
// 音效类型
// ============================================================
type SoundType = 'achievement' | 'click' | 'success' | 'error' | 'tick';

interface SoundContextType {
  playSound: (type: SoundType) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  isBgmEnabled: boolean;
  toggleBgm: () => void;
  bgmVolume: number;
  setBgmVolume: (v: number) => void;
  allowBgm: () => void; // 首次用户交互后解锁 AudioContext
  updateBgmParams: (params: { mood?: number; health?: number; isCrisis?: boolean }) => void; // 动态BGM参数
}

const SoundContext = createContext<SoundContextType | null>(null);

// ============================================================
// 合成音效 (短促 beep)
// ============================================================
let globalAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!globalAudioContext || globalAudioContext.state === 'closed') {
    globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (globalAudioContext.state === 'suspended') {
    globalAudioContext.resume();
  }
  return globalAudioContext;
}

function createBeep(frequency: number, duration: number, type: OscillatorType = 'sine') {
  return () => {
    try {
      const audioContext = getAudioContext();
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
      // Audio not supported
    }
  };
}

const sounds = {
  achievement: () => {
    const b1 = createBeep(523.25, 0.15);
    const b2 = createBeep(659.25, 0.15);
    const b3 = createBeep(783.99, 0.3);
    b1(); setTimeout(b2, 150); setTimeout(b3, 300);
  },
  click: createBeep(440, 0.05),
  success: () => {
    const b1 = createBeep(523.25, 0.1);
    const b2 = createBeep(659.25, 0.2);
    b1(); setTimeout(b2, 100);
  },
  error: createBeep(200, 0.2, 'square'),
  tick: createBeep(300, 0.05, 'triangle'),
};

// ============================================================
// BGM 氛围音引擎 — 纯 Web Audio API 合成
// ============================================================
interface BgmNodes {
  droneGain: GainNode;
  fifthGain: GainNode;
  windGain: GainNode;
  shimmerGain: GainNode;
  masterGain: GainNode;
  allNodes: AudioNode[];
}

interface BgmState {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  nodes: BgmNodes | null;
  running: boolean;
}

function createAmbientBgm(ctx: AudioContext, volume: number): BgmNodes {
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume * 0.5; // 总音量控制（已提升）
  masterGain.connect(ctx.destination);

  // --- 1. 低频嗡鸣 (基底氛围) ---
  const drone = ctx.createOscillator();
  drone.type = 'sine';
  drone.frequency.value = 55; // A1, 低沉基音

  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.08;
  drone.connect(droneGain);
  droneGain.connect(masterGain);
  drone.start();

  // --- 2. 五度泛音 (加厚) ---
  const fifth = ctx.createOscillator();
  fifth.type = 'sine';
  fifth.frequency.value = 82.41; // E2, 五度

  const fifthGain = ctx.createGain();
  fifthGain.gain.value = 0.04;
  fifth.connect(fifthGain);
  fifthGain.connect(masterGain);
  fifth.start();

  // --- 3. 缓慢颤动的风声 (LFO 调制) ---
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.15; // 极慢 LFO

  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 20; // 调制幅度

  const wind = ctx.createOscillator();
  wind.type = 'sawtooth';
  wind.frequency.value = 80;

  const windGain = ctx.createGain();
  windGain.gain.value = 0.02;

  lfo.connect(lfoGain);
  lfoGain.connect(wind.frequency);
  wind.connect(windGain);
  windGain.connect(masterGain);
  lfo.start();
  wind.start();

  // --- 4. 高音 shimmer (非常轻柔的泛音层) ---
  const shimmer = ctx.createOscillator();
  shimmer.type = 'triangle';
  shimmer.frequency.value = 220; // A3

  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.015;

  // shimmer 加缓慢 tremolo
  const tremolo = ctx.createOscillator();
  tremolo.type = 'sine';
  tremolo.frequency.value = 0.3;
  const tremGain = ctx.createGain();
  tremGain.gain.value = 0.3;
  tremolo.connect(tremGain);
  tremGain.connect(shimmerGain.gain);

  shimmer.connect(shimmerGain);
  shimmerGain.connect(masterGain);
  tremolo.start();
  shimmer.start();

  // --- 5. 极低频弱脉冲 (心跳感) ---
  const pulse = ctx.createOscillator();
  pulse.type = 'sine';
  pulse.frequency.value = 0.06; // 每约 16 秒一个完整的 pulse 周期

  const pulseGain = ctx.createGain();
  pulseGain.gain.value = 0.03;
  pulse.connect(pulseGain);
  pulseGain.connect(masterGain);
  pulse.start();

  return {
    droneGain,
    fifthGain,
    windGain,
    shimmerGain,
    masterGain,
    allNodes: [drone, droneGain, fifth, fifthGain, lfo, lfoGain, wind, windGain, 
               shimmer, shimmerGain, tremolo, tremGain, pulse, pulseGain, masterGain]
  };
}

function destroyBgmNodes(nodes: BgmNodes | null) {
  if (!nodes) return;
  for (const n of nodes.allNodes) {
    try {
      if (n instanceof OscillatorNode) n.stop();
      n.disconnect();
    } catch { /* ignore */ }
  }
}

/** 根据游戏状态动态调整 BGM 参数 */
function adjustBgmMood(nodes: BgmNodes | null, params: { mood?: number; health?: number; isCrisis?: boolean }, bgmVolumeRef: { current: number }) {
  if (!nodes) return;
  
  const mood = params.mood ?? 50;
  const health = params.health ?? 50;
  const isCrisis = params.isCrisis ?? false;
  
  // 心情低落时降低泛音，增加风声
  const moodFactor = mood / 100; // 0-1
  const healthFactor = health / 100; // 0-1
  
  // 基底音量随健康降低而减弱
  nodes.droneGain.gain.value = 0.08 * healthFactor;
  
  // 心情好时增加泛音层
  nodes.fifthGain.gain.value = 0.04 * moodFactor;
  nodes.shimmerGain.gain.value = 0.015 * moodFactor;
  
  // 心情差或危机时增加风声
  const windIntensity = isCrisis ? 0.06 : (1 - moodFactor) * 0.04;
  nodes.windGain.gain.value = windIntensity;
  
  // 总音量随心情变化
  nodes.masterGain.gain.value = bgmVolumeRef.current * 0.5 * (0.3 + moodFactor * 0.7);
}

// ============================================================
// Provider
// ============================================================
export function SoundProvider({ children }: { children: ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isBgmEnabled, setIsBgmEnabled] = useState(true);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [userInteracted, setUserInteracted] = useState(false);
  const bgmRef = useRef<BgmState>({ ctx: null, masterGain: null, nodes: null, running: false });
  const bgmVolumeRef = useRef(0.5);

  // ---- 持久化状态 ----
  useEffect(() => {
    const saved = localStorage.getItem('earth-online-sound');
    if (saved !== null) setIsSoundEnabled(saved === 'true');
    const bgm = localStorage.getItem('earth-online-bgm');
    if (bgm !== null) setIsBgmEnabled(bgm === 'true');
    const vol = localStorage.getItem('earth-online-bgm-vol');
    if (vol !== null) setBgmVolume(parseFloat(vol));
  }, []);

  // ---- 氛围音开始/停止 ----
  const startBgm = useCallback(() => {
    const state = bgmRef.current;
    if (state.running) return;
    try {
      const ctx = getAudioContext();
      const masterGain = ctx.createGain();
      masterGain.gain.value = bgmVolumeRef.current * 0.5;
      masterGain.connect(ctx.destination);

      const nodes = createAmbientBgm(ctx, bgmVolumeRef.current);
      state.ctx = ctx;
      state.masterGain = masterGain;
      state.nodes = nodes;
      state.running = true;
    } catch {
      // Audio not supported
    }
  }, []);

  const stopBgm = useCallback(() => {
    const state = bgmRef.current;
    if (!state.running) return;
    destroyBgmNodes(state.nodes);
    state.ctx?.close().catch(() => {});
    state.ctx = null;
    state.masterGain = null;
    state.nodes = null;
    state.running = false;
  }, []);

  // ---- BGM 开关切换 ----
  const toggleBgm = useCallback(() => {
    const next = !isBgmEnabled;
    setIsBgmEnabled(next);
    localStorage.setItem('earth-online-bgm', next.toString());
    if (next && userInteracted) {
      startBgm();
    } else {
      stopBgm();
    }
  }, [isBgmEnabled, userInteracted, startBgm, stopBgm]);

  // ---- 音量变化更新 ----
  const setVolume = useCallback((v: number) => {
    setBgmVolume(v);
    bgmVolumeRef.current = v;
    localStorage.setItem('earth-online-bgm-vol', v.toString());
    const state = bgmRef.current;
    if (state.masterGain) {
      state.masterGain.gain.value = v * 0.5;
    }
  }, []);

  // ---- 动态 BGM 参数更新 ----
  const updateBgmParams = useCallback((params: { mood?: number; health?: number; isCrisis?: boolean }) => {
    const state = bgmRef.current;
    if (state.nodes) {
      adjustBgmMood(state.nodes, params, bgmVolumeRef);
    }
  }, []);

  // ---- 允许 BGM (首次用户交互解锁) ----
  const allowBgm = useCallback(() => {
    if (userInteracted) return;
    setUserInteracted(true);
    if (isBgmEnabled) {
      startBgm();
    }
  }, [userInteracted, isBgmEnabled, startBgm]);

  // ---- 音效开关 ----
  const toggleSound = useCallback(() => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    localStorage.setItem('earth-online-sound', next.toString());
  }, [isSoundEnabled]);

  // ---- 清理 ----
  useEffect(() => {
    return () => stopBgm();
  }, [stopBgm]);

  // ---- 暴露接口 ----
  const playSound = useCallback((type: SoundType) => {
    if (isSoundEnabled) sounds[type]();
  }, [isSoundEnabled]);

  return (
    <SoundContext.Provider value={{
      playSound,
      isSoundEnabled,
      toggleSound,
      isBgmEnabled,
      toggleBgm,
      bgmVolume,
      setBgmVolume: setVolume,
      allowBgm,
      updateBgmParams,
    }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
}
