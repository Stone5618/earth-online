import React, { useEffect } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

function ErrorFallback({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) {
  useEffect(() => {
    // 记录错误到控制台
    console.error('应用发生错误:', error);
  }, [error]);

  const handleReset = () => {
    try {
      // 清空 localStorage 中的错误状态和游戏数据
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('earth-online') || key.includes('game'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('清理 localStorage 时出错:', e);
    }
    
    // 重置错误边界
    resetErrorBoundary();
    
    // 重新加载页面以确保完全重置
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

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
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="mb-6"
          >
            <AlertCircle className="w-20 h-20 text-fatal-red mx-auto" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-4 font-orbitron">
            出了点问题
          </h2>
          
          <p className="text-white/70 mb-6 leading-relaxed">
            地球 Online 遇到了一个小问题，正在尝试修复...
          </p>

          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <p className="text-white/50 text-xs mb-2">错误详情：</p>
            <p className="text-white/60 font-mono text-xs break-all">
              {error instanceof Error ? error.message : '未知错误'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="w-full min-h-[52px] py-3 px-6 bg-holo-blue border border-holo-blue/50 rounded-lg text-white font-medium hover:bg-holo-blue/20 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            重置游戏
          </motion.button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/40 text-xs">
            💡 如果问题持续存在，请尝试清除浏览器缓存
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// 全局错误捕获 Hook
function useGlobalErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('捕获到全局错误:', event.error);
      // 可以在这里添加错误报告逻辑
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('捕获到未处理的 Promise 拒绝:', event.reason);
      // 可以在这里添加错误报告逻辑
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // 添加全局错误捕获
  useGlobalErrorHandler();

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('ErrorBoundary 捕获到错误:', error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
