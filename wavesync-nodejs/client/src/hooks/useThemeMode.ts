import { useEffect, useMemo, useState } from "react";

export type ThemeName = "ocean" | "sunset" | "midnight";

const STORAGE_KEY = "wavesync-theme";
const THEMES: ThemeName[] = ["ocean", "sunset", "midnight"];

function isThemeName(value: string | null): value is ThemeName {
  return Boolean(value && THEMES.includes(value as ThemeName));
}

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isThemeName(saved) ? saved : "ocean";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const themeLabel = useMemo(() => {
    if (theme === "ocean") return "Ocean";
    if (theme === "sunset") return "Sunset";
    return "Midnight";
  }, [theme]);

  const cycleTheme = () => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  };

  return { theme, themeLabel, setTheme, cycleTheme, themes: THEMES };
}
