'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'hybrid';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'hybrid',
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeProvider() {
  const [theme, setTheme] = useState<Theme>('hybrid');

  useEffect(() => {
    const stored = localStorage.getItem('ctp-theme') as Theme | null;
    if (stored === 'light' || stored === 'hybrid') setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ctp-theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'hybrid' ? 'light' : 'hybrid'));

  return { theme, toggleTheme };
}
