import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, AlertCircle } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { useToast } from './ToastNotification';
import { GlowingButton } from '@/components/GlowingButton';
import { ChoiceResultModal } from './ChoiceResultModal';
import { resolveChoiceText, resolveStatChanges } from '@/game/gameState';
import type { GameEvent } from '@/game/gameState';

interface DecisionPanelProps {
  event: GameEvent | null;
}

export const DecisionPanel = React.memo(({ event }: DecisionPanelProps) => {
  const { tickYear, restAndRecover, state } = useGame();
  const { showToast } = useToast();
  const [resultModalOpen, setResultModalOpen] = useState(false);
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
      
      // 自动检查: 如果 statChanges 有金钱为负，且当前金钱小于绝对值
      // 先临时计算一次 statChanges 看是否有金钱消耗
      const tempStats = resolveStatChanges(choice.statChanges, state.stats);
      const moneyCost = - (tempStats.money || 0);
      if (moneyCost > 0 && state.stats.money < moneyCost) {
        disabled = true;
        disabledReason = `需要 ¥${moneyCost.toLocaleString()}`;
      }
      
      // 检查自定义 disabled 条件
      if (!disabled && typeof choice.disabled === 'function') {
        if (choice.disabled(state.stats)) {
          disabled = true;
          disabledReason = choice.disabledReason;
        }
      } else if (!disabled && typeof choice.disabled === 'boolean') {
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
      tickYear(pendingChoice.choiceIndex, pendingChoice.event);
      setResultModalOpen(false);
      setPendingChoice(null);
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
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-4">
          <GitFork className="w-5 h-5 text-holo-blue" />
          命运抉择
        </h3>

        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <p className="text-white leading-relaxed text-sm sm:text-base">{event.text}</p>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/50">
              <AlertCircle className="w-4 h-4" />
              <span>当前年龄: {state.stats.age} 岁</span>
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
                    choice.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
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
