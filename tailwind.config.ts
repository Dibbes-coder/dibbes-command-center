import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 80px rgba(245, 158, 11, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
