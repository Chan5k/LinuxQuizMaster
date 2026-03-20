import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        terminal: {
          bg: "#0f172a",
          green: "#10b981",
          blue: "#58a6ff",
          purple: "#a78bfa",
          orange: "#f59e0b",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "glow": "0 0 20px rgba(16, 185, 129, 0.15)",
      },
    },
  },
  plugins: [],
};
export default config;
