import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clinical Warmth color palette
        sage: {
          50: '#f6f8f6',
          100: '#e3e9e3',
          200: '#c7d3c7',
          300: '#a3b5a3',
          400: '#7d957d',
          500: '#5f7a5f',
          600: '#4a614a',
          700: '#3d4f3d',
          800: '#334133',
          900: '#2b362b',
        },
        terracotta: {
          50: '#fdf6f4',
          100: '#f9e9e4',
          200: '#f3d4ca',
          300: '#eab5a3',
          400: '#df8e73',
          500: '#d0704e',
          600: '#bc5739',
          700: '#9d4530',
          800: '#823b2b',
          900: '#6d3528',
        },
        cream: {
          50: '#fdfcfb',
          100: '#faf8f5',
          200: '#f5f1ea',
          300: '#ede7dc',
          400: '#e3d9c8',
          500: '#d5c4ab',
          600: '#c0a88a',
          700: '#a48b6f',
          800: '#87725c',
          900: '#6f5f4d',
        },
        // Soft accent for highlights
        amber: {
          50: '#fffbf5',
          100: '#fef5e7',
          200: '#fce8c4',
          300: '#f9d697',
          400: '#f5ba5a',
          500: '#f0a02d',
          600: '#e18519',
          700: '#bb6715',
          800: '#965118',
          900: '#7a4318',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'organic-blob': 'radial-gradient(ellipse at top left, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
