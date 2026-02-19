import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        floatA: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%":       { transform: "translateY(-30px) scale(1.05)" },
        },
        floatB: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%":       { transform: "translateY(-20px) scale(1.04)" },
        },
        floatC: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%":       { transform: "translateY(-25px) scale(1.06)" },
        },
      },
      animation: {
        floatA: "floatA 10s ease-in-out infinite",
        floatB: "floatB 12s ease-in-out infinite 3s",
        floatC: "floatC 14s ease-in-out infinite 6s",
      },
    },
  },
  plugins: [],
};

export default config;
