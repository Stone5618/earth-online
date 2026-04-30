import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface StatBarProps {
  icon: React.ElementType;
  label: string;
  value: number;
  max: number;
  color: string;
  showValue?: boolean;
  prefix?: string;
  displayValue?: string;
  compact?: boolean;
}

/** Reusable animated stat bar with tooltips, critical/low state handling, and color-blind friendly indicators */
export const StatBar = React.memo(function StatBar({
  icon: Icon,
  label,
  value,
  max,
  color,
  showValue = true,
  prefix = '',
  displayValue,
  compact = false,
}: StatBarProps) {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  // Cached via useMemo so transition only triggers when inputs actually change
  const percentage = useMemo(
    () => Math.max(0, Math.min(100, (absValue / max) * 100)),
    [absValue, max],
  );
  const isLow = !isNegative && percentage < 30;
  const isCritical = !isNegative && percentage < 15;

  // Color-blind friendly status indicator (uses shape/icon, not just color)
  const StatusIndicator = isCritical
    ? AlertTriangle
    : isLow
    ? Info
    : isNegative
    ? AlertTriangle
    : CheckCircle;

  if (compact) {
    return (
      <div className="space-y-0.5">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <Icon className="w-3 h-3" style={{ color: isNegative ? '#FF4B4B' : color }} />
            <span className="text-white/70 text-[10px]">{label}</span>
          </div>
          {showValue && (
            <span className={`text-[10px] font-mono ${isNegative || isCritical ? 'text-fatal-red' : 'text-white'}`}>
              {prefix}{displayValue ?? value.toLocaleString()}
            </span>
          )}
        </div>
        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: isNegative ? '#FF4B4B' : color,
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 sm:space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help select-none">
              <Icon className="w-4 h-4" style={{ color: isNegative ? '#FF4B4B' : color }} />
              <span className="text-white/70 text-xs sm:text-sm">{label}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent sideOffset={6} className="max-w-[260px]">
            {label.includes('健康') && <p>健康值：归零则游戏结束。35岁后会有自然衰减；精力耗尽也会持续伤害健康。</p>}
            {label.includes('精力') && <p>精力值：行动消耗与恢复的核心资源。长期过低会更容易陷入负面循环。</p>}
            {label.includes('金币') && <p>金币：用于升级与应对事件支出。经济系数与健康状态会影响收入波动。负数表示债务金额。</p>}
            {label.includes('心情') && <p>心情：影响"连续开心年数"等成就，并会间接影响事件收益/损失的体验。</p>}
            {label === '智力' && <p>智力：学习/升学/技术路线的关键属性，会影响部分事件可用选项与收益。</p>}
            {label === '创造力' && <p>创造力：艺术/创作/创业方向常见加成来源，影响部分事件收益。</p>}
            {label === '运气' && <p>运气：影响随机事件偏向与机会出现概率（越高越可能遇到好事）。</p>}
            {label === '魅力' && <p>魅力：社交/恋爱/关系线的关键属性，会影响部分事件选项与结果。</p>}
          </TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-1.5">
          {/* Status indicator icon for color-blind accessibility */}
          <StatusIndicator
            className={`w-3.5 h-3.5 ${
              isCritical ? 'text-fatal-red' : isLow ? 'text-yellow-400' : isNegative ? 'text-fatal-red' : 'text-green-400'
            }`}
          />
          {showValue && (
            <span className={`text-xs sm:text-sm font-mono ${isNegative || isCritical ? 'text-fatal-red animate-pulse' : 'text-white'}`}>
              {prefix}{displayValue ?? value.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <div className="relative h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 rounded-full" />
        
        {/* Fill with striped pattern for critical state - color-blind friendly texture cue */}
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${isCritical ? 'animate-pulse' : ''}`}
          style={{ 
            width: `${percentage}%`,
            backgroundColor: isNegative ? '#FF4B4B' : color,
            backgroundImage: isCritical
              ? 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 6px)'
              : undefined,
            boxShadow: isLow || isNegative ? `0 0 10px ${isNegative ? '#FF4B4B' : color}` : 'none',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        {/* Critical shake effect */}
        {(!isNegative && isCritical) || isNegative ? (
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
        ) : null}
      </div>
    </div>
  );
});
