import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Heart, Zap, Coins, Smile, Frown, Brain, Sparkles, Palette, Clover, Save, Home, Settings, Server, Star, HeartPulse, Users, Crown, User } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { formatMoney, STAT_BOUNDS } from '@/game/gameState';
import { AchievementPanel } from './AchievementPanel';
import { useToast } from './ToastNotification';
import { SaveSlotPanel } from './SaveSlotPanel';
import { SettingsPanel } from './SettingsPanel';
import { useSound } from './SoundManager';

interface StatBarProps {
  icon: React.ElementType;
  label: string;
  value: number;
  max: number;
  color: string;
  showValue?: boolean;
  prefix?: string;
  displayValue?: string;
}

function StatBar({ icon: Icon, label, value, max, color, showValue = true, prefix = '', displayValue }: StatBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const isLow = percentage < 30;
  const isCritical = percentage < 15;

  return (
    <div className="space-y-1 sm:space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-white/70 text-xs sm:text-sm">{label}</span>
        </div>
        {showValue && (
          <span className={`text-xs sm:text-sm font-mono ${isCritical ? 'text-fatal-red animate-pulse' : 'text-white'}`}>
            {prefix}{displayValue ?? value.toLocaleString()}
          </span>
        )}
      </div>
      <div className="relative h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 rounded-full" />
        
        {/* Fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${isCritical ? 'animate-pulse' : ''}`}
          style={{ 
            backgroundColor: color,
            boxShadow: isLow ? `0 0 10px ${color}` : 'none',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        />
        
        {/* Critical shake effect */}
        {isCritical && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-fatal-red"
            animate={{ 
              x: [-1, 1, -1, 1, 0],
              opacity: [1, 0.5, 1, 0.5, 1],
            }}
            transition={{ 
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        )}
      </div>
    </div>
  );
}

interface ProfileCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description?: string;
  iconColor?: string;
}

function ProfileCard({ icon: Icon, title, value, description, iconColor = '#00D2FF' }: ProfileCardProps) {
  return (
    <motion.div 
      className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-all"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${iconColor}20` }}>
          <Icon className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/50 text-xs mb-1">{title}</p>
          <p className="text-white font-medium truncate text-sm sm:text-base">{value}</p>
          {description && (
            <p className="text-white/40 text-xs mt-1">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export const StatPanel = React.memo(() => {
  const { state, dispatch } = useGame();
  const { stats } = state;
  const [isAchievementPanelOpen, setIsAchievementPanelOpen] = useState(false);
  const [isSavePanelOpen, setIsSavePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showToast } = useToast();
  const { playSound } = useSound();

  // Determine mood icon and color
  const getMoodInfo = () => {
    if (stats.mood >= 70) return { icon: Smile, color: '#00FF88', label: '开心' };
    if (stats.mood >= 40) return { icon: Smile, color: '#FFD700', label: '一般' };
    return { icon: Frown, color: '#FF4B4B', label: '沮丧' };
  };

  const moodInfo = getMoodInfo();

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
          Lv. {stats.age}
        </motion.div>
      </div>

      {/* Player Profile Section */}
      {(state.birthServer || state.birthTalent || state.familyTier) && (
        <div className="space-y-3 sm:space-y-4">
          <h4 className="text-xs sm:text-sm font-semibold text-white/80 flex items-center gap-2">
            <User className="w-4 h-4 text-holo-purple" />
            玩家档案
          </h4>
          
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {state.birthServer && (
              <ProfileCard
                icon={Server}
                title="出生服务器"
                value={state.birthServer}
                iconColor="#00D2FF"
              />
            )}
            
            {state.birthTalent && (
              <ProfileCard
                icon={Star}
                title="天赋"
                value={state.birthTalent}
                iconColor="#FFD700"
              />
            )}
            
            <ProfileCard
              icon={stats.isMarried ? HeartPulse : Users}
              title="婚姻状态"
              value={stats.isMarried ? "已婚" : "单身"}
              description={stats.isMarried ? "组建了自己的家庭" : "享受自由的单身生活"}
              iconColor={stats.isMarried ? "#FF4B4B" : "#8B5CF6"}
            />
            
            {state.familyTier && (
              <ProfileCard
                icon={Crown}
                title="出身等级"
                value={
                  state.familyTier === 'SSR' ? '★★★ SSR 豪门世家' :
                  state.familyTier === 'SR' ? '★★ SR 小康家庭' :
                  state.familyTier === 'R' ? '★ R 普通家庭' :
                  '⚙ N 困难模式'
                }
                description={
                  state.familyTier === 'SSR' ? '豪门世家 · 开局即巅峰' :
                  state.familyTier === 'SR' ? '小康家庭 · 衣食无忧' :
                  state.familyTier === 'R' ? '普通家庭 · 靠自己奋斗' :
                  '困难模式 · 生存即是胜利'
                }
                iconColor={
                  state.familyTier === 'SSR' ? '#FFD700' :
                  state.familyTier === 'SR' ? '#A855F7' :
                  state.familyTier === 'R' ? '#3B82F6' :
                  '#6B7280'
                }
              />
            )}
          </div>
        </div>
      )}

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
          max={Math.max(1000000, stats.money)}
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


      
      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10 space-y-2 sm:space-y-3">
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
    </>
  );
});
