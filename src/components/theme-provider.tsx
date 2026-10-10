"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeName = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

const STORAGE_KEY = "mori-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const preferred: ThemeName =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    setThemeState(preferred);
    document.documentElement.dataset.theme = preferred;
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      mounted,
    }),
    [theme, setTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const CHART_TOKENS: Record<ThemeName, Record<string, string>> = {
  light: {
    grid: "#E4E1D9",
    axis: "#8B948E",
    moss: "#618C68",
    mossSoft: "#A3C4A6",
    clay: "#C08A6A",
    ink: "#1E2320",
    good: "#3F7D5B",
    warn: "#B07434",
    bad: "#A8483F",
    info: "#4B6C8F",
    neutral: "#B9C0BA",
  },
  dark: {
    grid: "#343A35",
    axis: "#808982",
    moss: "#8ABA92",
    mossSoft: "#4E6F56",
    clay: "#D1A080",
    ink: "#EBEEE9",
    good: "#6FAF89",
    warn: "#D8A15F",
    bad: "#D98A81",
    info: "#8FB0D1",
    neutral: "#5C6660",
  },
};
