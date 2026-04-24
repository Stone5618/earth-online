import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, AlertCircle, Heart, Zap, Coins, Smile, Brain, Sparkles, Palette, Clover } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { useToast } from './ToastNotification';
import { GlowingButton } from '@/components/GlowingButton';
import { ChoiceResultModal } from './ChoiceResultModal';
import { resolveChoiceText, resolveStatChanges } from '@/game/gameState';
import type { GameEvent } from '@/game/gameState';

interface DecisionPanelProps {
  event: GameEvent | null;
}

// 紧凑属性条组件
const CompactStatItem = ({ icon: Icon, value, max, color, label, prefix = "" }: {
  icon: React.ElementType;
  value: number;
  max: number;
  color: string;
  label: string;
  prefix?: string;
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const isLow = percentage < 30;
  const isCritical = percentage < 15;
  
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Icon className="w-3 h-3" style={{ color }} />
          <span className="text-[10px] text-white/60">{label}</span>
        </div>
        <span className={`text-[10px] font-mono ${isCritical ? 'text-fatal-red animate-pulse' : 'text-white/80'}`}>
          {prefix}{value.toLocaleString()}
        </span>
      </div>
      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: isLow ? `0 0 6px ${color}` : 'none',
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

// 数值属性展示组件
const NumericStatItem = ({ icon: Icon, value, color, label }: {
  icon: React.ElementType;
  value: number;
  color: string;
  label: string;
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <div>
        <span className="text-[10px] text-white/60 block">{label}</span>
        <span className="text-xs font-mono text-white">{value}</span>
      </div>
    </div>
  );
};

export const DecisionPanel = React.memo(({ event }: DecisionPanelProps) => {
  const { tickYear, restAndRecover, state } = useGame();
  const { showToast } = useToast();
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<{
    choiceText: string;
    statChanges: any;
    choiceIndex: number;
    event: GameEvent;
    followUp?: string;
  } | null>(null);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const resolvedChoices = useMemo(() => {
    if (!event) return [];
    return event.choices.map(choice => {
      // 第一步: 预计算 resolvedText
      const resolvedText = resolveChoiceText(choice.text, state.stats);
      
      // 第二步: 计算是否禁用
      let disabled = false;
      let disabledReason: string | undefined;
      
      // 检查自定义 disabled 条件
      if (typeof choice.disabled === 'function') {
        if (choice.disabled(state.stats)) {
          disabled = true;
          disabledReason = choice.disabledReason;
        }
      } else if (typeof choice.disabled === 'boolean') {
        disabled = choice.disabled;
        disabledReason = choice.disabledReason;
      }
      
      return {
        ...choice,
        resolvedText,
        disabled,
        disabledReason,
      };
    });
  }, [event, state.stats]);

  const handleChoice = (choiceIndex: number) => {
    if (!event) return;
    if (isSubmitting) return;
    const choice = event.choices[choiceIndex];
    const resolvedChoice = resolvedChoices[choiceIndex];
    
    // 如果禁用了，不处理
    if (resolvedChoice.disabled) {
      return;
    }
    
    // ⭐关键: 一次性计算 statChanges 和 followUp，确保两者基于同一个随机结果！
    const resolvedStatChanges = resolveStatChanges(choice.statChanges, state.stats);
    
    // 计算 followUp
    let resolvedFollowUp: string | undefined;
    if (choice.followUp) {
      if (typeof choice.followUp === 'function') {
        resolvedFollowUp = choice.followUp(resolvedStatChanges);
      } else {
        resolvedFollowUp = choice.followUp;
      }
    } else if (choice.resultMessage) {
      resolvedFollowUp = choice.resultMessage;
    }
    
    setPendingChoice({
      choiceText: resolvedChoice.resolvedText,
      statChanges: resolvedStatChanges,
      followUp: resolvedFollowUp,
      choiceIndex,
      event
    });
    setResultModalOpen(true);
  };

  const confirmChoice = () => {
    if (pendingChoice) {
      setIsSubmitting(true);
      tickYear({
        choiceIndex: pendingChoice.choiceIndex,
        event: pendingChoice.event,
        resolvedActionText: pendingChoice.choiceText,
        resolvedStatChanges: pendingChoice.statChanges,
        resolvedLogEventText: pendingChoice.followUp || pendingChoice.event.text
      });
      setResultModalOpen(false);
      setPendingChoice(null);
      // 这里不等异步结果（reducer同步），下一帧释放即可防连点
      requestAnimationFrame(() => setIsSubmitting(false));
    }
  };

  const handleRestAndRecover = () => {
    restAndRecover();
    const moneyCost = Math.max(0, Math.floor(state.stats.money * 0.1));
    showToast(
      moneyCost > 0 
        ? `休息恢复！花费 ¥${moneyCost.toLocaleString()}` 
        : "休息恢复！没钱也能在家休息",
      "success"
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 当滑动距离超过30px时关闭面板
    if (distance > 30) {
      // 这里可以添加关闭面板的逻辑
      // 由于DecisionPanel是一个子组件，实际的关闭逻辑可能在父组件中
      // 这里我们暂时只添加滑动检测
    }
  };

  if (!event) {
    return (
      <div className="glass-card p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <GitFork className="w-12 sm:w-16 h-12 sm:h-16 text-holo-blue/30" />
        </motion.div>
        <p className="text-white/50 mt-4 text-sm sm:text-base">等待命运降临...</p>
      </div>
    );
  }

  return (
    <>
      <ChoiceResultModal
        isOpen={resultModalOpen}
        onClose={confirmChoice}
        choiceText={pendingChoice?.choiceText || ''}
        statChanges={pendingChoice?.statChanges || {}}
        followUp={pendingChoice?.followUp}
      />

      <div 
        className="glass-card p-3 sm:p-4 h-full overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-3">
          <GitFork className="w-5 h-5 text-holo-blue" />
          命运生存控制台
        </h3>

        {/* 紧凑基础属性面板 - 移动端优化 */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
          {/* 进度条属性 */}
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <CompactStatItem
              icon={Heart}
              label="健康"
              value={state.stats.health}
              max={state.stats.maxHealth}
              color="#FF4B4B"
            />
            <CompactStatItem
              icon={Zap}
              label="精力"
              value={state.stats.energy}
              max={state.stats.maxEnergy}
              color="#FF6B35"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <CompactStatItem
              icon={Smile}
              label="心情"
              value={state.stats.mood}
              max={100}
              color="#00FF88"
            />
            <CompactStatItem
              icon={Coins}
              label="金钱"
              value={state.stats.money}
              max={Math.max(100000, state.stats.money * 2)}
              color="#FFD700"
              prefix="¥"
            />
          </div>

          {/* 分割线 */}
          <div className="h-px bg-white/10 my-2.5" />

          {/* 数值属性 */}
          <div className="grid grid-cols-4 gap-1.5">
            <NumericStatItem
              icon={Brain}
              label="智力"
              value={state.stats.intelligence}
              color="#00D2FF"
            />
            <NumericStatItem
              icon={Sparkles}
              label="魅力"
              value={state.stats.charm}
              color="#FF69B4"
            />
            <NumericStatItem
              icon={Palette}
              label="创造"
              value={state.stats.creativity}
              color="#A855F7"
            />
            <NumericStatItem
              icon={Clover}
              label="运气"
              value={state.stats.luck}
              color="#00FF88"
            />
          </div>

          {/* 年龄信息 */}
          <div className="flex items-center justify-center gap-2 mt-2.5 pt-2 border-t border-white/5">
            <AlertCircle className="w-3.5 h-3.5 text-holo-blue/70" />
            <span className="text-xs text-white/70">
              当前年龄: <span className="font-bold text-white">{state.stats.age}岁</span>
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white leading-relaxed text-sm sm:text-base">{event.text}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-3 sm:space-y-4">
          <AnimatePresence mode="wait">
            {resolvedChoices.map((choice, index) => (
              <motion.div
                key={`${event.id}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <GlowingButton
                  onClick={() => handleChoice(index)}
                  variant="secondary"
                  className={`w-full text-left justify-start min-h-[56px] py-3 sm:py-4 px-3 sm:px-4 active:scale-[0.97] touch-manipulation ${
                    choice.disabled || isSubmitting ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
                  }`}
                >
                  <div className="flex-1">
                    <span className="block text-sm sm:text-base">{choice.resolvedText}</span>
                    {choice.disabled && choice.disabledReason && (
                      <span className="block text-xs text-white/50 mt-1">{choice.disabledReason}</span>
                    )}
                  </div>
                </GlowingButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/40 text-xs mb-3">快捷操作</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => {
                if (event && event.choices.length > 0) {
                  const randomIndex = Math.floor(Math.random() * event.choices.length);
                  handleChoice(randomIndex);
                }
              }}
              className="flex-1 min-h-[48px] px-4 py-3 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.97] touch-manipulation"
            >
              顺其自然
            </button>
            <button
              onClick={handleRestAndRecover}
              className="flex-1 min-h-[48px] px-4 py-3 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-all active:scale-[0.97] touch-manipulation"
            >
              休息恢复
            </button>
          </div>
        </div>
      </div>
    </>
  );
});
