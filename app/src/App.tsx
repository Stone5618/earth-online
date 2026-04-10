import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from '@/game/GameContext';
import { generateFamilyTier, generateInitialStats } from '@/game/gameState';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { ServerStatus } from '@/sections/ServerStatus';
import { CharacterCreation } from '@/sections/CharacterCreation';
import { MainQuestline } from '@/sections/MainQuestline';
import { OpenWorld } from '@/sections/OpenWorld';
import { SkillTree } from '@/sections/SkillTree';
import { Economy } from '@/sections/Economy';
import { Guilds } from '@/sections/Guilds';
import { RNGEvents } from '@/sections/RNGEvents';
import { WinConditions } from '@/sections/WinConditions';
import { Footer } from '@/sections/Footer';
import { GameHUD } from '@/components/game/GameHUD';
import { SpawnTransition } from '@/components/game/SpawnTransition';
import { AchievementNotificationProvider } from '@/components/game/AchievementNotification';
import { ToastProvider } from '@/components/game/ToastNotification';
import { SoundProvider } from '@/components/game/SoundManager';
import { SaveSlotPanel } from '@/components/game/SaveSlotPanel';
import { SettingsPanel } from '@/components/game/SettingsPanel';
import { Settings, Play } from 'lucide-react';
import { SurvivalGuide } from '@/sections/SurvivalGuide';
import './App.css';

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
  const { state, startSpawning, completeSpawning } = useGame();
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
      {/* Achievement Notification */}
      <AchievementNotificationProvider />
      
      {/* Particle Background - only show in landing phase */}
      {state.phase === 'LANDING' && <ParticleBackground />}
      
      {/* Spawn Transition */}
      <AnimatePresence>
        {state.phase === 'SPAWNING' && <SpawnTransition />}
      </AnimatePresence>

      {/* Game HUD - only show in playing or gameover phase */}
      {(state.phase === 'PLAYING' || state.phase === 'GAMEOVER') && <GameHUD />}

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
          
          <main className="relative z-10">
            <Hero onSpawnClick={handleSpawn} onGuideClick={() => setIsGuideOpen(true)} />
            <ServerStatus />
            <CharacterCreation />
            <MainQuestline />
            <OpenWorld />
            <SkillTree />
            <Economy />
            <Guilds />
            <RNGEvents />
            <WinConditions />
          </main>
          
          <Footer />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <SoundProvider>
        <ToastProvider>
          <GameContent />
        </ToastProvider>
      </SoundProvider>
    </GameProvider>
  );
}

export default App;
