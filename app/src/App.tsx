import { Suspense, lazy, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '@/game/GameContext';
import { generateFamilyTier, generateInitialStats } from '@/game/core/gameInitializer';
import type { BirthConfig } from '@/game/core/gameInitializer';
import { Loading } from '@/components/Loading';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { Footer } from '@/sections/Footer';
import { Settings, Play, Save, Book } from 'lucide-react';
import { BackgroundSelector, type BackgroundChoice } from '@/components/game/BackgroundSelector';
import { TALENTS } from '@/config/gameConfig';
import { ToastProvider } from '@/components/game/ToastNotification';
import { SoundProvider } from '@/components/game/SoundManager';
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

// Predefined servers and talents
const servers = [
  '亚洲服务器 - 中国一线城市',
  '亚洲服务器 - 中国二线城市',
  '亚洲服务器 - 日本',
  '亚洲服务器 - 韩国',
  '欧洲服务器 - 英国',
  '欧洲服务器 - 德国',
  '欧洲服务器 - 法国',
  '北美服务器 - 美国东部',
  '北美服务器 - 美国西部',
];

// Main game content component
function GameContent() {
  const { state, startSpawning } = useGame();
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [savePanelMode, setSavePanelMode] = useState<'save' | 'load'>('load');
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  // Spawn with background selection
  const handleSpawn = () => {
    setShowBackgroundSelector(true);
  };

  const handleBackgroundComplete = (choice: BackgroundChoice) => {
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
      selectedFlaw: choice.selectedFlaw
    };
    
    let initialStats = generateInitialStats(familyTier, birthConfig);

    startSpawning(randomServer, talentName, familyTier, initialStats, choice.challenge);
  };

  return (
    <div className="relative min-h-screen bg-deep-space text-white overflow-x-hidden">
      {/* 顶部右侧按钮 - 仅在桌面端可见 */}
      <div className="hidden lg:flex fixed top-24 right-4 z-50 flex gap-2">
        {state.phase === 'PLAYING' && (
          <>
            <button
              onClick={() => {
                setSavePanelMode('save');
                setIsSavePanelOpen(true);
              }}
              className="px-4 py-2 bg-holo-blue/20 border border-holo-blue/50 rounded-lg text-holo-blue hover:bg-holo-blue/30 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存游戏
            </button>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
            >
              <Book className="w-4 h-4" />
              指南
            </button>
          </>
        )}
        {state.phase === 'LANDING' && (
          <button
            onClick={() => {
              setSavePanelMode('load');
              setIsSavePanelOpen(true);
            }}
            className="px-4 py-2 bg-holo-blue/20 border border-holo-blue/50 rounded-lg text-holo-blue hover:bg-holo-blue/30 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            继续游戏
          </button>
        )}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      
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
            <GameHUD />
          </Suspense>
        </>
      )}

      {/* Landing Page Content */}
      {state.phase === 'LANDING' && (
        <>
          <Header onSpawnClick={handleSpawn} />
          
          <main className="relative z-10">
            <Hero onSpawnClick={handleSpawn} onGuideClick={() => setIsGuideOpen(true)} />
            <Suspense fallback={<Loading />}>
              <ServerStatus />
              <CharacterCreation />
              <MainQuestline />
              <OpenWorld />
              <SkillTree />
              <Economy />
              <Guilds />
              <RNGEvents />
              <WinConditions />
            </Suspense>
          </main>
          
          <Footer />
        </>
      )}
      
      {/* 所有阶段的面板 */}
      <Suspense fallback={<Loading />}>
        <SaveSlotPanel
          isOpen={isSavePanelOpen}
          onClose={() => setIsSavePanelOpen(false)}
          mode={savePanelMode}
        />
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
        <SurvivalGuide
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <SoundProvider>
            <GameProvider>
              <GameContent />
            </GameProvider>
          </SoundProvider>
        </ToastProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
