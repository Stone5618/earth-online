import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Users, Star } from 'lucide-react';
import { api } from '@/api/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface LeaderboardProps {
  open: boolean;
  onClose: () => void;
}

interface LeaderboardEntry {
  id: number;
  name: string;
  age: number;
  money: number;
  totalMoney: number;
  server: string;
}

export const Leaderboard = React.memo(function Leaderboard({ open, onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const { handleError } = useErrorHandler();

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setOffline(false);
    try {
      // First check server status
      const { success: pingSuccess } = await api.ping();
      if (!pingSuccess) {
        setOffline(true);
        return;
      }

      // Then get data
      const { data, error } = await api.getLeaderboard();
      if (error) {
        handleError(error, { errorMessage: '获取排行榜失败' });
        return;
      }
      
      if (Array.isArray(data)) {
        const formatted = data.map((entry: any, index: number) => ({
          id: index,
          name: entry.character_name || entry.name || '玩家',
          age: entry.age || 0,
          money: Math.round(entry.money || 0),
          totalMoney: Math.round(entry.total_money_earned || entry.total_money || 0),
          server: entry.server_name || entry.server || '未知服务器',
        }));
        setEntries(formatted);
      }
    } catch (err) {
      console.error('[Leaderboard] Error:', err);
      setOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    if (open) {
      fetchLeaderboard();
    }
  }, [open, fetchLeaderboard]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1: return <Trophy className="w-5 h-5 text-gray-300" />;
      case 2: return <Trophy className="w-4 h-4 text-amber-600" />;
      default: return <span className="text-white/60 font-bold">{index + 1}</span>;
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
          className="relative glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-holo-blue" />
              <div>
                <h2 className="text-2xl font-bold text-white font-orbitron">
                  排行榜
                </h2>
                <p className="text-white/60 text-sm">
                  地球 Online 最富有的玩家
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-deep-space focus-visible:ring-holo-blue"
              aria-label="关闭排行榜"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-3 border-holo-blue/30 border-t-holo-blue rounded-full animate-spin mb-4" />
              <p className="text-white/60">加载排行榜...</p>
            </div>
          ) : offline ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">服务器离线</h3>
              <p className="text-white/60 text-sm mb-4">无法连接到排行榜服务器</p>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 bg-holo-blue/20 border border-holo-blue/30 rounded-lg text-holo-blue hover:bg-holo-blue/30 transition-all"
              >
                重试
              </button>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-white text-lg font-medium mb-2">暂无数据</h3>
              <p className="text-white/60 text-sm">还没有玩家上榜，成为第一个吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl ${
                    index < 3 ? 'bg-white/10 border border-white/15' : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(index)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {entry.name}
                    </h3>
                    <p className="text-white/60 text-sm truncate">
                      {entry.server} · {entry.age} 岁
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-amber-400 font-mono font-bold">
                      ¥{entry.money.toLocaleString()}
                    </p>
                    {entry.totalMoney > 0 && (
                        <p className="text-white/50 text-xs font-mono">
                        总计: ¥{entry.totalMoney.toLocaleString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});
