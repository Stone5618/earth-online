/**
 * MarriageProposalModal — 弹出式婚姻匹配交互
 * 
 * 当后端返回 marriage_candidate 信号时，这个弹窗会弹出来
 * 让玩家选择接受或拒绝求婚。
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, HeartCrack, Sparkles, Star } from 'lucide-react';

export interface MarriageCandidateData {
  name: string;
  age: number;
  charm: number;
  intelligence: number;
  quality: number;
}

interface MarriageProposalModalProps {
  candidate: MarriageCandidateData | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const MarriageProposalModal = React.memo(function MarriageProposalModal({
  candidate,
  onAccept,
  onDecline,
}: MarriageProposalModalProps) {
  if (!candidate) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl border border-pink-500/30 max-w-sm w-full mx-4 p-6 shadow-2xl shadow-pink-500/10"
          initial={{ scale: 0.8, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex p-3 rounded-full bg-pink-500/20 mb-3"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-8 h-8 text-pink-400 fill-pink-400" />
            </motion.div>
            <h3 className="text-white text-lg font-bold">💞 缘份来了！</h3>
            <p className="text-white/50 text-sm mt-1">你遇到了一个特别的人</p>
          </div>

          {/* Candidate card */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium">{candidate.name}</p>
                <p className="text-white/60 text-xs">{candidate.age}岁</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-white/30 text-xs">魅力</p>
                <p className="text-white text-sm flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-pink-400" />
                  {candidate.charm}
                </p>
              </div>
              <div>
                <p className="text-white/30 text-xs">才智</p>
                <p className="text-white text-sm">{candidate.intelligence}</p>
              </div>
              <div>
                <p className="text-white/30 text-xs">契合度</p>
                <p className={`text-sm font-medium ${candidate.quality >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {candidate.quality}%
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onAccept}
            >
              <Heart className="w-4 h-4" />
              接受
            </motion.button>
            <motion.button
              className="flex-1 bg-white/10 text-white/70 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 border border-white/10"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onDecline}
            >
              <HeartCrack className="w-4 h-4" />
              婉拒
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
