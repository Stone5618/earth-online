import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function Loading() {
  return (
    <div className="fixed inset-0 bg-deep-space flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Globe className="w-16 h-16 text-holo-blue mx-auto" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <p className="text-white text-lg font-orbitron mb-2">加载中...</p>
          <p className="text-white/60 text-sm">准备你的地球 Online 冒险</p>
        </motion.div>

        <div className="mt-6 w-48 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-holo-blue"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  )
}
