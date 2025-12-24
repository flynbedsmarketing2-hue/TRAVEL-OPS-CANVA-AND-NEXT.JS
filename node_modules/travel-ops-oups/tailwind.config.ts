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
        primary: "#5D87FF",
        secondary: "#49BEFF",
        accent: "#f6c35c",
        "background-light": "#F4F7FE",
        "background-dark": "#0f172a",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1e293b",
        "sidebar-light": "#FFFFFF",
        "sidebar-dark": "#111827",
        "border-soft": "#dfe6ff",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        heading: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 15px 35px rgba(31, 41, 55, 0.08)",
        card: "0 8px 28px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
