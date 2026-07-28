import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f7ff",
          100: "#e3edff",
          200: "#c3d9ff",
          300: "#94baff",
          400: "#5c92ff",
          500: "#3266ff",
          600: "#1f45f5",
          700: "#1a35d1",
          800: "#1c2fa8",
          900: "#1c2c84"
        },
        surface: {
          light: "#ffffff",
          dark: "#0b0d12"
        }
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)",
        cardHover: "0 4px 12px rgba(16,24,40,0.12), 0 2px 4px rgba(16,24,40,0.08)"
      },
      keyframes: {
        fadeIn: { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } }
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
