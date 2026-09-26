import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        surface: {
          dark: "#0f172a",
          darker: "#0b0f19",
          card: "#1e293b",
          border: "#334155",
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'tile-pop': 'tile-pop 0.2s ease-in-out',
        'shake': 'shake 0.4s ease-in-out',
        'flip': 'flip 0.6s ease-in-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.6))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.2))' },
        },
        'tile-pop': {
          '0%': { transform: 'scale(0.8)' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        'flip': {
          '0%': { transform: 'rotateX(0)' },
          '50%': { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
