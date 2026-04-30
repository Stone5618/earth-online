import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork, Heart, Zap, Coins, Smile, Brain, Sparkles,
  HelpCircle, Bed, ArrowRight, Info, Clock, Tag,
  Maximize2, Minimize2, ScrollText, ChevronDown
} from 'lucide-react';
import { useGameState, useGameActions } from '@/game/GameContext';
import { useToast } from './ToastNotification';
import { useSound } from './SoundManager';
import { GlowingButton } from '@/components/GlowingButton';
import { ChoiceResultModal } from './ChoiceResultModal';
import { resolveChoiceText, resolveStatChanges } from '@/game/gameState';
import { useNumberKeySelection } from '@/hooks/useKeyboardShortcuts';
import type { GameEvent, PlayerStats } from '@/game/gameState';
import { safeRender } from '@/lib/safeRender';
import { attrColor } from '@/config/attributeColors';

interface DecisionPanelProps {
  event: GameEvent | null;
  onClose?: () => void;
}

const STAT_ICONS: Record<string, React.ElementType> = {
  health: Heart,
  energy: Zap,
  mood: Smile,
  money: Coins,
  intelligence: Brain,
  charm: Sparkles,
};

const STAT_LABELS: Record<string, string> = {
  health: '健康',
  energy: '精力',
  mood: '心情',
  money: '金钱',
  intelligence: '智力',
  charm: '魅力',
  karma: '福报',
  skillPoints: '技能点',
  socialCapital: '社交',
};

/** 格式化属性变化预览 */
function formatStatPreview(statChanges: Partial<PlayerStats>): { rewards: string[]; costs: string[] } {
  const rewards: string[] = [];
  const costs: string[] = [];
  
  Object.entries(statChanges)
    .filter(([key, value]) => {
      if (key === 'skills' || key === 'partner' || key === 'children' || key === 'debts') return false;
      return typeof value === 'number' && value !== 0;
    })
    .forEach(([key, value]) => {
      const label = STAT_LABELS[key] || key;
      const num = value as number;
      if (num > 0) {
        rewards.push(`${label} +${num}`);
      } else {
        costs.push(`${label} ${num}`);
      }
    });

  return { rewards, costs };
}

/** 任务类型标签 */
const EventTypeTag = ({ type }: { type?: string }) => {
  const typeConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    study: { label: '学习', color: '#42A5F5', bgColor: 'rgba(66, 165, 245, 0.15)' },
    entertainment: { label: '娱乐', color: '#EC407A', bgColor: 'rgba(236, 64, 122, 0.15)' },
    work: { label: '工作', color: '#FFA726', bgColor: 'rgba(255, 167, 38, 0.15)' },
    social: { label: '社交', color: '#66BB6A', bgColor: 'rgba(102, 187, 106, 0.15)' },
    random: { label: '随机', color: '#9E9E9E', bgColor: 'rgba(158, 158, 158, 0.15)' },
  };
  
  const config = type ? typeConfig[type] : null;
  if (!config) return null;
  
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
      style={{ color: config.color, backgroundColor: config.bgColor }}
    >
      <Tag className="w-3 h-3" />
      {config.label}
    </span>
  );
};

