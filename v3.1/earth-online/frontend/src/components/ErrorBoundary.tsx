import React, { useEffect, useCallback, useState } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertCircle, RefreshCw, Home, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    console.error('[ErrorBoundary] 应用发生错误:', error);
  }, [error]);

  const handleReset = useCallback(() => {
    try {
      // Clear temporary keys only, preserve game saves!
      const keysToRemove = ['earth-online-error-state', 'earth-online-session', 'game-error'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('[ErrorBoundary] 清理 localStorage 时出错:', e);
    }

    setIsCleared(true);
    setTimeout(() => {
      resetErrorBoundary();
    }, 100);
  }, [resetErrorBoundary]);

  const handleGoHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  const getErrorMessage = (): { title: string; message: string } => {
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          title: '网络连接失败',
          message: '无法连接到服务器，请检查您的网络连接',
        };
      }
      if (error.message.includes('storage')) {
        return {
          title: '存储访问失败',
          message: '无法访问本地存储，请检查浏览器设置',
        };
      }
    }
    return {
      title: '发生了一个错误',
      message: '地球 Online 遇到了一个问题，正在尝试修复...',
    };
  };

  const { title, message } = getErrorMessage();

  if (isCleared) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RotateCcw className="w-12 h-12 text-holo-blue mx-auto mb-4" />
        </motion.div>
        <p className="text-white text-lg">正在恢复...</p>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        <div className="glass-card p-8 text-center">
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="mb-6"
          >
            <AlertCircle className="w-16 h-16 text-fatal-red mx-auto" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
            {title}
          </h2>

          <p className="text-white/80 mb-6 leading-relaxed">
            {message}
          </p>

          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <p className="text-white/50 text-xs mb-2 font-orbitron">技术详情:</p>
            <p className="text-white/60 font-mono text-xs break-all">
              {error instanceof Error ? error.message : '未知错误'}
            </p>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="w-full min-h-[52px] py-3 px-6 bg-holo-blue border border-holo-blue/50 rounded-xl text-white font-medium hover:bg-holo-blue/30 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              重置当前会话
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoHome}
              className="w-full min-h-[52px] py-3 px-6 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              返回主页
            </motion.button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-xs">
              如果问题持续存在，请尝试清除浏览器缓存或联系支持
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('[ErrorBoundary] 捕获到错误:', error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Global error handler - MUST be used at the app root
 * Registers window-level error/unhandledrejection listeners and shows a toast.
 */
export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const [toastState, setToastState] = useState<{ show: boolean; message: string } | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[GlobalErrorHandler] 全局错误:', event.error);
      setToastState({
        show: true, message: '发生了一个错误，请刷新页面重试' });
      // Auto-hide toast after 5 seconds
      setTimeout(() => setToastState(null), 5000);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[GlobalErrorHandler] 未处理的 Promise 拒绝:', event.reason);
      setToastState({
        show: true,
        message: '发生了一个意外错误，请刷新页面重试' });
      setTimeout(() => setToastState(null), 5000);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <>
      {children}
      {/* Simple in-line toast for global errors
      Since we can't use useToast hook here because we're outside provider*/}
      {toastState && toastState.show && (
        <div className="fixed bottom-20 right-4 z-[9999] glass-card px-4 py-3 border border-fatal-red/30 bg-fatal-red/10 text-fatal-red flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>{toastState.message}</span>
        </div>
      )}
    </>
  );
}
