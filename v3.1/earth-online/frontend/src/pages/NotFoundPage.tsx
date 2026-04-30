import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle } from 'lucide-react';

/**
 * 404 Not Found Page
 * Holographic sci-fi themed error page for unmatched routes.
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-deep-space flex items-center justify-center overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,210,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-holo-blue rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.3,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Glowing orb behind the content */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-holo-blue/5 rounded-full blur-3xl" />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 text-center px-6 max-w-2xl"
      >
        {/* Error code */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            <AlertTriangle className="w-16 h-16 mx-auto text-holo-blue/60" />
          </motion.div>
          <h1
            className="text-9xl font-bold font-orbitron mt-4 bg-gradient-to-r from-holo-blue via-white to-holo-blue bg-clip-text text-transparent"
            style={{ textShadow: '0 0 40px rgba(0,210,255,0.3)' }}
          >
            404
          </h1>
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-orbitron text-white mb-4">
            页面未找到
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-lg mb-2">
            你尝试访问的坐标不存在于当前服务器
          </p>
          <p className="text-sm text-[rgba(255,255,255,0.4)] font-mono mb-8">
            ERROR_COORDINATE_NOT_FOUND // SECTOR_UNKNOWN
          </p>
        </motion.div>

        {/* Scanline effect */}
        <motion.div
          className="relative glass-card p-8 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Scanline animation */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <motion.div
              className="absolute left-0 right-0 h-px bg-holo-blue/30"
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="relative space-y-3 text-left font-mono text-sm">
            <div className="flex items-center gap-2 text-holo-blue/80">
              <span className="text-[rgba(255,255,255,0.3)]">$</span>
              <span>导航系统诊断...</span>
            </div>
            <div className="text-[rgba(255,255,255,0.4)] pl-4">
              <p>状态: <span className="text-fatal-red">信号丢失</span></p>
              <p>原因: 目标页面可能已被移除或从未存在</p>
              <p>建议: 返回主导航重新选择目的地</p>
            </div>
            <div className="flex items-center gap-2 text-holo-blue/80 pt-2">
              <span className="text-[rgba(255,255,255,0.3)]">$</span>
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                _
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Return to home button */}
        <motion.button
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,210,255,0.4)' }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-holo-blue/20 border border-holo-blue/50 rounded-xl text-holo-blue font-orbitron text-lg hover:bg-holo-blue/30 transition-all duration-300"
          style={{ textShadow: '0 0 10px rgba(0,210,255,0.5)' }}
        >
          <Home className="w-5 h-5" />
          返回主页
        </motion.button>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
