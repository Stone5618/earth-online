import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, AlertCircle } from 'lucide-react';
import { useGame } from '@/game/GameContext';
import { useToast } from './ToastNotification';
import { GlowingButton } from '@/components/GlowingButton';
import { ChoiceResultModal } from './ChoiceResultModal';
import type { GameEvent } from '@/game/gameState';
import { useState } from 'react';

interface DecisionPanelProps {
  event: GameEvent | null;
}

export function DecisionPanel({ event }: DecisionPanelProps) {
  const { tickYear, restAndRecover, state } = useGame();
  const { showToast } = useToast();
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<{
    choiceText: string;
    statChanges: any;
    choiceIndex: number;
    event: GameEvent;
  } | null>(null);

  const handleChoice = (choiceIndex: number) => {
    if (!event) return;
    const choice = event.choices[choiceIndex];
    setPendingChoice({
      choiceText: choice.text,
      statChanges: choice.statChanges,
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

  if (!event) {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <GitFork className="w-16 h-16 text-holo-blue/30" />
        </motion.div>
        <p className="text-white/50 mt-4">等待命运降临...</p>
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
      />

      <div className="glass-card p-4 h-full overflow-y-auto">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
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
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <p className="text-white leading-relaxed">{event.text}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/50">
              <AlertCircle className="w-4 h-4" />
              <span>当前年龄: {state.stats.age} 岁</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {event.choices.map((choice, index) => (
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
                  className="w-full text-left justify-start min-h-[56px] py-4 px-4 active:scale-[0.97] touch-manipulation"
                >
                  <div className="flex-1">
                    <span className="block">{choice.text}</span>
                  </div>
                </GlowingButton>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/40 text-xs mb-3">快捷操作</p>
          <div className="flex gap-3">
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
}
