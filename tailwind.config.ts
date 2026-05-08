import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#070604",
        ivory: "#f7f0df",
        gold: "#c4a76a",
      },
      boxShadow: {
        glow: "0 0 70px rgba(196, 167, 106, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
