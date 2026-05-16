import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        card: "#101010",
        ivory: "#F5F0E6",
        gold: "#D6B56D",
      },
      boxShadow: {
        glow: "0 0 70px rgba(214, 181, 109, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
