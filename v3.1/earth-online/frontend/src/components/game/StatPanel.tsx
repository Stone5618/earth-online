import React, { Suspense, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, Zap, Coins, Smile, Frown, Brain, Sparkles, Palette, Clover, Save, Home, Settings, Activity, BookOpen, TrendingUp, TrendingDown, Minus, User } from 'lucide-react';
import { useGameState, useGameActions } from '@/game/GameContext';
import { formatMoney, STAT_BOUNDS, getEconomyState, getHealthConditionName, getHealthConditionColor, getHealthTreatmentCost } from '@/game/gameState';
import { attrColor, getMoodInfo } from '@/config/attributeColors';
import { useToast } from './ToastNotification';
import { useSound } from './SoundManager';
import { StatBar } from '@/components/ui/StatBar';
import { PlayerProfileSection } from './PlayerProfileSection';
import { DebtSection } from './DebtSection';
import { Loading } from '@/components/Loading';
import { SkillsPanel, AchievementPanel, SaveSlotPanel, SettingsPanel } from './lazyImports';

interface StatPanelProps {
  compact?: boolean;
}

export const StatPanel = React.memo(({ compact }: StatPanelProps = {}) => {
  const { state } = useGameState();
  const { dispatch } = useGameActions();
  const { stats } = state;
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isSkillsPanelOpen, setIsSkillsPanelOpen] = useState(false);
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showToast } = useToast();
  const { playSound } = useSound();

  // Determine mood icon and color - using global attributeColors
  const moodInfo = useMemo(() => getMoodInfo(stats.mood), [stats.mood]);

  if (compact) {
    return (
      <>
        <div className="glass-card p-2 space-y-2 h-full overflow-y-auto">
          {/* Compact Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-holo-blue" />
              状态
            </h3>
            <span className="text-xs text-holo-blue font-orbitron">Lv.{stats.age}</span>
          </div>

          {/* Compact Economy & Health */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="text-center p-1.5 rounded-lg bg-white/5">
              <span className="text-white/50 text-[10px]">经济</span>
              <div className="text-xs font-bold text-white/70">
                {getEconomyState(stats.economyFactor) === 'boom' ? '繁荣' : getEconomyState(stats.economyFactor) === 'crisis' ? '危机' : '正常'}
              </div>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-white/5">
              <span className="text-white/50 text-[10px]">健康</span>
              <div className="text-xs font-bold" style={{ color: getHealthConditionColor(stats.healthStatus.condition) }}>
                {getHealthConditionName(stats.healthStatus.condition)}
              </div>
            </div>
          </div>

          {/* Compact Stats */}
          <div className="space-y-1.5">
            <StatBar icon={Heart} label="健康" value={stats.health} max={stats.maxHealth} color={attrColor('health')} compact />
            <StatBar icon={Zap} label="精力" value={stats.energy} max={stats.maxEnergy} color={attrColor('energy')} compact />
            <StatBar icon={Coins} label="金币" value={stats.money} max={Math.max(1000000, Math.abs(stats.money))} color={attrColor('gold')} showValue prefix="¥" displayValue={formatMoney(stats.money)} compact />
            <StatBar icon={moodInfo.icon} label="心情" value={stats.mood} max={100} color={moodInfo.color} compact />
            <StatBar icon={Brain} label="智力" value={stats.intelligence} max={STAT_BOUNDS.intelligence.max} color={attrColor('intellect')} compact />
            <StatBar icon={Palette} label="创造" value={stats.creativity} max={STAT_BOUNDS.creativity.max} color={attrColor('creativity')} compact />
            <StatBar icon={Clover} label="运气" value={stats.luck} max={STAT_BOUNDS.luck.max} color={attrColor('luck')} compact />
            <StatBar icon={Sparkles} label="魅力" value={stats.charm} max={STAT_BOUNDS.charm.max} color={attrColor('charm')} compact />
          </div>

          {/* Compact Actions */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button onClick={() => { setIsSkillsPanelOpen(true); playSound('click'); }} className="py-1.5 rounded bg-holo-purple/20 border border-holo-purple/50 text-holo-purple text-[10px] flex items-center justify-center gap-1">
              <BookOpen className="w-3 h-3" />技能({stats.skillPoints})
            </button>
            <button onClick={() => setIsAchievementPanelOpen(true)} className="py-1.5 rounded bg-gold/10 border border-gold/30 text-gold text-[10px] flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3" />成就
            </button>
            <button onClick={() => { setIsSavePanelOpen(true); playSound('click'); }} className="py-1.5 rounded bg-holo-blue/20 border border-holo-blue/50 text-holo-blue text-[10px] flex items-center justify-center gap-1">
              <Save className="w-3 h-3" />存档
            </button>
            <button onClick={() => { setIsSettingsOpen(true); playSound('click'); }} className="py-1.5 rounded bg-white/5 border border-white/20 text-white/60 text-[10px] flex items-center justify-center gap-1">
              <Settings className="w-3 h-3" />设置
            </button>
          </div>
        </div>

        <Suspense fallback={<Loading />}>
          <SkillsPanel isOpen={isSkillsPanelOpen} onClose={() => setIsSkillsPanelOpen(false)} />
          <AchievementPanel isOpen={isAchievementPanelOpen} onClose={() => setIsAchievementPanelOpen(false)} />
          <SaveSlotPanel isOpen={isSavePanelOpen} onClose={() => setIsSavePanelOpen(false)} mode="save" />
          <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <div className="glass-card p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-holo-blue" />
        状态监测
      </h3>

      {/* Age Display */}
      <div className="text-center p-3 sm:p-4 rounded-xl bg-white/5">
        <span className="text-white/50 text-xs sm:text-sm">当前年龄</span>
        <motion.div
          className="text-3xl sm:text-4xl font-orbitron font-bold text-holo-blue"
          key={stats.age}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {stats.age}岁
        </motion.div>
      </div>

      {/* Economy Status Display */}
      <div className="text-center p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="text-white/50 text-xs sm:text-sm">经济状态</span>
        <motion.div
          className="flex items-center justify-center gap-2 mt-1"
          key={stats.economyFactor}
        >
          {(() => {
            const economyState = getEconomyState(stats.economyFactor);
            if (economyState === 'boom') {
              return (
                <>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-lg sm:text-xl font-bold text-green-400">繁荣</span>
                </>
              );
            } else if (economyState === 'crisis') {
              return (
                <>
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span className="text-lg sm:text-xl font-bold text-red-400">危机</span>
                </>
              );
            } else {
              return (
                <>
                  <Minus className="w-5 h-5 text-white/70" />
                  <span className="text-lg sm:text-xl font-bold text-white/70">正常</span>
                </>
              );
            }
          })()}
        </motion.div>
        <div className="mt-1">
          <span className="text-white/50 text-xs">
            系数: {(stats.economyFactor * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Health Status Display */}
      <div className="text-center p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="text-white/50 text-xs sm:text-sm">健康状态</span>
        <motion.div
          className="flex items-center justify-center gap-2 mt-1"
          key={stats.healthStatus.condition}
        >
          {(() => {
            const healthIcon = () => {
              switch (stats.healthStatus.condition) {
                case 'healthy':
                  return <Smile className="w-5 h-5" />;
                case 'minor_ill':
                  return <Activity className="w-5 h-5" />;
                case 'major_ill':
                  return <Heart className="w-5 h-5" />;
                case 'injured':
                  return <Activity className="w-5 h-5" />;
                case 'disabled':
                  return <User className="w-5 h-5" />;
                default:
                  return <Heart className="w-5 h-5" />;
              }
            };

            const healthColor = getHealthConditionColor(stats.healthStatus.condition);

            return (
              <>
                <div style={{ color: healthColor }}>
                  {healthIcon()}
                </div>
                <span className="text-lg sm:text-xl font-bold" style={{ color: healthColor }}>
                  {getHealthConditionName(stats.healthStatus.condition)}
                </span>
              </>
            );
          })()}
        </motion.div>
        <div className="mt-1">
          <span className="text-white/50 text-xs">
            {stats.healthStatus.duration > 0 ? `持续 ${stats.healthStatus.duration} 年` : '状态稳定'}
          </span>
        </div>
        {stats.healthStatus.condition !== 'healthy' && (
          <div className="mt-2">
            <button
              onClick={() => dispatch({ type: 'SEEK_TREATMENT' })}
              className="px-3 py-1 text-xs bg-blue-500/20 border border-blue-500/50 rounded hover:bg-blue-500/30 text-blue-300 transition-all"
            >
              寻求治疗 (¥{getHealthTreatmentCost(stats.healthStatus.condition, stats).toLocaleString()})
            </button>
          </div>
        )}
      </div>

      {/* Player Profile Section (Extracted) */}
      <PlayerProfileSection state={state} stats={stats} />

      {/* Stats */}
      <div className="space-y-3 sm:space-y-4">
        <StatBar
          icon={Heart}
          label="健康值"
          value={stats.health}
          max={stats.maxHealth}
          color="#FF4B4B"
        />

        <StatBar
          icon={Zap}
          label="精力值"
          value={stats.energy}
          max={stats.maxEnergy}
          color="#FF6B35"
        />

        <StatBar
          icon={Coins}
          label="金币"
          value={stats.money}
          max={Math.max(1000000, Math.abs(stats.money))}
          color="#FFD700"
          showValue={true}
          prefix="¥"
          displayValue={formatMoney(stats.money)}
        />

        <StatBar
          icon={moodInfo.icon}
          label={`心情 (${moodInfo.label})`}
          value={stats.mood}
          max={100}
          color={moodInfo.color}
        />

        <StatBar
          icon={Brain}
          label="智力"
          value={stats.intelligence}
          max={STAT_BOUNDS.intelligence.max}
          color="#00D2FF"
        />

        <StatBar
          icon={Palette}
          label="创造力"
          value={stats.creativity}
          max={STAT_BOUNDS.creativity.max}
          color="#FF69B4"
        />

        <StatBar
          icon={Clover}
          label="运气"
          value={stats.luck}
          max={STAT_BOUNDS.luck.max}
          color="#00FF88"
        />

        <StatBar
          icon={Sparkles}
          label="魅力"
          value={stats.charm}
          max={STAT_BOUNDS.charm.max}
          color="#FF1493"
        />
      </div>

      {/* Debt Display (Extracted) */}
      <DebtSection stats={stats} />

      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10 space-y-2 sm:space-y-3">
        <button
          onClick={() => {
            setIsSkillsPanelOpen(true);
            playSound('click');
          }}
          className="w-full py-3 min-h-[44px] bg-holo-purple/20 border border-holo-purple/50 rounded-lg text-holo-purple hover:bg-holo-purple/30 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <BookOpen className="w-4 h-4" />
          技能树 ({stats.skillPoints} 点)
        </button>
        <button
          onClick={() => setIsAchievementPanelOpen(true)}
          className="w-full py-3 min-h-[44px] bg-gold/10 border border-gold/30 rounded-lg text-gold hover:bg-gold/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Trophy className="w-4 h-4" />
          成就 ({state.achievements.filter(a => a.unlocked).length}/{state.achievements.length})
        </button>
        <button
          onClick={() => {
            setIsSavePanelOpen(true);
            playSound('click');
          }}
          className="w-full py-3 min-h-[44px] bg-holo-blue/20 border border-holo-blue/50 rounded-lg text-holo-blue hover:bg-holo-blue/30 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Save className="w-4 h-4" />
          保存进度
        </button>

        <button
          onClick={() => {
            setIsSettingsOpen(true);
            playSound('click');
          }}
          className="w-full py-3 min-h-[44px] bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
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
          className="w-full py-3 min-h-[44px] bg-white/5 border border-white/20 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Home className="w-4 h-4" />
          返回主菜单
        </button>
      </div>
    </div>

    {/* Panels - outside the glass-card */}
    <Suspense fallback={<Loading />}>
      <SkillsPanel
        isOpen={isSkillsPanelOpen}
        onClose={() => setIsSkillsPanelOpen(false)}
      />
      <AchievementPanel
        isOpen={isAchievementPanelOpen}
        onClose={() => setIsAchievementPanelOpen(false)}
      />
      <SaveSlotPanel
        isOpen={isSavePanelOpen}
        onClose={() => setIsSavePanelOpen(false)}
        mode="save"
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </Suspense>
    </>
  );
});
