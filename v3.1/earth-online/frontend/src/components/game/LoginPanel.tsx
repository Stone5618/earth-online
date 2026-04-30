import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/game/ToastNotification';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuth } from '@/contexts/AuthContext';

interface LoginPanelProps {
  open: boolean;
  onClose: () => void;
  onLoggedIn: () => void;
}

export const LoginPanel = React.memo(function LoginPanel({ open, onClose, onLoggedIn }: LoginPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const { login, register, isLoading: authLoading } = useAuth();

  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Auto-focus username input with slight delay for animations
      const timer = setTimeout(() => usernameInputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      showToast('请输入用户名和密码', 'error');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { success, error } = await login(username.trim(), password.trim());
        if (success) {
          localStorage.setItem('earth-online-username', username.trim());
          showToast('登录成功！', 'success');
          onLoggedIn();
        } else {
          if (error) {
            const userMessage = error.type === 'unknown' || error.type === 'network'
              ? '登录失败，请检查网络连接'
              : (error.message || '登录失败，请检查用户名和密码');
            handleError(error, { errorMessage: userMessage });
          } else {
            showToast('登录失败，请检查用户名和密码', 'error');
          }
        }
      } else {
        const { success, error } = await register(username.trim(), password.trim());
        if (success) {
          localStorage.setItem('earth-online-username', username.trim());
          showToast('注册成功！', 'success');
          onLoggedIn();
        } else {
          if (error) {
            const userMessage = error.type === 'unknown' || error.type === 'network'
              ? '注册失败，请检查网络连接'
              : (error.message || '注册失败，用户名可能已存在');
            handleError(error, { errorMessage: userMessage });
          } else {
            showToast('注册失败，用户名可能已存在', 'error');
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('网络错误，请稍后重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative glass-card w-full max-w-md overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-deep-space focus-visible:ring-holo-blue"
            aria-label="关闭登录面板"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white font-orbitron">
              {mode === 'login' ? '登录' : '注册'}
            </h2>
            <p className="text-white/60 text-sm mt-1">
              {mode === 'login' ? '访问您的地球 Online 账户' : '创建新的地球 Online 账户'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm text-white/80 flex items-center gap-2">
                <User className="w-4 h-4" />
                用户名
              </label>
              <input
                ref={usernameInputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-holo-blue focus:outline-none focus:ring-2 focus:ring-holo-blue/30"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-white/80 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-holo-blue focus:outline-none focus:ring-2 focus:ring-holo-blue/30"
                  disabled={isLoading}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-holo-blue"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-holo-blue border border-holo-blue/50 rounded-lg text-white font-medium hover:bg-holo-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? '登录中...' : '注册中...'}
                </div>
              ) : (
                mode === 'login' ? '登录' : '注册'
              )}
            </motion.button>

            {/* Switch mode */}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setPassword('');
              }}
              disabled={isLoading}
              className="w-full py-2 text-holo-blue text-sm hover:text-holo-blue/80 transition-colors focus-visible:outline-none focus-visible:underline"
            >
              {mode === 'login' ? '没有账户？去注册' : '已有账户？去登录'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
