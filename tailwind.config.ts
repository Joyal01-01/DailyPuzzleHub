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
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        cinzel: ["var(--font-cinzel)", "serif"],
      },
      colors: {
        obsidian: {
          950: "#08090D",
          900: "#0D0E15",
          850: "#12131C",
          800: "#181A26",
          700: "#222536",
        },
        gold: {
          100: "#FCF8E8",
          200: "#F7ECC1",
          300: "#F0DF97",
          400: "#E5CA68",
          500: "#D4AF37", // Renaissance Gold
          600: "#B89326",
          700: "#91721A",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'tile-pop': 'tile-pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'shake': 'shake 0.4s ease-in-out',
        'flip': 'flip 0.6s ease-in-out',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.5))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.2))' },
        },
        'tile-pop': {
          '0%': { transform: 'scale(0.85)' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
        'flip': {
          '0%': { transform: 'rotateX(0)' },
          '50%': { transform: 'rotateX(90deg)' },
          '100%': { transform: 'rotateX(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      }
    },
  },
  plugins: [],
};
export default config;
