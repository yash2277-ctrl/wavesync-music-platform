import { useState, useEffect } from 'react';

export type ThemeName = 'aurora' | 'emerald' | 'sunset' | 'ocean';

export const THEMES: { id: ThemeName; label: string; swatch: string }[] = [
  { id: 'aurora',  label: 'Aurora',  swatch: 'linear-gradient(135deg,#a855f7,#ec4899)' },
  { id: 'emerald', label: 'Emerald', swatch: 'linear-gradient(135deg,#22c55e,#14b8a6)' },
  { id: 'sunset',  label: 'Sunset',  swatch: 'linear-gradient(135deg,#f97316,#ec4899)' },
  { id: 'ocean',   label: 'Ocean',   swatch: 'linear-gradient(135deg,#22d3ee,#3b82f6)' },
];

const KEY = 'ws-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const s = localStorage.getItem(KEY) as ThemeName;
    return THEMES.some(t => t.id === s) ? s : 'aurora';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return { theme, setTheme: setThemeState, themes: THEMES };
}
