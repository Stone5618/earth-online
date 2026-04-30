import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Milestone, AlertTriangle, Skull, Sparkles, TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import { useGameState } from '@/game/GameContext';
import { formatMoney } from '@/game/gameState';
import type { GameLog } from '@/game/gameState';
import { FixedSizeList } from 'react-window';
import { safeRender, safeNumber } from '@/lib/safeRender';

const LOG_ITEM_HEIGHT = 130;
const MAX_VISIBLE_LOGS = 100;
const RECENT_LOG_COUNT = 5;

/** 日志类型配置 */
const LOG_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bgColor: string; borderColor: string }> = {
  milestone: {
    icon: Milestone,
    label: '里程碑',
    color: '#FFD700',
    bgColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  positive: {
    icon: TrendingUp,
    label: '好运',
    color: '#66BB6A',
    bgColor: 'rgba(102, 187, 106, 0.1)',
    borderColor: 'rgba(102, 187, 106, 0.3)',
  },
  negative: {
    icon: TrendingDown,
    label: '厄运',
    color: '#EF5350',
    bgColor: 'rgba(239, 83, 80, 0.1)',
    borderColor: 'rgba(239, 83, 80, 0.3)',
  },
  death: {
    icon: Skull,
    label: '死亡',
    color: '#FF4B4B',
    bgColor: 'rgba(255, 75, 75, 0.15)',
    borderColor: 'rgba(255, 75, 75, 0.5)',
  },
  event: {
    icon: ScrollText,
    label: '事件',
    color: '#42A5F5',
    bgColor: 'rgba(66, 165, 245, 0.1)',
    borderColor: 'rgba(66, 165, 245, 0.3)',
  },
  stat_change: {
    icon: Sparkles,
    label: '属性',
    color: '#AB47BC',
    bgColor: 'rgba(171, 71, 188, 0.1)',
    borderColor: 'rgba(171, 71, 188, 0.3)',
  },
  task_complete: {
    icon: Milestone,
    label: '完成',
    color: '#FFA726',
    bgColor: 'rgba(255, 167, 38, 0.1)',
    borderColor: 'rgba(255, 167, 38, 0.3)',
  },
};

const getLogConfig = (type: string) => {
  return LOG_TYPE_CONFIG[type] || LOG_TYPE_CONFIG.event;
};

const getStatLabel = (key: string): string => {
  const labels: Record<string, string> = {
    health: '健康',
    maxHealth: '最大健康',
    energy: '精力',
    maxEnergy: '最大精力',
    money: '金钱',
    totalMoneyEarned: '总收入',
    mood: '心情',
    intelligence: '智力',
    charm: '魅力',
    creativity: '创造力',
    luck: '运气',
    karma: '福报',
    trauma: '创伤',
    physical_fitness: '体能',
    emotional_stability: '情绪稳定',
    social_capital: '社交',
    reputation: '声望',
    career_level: '职业等级',
    skill_level: '技能等级',
    family_harmony: '家庭和睦',
    is_married: '婚姻状态',
  };
  return labels[key] || key;
};

const renderStatChange = (key: string, value: unknown, useFormatMoney = false) => {
  if (value === 0 || value === null || value === undefined) return null;
  if (typeof value === 'object') return null;
  if (Array.isArray(value)) return null;
  
  const isPositive = Number(value) > 0;
  const label = getStatLabel(key);
  
  let displayValue: string;
  if (typeof value === 'number' && (key === 'money' || key === 'totalMoneyEarned') && useFormatMoney) {
    displayValue = formatMoney(value);
  } else {
    displayValue = String(value);
  }
  
  return (
    <span
      key={key}
      className={`text-xs font-mono ${
        isPositive ? 'text-green-400' : 'text-fatal-red'
      }`}
    >
      {isPositive ? '+' : ''}{displayValue} {label}
    </span>
  );
};

/** 分类标签组件 */
const LogTypeTag = ({ type }: { type: string }) => {
  const config = getLogConfig(type);
  const Icon = config.icon;
  
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
      style={{ 
        color: config.color, 
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`
      }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const LogItem = React.memo(({ log, isRecent, compact = false }: { log: GameLog; isRecent: boolean; compact?: boolean }) => {
  const config = getLogConfig(log.type);
  const Icon = config.icon;
  
  if (compact) {
    return (
      <div 
        className="p-2 rounded-lg mb-1 transition-colors hover:bg-white/5"
        style={{ 
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}`
        }}
      >
        <div className="flex items-start gap-2">
          <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: config.color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-holo-blue font-mono text-[10px] font-bold">
                [{log.year}岁]
              </span>
              <LogTypeTag type={log.type} />
            </div>
            <p className="text-white/80 text-[11px] leading-snug">{log.event}</p>
            {log.statChanges && Object.keys(log.statChanges).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(log.statChanges).slice(0, 3).map(([key, value]) => {
                  const safeValue = safeNumber(value);
                  return (
                    <span key={key} className={`text-[9px] px-1.5 py-0.5 rounded ${safeValue >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {safeRender(getStatLabel(key))} {safeValue >= 0 ? '+' : ''}{safeValue}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isRecent) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20, height: 0 }}
        animate={{ opacity: 1, x: 0, height: 'auto' }}
        exit={{ opacity: 0, x: 20, height: 0 }}
        transition={{ duration: 0.3 }}
        className="p-3 sm:p-4 rounded-xl mb-2"
        style={{ 
          backgroundColor: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          minHeight: `${LOG_ITEM_HEIGHT - 8}px`
        }}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.color }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-holo-blue font-mono text-xs sm:text-sm font-bold">
                [{log.year}岁]
              </span>
              <LogTypeTag type={log.type} />
            </div>
            {log.action && (
              <p className="text-white/50 text-xs mb-1 font-mono">
                选择: {log.action}
              </p>
            )}
            <p className="text-white/80 text-sm leading-relaxed">{log.event}</p>
            
            {log.statChanges && Object.keys(log.statChanges).length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                {Object.entries(log.statChanges).map(([key, value]) =>
                  renderStatChange(key, value, isRecent)
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="p-3 sm:p-4 rounded-xl mb-2 transition-colors hover:bg-white/5"
      style={{ 
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        minHeight: `${LOG_ITEM_HEIGHT - 8}px`
      }}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: config.color }} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-holo-blue font-mono text-xs sm:text-sm font-bold">
              [{log.year}岁]
            </span>
            <LogTypeTag type={log.type} />
          </div>
          {log.action && (
            <p className="text-white/50 text-xs mb-1 font-mono">
              选择: {log.action}
            </p>
          )}
          <p className="text-white/80 text-sm leading-relaxed">{log.event}</p>
          
          {log.statChanges && Object.keys(log.statChanges).length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
              {Object.entries(log.statChanges).map(([key, value]) =>
                renderStatChange(key, value, false)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
LogItem.displayName = 'LogItem';

interface LogStreamProps {
  compact?: boolean;
}

export function LogStream({ compact = false }: LogStreamProps = {}) {
  const { state } = useGameState();
  const listRef = useRef<FixedSizeList>(null);

  const visibleLogs = state.logs.slice(-MAX_VISIBLE_LOGS);
  const recentCount = Math.min(RECENT_LOG_COUNT, visibleLogs.length);
  const recentLogs = visibleLogs.slice(0, recentCount);
  const virtualizedLogs = visibleLogs.slice(recentCount);

  useEffect(() => {
    if (listRef.current && virtualizedLogs.length > 0) {
      listRef.current.scrollToItem(0, 'start');
    }
  }, [virtualizedLogs.length]);

  const renderRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const log = virtualizedLogs[index];
    return (
      <div style={style}>
        <LogItem log={log} isRecent={false} compact={compact} />
      </div>
    );
  }, [virtualizedLogs, compact]);

  if (compact) {
    return (
      <div className="h-full flex flex-col">
        <div
          className="flex-1 overflow-y-auto pr-1"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 210, 255, 0.3) transparent',
          }}
        >
          {visibleLogs.length === 0 ? (
            <div className="text-center py-4 text-white/60 text-xs">
              <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>人生尚未开始...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentLogs.map((log, index) => (
                <LogItem key={`recent-${log.year}-${index}`} log={log} isRecent={true} compact={true} />
              ))}
              {virtualizedLogs.length > 0 && (
                <FixedSizeList
                  ref={listRef}
                  height={250}
                  itemCount={virtualizedLogs.length}
                  itemSize={80}
                  width="100%"
                  style={{ overflowX: 'hidden' }}
                  itemData={virtualizedLogs}
                >
                  {renderRow}
                </FixedSizeList>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col">
      <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-4">
        <ScrollText className="w-5 h-5 text-holo-blue" />
        命运文本流
      </h3>

      <div
        className="flex-1 overflow-y-auto pr-2 max-h-[400px] sm:max-h-[500px]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 210, 255, 0.3) transparent',
        }}
      >
        {visibleLogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12 text-white/60"
          >
            <ScrollText className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base">人生尚未开始...</p>
            <p className="text-xs sm:text-sm mt-2">点击"立即投胎"开启你的旅程</p>
          </motion.div>
        ) : (
          <div className="space-y-0">
            <AnimatePresence mode="popLayout">
              {recentLogs.map((log, index) => (
                <LogItem key={`recent-${log.year}-${index}`} log={log} isRecent={true} />
              ))}
            </AnimatePresence>

            {virtualizedLogs.length > 0 && (
              <FixedSizeList
                ref={listRef}
                height={400}
                itemCount={virtualizedLogs.length}
                itemSize={LOG_ITEM_HEIGHT}
                width="100%"
                style={{ overflowX: 'hidden' }}
                itemData={virtualizedLogs}
              >
                {renderRow}
              </FixedSizeList>
            )}
          </div>
        )}
      </div>

      {state.logs.length > MAX_VISIBLE_LOGS && (
        <div className="text-center pt-2 text-white/60 text-xs">
          仅显示最近 {MAX_VISIBLE_LOGS} 条记录
        </div>
      )}
    </div>
  );
}
