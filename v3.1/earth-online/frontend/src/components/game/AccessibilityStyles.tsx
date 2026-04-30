import { useEffect } from 'react';
import { useSettings } from './SettingsContext';

/**
 * 全局辅助功能样式组件
 * 根据设置动态应用字体大小和高对比度样式
 */
export function AccessibilityStyles() {
  const { settings } = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    // 字体大小 - 使用 data 属性
    root.setAttribute('data-font-size', settings.fontSize);

    // 高对比度模式
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    return () => {
      root.removeAttribute('data-font-size');
      root.classList.remove('high-contrast');
    };
  }, [settings.fontSize, settings.highContrast]);

  return null;
}
