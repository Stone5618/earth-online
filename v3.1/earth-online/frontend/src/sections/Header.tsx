import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Menu, X, LogIn, Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { useSound } from '@/components/game/SoundManager';
import { GlowingButton } from '@/components/GlowingButton';

interface HeaderProps {
  onSpawnClick: () => void;
  onLoginClick?: () => void;
}

const navItems = [
  { label: '出生点', href: '#character' },
  { label: '主线任务', href: '#questline' },
  { label: '开放世界', href: '#openworld' },
  { label: '天赋与职业', href: '#skilltree' },
  { label: '拍卖行', href: '#economy' },
  { label: '公会', href: '#guilds' },
];

export function Header({ onSpawnClick, onLoginClick }: HeaderProps) {
  const { playSound, isSoundEnabled, toggleSound, isBgmEnabled, toggleBgm, allowBgm } = useSound();
  const handleSpawn = useCallback(() => {
    allowBgm();
    playSound('click');
    onSpawnClick();
  }, [allowBgm, playSound, onSpawnClick]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      // CSS scroll-margin-top handles the header offset
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-deep-space/90 backdrop-blur-xl border-b border-holo-blue/10' 
          : 'bg-transparent'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <Globe className="w-8 h-8 text-holo-blue" />
              <div className="absolute inset-0 animate-pulse-glow">
                <Globe className="w-8 h-8 text-holo-blue opacity-50" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-orbitron font-bold text-white text-lg tracking-wider">
                EarthOnline
              </span>
              <span className="text-xs text-holo-blue/70 font-mono">
                v2.0
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                onClick={() => scrollToSection(item.href)}
                className="nav-link text-sm font-medium"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Sound controls + CTA */}
          <motion.div
            className="hidden lg:flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* 氛围音开关 */}
            <button
              onClick={() => { allowBgm(); toggleBgm(); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs border transition-colors ${
                isBgmEnabled
                  ? 'text-emerald-400/70 hover:text-emerald-400 border-emerald-400/20 hover:border-emerald-400/40'
                  : 'text-white/60 hover:text-white border-white/20 hover:border-white/40'
              }`}
              aria-label={isBgmEnabled ? '关闭氛围音' : '开启氛围音'}
              title={isBgmEnabled ? '关闭氛围音' : '开启氛围音'}
            >
              {isBgmEnabled ? <Music2 className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5" />}
            </button>
            {/* 音效开关 */}
            <button
              onClick={() => { allowBgm(); toggleSound(); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs border transition-colors ${
                isSoundEnabled
                  ? 'text-white/60 hover:text-white border-white/10 hover:border-white/30'
                  : 'text-white/60 hover:text-white border-white/20 hover:border-white/40'
              }`}
              aria-label={isSoundEnabled ? '关闭音效' : '开启音效'}
              title={isSoundEnabled ? '关闭音效' : '开启音效'}
            >
              {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-holo-blue hover:text-white hover:bg-holo-blue/10 border border-holo-blue/30 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              登录
            </button>
            <GlowingButton 
              onClick={handleSpawn}
              variant="primary"
              size="sm"
              pulse
            >
              立即投胎 (Spawn)
            </GlowingButton>
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden bg-deep-space/95 backdrop-blur-xl border-t border-holo-blue/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className="text-left py-3 px-4 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4">
                <GlowingButton 
                  onClick={onSpawnClick}
                  variant="primary"
                  className="w-full"
                  pulse
                >
                  立即投胎 (Spawn)
                </GlowingButton>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
}
