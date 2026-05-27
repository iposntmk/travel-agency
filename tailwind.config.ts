import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0f67b1",
          red: "#c83232",
          gold: "#f4b545",
          ink: "#111827"
        },
        navy: {
          50: "#f1f7fd",
          100: "#dde9f7",
          200: "#bcd3ee",
          300: "#8fb4e0",
          400: "#5f8fcc",
          500: "#3d72b8",
          600: "#2a5a9a",
          700: "#1f487d",
          800: "#173a66",
          900: "#0f2a4a",
          950: "#091a2e"
        },
        mist: "#f6f9fc"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "Arial", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "Arial", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 42, 74, 0.04), 0 4px 12px rgba(15, 42, 74, 0.06)",
        elevated: "0 4px 12px rgba(15, 42, 74, 0.08), 0 12px 32px rgba(15, 42, 74, 0.10)"
      },
      maxWidth: {
        "page": "1200px"
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
};

export default config;
