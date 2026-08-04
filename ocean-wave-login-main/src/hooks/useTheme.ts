import { useState, useEffect } from 'react';
import type { ThemeName } from '../types';

const THEMES: ThemeName[] = ['ocean', 'sunset', 'midnight'];
const STORAGE_KEY = 'wavesync-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (THEMES.includes(saved as ThemeName) ? saved : 'ocean') as ThemeName;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setThemeState(next);
  };

  const themeLabel = theme.charAt(0).toUpperCase() + theme.slice(1);

  return { theme, themeLabel, cycleTheme };
}
