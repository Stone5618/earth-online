import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative py-12 px-4 border-t border-holo-blue/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-holo-blue" />
            <span className="font-orbitron font-bold text-white tracking-wider">
              EarthOnline
            </span>
          </div>

          {/* Copyright */}
          <p className="text-white/50 text-sm mb-4">
            Copyright © 4.6 Billion Years BC - Present.
          </p>
          <p className="text-holo-blue/60 text-sm mb-8">
            宇宙开发委员会 荣誉出品
          </p>

          {/* Disclaimer */}
          <div className="max-w-2xl p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/40 text-xs leading-relaxed">
              免责声明：游戏过程中的一切悲欢离合均由物理法则和人类社会共同计算得出，官方概不负责。
              请遵守游戏规则，珍惜每一次游戏体验。
            </p>
          </div>

          {/* Version */}
          <p className="text-white/30 text-xs mt-6 font-mono">
            v2.0 · Build 2026.01.01 · Server: Earth-Main
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
