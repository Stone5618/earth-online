import { Suspense, lazy, useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AdminRoutes } from '@/admin/router';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useGameState, useGameActions } from '@/game/GameContext';
import { useOnlineAwareGame, OnlineAwareGameProvider } from '@/game/OnlineAwareGameProvider';
import { generateFamilyTier, generateInitialStats } from '@/game/core/gameInitializer';
import type { BirthConfig } from '@/game/core/gameInitializer';
import { Loading } from '@/components/Loading';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { Footer } from '@/sections/Footer';
import { Settings, Play, Save, Book, Trophy, LogIn, User } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserAvatar } from './components/UserAvatar';
import { UserProfilePanel } from './components/game/UserProfilePanel';
import { BackgroundSelector, type BackgroundChoice } from '@/components/game/BackgroundSelector';
import { TALENTS } from '@/config/gameConfig';
import { ToastProvider, useToast } from '@/components/game/ToastNotification';
import { SoundProvider } from '@/components/game/SoundManager';
import { SettingsProvider } from '@/components/game/SettingsContext';
import { AccessibilityStyles } from '@/components/game/AccessibilityStyles';
import { api } from '@/api/client';
import { usePanelManager } from '@/hooks/usePanelManager';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteMetadata } from '@/components/RouteMetadata';
import './App.css';

// Lazy loading components
const ServerStatus = lazy(() => import('@/sections/ServerStatus').then(m => ({ default: m.ServerStatus })));
const CharacterCreation = lazy(() => import('@/sections/CharacterCreation').then(m => ({ default: m.CharacterCreation })));
const MainQuestline = lazy(() => import('@/sections/MainQuestline').then(m => ({ default: m.MainQuestline })));
const OpenWorld = lazy(() => import('@/sections/OpenWorld').then(m => ({ default: m.OpenWorld })));
const SkillTree = lazy(() => import('@/sections/SkillTree').then(m => ({ default: m.SkillTree })));
const Economy = lazy(() => import('@/sections/Economy').then(m => ({ default: m.Economy })));
const Guilds = lazy(() => import('@/sections/Guilds').then(m => ({ default: m.Guilds })));
const RNGEvents = lazy(() => import('@/sections/RNGEvents').then(m => ({ default: m.RNGEvents })));
const WinConditions = lazy(() => import('@/sections/WinConditions').then(m => ({ default: m.WinConditions })));
const GameHUD = lazy(() => import('@/components/game/GameHUD').then(m => ({ default: m.GameHUD })));
const SpawnTransition = lazy(() => import('@/components/game/SpawnTransition').then(m => ({ default: m.SpawnTransition })));
const AchievementNotificationProvider = lazy(() => import('@/components/game/AchievementNotification').then(m => ({ default: m.AchievementNotificationProvider })));
const SaveSlotPanel = lazy(() => import('@/components/game/SaveSlotPanel').then(m => ({ default: m.SaveSlotPanel })));
const SettingsPanel = lazy(() => import('@/components/game/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const SurvivalGuide = lazy(() => import('@/sections/SurvivalGuide').then(m => ({ default: m.SurvivalGuide })));

const LoginPanel = lazy(() => import('@/components/game/LoginPanel').then(m => ({ default: m.LoginPanel })));
const Leaderboard = lazy(() => import('@/components/game/Leaderboard').then(m => ({ default: m.Leaderboard })));

// ===== Game Pause Context =====
// Allows pausing game timers, event polling, and auto-save during admin navigation

interface GamePauseContextValue {
  /** Whether the game should be paused (e.g., user is on admin routes) */
  isGamePaused: boolean;
  /** Pause the game (stop timers, polling, auto-save) */
  pauseGame: () => void;
  /** Resume the game (restart timers, polling, auto-save) */
  resumeGame: () => void;
}

const GamePauseContext = createContext<GamePauseContextValue>({
  isGamePaused: false,
  pauseGame: () => {},
  resumeGame: () => {},
});

/**
 * Hook to check if the game is paused and control pause state.
 */
function useGamePauseController(): GamePauseContextValue {
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  const pauseGame = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resumeGame = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
  }, []);

  return {
    isGamePaused: isPaused,
    pauseGame,
    resumeGame,
  };
}

/**
 * Hook to detect route changes and pause game when on admin routes.
 */
function useRouteAwarePause(
  pauseGame: () => void,
  resumeGame: () => void,
) {
  const location = useLocation();
  const wasAdminRoute = useRef(false);

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isAdminRoute && !wasAdminRoute.current) {
      // Entering admin route -> pause game
      pauseGame();
    } else if (!isAdminRoute && wasAdminRoute.current) {
      // Leaving admin route -> resume game
      resumeGame();
    }

    wasAdminRoute.current = isAdminRoute;
  }, [location.pathname, pauseGame, resumeGame]);
}

/**
 * Root component that manages game pause across routes.
 * Keeps game state alive while navigating between game and admin routes.
 */
