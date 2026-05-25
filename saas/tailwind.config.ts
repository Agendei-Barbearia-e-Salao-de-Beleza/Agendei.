import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#fd9602",
        darkBg: "#09090b",
        lightBg: "#f8fafc",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
