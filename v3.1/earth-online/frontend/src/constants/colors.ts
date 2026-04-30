/**
 * 统一颜色常量，确保符合 WCAG AA 对比度标准
 * 主要背景为深色，所以大部分文字为高对比度白色
 */

export const COLORS = {
  // 主题色
  primary: {
    blue: '#00D2FF',
    purple: '#A855F7',
    pink: '#FF69B4',
  },

  // 语义色
  semantic: {
    danger: '#FF4B4B',
    warning: '#FF6B35',
    success: '#00FF88',
    info: '#00D2FF',
    amber: '#FDB022',
  },

  // 文本颜色 - 高对比度版本
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB',
    muted: '#D1D5DB',
    disabled: '#9CA3AF',
  },

  // 背景色
  background: {
    primary: 'rgba(15, 15, 25, 0.95)',
    secondary: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.15)',
  },

  // 玻璃效果
  glass: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.12)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
};

// 导出为 Tailwind 样式引用
export const TAILWIND_CLASSES = {
  text: {
    primary: 'text-white',
    secondary: 'text-gray-100',
    muted: 'text-gray-200',
    disabled: 'text-gray-400',
  },
  bg: {
    secondary: 'bg-white/10',
    hover: 'bg-white/15',
  },
  border: {
    default: 'border-white/20',
  },
};
