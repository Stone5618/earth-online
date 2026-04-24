import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ClipboardList, GitFork, Home, Play, Save, ScrollText, Settings, Sparkles, Trophy, Book } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { StatPanel } from './StatPanel';
import { LogStream } from './LogStream';
import { DecisionPanel } from './DecisionPanel';
import { DeathScreen } from './DeathScreen';
import { NeedsPanel } from './NeedsPanel';
import { SkillsPanel } from './SkillsPanel';
import { AchievementPanel } from './AchievementPanel';
import { SaveSlotPanel } from './SaveSlotPanel';
import { SettingsPanel } from './SettingsPanel';
import { SurvivalGuide } from '@/sections/SurvivalGuide';
import { useToast } from './ToastNotification';
import { useSound } from './SoundManager';

export function GameHUD() {
  const { state, currentEvent, dispatch } = useGame();
  const [mobileTab, setMobileTab] = useState<'decision' | 'stats' | 'logs' | 'more'>('decision');
  const { showToast } = useToast();
  const { playSound } = useSound();

  const [isSkillsPanelOpen, setIsSkillsPanelOpen] = useState(false);
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [savePanelMode, setSavePanelMode] = useState<'save' | 'load'>('load');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const mobileTitle = useMemo(() => {
    switch (mobileTab) {
      case 'decision':
        return { icon: GitFork, text: '生存控制台' };
      case 'stats':
        return { icon: Sparkles, text: '状态' };
      case 'logs':
        return { icon: ScrollText, text: '日志' };
      case 'more':
        return { icon: ClipboardList, text: '更多' };
    }
  }, [mobileTab]);

  if (state.phase === 'GAMEOVER') {
    return <DeathScreen />;
  }

  return (
    <motion.div
      className="min-h-screen pt-20 pb-24 px-2 sm:px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Mobile HUD (fixed top actions + bottom navigation) */}
        <div className="lg:hidden">
          {/* Fixed Top Action Bar */}
          <div className="fixed top-0 left-0 right-0 z-[130] border-b border-white/10 bg-deep-space/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-2 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    dispatch({ type: 'GO_TO_LANDING' });
                    showToast('已返回主菜单', 'info');
                    playSound('click');
                  }}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Home className="w-5 h-5" />
                </button>

                <motion.div
                  className="flex-1 text-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-lg font-orbitron font-bold text-white flex items-center justify-center gap-2">
                    <mobileTitle.icon className="w-4 h-4 text-holo-blue" />
                    {mobileTitle.text}
                  </h2>
                </motion.div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsGuideOpen(true);
                      playSound('click');
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    title="指南"
                  >
                    <Book className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSavePanelMode('load');
                      setIsSavePanelOpen(true);
                      playSound('click');
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    title="读档"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSavePanelMode('save');
                      setIsSavePanelOpen(true);
                      playSound('click');
                    }}
                    className="p-2 rounded-xl bg-holo-blue/20 border border-holo-blue/40 text-holo-blue hover:bg-holo-blue/30 transition-all"
                    title="存档"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      playSound('click');
                    }}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    title="设置"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-24">
            {mobileTab === 'decision' && <DecisionPanel event={currentEvent} />}
            {mobileTab === 'stats' && <StatPanel />}
            {mobileTab === 'logs' && <LogStream />}
            {mobileTab === 'more' && (
              <div className="space-y-4">
                <div className="glass-card p-4 space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-holo-blue" />
                    行动中心
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsSkillsPanelOpen(true);
                        playSound('click');
                      }}
                      className="min-h-[52px] rounded-xl bg-holo-purple/20 border border-holo-purple/40 text-holo-purple hover:bg-holo-purple/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      技能
                    </button>
                    <button
                      onClick={() => setIsAchievementPanelOpen(true)}
                      className="min-h-[52px] rounded-xl bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Trophy className="w-4 h-4" />
                      成就
                    </button>

                    <button
                      onClick={() => {
                        setSavePanelMode('load');
                        setIsSavePanelOpen(true);
                        playSound('click');
                      }}
                      className="min-h-[52px] rounded-xl bg-white/5 border border-white/15 text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Play className="w-4 h-4" />
                      读档
                    </button>
                    <button
                      onClick={() => {
                        setSavePanelMode('save');
                        setIsSavePanelOpen(true);
                        playSound('click');
                      }}
                      className="min-h-[52px] rounded-xl bg-holo-blue/20 border border-holo-blue/40 text-holo-blue hover:bg-holo-blue/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      存档
                    </button>

                    <button
                      onClick={() => {
                        setIsSettingsOpen(true);
                        playSound('click');
                      }}
                      className="min-h-[52px] rounded-xl bg-white/5 border border-white/15 text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      设置
                    </button>
                    <button
                      onClick={() => {
                        dispatch({ type: 'GO_TO_LANDING' });
                        showToast('已返回主菜单', 'info');
                        playSound('click');
                      }}
                      className="min-h-[52px] rounded-xl bg-white/5 border border-white/15 text-white/70 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Home className="w-4 h-4" />
                      主菜单
                    </button>
                  </div>
                </div>

                <NeedsPanel mode="inline" />
              </div>
            )}
          </div>

          {/* Fixed Bottom Navigation */}
          <div className="fixed left-0 right-0 bottom-0 z-[120] border-t border-white/10 bg-deep-space/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-2">
              <div className="grid grid-cols-4 gap-2 py-2">
                <button
                  onClick={() => setMobileTab('decision')}
                  className={`min-h-[44px] rounded-xl border transition-all flex flex-col items-center justify-center ${
                    mobileTab === 'decision'
                      ? 'bg-holo-blue/20 border-holo-blue/50 text-holo-blue'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  <GitFork className="w-5 h-5" />
                  <span className="text-[11px] mt-0.5">生存控制台</span>
                </button>
                <button
                  onClick={() => setMobileTab('stats')}
                  className={`min-h-[44px] rounded-xl border transition-all flex flex-col items-center justify-center ${
                    mobileTab === 'stats'
                      ? 'bg-holo-purple/20 border-holo-purple/50 text-holo-purple'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[11px] mt-0.5">状态</span>
                </button>
                <button
                  onClick={() => setMobileTab('logs')}
                  className={`min-h-[44px] rounded-xl border transition-all flex flex-col items-center justify-center ${
                    mobileTab === 'logs'
                      ? 'bg-gold/10 border-gold/30 text-gold'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  <ScrollText className="w-5 h-5" />
                  <span className="text-[11px] mt-0.5">日志</span>
                </button>
                <button
                  onClick={() => setMobileTab('more')}
                  className={`min-h-[44px] rounded-xl border transition-all flex flex-col items-center justify-center ${
                    mobileTab === 'more'
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-[11px] mt-0.5">更多</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile modals */}
        <SkillsPanel isOpen={isSkillsPanelOpen} onClose={() => setIsSkillsPanelOpen(false)} />
        <AchievementPanel isOpen={isAchievementPanelOpen} onClose={() => setIsAchievementPanelOpen(false)} />
        <SaveSlotPanel
          isOpen={isSavePanelOpen}
          onClose={() => setIsSavePanelOpen(false)}
          mode={savePanelMode}
        />
        <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <SurvivalGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

        {/* Desktop HUD (3-column layout) */}
        <div className="hidden lg:block">
          <motion.div
            className="text-center mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white mb-2">
              生存控制台
            </h2>
            <p className="text-white/50 text-xs sm:text-sm">
              Life Simulation Console v2.0
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            <motion.div
              className="lg:col-span-5 lg:order-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <DecisionPanel event={currentEvent} />
            </motion.div>

            <motion.div
              className="lg:col-span-3 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StatPanel />
            </motion.div>

            <motion.div
              className="lg:col-span-4 lg:order-3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <LogStream />
            </motion.div>
          </div>

          {/* PC-only floating NeedsPanel */}
          <NeedsPanel mode="floating" />
        </div>

        <motion.div
          className="mt-6 sm:mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-white/30 text-xs">
            💡 提示：精力耗尽会扣除健康值 | 35岁后健康自然衰减 | 100岁或健康归零时游戏结束
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
