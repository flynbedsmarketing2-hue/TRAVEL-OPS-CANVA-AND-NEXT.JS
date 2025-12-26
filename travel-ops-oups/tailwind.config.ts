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
        background: "var(--token-background)",
        surface: "var(--token-surface)",
        "surface-2": "var(--token-surface-2)",
        border: "var(--token-border)",
        muted: "var(--token-muted)",
        primary: "var(--token-primary)",
        "primary-strong": "var(--token-primary-strong)",
        secondary: "var(--token-secondary)",
        accent: "var(--token-accent)",
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        heading: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        body: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        sm: "0 4px 14px rgba(15, 23, 42, 0.08)",
        md: "0 12px 30px rgba(15, 23, 42, 0.1)",
        lg: "0 20px 45px rgba(15, 23, 42, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
