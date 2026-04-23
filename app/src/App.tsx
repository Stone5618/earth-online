import { Suspense, lazy, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import { GameProvider, useGame } from '@/game/GameContext';
import { generateFamilyTier, generateInitialStats } from '@/game/gameState';
import { Loading } from '@/components/Loading';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { Footer } from '@/sections/Footer';
import { Settings, Play } from 'lucide-react';
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
const ToastProvider = lazy(() => import('@/components/game/ToastNotification').then(m => ({ default: m.ToastProvider })));
const SoundProvider = lazy(() => import('@/components/game/SoundManager').then(m => ({ default: m.SoundProvider })));

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

const talents = [
  '乐感极佳',
  '运动天赋',
  '数学直觉',
  '语言天赋',
  '艺术感知',
  '社交魅力',
  '逻辑思维',
  '空间想象',
];

// Main game content component
function GameContent() {
  const { state, startSpawning } = useGame();
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [savePanelMode, setSavePanelMode] = useState<'save' | 'load'>('load');

  // Direct spawning with random server and talent
  const handleSpawn = () => {
    const randomServer = servers[Math.floor(Math.random() * servers.length)];
    const randomTalent = talents[Math.floor(Math.random() * talents.length)];
    const familyTier = generateFamilyTier();
    const initialStats = generateInitialStats(familyTier);
    startSpawning(randomServer, randomTalent, familyTier, initialStats);
  };

  return (
    <div className="relative min-h-screen bg-deep-space text-white overflow-x-hidden">
      {/* Achievement Notification (always load) */}
      <Suspense fallback={<Loading />}>
        <AchievementNotificationProvider />
      </Suspense>
      
      {/* Particle Background - only show in landing phase */}
      {state.phase === 'LANDING' && <ParticleBackground />}
      
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
        <Suspense fallback={<Loading />}>
          <GameHUD />
        </Suspense>
      )}

      {/* Landing Page Content */}
      {state.phase === 'LANDING' && (
        <>
          <Header onSpawnClick={handleSpawn} />
          
          {/* Top Right Buttons */}
          <div className="fixed top-24 right-4 z-50 flex gap-2">
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
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {/* Panels */}
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
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <GameProvider>
          <Suspense fallback={<Loading />}>
            <SoundProvider>
              <Suspense fallback={<Loading />}>
                <ToastProvider>
                  <GameContent />
                </ToastProvider>
              </Suspense>
            </SoundProvider>
          </Suspense>
        </GameProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
