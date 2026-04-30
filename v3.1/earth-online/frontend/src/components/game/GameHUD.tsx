import React, { Suspense, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, GitFork, Home, Save, Settings, Trophy,
  Heart, Zap, Coins, Smile, Brain, Sparkles,
  ScrollText, TrendingUp, TrendingDown, Minus, User, Briefcase, Users,
  Terminal, PanelLeft, PanelRight, X
} from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { usePanelManager } from '@/hooks/usePanelManager';
import { DecisionPanel } from './DecisionPanel';
import { DeathScreen } from './DeathScreen';
import { useToast } from './ToastNotification';
import { useSound } from './SoundManager';
import type { PlayerStats } from '@/game/core/types';
import { getEconomyState } from '@/game/systems/economySystem';
import { attrColor, getMoodInfo, getAgeAvatar, getServerTheme } from '@/config/attributeColors';
import { useMobilePanels } from './useMobilePanels';
import { Loading } from '@/components/Loading';
import { SkillsPanel, AchievementPanel, SaveSlotPanel, SettingsPanel } from './lazyImports';

/** 紧凑属性条 - P2-02: 增加表情化指示 */
const CompactStatBar = ({ icon: Icon, label, statKey, value, max, color, prefix = '' }: {
  icon: React.ElementType;
  label: string;
  statKey: string;
  value: number;
  max: number;
  color: string;
  prefix?: string;
}) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  // P2-02: 根据数值区间返回表情和状态文本
  const getEmojiInfo = (val: number, key: string) => {
    if (key === 'mood') {
      if (val >= 80) return { emoji: '😊', status: '状态极佳' };
      if (val >= 50) return { emoji: '😐', status: '一般' };
      if (val >= 20) return { emoji: '😟', status: '低落' };
      return { emoji: '🤒', status: '危险' };
    }
    if (key === 'health') {
      if (val >= 80) return { emoji: '💪', status: '健康' };
      if (val >= 40) return { emoji: '🏥', status: '受伤' };
      return { emoji: '☠️', status: '危急' };
    }
    if (key === 'energy') {
      if (val >= 70) return { emoji: '⚡', status: '充沛' };
      if (val >= 30) return { emoji: '😴', status: '疲惫' };
      return { emoji: '🔋', status: '耗尽' };
    }
    return { emoji: '', status: '' };
  };

  const emojiInfo = getEmojiInfo(value, statKey);
  const isLow = pct < 25;

  return (
    <div className="flex items-center gap-2 group cursor-default" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <Icon className={`w-4 h-4 shrink-0 ${isLow ? 'animate-pulse-red' : ''}`} style={{ color }} aria-hidden="true" />
      <span className="text-[11px] text-game-text-secondary w-8 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-300 group-hover:brightness-110 ${isLow ? 'animate-pulse-slow' : ''}`} 
          style={{ width: `${pct}%`, backgroundColor: color }} 
        />
      </div>
      <span className="text-[11px] text-game-text w-10 text-right font-mono tabular-nums">{prefix}{Math.round(value)}</span>
      {/* P2-02: 表情指示器 */}
      {emojiInfo.emoji && (
        <span
          className={`text-xs shrink-0 ${isLow ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}
          title={emojiInfo.status}
        >
          {emojiInfo.emoji}
        </span>
      )}
    </div>
  );
};

/** 小型日志项 - PC端右侧日志 - WCAG AA 对比度优化 */
const MiniLogItem = ({ log }: { log: { year: number; event: string; type: string; statChanges?: Record<string, number>; action?: string } }) => {
  const statEntries = log.statChanges ? Object.entries(log.statChanges).filter(([, v]) => v !== 0 && v !== null && v !== undefined) : [];
  return (
    <div
      className="py-1 border-b border-white/5 leading-relaxed hover:bg-white/5 px-1 rounded transition-colors cursor-pointer group"
      title={log.event}
    >
      <div className="flex items-start gap-1">
        <span className="text-holo-blue/70 font-mono text-[10px] shrink-0">[{log.year}岁]</span>
        <span className="text-white/60 group-hover:text-white/70 text-[10px] leading-snug flex-1 min-w-0 truncate">
          {log.event}
        </span>
      </div>
      {statEntries.length > 0 && (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 pl-0">
          {statEntries.slice(0, 5).map(([key, value]) => {
            const labels: Record<string, string> = {
              health: '健康', energy: '精力', money: '金钱', mood: '心情',
              intelligence: '智力', charm: '魅力', creativity: '创造力',
              luck: '运气', karma: '福报', trauma: '创伤',
              physical_fitness: '体能', emotional_stability: '情绪',
              social_capital: '社交', reputation: '声望',
            };
            const label = labels[key] || key;
            const numVal = Number(value);
            const isPositive = numVal > 0;
            const isNegative = numVal < 0;
            const displayVal = numVal % 1 === 0 ? String(numVal) : numVal.toFixed(1);
            const bgColor = isPositive ? 'bg-green-400/10' : isNegative ? 'bg-red-400/10' : 'bg-white/5';
            const textColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/30';
            return (
              <span key={key} className={`text-[9px] font-mono px-1 rounded ${bgColor} ${textColor}`}>
                {label} {isPositive ? '+' : ''}{displayVal}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** 属性变化标签 */
const StatChangeTag = ({ label, value }: { label: string; value: number }) => {
  const isPositive = value > 0;
  const color = isPositive ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-white/40';
  const prefix = isPositive ? '+' : '';
  return (
    <span className={`text-[9px] font-mono ${color}`}>
      {label}{prefix}{value}
    </span>
  );
};

/** 空状态组件 */
const EmptyState = ({ message, action }: { message: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <Terminal className="w-12 h-12 text-white/20 mb-2" />
    <p className="text-[11px] text-white/40 mb-3">{message}</p>
    {action}
  </div>
);

export const GameHUD = React.memo(function GameHUD() {
  const { state, currentEvent, dispatch } = useGame();
  const { showToast } = useToast();
  const { playSound } = useSound();
  const { openPanel, closePanel, isPanelOpen, savePanelMode, setSavePanelMode } = usePanelManager();
  // P1-02: 使用统一的面板状态管理Hook
  const {
    showMobileStats,
    showMobileLogs,
    toggleStats,
    toggleLogs,
    closeAll,
    setShowMobileStats,
    setShowMobileLogs,
  } = useMobilePanels();

  const { stats } = state;
  const moodInfo = getMoodInfo(stats.mood);
  const economyState = getEconomyState(stats.economyFactor);

  if (state.phase === 'GAMEOVER') return <DeathScreen />;

  return (
    <div className="h-screen bg-game-bg overflow-hidden flex flex-col">
      {/* ====== 顶部信息栏 (高度自适应，两行布局) ====== */}
      <header className="px-2 sm:px-4 py-2 border-b border-game-divider bg-game-bg/95 shrink-0 z-10">
        {/* 第一行：标题 + 角色名 + 快捷按钮 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* 移动端属性面板切换按钮 */}
            <button
              onClick={toggleStats}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-lg hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center"
              aria-label="属性面板"
            >
              <PanelLeft className="w-5 h-5 text-white/60" />
            </button>
            <GitFork className="w-4 h-4 text-holo-blue hidden sm:block" />
            <span className="text-sm font-bold text-white font-orbitron hidden sm:inline">生存控制台</span>
          </div>

          {/* 中间：角色名字 */}
          <div className="text-center px-2 max-w-[120px] sm:max-w-[200px] truncate">
            <span className="text-sm font-bold text-holo-blue">
              {state.characterName || '无名角色'}
            </span>
            <span className="text-[10px] text-white/40 ml-2 hidden sm:inline">v2.1</span>
          </div>

          {/* 右侧：快捷按钮 */}
          <div className="flex items-center gap-0.5 justify-end">
            <button
              onClick={() => { openPanel('skills'); playSound('click'); }}
              className="min-w-[44px] min-h-[44px] p-2 sm:p-1.5 rounded-lg sm:rounded-md hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center"
              aria-label="技能"
            >
              <BookOpen className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white/60" />
            </button>
            <button
              onClick={() => openPanel('achievements')}
              className="min-w-[44px] min-h-[44px] p-2 sm:p-1.5 rounded-lg sm:rounded-md hover:bg-white/10 transition-colors active:scale-95 hidden sm:flex items-center justify-center"
              aria-label="成就"
            >
              <Trophy className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white/60" />
            </button>
            <button
              onClick={() => { setSavePanelMode('save'); openPanel('save'); playSound('click'); }}
              className="min-w-[44px] min-h-[44px] p-2 sm:p-1.5 rounded-lg sm:rounded-md hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center"
              aria-label="存档"
            >
              <Save className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-holo-blue" />
            </button>
            <button
              onClick={() => { openPanel('settings'); playSound('click'); }}
              className="min-w-[44px] min-h-[44px] p-2 sm:p-1.5 rounded-lg sm:rounded-md hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center"
              aria-label="设置"
            >
              <Settings className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white/60" />
            </button>
            <button
              onClick={() => { dispatch({ type: 'GO_TO_LANDING' }); showToast('已返回主菜单', 'info'); }}
              className="min-w-[44px] min-h-[44px] p-2 sm:p-1.5 rounded-lg sm:rounded-md hover:bg-white/10 transition-colors active:scale-95 flex items-center justify-center"
              aria-label="退出"
            >
              <Home className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white/60" />
            </button>
            {/* 移动端日志面板切换按钮 */}
            <button
              onClick={toggleLogs}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-lg hover:bg-white/10 transition-colors active:scale-95 ml-1 flex items-center justify-center"
              aria-label="日志面板"
            >
              <PanelRight className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>

        {/* 第二行：年龄、资金、状态、经济 */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {/* 年龄 */}
          <div className="text-[11px] text-white/70 px-2 py-1 rounded-md bg-white/5 flex items-center gap-1">
            <span className="text-sm leading-none" title={getAgeAvatar(stats.age).label}>{getAgeAvatar(stats.age).emoji}</span>
            <span className="text-holo-blue font-bold">{stats.age}岁</span>
          </div>

          {/* 金币 */}
          <div className="flex items-center gap-1 text-[11px] text-white/70 px-2 py-1 rounded-md bg-white/5">
            <Coins className="w-3.5 h-3.5 text-attr-gold" />
            <span className="font-mono">¥{(stats.money || 0).toLocaleString()}</span>
          </div>

          {/* 状态图标 */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5">
            {stats.health < 20 ? (
              <span title="生命值过低"><Heart className="w-3.5 h-3.5 text-attr-health animate-pulse-red" /></span>
            ) : stats.energy < 20 ? (
              <span title="精力不足"><Zap className="w-3.5 h-3.5 text-attr-energy animate-pulse" /></span>
            ) : (
              <span title="状态良好"><Smile className="w-3.5 h-3.5 text-attr-mood" /></span>
            )}
            <span className="text-[10px] text-white/50">
              {stats.health < 20 ? '危急' : stats.energy < 20 ? '疲惫' : '良好'}
            </span>
          </div>

          {/* 经济状态 */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
            {economyState === 'boom' ? <TrendingUp className="w-3.5 h-3.5 text-green-400" /> :
             economyState === 'crisis' ? <TrendingDown className="w-3.5 h-3.5 text-red-400" /> :
             <Minus className="w-3.5 h-3.5 text-white/40" />}
            <span className="text-[11px] text-white/70">
              {economyState === 'boom' ? '繁荣' : economyState === 'crisis' ? '危机' : '正常'}
            </span>
          </div>
        </div>
      </header>

      {/* ====== 主体内容区 (自适应高度) ====== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 左侧: 属性面板 - 统一使用 lg 断点 */}
        {/* P1-03: 移动端面板添加滑入/滑出动画 */}
        <AnimatePresence>
          {showMobileStats && (
            <motion.aside
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-30 w-[280px] shadow-2xl lg:hidden shrink-0 border-r border-game-divider flex-col overflow-y-auto bg-game-panel"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div className="flex items-center justify-between p-2 border-b border-game-divider bg-white/5">
                <span className="text-sm font-bold text-white">属性面板</span>
                <button
                  onClick={() => setShowMobileStats(false)}
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="关闭属性面板"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              {/* 核心属性 */}
              <div className="p-3 space-y-2 border-b border-game-divider">
                <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2">核心属性</h3>
                <CompactStatBar icon={Heart} label="健康" statKey="health" value={stats.health} max={stats.maxHealth} color={attrColor('health')} />
                <CompactStatBar icon={Zap} label="精力" statKey="energy" value={stats.energy} max={stats.maxEnergy} color={attrColor('energy')} />
                <CompactStatBar icon={Coins} label="金币" statKey="money" value={stats.money} max={Math.max(1000000, Math.abs(stats.money))} color={attrColor('gold')} prefix="¥" />
                <CompactStatBar icon={Smile} label="心情" statKey="mood" value={stats.mood} max={100} color={attrColor('mood', stats.mood)} />
              </div>

              {/* 成长属性 */}
              <div className="p-3 space-y-2 border-b border-game-divider">
                <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2">成长属性</h3>
                <CompactStatBar icon={Brain} label="智力" statKey="intelligence" value={stats.intelligence} max={150} color={attrColor('intellect')} />
                <CompactStatBar icon={Sparkles} label="魅力" statKey="charm" value={stats.charm} max={100} color={attrColor('charm')} />
              </div>

              {/* 人生状态 */}
              <div className="p-3 space-y-1.5 text-[11px] border-b border-game-divider">
                <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2">人生状态</h3>
                <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
                  <span>出身</span>
                  <span className="text-game-text">{state.familyTier || '未知'}</span>
                </div>
                <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
                  <span>服务器</span>
                  <span className="text-game-text flex items-center gap-1">
                    <span className="text-xs" title={getServerTheme(state.birthServer).description}>{getServerTheme(state.birthServer).iconEmoji}</span>
                    {state.birthServer || '未知'}
                  </span>
                </div>
                <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
                  <span>天赋</span>
                  <span className="text-game-text">{state.birthTalent || '无'}</span>
                </div>
                <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
                  <span>婚姻</span>
                  <span className={stats.isMarried ? 'text-pink-400' : 'text-game-text'}>
                    {stats.isMarried ? (stats.partner?.name || '已婚') : '单身'}
                  </span>
                </div>
                <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
                  <span>职业</span>
                  <span className="text-game-text">{stats.career?.currentCareer || '无'}</span>
                </div>
                <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
                  <span>资产</span>
                  <span className="text-game-text">¥{(stats.totalAssets || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
                  <span>家族</span>
                  <span className="text-game-text">{stats.familyName || '无'}</span>
                </div>
                <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
                  <span>子女</span>
                  <span className="text-game-text">{stats.children?.length || 0}人</span>
                </div>
              </div>

              {/* 技能点 */}
              <div className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-game-text-secondary">技能点</span>
                  <span className="text-[12px] text-holo-purple font-bold font-mono">{stats.skillPoints}</span>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* PC端左侧属性面板 (常驻) */}
        <aside
          className="hidden lg:flex w-[20%] min-w-[200px] max-w-[280px] shrink-0 border-r border-game-divider flex-col overflow-y-auto bg-game-panel"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* 核心属性 */}
          <div className="p-3 space-y-2 border-b border-game-divider">
            <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2">核心属性</h3>
            <CompactStatBar icon={Heart} label="健康" statKey="health" value={stats.health} max={stats.maxHealth} color={attrColor('health')} />
            <CompactStatBar icon={Zap} label="精力" statKey="energy" value={stats.energy} max={stats.maxEnergy} color={attrColor('energy')} />
            <CompactStatBar icon={Coins} label="金币" statKey="money" value={stats.money} max={Math.max(1000000, Math.abs(stats.money))} color={attrColor('gold')} prefix="¥" />
            <CompactStatBar icon={Smile} label="心情" statKey="mood" value={stats.mood} max={100} color={attrColor('mood', stats.mood)} />
          </div>

          {/* 成长属性 */}
          <div className="p-3 space-y-2 border-b border-game-divider">
            <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2">成长属性</h3>
            <CompactStatBar icon={Brain} label="智力" statKey="intelligence" value={stats.intelligence} max={150} color={attrColor('intellect')} />
            <CompactStatBar icon={Sparkles} label="魅力" statKey="charm" value={stats.charm} max={100} color={attrColor('charm')} />
          </div>

          {/* 人生状态 */}
          <div className="p-3 space-y-1.5 text-[11px] border-b border-game-divider">
            <h3 className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-2">人生状态</h3>
            <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
              <span>出身</span>
              <span className="text-game-text">{state.familyTier || '未知'}</span>
            </div>
            <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
              <span>服务器</span>
              <span className="text-game-text flex items-center gap-1">
                <span className="text-xs" title={getServerTheme(state.birthServer).description}>{getServerTheme(state.birthServer).iconEmoji}</span>
                {state.birthServer || '未知'}
              </span>
            </div>
            <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
              <span>天赋</span>
              <span className="text-game-text">{state.birthTalent || '无'}</span>
            </div>
            <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
              <span>婚姻</span>
              <span className={stats.isMarried ? 'text-pink-400' : 'text-game-text'}>
                {stats.isMarried ? (stats.partner?.name || '已婚') : '单身'}
              </span>
            </div>
            <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
              <span>职业</span>
              <span className="text-game-text">{stats.career?.currentCareer || '无'}</span>
            </div>
            <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
              <span>资产</span>
              <span className="text-game-text">¥{(stats.totalAssets || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
              <span>家族</span>
              <span className="text-game-text">{stats.familyName || '无'}</span>
            </div>
            <div className="flex justify-between text-game-text-secondary hover:text-game-text transition-colors">
              <span>子女</span>
              <span className="text-game-text">{stats.children?.length || 0}人</span>
            </div>
          </div>

          {/* 技能点 */}
          <div className="p-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-game-text-secondary">技能点</span>
              <span className="text-[12px] text-holo-purple font-bold font-mono">{stats.skillPoints}</span>
            </div>
          </div>
        </aside>

        {/* 中间: 事件决策区 (60%) - P2-03: 增强视觉焦点 */}
        <main className="flex-1 flex flex-col min-w-0 bg-game-card relative overflow-hidden">
          {/* P2-03: 核心区域增强外发光 - 从3%提升至8% + 内发光 */}
          <div
            className="absolute inset-0 pointer-events-none rounded-lg"
            style={{
              boxShadow: `
                0 0 60px rgba(0, 210, 255, 0.08),
                inset 0 0 30px rgba(0, 210, 255, 0.04)
              `,
            }}
          />
          <DecisionPanel event={currentEvent} />
        </main>

        {/* 右侧: 日志区 - 统一使用 lg 断点 + P1-03动画 */}
        <AnimatePresence>
          {showMobileLogs && (
            <motion.aside
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-30 w-[280px] shadow-2xl lg:hidden shrink-0 border-l border-game-divider flex-col bg-game-panel"
            >
              <div className="flex items-center justify-between p-2 border-b border-game-divider bg-white/5">
                <span className="text-sm font-bold text-white">命运日志</span>
                <button
                  onClick={() => setShowMobileLogs(false)}
                  className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="关闭日志面板"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <div className="h-8 px-3 flex items-center justify-between border-b border-game-divider bg-white/5">
                <div className="flex items-center gap-1.5">
                  <ScrollText className="w-3.5 h-3.5 text-holo-blue" />
                  <span className="text-[11px] text-white/70 font-bold">命运日志</span>
                  <span className="text-[10px] text-white/30">{state.logs.length}条</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
                {state.logs.length === 0 ? (
                  <EmptyState
                    message="暂无事件记录，开始你的生存之旅吧"
                    action={
                      <button
                        onClick={() => {
                          dispatch({
                            type: 'TICK_YEAR',
                            payload: {
                              action: '开始生存',
                              statChanges: {},
                              event: '你踏上了生存之旅，命运之轮开始转动...',
                              eventType: 'milestone',
                            },
                          });
                        }}
                        className="text-[11px] px-3 py-1.5 rounded-md bg-holo-blue/10 text-holo-blue border border-holo-blue/30 hover:bg-holo-blue/20 transition-colors"
                      >
                        开始游戏
                      </button>
                    }
                  />
                ) : (
                  <>
                    {state.logs.map((log, i) => (
                      <MiniLogItem key={i} log={log} />
                    ))}
                  </>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* PC端右侧日志面板 (常驻) */}
        <aside
          className="hidden lg:flex w-[20%] min-w-[180px] max-w-[260px] shrink-0 border-l border-game-divider flex-col bg-game-panel"
        >
          <div className="h-8 px-3 flex items-center justify-between border-b border-game-divider bg-white/5">
            <div className="flex items-center gap-1.5">
              <ScrollText className="w-3.5 h-3.5 text-holo-blue" />
              <span className="text-[11px] text-white/70 font-bold">命运日志</span>
              <span className="text-[10px] text-white/30">{state.logs.length}条</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
            {state.logs.length === 0 ? (
              <EmptyState
                message="暂无事件记录，开始你的生存之旅吧"
                action={
                  <button
                    onClick={() => {
                      dispatch({
                        type: 'TICK_YEAR',
                        payload: {
                          action: '开始生存',
                          statChanges: {},
                          event: '你踏上了生存之旅，命运之轮开始转动...',
                          eventType: 'milestone',
                        },
                      });
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-md bg-holo-blue/10 text-holo-blue border border-holo-blue/30 hover:bg-holo-blue/20 transition-colors"
                  >
                    开始游戏
                  </button>
                }
              />
            ) : (
              <>
                {state.logs.map((log, i) => (
                  <MiniLogItem key={i} log={log} />
                ))}
              </>
            )}
          </div>
        </aside>

        {/* 移动端遮罩层 - 统一使用 lg 断点 */}
        {(showMobileStats || showMobileLogs) && (
          <div
            className="lg:hidden absolute inset-0 bg-black/50 z-20"
            onClick={closeAll}
          />
        )}
      </div>

      {/* ====== 底部状态栏 (固定高度 28px) ====== */}
      <footer className="h-7 px-4 flex items-center justify-between border-t border-game-divider bg-game-bg/95 shrink-0 text-[10px] text-white/55">
        <div className="flex items-center gap-4">
          <span>成就: {state.achievements.filter(a => a.unlocked).length}/{state.achievements.length}</span>
          <span>快乐年: {state.consecutiveHappyYears}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>经济: {(stats.economyFactor * 100).toFixed(0)}%</span>
          <span>回合: {state.currentYear}</span>
        </div>
      </footer>

      {/* 面板 */}
      <Suspense fallback={<Loading />}>
        <SkillsPanel isOpen={isPanelOpen('skills')} onClose={() => closePanel('skills')} />
        <AchievementPanel isOpen={isPanelOpen('achievements')} onClose={() => closePanel('achievements')} />
        <SaveSlotPanel isOpen={isPanelOpen('save')} onClose={() => closePanel('save')} mode={savePanelMode} />
        <SettingsPanel isOpen={isPanelOpen('settings')} onClose={() => closePanel('settings')} />
      </Suspense>
    </div>
  );
});
