import React, { useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useSettings } from './SettingsContext';
import type { FontSize } from './SettingsContext';
import { X, Volume2, VolumeX, Music, Music2, Monitor, Moon, Sun, Type, Contrast } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/GlassCard';
import { GlowingButton } from '@/components/GlowingButton';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// 语义化切换开关组件
const AccessibleToggle = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) => {
  const id = React.useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label
          id={`${id}-label`}
          htmlFor={id}
          className="text-white text-sm font-medium cursor-pointer block"
        >
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="text-gray-200 text-xs mt-1">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F19] focus-visible:ring-holo-blue',
          checked ? 'bg-holo-blue' : 'bg-white/10',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-8' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
};

export const SettingsPanel = React.memo(function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <GlassCard
        className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4 fade-in duration-200"
        role="dialog"
        aria-labelledby="settings-title"
        aria-modal="true"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 id="settings-title" className="text-xl sm:text-2xl font-bold text-white">
                系统设置
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F19] focus-visible:ring-holo-blue"
                aria-label="关闭设置面板"
              >
                <X className="w-5 h-5" />
              </button>
          </div>

          <div className="space-y-6">
            {/* 音效设置 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                音效控制
              </h3>

              <AccessibleToggle
                checked={settings.soundEnabled}
                onChange={(checked) => updateSettings({ soundEnabled: checked })}
                label="游戏音效"
                description="开启游戏的交互音效反馈"
              />

              <AccessibleToggle
                checked={settings.musicEnabled}
                onChange={(checked) => updateSettings({ musicEnabled: checked })}
                label="背景音乐"
                description="控制游戏背景音乐的开关"
              />
            </div>

            {/* 视觉设置 */}
            <div className="space-y-4 pt-4 border-t border-white/15">
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                视觉效果
              </h3>

              <AccessibleToggle
                checked={settings.particlesEnabled}
                onChange={(checked) => updateSettings({ particlesEnabled: checked })}
                label="粒子特效"
                description="开启背景粒子动画，低配置设备可关闭"
              />

              <AccessibleToggle
                checked={settings.animationsEnabled}
                onChange={(checked) => updateSettings({ animationsEnabled: checked })}
                label="动画效果"
                description="控制界面的交互动画是否播放"
              />
            </div>

            {/* 主题设置 */}
            <div className="space-y-4 pt-4 border-t border-white/15">
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Moon className="w-4 h-4" />
                主题设置
              </h3>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-white text-sm font-medium block">主题模式</label>
                  <p className="text-gray-200 text-xs mt-1">切换暗黑/明亮模式</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'p-2 rounded-lg border transition-all',
                      theme === 'dark' 
                        ? 'bg-holo-blue/20 border-holo-blue text-holo-blue' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    )}
                    title="暗黑模式"
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      'p-2 rounded-lg border transition-all',
                      theme === 'light' 
                        ? 'bg-holo-blue/20 border-holo-blue text-holo-blue' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    )}
                    title="明亮模式"
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={cn(
                      'p-2 rounded-lg border transition-all',
                      theme === 'system' 
                        ? 'bg-holo-blue/20 border-holo-blue text-holo-blue' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    )}
                    title="跟随系统"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 显示设置 */}
            <div className="space-y-4 pt-4 border-t border-white/15">
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4" />
                界面显示
              </h3>

              {/* 字体大小 */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="text-white text-sm font-medium block">字体大小</label>
                  <p className="text-gray-200 text-xs mt-1">调整界面文字大小</p>
                </div>
                <div className="flex gap-2">
                  {([
                    { key: 'small', label: '小', className: 'text-xs' },
                    { key: 'normal', label: '中', className: 'text-sm' },
                    { key: 'large', label: '大', className: 'text-base' },
                  ] as { key: FontSize; label: string; className: string }[]).map((item) => (
                    <button
                      key={item.key}
                      onClick={() => updateSettings({ fontSize: item.key })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg border transition-all font-medium',
                        settings.fontSize === item.key
                          ? 'bg-holo-blue/20 border-holo-blue text-holo-blue'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      )}
                    >
                      <span className={item.className}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 高对比度 */}
              <AccessibleToggle
                checked={settings.highContrast}
                onChange={(checked) => updateSettings({ highContrast: checked })}
                label="高对比度模式"
                description="增强文字与背景的对比度，提升可读性"
              />

              <AccessibleToggle
                checked={settings.showAvatars}
                onChange={(checked) => updateSettings({ showAvatars: checked })}
                label="显示头像"
                description="在排行榜和社交界面显示角色头像"
              />

              <AccessibleToggle
                checked={settings.showAges}
                onChange={(checked) => updateSettings({ showAges: checked })}
                label="显示年龄"
                description="在排行榜显示角色的当前年龄"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/15">
            <GlowingButton onClick={handleClose} variant="primary" className="w-full">
              保存并关闭
            </GlowingButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
});