function AppRoot() {
  const { isGamePaused, pauseGame, resumeGame } = useGamePauseController();
  useRouteAwarePause(pauseGame, resumeGame);

  return (
    <AuthProvider>
      <GamePauseContext.Provider value={{ isGamePaused, pauseGame, resumeGame }}>
        <RouteMetadata />
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <MotionConfig reducedMotion="user">
                  <SettingsProvider>
                    <AccessibilityStyles />
                    <ToastProvider>
                      <SoundProvider>
                        <OnlineAwareGameProvider isPaused={isGamePaused}>
                          <GameContent />
                        </OnlineAwareGameProvider>
                      </SoundProvider>
                    </ToastProvider>
                  </SettingsProvider>
                </MotionConfig>
              </ErrorBoundary>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </GamePauseContext.Provider>
    </AuthProvider>
  );
}

export function useGamePause(): GamePauseContextValue {
  return useContext(GamePauseContext);
}

// Predefined servers and talents
const servers = [
  '亚洲服务器 - 中国一线城市',
  '亚洲服务器 - 中国二线城市',
  '亚洲服务器 - 日本',
  '亚洲服务器 - 韩国',
  '亚洲服务器 - 印度',
  '欧洲服务器 - 英国',
  '欧洲服务器 - 德国',
  '欧洲服务器 - 法国',
  '欧洲服务器 - 西班牙',
  '北美服务器 - 美国东部',
  '北美服务器 - 美国西部',
];

