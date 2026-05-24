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
        }
      }
    }
  },
  plugins: []
};

export default config;
