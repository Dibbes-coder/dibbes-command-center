import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 80px rgba(245, 158, 11, 0.13)",
        innerGlow: "inset 0 0 60px rgba(255, 255, 255, 0.035)"
      },
      backgroundImage: {
        "command-radial": "radial-gradient(circle at top left, rgba(245,158,11,0.18), transparent 28%), radial-gradient(circle at 82% 18%, rgba(56,189,248,0.10), transparent 24%), linear-gradient(135deg, #020617 0%, #050505 55%, #111827 100%)"
      }
    }
  },
  plugins: []
};

export default config;
