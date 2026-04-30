import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { visualizer } from "rollup-plugin-visualizer"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    base: './',
    plugins: [
      !isProduction && inspectAttr(), 
      react(),
      isProduction && visualizer({
        filename: './dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
        host: '127.0.0.1',
        port: 3000,
        strictPort: false,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            }
        }
    },
    optimizeDeps: {
      // Pre-bundle common dependencies to speed up cold start
      include: [
        'react', 
        'react-dom',
        'framer-motion',
        'lucide-react',
        'sonner',
        'zod'
      ]
    },
    build: {
      minify: 'esbuild',
      target: 'es2020',
      cssMinify: true,
      cssTarget: 'es2020',
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : [],
        treeShaking: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Vendor chunks (node_modules)
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
              if (id.includes('framer-motion') || id.includes('gsap')) return 'animation-vendor';
              if (id.includes('lucide-react') || id.includes('recharts') || id.includes('next-themes')) return 'ui-vendor';
              if (id.includes('react-router') || id.includes('react-router-dom')) return 'router-vendor';
              if (
                id.includes('class-variance-authority') ||
                id.includes('clsx') ||
                id.includes('tailwind-merge') ||
                id.includes('sonner') ||
                id.includes('zod') ||
                id.includes('react-hook-form')
              ) return 'vendor';
            }

            // Panel components - each gets its own chunk for lazy loading
            if (id.includes('/components/game/SkillsPanel')) return 'panel-skills';
            if (id.includes('/components/game/AchievementPanel')) return 'panel-achievements';
            if (id.includes('/components/game/SaveSlotPanel')) return 'panel-save-slot';
            if (id.includes('/components/game/SettingsPanel')) return 'panel-settings';
            if (id.includes('/components/game/DecisionPanel')) return 'panel-decision';
            if (id.includes('/components/game/NeedsPanel')) return 'panel-needs';
            if (id.includes('/components/game/StatPanel')) return 'panel-stat';
            if (id.includes('/components/game/LoginPanel')) return 'panel-login';
            if (id.includes('/components/game/Leaderboard')) return 'panel-leaderboard';
            if (id.includes('/components/game/family/FamilyPanel')) return 'panel-family';
            if (id.includes('/sections/SurvivalGuide')) return 'panel-survival-guide';

            // Game core - bundle engine modules together
            if (id.includes('/game/') && !id.includes('/components/')) return 'game-core';
            if (id.includes('/game/GameContext')) return 'game-core';

            // Landing page sections - each gets its own chunk
            if (id.includes('/sections/ServerStatus')) return 'section-server';
            if (id.includes('/sections/CharacterCreation')) return 'section-character';
            if (id.includes('/sections/MainQuestline')) return 'section-questline';
            if (id.includes('/sections/OpenWorld')) return 'section-openworld';
            if (id.includes('/sections/SkillTree')) return 'section-skilltree';
            if (id.includes('/sections/Economy')) return 'section-economy';
            if (id.includes('/sections/Guilds')) return 'section-guilds';
            if (id.includes('/sections/RNGEvents')) return 'section-rng';
            if (id.includes('/sections/WinConditions')) return 'section-win';

            // Game HUD and supporting components
            if (id.includes('/components/game/GameHUD')) return 'game-hud';
            if (id.includes('/components/game/SpawnTransition')) return 'game-spawn';
            if (id.includes('/components/game/LogStream')) return 'game-logstream';
            if (id.includes('/components/game/DeathScreen')) return 'game-death-screen';
            if (id.includes('/components/game/AchievementNotification')) return 'game-achievement-notif';
          },
        },
      },
      // Optimize chunk size warning to a reasonable limit (500KB)
      chunkSizeWarningLimit: 500,
      // Generate sourcemaps only in development
      sourcemap: !isProduction,
    },
  }
})

