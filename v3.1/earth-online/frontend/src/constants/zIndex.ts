/**
 * 统一的 z-index 层级管理常量
 * 确保应用各层级不会产生冲突
 */

export const Z_INDEX = {
  // 背景层级
  BACKGROUND: 0,
  PARTICLES: 1,
  
  // 内容层级
  CONTENT: 10,
  
  // 头部导航
  HEADER: 50,
  
  // 浮动面板
  FLOATING_PANEL: 100,
  
  // HUD 元素
  HUD_TOP_BAR: 120,
  HUD_BOTTOM_NAV: 130,
  
  // 模态框/面板
  PANEL: 200,
  
  // 模态框
  MODAL: 300,
  
  // 警告/确认对话框
  ALERT_DIALOG: 400,
  
  // 提示通知
  TOAST: 500,
  
  // 加载指示器
  LOADING: 600,
  
  // 调试工具 (最高)
  DEBUG: 9999,
} as const;

// 类型导出
export type ZIndexKeys = keyof typeof Z_INDEX;
