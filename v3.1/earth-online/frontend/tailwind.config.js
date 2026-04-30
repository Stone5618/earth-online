/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom colors for EarthOnline
        'deep-space': '#080B1A',
        'deep-space-light': '#0D1128',
        'holo-blue': '#00D2FF',
        'holo-cyan': {
          DEFAULT: '#00F0FF',
          50: '#E6FDFF',
          100: '#B3F8FF',
          200: '#80F3FF',
          300: '#4DEBFF',
          400: '#1AE0FF',
          500: '#00F0FF',
          600: '#00BCD4',
          700: '#0097A7',
          800: '#006D7A',
          900: '#00434D',
        },
        'holo-purple': {
          DEFAULT: '#A855F7',
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#C084FC',
          400: '#B35EF5',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
        'fatal-red': '#FF4B4B',
        'gold': '#FFD700',
        // Additional semantic colors used in UI components
        'border-glow': 'rgba(0, 210, 255, 0.15)',
        'border-glow-hover': 'rgba(0, 210, 255, 0.4)',
        // Game UI optimized colors
        'game-bg': '#080B1A',
        'game-card': '#1A1A2E',
        'game-panel': '#0F0F1A',
        'game-text': '#E0E0E0',
        'game-text-secondary': '#9E9E9E',
        'game-divider': '#2A2A2A',
        // Attribute colors (standardized)
        'attr-health': '#EF5350',
        'attr-energy': '#FFA726',
        'attr-mood': '#66BB6A',
        'attr-gold': '#FFD700',
        'attr-intellect': '#42A5F5',
        'attr-charm': '#EC407A',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'glow-blue': '0 0 20px rgba(0, 210, 255, 0.4)',
        'glow-blue-strong': '0 0 40px rgba(0, 210, 255, 0.8)',
        'glow-red': '0 0 20px rgba(255, 75, 75, 0.4)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 210, 255, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 210, 255, 0.8)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "pulse-red": {
          "0%, 100%": { opacity: "1", textShadow: "0 0 10px rgba(255, 75, 75, 0.8)" },
          "50%": { opacity: "0.7", textShadow: "0 0 20px rgba(255, 75, 75, 1)" },
        },
        "float-up": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-30px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 60s linear infinite",
        "shimmer": "shimmer 2s linear infinite",
        "blink": "blink 1s step-end infinite",
        "pulse-red": "pulse-red 1.5s ease-in-out infinite",
        "float-up": "float-up 1s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