/** 选项按钮组件 */
const ChoiceButton = ({ 
  choice, 
  index, 
  onClick, 
  disabled 
}: { 
  choice: any; 
  index: number; 
  onClick: () => void;
  disabled: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { rewards, costs } = formatStatPreview(choice.resolvedStatChanges);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-full min-h-[52px] sm:min-h-[72px] text-left p-2 sm:p-3 rounded-lg border transition-all duration-200 relative overflow-hidden
          ${disabled 
            ? 'bg-white/[0.03] border-white/10 opacity-50 cursor-not-allowed' 
            : 'bg-game-card border-game-divider hover:border-holo-blue/50 hover:shadow-[0_0_15px_rgba(0,210,255,0.1)] active:scale-[0.98] cursor-pointer'
          }
        `}
        aria-label={`选择 ${index + 1}: ${safeRender(choice.resolvedText)}`}
      >
        {/* 悬停时的背景光效 */}
        {!disabled && isHovered && (
          <div className="absolute inset-0 bg-holo-blue/5 pointer-events-none" />
        )}
        
        <div className="flex items-start gap-3 relative z-10">
          {/* 序号 */}
          <span className="text-holo-blue font-bold text-sm min-w-[1.5rem] shrink-0 mt-0.5">
            {index + 1}.
          </span>
          
          <div className="flex-1 min-w-0">
            {/* 选项文字 */}
            <span className="block text-[13px] leading-relaxed text-game-text">
              {safeRender(choice.text, `选择 ${index + 1}`)}
            </span>
            
            {/* 解析后的文字（如果有） */}
            {choice.resolvedText && typeof choice.resolvedText === 'string' && choice.resolvedText !== choice.text && (
              <span className="block text-[11px] leading-relaxed mt-1 text-game-text-secondary">
                {safeRender(choice.resolvedText)}
              </span>
            )}
            
            {/* 奖励和消耗 */}
            {(rewards.length > 0 || costs.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {rewards.map((reward, i) => (
                  <span key={`reward-${i}`} className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">
                    {reward}
                  </span>
                ))}
                {costs.map((cost, i) => (
                  <span key={`cost-${i}`} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">
                    {cost}
                  </span>
                ))}
              </div>
            )}
            
            {/* 禁用原因 */}
            {choice.disabled && choice.disabledReason && (
              <span className="block text-[10px] text-white/50 mt-2 pt-2 border-t border-white/10">
                <Info className="w-3 h-3 inline mr-1" />
                {safeRender(choice.disabledReason)}
              </span>
            )}
          </div>
          
          {/* 右侧箭头 */}
          {!disabled && (
            <ArrowRight className={`
              w-4 h-4 shrink-0 mt-1 transition-all duration-200
              ${isHovered ? 'text-holo-blue translate-x-1' : 'text-white/30'}
            `} />
          )}
        </div>
      </button>
    </motion.div>
  );
};

/** P3-01: 移动端事件反馈组件 - 简洁静态展示 */
import type { GameLog } from '@/game/core/types';

export const MobileEventFeedback = ({ logs }: { logs: GameLog[] }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="px-4 py-4 text-center">
        <p className="text-[11px] text-white/30 leading-relaxed">完成选择后这里会显示事件记录</p>
      </div>
    );
  }

  return (
    <div className="border-t border-game-divider/50 mb-3 pt-2">
      {/* 简洁标题 */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <ScrollText className="w-3 h-3 text-holo-blue/50" />
        <span className="text-[10px] text-white/40">命运日志</span>
        <span className="text-[10px] text-white/25">{logs.length}条</span>
      </div>

      {/* 日志列表 - 显示全部，可滚动 */}
      <div 
        className="px-4 pb-2 max-h-[280px] overflow-y-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        {logs.map((log, index) => {
          const statEntries = log.statChanges ? Object.entries(log.statChanges).filter(([, v]) => v !== 0 && v !== null && v !== undefined) : [];
          return (
            <div
              key={`mobile-log-${index}`}
              className="py-1.5 border-b border-white/5 last:border-0 leading-relaxed hover:bg-white/5 px-1 -mx-1 rounded transition-colors"
              title={log.event}
            >
              <div className="flex items-start gap-1">
                <span className="text-holo-blue/60 font-mono text-[11px] shrink-0">[{log.year}岁]</span>
                <span className="text-white/60 hover:text-white/70 text-[11px] leading-snug flex-1 min-w-0 truncate">
                  {safeRender(log.event)}
                </span>
              </div>
              {statEntries.length > 0 && (
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 pl-0">
                  {statEntries.slice(0, 4).map(([key, value]) => {
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
        })}
      </div>
    </div>
  );
};

export const DecisionPanel = React.memo(({ event, onClose }: DecisionPanelProps) => {
  const { state } = useGameState();
  const { tickYear, restAndRecover } = useGameActions();
  const { showToast } = useToast();
  const { playSound } = useSound();
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<{
    choiceText: string;
    statChanges: any;
    choiceIndex: number;
    event: GameEvent;
    followUp?: string;
  } | null>(null);
  const [backendOutcome, setBackendOutcome] = useState<string | null>(null);
  const [backendStatChanges, setBackendStatChanges] = useState<Record<string, number> | null>(null);

  // Safely extract text fields with defensive checks
  const safeEventText = event ? safeRender(event.text, '未知事件') : '';
  const safeEventDesc = event ? safeRender(event.description) : undefined;

  const resolvedChoices = useMemo(() => {
    if (!event) return [];
    return event.choices.map((choice) => {
      const resolvedText = resolveChoiceText(choice.text, state.stats);
      const resolvedStatChanges = resolveStatChanges(choice.statChanges || {}, state.stats);
      let disabled = false;
      let disabledReason: string | undefined;

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
        resolvedStatChanges,
        disabled,
        disabledReason,
      };
    });
  }, [event, state.stats]);

  useNumberKeySelection(
    (index) => handleChoice(index),
    resolvedChoices.length,
    !!event && !isSubmitting && !resultModalOpen,
  );

  const handleChoice = useCallback(async (choiceIndex: number) => {
    if (!event) return;
    if (isSubmitting) return;
    const resolvedChoice = resolvedChoices[choiceIndex];

    if (resolvedChoice.disabled) {
      return;
    }

    const resolvedStatChanges = resolveStatChanges(event.choices[choiceIndex].statChanges, state.stats);

    let resolvedFollowUp: string | undefined;
    if (event.choices[choiceIndex].followUp) {
      if (typeof event.choices[choiceIndex].followUp === 'function') {
        resolvedFollowUp = event.choices[choiceIndex].followUp(resolvedStatChanges);
      } else {
        resolvedFollowUp = event.choices[choiceIndex].followUp;
      }
    } else if (event.choices[choiceIndex].resultMessage) {
      resolvedFollowUp = event.choices[choiceIndex].resultMessage;
    }

    playSound('click');

    // 设置pendingChoice
    setPendingChoice({
      choiceText: resolvedChoice.resolvedText,
      statChanges: resolvedStatChanges,
      followUp: resolvedFollowUp,
      choiceIndex,
      event,
    });

    // 判断是否需要后端处理
    const choiceData = event.choices[choiceIndex];
    const needsBackend = typeof choiceData.statChanges === 'function' ||
      typeof choiceData.followUp === 'function' ||
      typeof choiceData.resultMessage === 'function';

    if (needsBackend) {
      setBackendOutcome(null);
      setBackendStatChanges(null);
      setResultModalOpen(true);
    } else {
      // 直接执行，不需要弹窗
      setIsSubmitting(true);
      
      const result = await tickYear({
        choiceIndex,
        event,
        resolvedActionText: resolvedChoice.resolvedText,
        resolvedStatChanges: resolvedStatChanges,
        resolvedLogEventText: resolvedFollowUp || event.text,
      });

      if (result) {
        setBackendOutcome(result.outcomeText);
        setBackendStatChanges(result.statChanges as Record<string, number>);
      }

      setPendingChoice(null);
      setIsSubmitting(false);
    }
  }, [event, isSubmitting, resolvedChoices, state.stats, playSound, tickYear]);

  const confirmChoice = useCallback(async () => {
    if (pendingChoice) {
      playSound('success');
      setIsSubmitting(true);

      const result = await tickYear({
        choiceIndex: pendingChoice.choiceIndex,
        event: pendingChoice.event,
        resolvedActionText: pendingChoice.choiceText,
        resolvedStatChanges: pendingChoice.statChanges,
        resolvedLogEventText: pendingChoice.followUp || pendingChoice.event.text,
      });

      if (result) {
        setBackendOutcome(result.outcomeText);
        setBackendStatChanges(result.statChanges as Record<string, number>);
      }

      setPendingChoice(null);
      setIsSubmitting(false);
    }
  }, [pendingChoice, playSound, tickYear]);

  const handleCloseModal = useCallback(() => {
    setResultModalOpen(false);
    setPendingChoice(null);
    setBackendOutcome(null);
    setBackendStatChanges(null);
  }, []);

  const handleRestAndRecover = useCallback(() => {
    restAndRecover();
    const moneyCost = Math.max(0, Math.floor(state.stats.money * 0.1));
    showToast(
      moneyCost > 0
        ? `休息恢复！花费 ¥${moneyCost.toLocaleString()}`
        : '休息恢复！没钱也能在家休息',
      'success',
    );
  }, [restAndRecover, state.stats.money]);

  return (
    <>
      <ChoiceResultModal
        isOpen={resultModalOpen}
        onClose={backendOutcome ? handleCloseModal : confirmChoice}
        choiceText={pendingChoice?.choiceText || ''}
        statChanges={backendStatChanges || pendingChoice?.statChanges || {}}
        followUp={backendOutcome || pendingChoice?.followUp}
        isWaitingBackend={!backendOutcome && isSubmitting}
      />

      {/* 主内容区 */}
      <div className="h-full overflow-y-auto p-3 sm:p-4">
        {!event ? (
          /* 空状态：无当前事件 */
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <GitFork className="w-12 h-12 text-holo-blue/30" />
            </motion.div>
            <p className="text-white/70 mt-4 text-sm font-medium">等待命运降临...</p>
            <p className="text-white/40 mt-2 text-xs">点击「休息恢复」或等待下一年</p>

            <button
              onClick={handleRestAndRecover}
              className="mt-4 px-4 py-2 rounded-lg bg-holo-blue/10 text-holo-blue border border-holo-blue/30 hover:bg-holo-blue/20 transition-all active:scale-95 text-sm"
            >
              <Bed className="w-4 h-4 inline mr-2" />
              休息恢复
            </button>
          </div>
        ) : (
          /* 正常状态：有当前事件 */
          <>
            {/* 事件卡片 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-3 sm:mb-4"
              >
                <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-holo-blue/10 to-holo-purple/10 border border-holo-blue/30">
                  {/* 任务类型标签 */}
                  <div className="flex items-center gap-2 mb-2">
                    <EventTypeTag type={event.eventType} />
                  </div>

                  <h3 className="text-base font-bold text-holo-blue mb-2">{safeEventText}</h3>
                  {safeEventDesc && (
                    <p className="text-game-text leading-relaxed text-sm">{safeEventDesc}</p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 选项区域 - 固定4条记录高度，避免布局跳动 */}
            <div className="h-[232px] sm:h-[320px] mb-3 sm:mb-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div className="flex flex-col gap-2 min-h-full">
                <AnimatePresence mode="wait">
                  {resolvedChoices.map((choice, index) => (
                    <ChoiceButton
                      key={`${event.id}-${index}`}
                      choice={choice}
                      index={index}
                      onClick={() => handleChoice(index)}
                      disabled={choice.disabled || isSubmitting}
                    />
                  ))}
                </AnimatePresence>
                {/* 占位填充：当选项少于4个时，用空白占位保持高度 */}
                {resolvedChoices.length < 4 && (
                  <>
                    {Array.from({ length: 4 - resolvedChoices.length }).map((_, i) => (
                      <div key={`placeholder-${i}`} className="h-[52px] sm:h-[72px] rounded-lg border border-dashed border-white/5 bg-white/[0.02]" />
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* ✅ P3-01: 移动端事件反馈区 - 仅在移动端显示，PC端由右侧日志面板展示 */}
            <div className="md:hidden">
              <MobileEventFeedback logs={state.logs} />
            </div>

            {/* 快捷操作 */}
            <div className="pt-3 sm:pt-4 border-t border-game-divider mt-auto">
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    if (event && event.choices.length > 0) {
                      const randomIndex = Math.floor(Math.random() * event.choices.length);
                      handleChoice(randomIndex);
                    }
                  }}
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-white/5 border border-white/10 text-game-text-secondary hover:bg-white/10 hover:text-game-text hover:border-holo-blue/30 transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  随机选择
                </button>
                <button
                  onClick={handleRestAndRecover}
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg bg-white/5 border border-white/10 text-game-text-secondary hover:bg-white/10 hover:text-game-text hover:border-holo-blue/30 transition-all active:scale-[0.97] text-sm flex items-center justify-center gap-2"
                >
                  <Bed className="w-4 h-4" />
                  休息 (+20精力)
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
});