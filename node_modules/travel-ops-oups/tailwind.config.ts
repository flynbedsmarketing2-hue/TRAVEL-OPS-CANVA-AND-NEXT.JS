import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6b7bff",
        "primary-strong": "#5566f6",
        accent: "#f6c35c",
        "background-light": "#eef2ff",
        "background-dark": "#0f172a",
        "surface-light": "#f7f9ff",
        "surface-dark": "#0f172a",
        "border-soft": "#dfe6ff",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        heading: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
