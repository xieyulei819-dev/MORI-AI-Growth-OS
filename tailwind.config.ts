import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          line: "rgb(var(--line) / <alpha-value>)",
        },
        moss: {
          DEFAULT: "rgb(var(--moss) / <alpha-value>)",
          strong: "rgb(var(--moss-strong) / <alpha-value>)",
          soft: "rgb(var(--moss-soft) / <alpha-value>)",
        },
        clay: {
          DEFAULT: "rgb(var(--clay) / <alpha-value>)",
          soft: "rgb(var(--clay-soft) / <alpha-value>)",
        },
        tone: {
          good: "rgb(var(--tone-good) / <alpha-value>)",
          warn: "rgb(var(--tone-warn) / <alpha-value>)",
          bad: "rgb(var(--tone-bad) / <alpha-value>)",
          info: "rgb(var(--tone-info) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "Iowan Old Style",
          "Palatino Linotype",
          "Palatino",
          "Georgia",
          "Songti SC",
          "Source Han Serif SC",
          "Noto Serif SC",
          "serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(30,35,32,0.04), 0 8px 24px -16px rgba(30,35,32,0.18)",
        lift: "0 2px 4px rgba(30,35,32,0.05), 0 18px 40px -24px rgba(30,35,32,0.28)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