// Main game content component
function GameContent() {
  // Use selective hooks to avoid unnecessary re-renders.
  // useGameState() only re-renders when game state changes.
  // useGameActions() returns stable references that rarely change.
  const { state } = useGameState();
  const { startSpawning, loadGame, checkAutoSave } = useGameActions();
  const { setBackendCharId } = useOnlineAwareGame();
  const { showToast } = useToast();
  const {
    openPanel,
    closePanel,
    isPanelOpen,
    savePanelMode,
    setSavePanelMode,
  } = usePanelManager();
  const { user, isAuthenticated, isLoading: isAuthLoading, isOnline, checkOnline } = useAuth();
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [availableServers, setAvailableServers] = useState<number[]>([]);

  // Update showLogin when auth status changes - only auto-show login on initial load if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      // Only show login automatically on initial app load, not after user closes it
      const hasUserInteracted = localStorage.getItem('earth-online-user-interacted');
      if (!hasUserInteracted) {
        setShowLogin(true);
      }
    }
  }, [isAuthenticated, isAuthLoading]);

  // Fetch available servers on mount
  useEffect(() => {
    async function fetchServers() {
      try {
        const { data: serverList } = await api.getServers();
        if (serverList.length > 0) {
          setAvailableServers(serverList.map(s => s.id));
        }
      } catch {
        // Server list fetch failed - will use fallback
      }
    }
    fetchServers();
  }, []);

  const handleLoggedIn = useCallback(() => {
    setShowLogin(false);
    localStorage.setItem('earth-online-user-interacted', 'true');
  }, []);

  // Spawn with background selection - require login first
  const handleSpawn = useCallback(() => {
    if (!isOnline || !isAuthenticated) {
      setShowLogin(true);
      return;
    }
    setShowBackgroundSelector(true);
  }, [isOnline, isAuthenticated]);

  // 继续游戏 - 打开存档选择面板
  const handleContinue = useCallback(() => {
    setSavePanelMode('load');
    openPanel('save');
  }, [setSavePanelMode, openPanel]);

  const handleBackgroundComplete = useCallback(async (choice: BackgroundChoice) => {
    setShowBackgroundSelector(false);

    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    const talentName = choice.selectedTalent 
      ? TALENTS.find(t => t.id === choice.selectedTalent)?.name || '随机天赋' 
      : '随机天赋';
    
    let familyTier = generateFamilyTier();
    
    // 使用新的出生系统
    const birthConfig: BirthConfig = {
      familyTier: familyTier,
      familyOccupation: choice.familyOccupation as any,
      selectedTalent: choice.selectedTalent,
      selectedFlaw: choice.selectedFlaw,
      characterName: choice.characterName,
      familyName: choice.familyName,
      gender: choice.gender,
    };
    
    let initialStats = generateInitialStats(familyTier, birthConfig);

    // Create character on backend first
    try {
      const token = localStorage.getItem('earth-online-token');
      if (!token) {
        setShowLogin(true);
        return;
      }
      // Use a server from the available servers list, or fallback to first
      const selectedServerId = availableServers.length > 0 
        ? availableServers[Math.floor(Math.random() * availableServers.length)]
        : 1; // Fallback to 1 if no servers available
      const characterName = choice.characterName?.trim() || '地球online玩家';
      const { data: character, error } = await api.createCharacter(selectedServerId, characterName);
      if (error) {
        console.error('Failed to create character:', error.message);
        showToast('角色创建失败: ' + error.message, 'error');
        setShowLogin(true);
        return;
      }
      if (character && character.id) {
        setBackendCharId(character.id);
        startSpawning(randomServer, talentName, familyTier, initialStats, choice.challenge, choice.characterName, choice.familyName, choice.gender);
      } else {
        console.error('Failed to create character: no character data returned');
        showToast('角色创建失败，请重试', 'error');
        setShowLogin(true);
      }
    } catch (error) {
      console.error('Error creating character:', error);
      showToast('角色创建失败，请检查网络连接', 'error');
      setShowLogin(true);
    }
  }, [startSpawning, availableServers, setBackendCharId]);

  return (
    <div className="relative min-h-screen bg-deep-space text-white overflow-x-hidden">
      {/* Connection status indicator */}
      {!isOnline && !isAuthLoading && state.phase === 'LANDING' && (
        <div className="fixed top-4 left-4 z-50 px-4 py-2 bg-fatal-red/20 border border-fatal-red/30 rounded-lg text-fatal-red text-sm animate-pulse">
          ⚠️ 连接服务器中...
        </div>
      )}
      
      {/* 顶部右侧按钮 - 仅在LANDING阶段桌面端可见，PLAYING阶段隐藏避免与GameHUD顶部栏重合 */}
      {state.phase === 'LANDING' && (
        <div className="hidden lg:flex fixed top-24 right-4 z-50 flex gap-2">
          {/* 用户头像/登录按钮 */}
          {user ? (
            <button
              onClick={() => setShowProfile(true)}
              className="p-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-deep-space focus-visible:ring-holo-blue"
              title="个人中心"
            >
              <UserAvatar
                username={user.display_name || user.username}
                avatarColor={user.avatar_color}
                size="md"
              />
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="p-2 bg-holo-blue/20 border border-holo-blue/50 rounded-lg text-holo-blue hover:bg-holo-blue/30 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-deep-space focus-visible:ring-holo-blue"
              title="登录"
            >
              <LogIn className="w-5 h-5" />
            </button>
          )}
          {/* 排行榜按钮 */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="p-2 bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            title="排行榜"
          >
            <Trophy className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              setSavePanelMode('load');
              openPanel('save');
            }}
            className="px-4 py-2 bg-holo-blue/20 border border-holo-blue/50 rounded-lg text-holo-blue hover:bg-holo-blue/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            继续游戏
          </button>
          <button
            onClick={() => openPanel('settings')}
            className="p-2 bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Achievement Notification (always load) */}
      <Suspense fallback={<Loading />}>
        <AchievementNotificationProvider />
      </Suspense>
      
      {/* Particle Background - only show in landing phase */}
      {state.phase === 'LANDING' && <ParticleBackground />}
      
      {/* Background Selector */}
      <AnimatePresence>
        {showBackgroundSelector && (
          <BackgroundSelector onComplete={handleBackgroundComplete} />
        )}
      </AnimatePresence>
      
      {/* Spawn Transition */}
      <AnimatePresence>
        {state.phase === 'SPAWNING' && (
          <Suspense fallback={<Loading />}>
            <SpawnTransition />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Game HUD - only show in playing or gameover phase */}
      {(state.phase === 'PLAYING' || state.phase === 'GAMEOVER') && (
        <>
          <Suspense fallback={<Loading />}>
            <ErrorBoundary>
              <GameHUD />
            </ErrorBoundary>
          </Suspense>
        </>
      )}

      {/* Landing Page Content */}
      {state.phase === 'LANDING' && (
        <>
          <Header onSpawnClick={handleSpawn} onLoginClick={() => setShowLogin(true)} />
          
          <main className="relative z-10">
            <Hero 
              onSpawnClick={handleSpawn} 
              onGuideClick={() => openPanel('guide')}
              onContinueClick={handleContinue}
            />
            <Suspense fallback={<Loading />}>
              <ErrorBoundary>
                <ServerStatus />
              </ErrorBoundary>
              <ErrorBoundary>
                <CharacterCreation />
              </ErrorBoundary>
              <ErrorBoundary>
                <MainQuestline />
              </ErrorBoundary>
              <ErrorBoundary>
                <OpenWorld />
              </ErrorBoundary>
              <ErrorBoundary>
                <SkillTree />
              </ErrorBoundary>
              <ErrorBoundary>
                <Economy />
              </ErrorBoundary>
              <ErrorBoundary>
                <Guilds />
              </ErrorBoundary>
              <ErrorBoundary>
                <RNGEvents />
              </ErrorBoundary>
              <ErrorBoundary>
                <WinConditions />
              </ErrorBoundary>
            </Suspense>
          </main>
          
          <Footer />
        </>
      )}
      
      {/* 所有阶段的面板 */}
      <Suspense fallback={<Loading />}>
        <SaveSlotPanel
          isOpen={isPanelOpen('save')}
          onClose={() => closePanel('save')}
          mode={savePanelMode}
        />
        <SettingsPanel
          isOpen={isPanelOpen('settings')}
          onClose={() => closePanel('settings')}
        />
        <SurvivalGuide
          isOpen={isPanelOpen('guide')}
          onClose={() => closePanel('guide')}
        />
        <LoginPanel
          open={showLogin}
          onClose={() => {
            setShowLogin(false);
            localStorage.setItem('earth-online-user-interacted', 'true');
          }}
          onLoggedIn={handleLoggedIn}
        />
        <Leaderboard
          open={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
        <UserProfilePanel
          open={showProfile}
          onClose={() => setShowProfile(false)}
        />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoot />
    </BrowserRouter>
  );
}

export default App;
