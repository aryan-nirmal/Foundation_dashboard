import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1e3a8a",
          light: "#dbeafe",
        },
        panel: "#ffffff",
        border: "#e2e8f0",
        muted: "#64748b",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
    fontFamily: {
      sans: ["var(--font-geist-sans)", "Inter", "system-ui"],
    },
  },
  plugins: [],
};

export default config;

