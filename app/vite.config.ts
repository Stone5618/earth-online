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
      inspectAttr(), 
      react(),
      isProduction && visualizer({
        filename: './dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      minify: 'esbuild',
      target: 'es2020',
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : [],
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'animation-vendor': ['framer-motion', 'gsap', '@gsap/react'],
            'ui-vendor': ['lucide-react', 'recharts', 'next-themes'],
            'vendor': [
              'class-variance-authority', 
              'clsx', 
              'tailwind-merge',
              'sonner',
              'zod',
              'react-hook-form'
            ],
          },
        },
      },
    },
  }
})
