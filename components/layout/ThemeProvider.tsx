'use client';

import { ThemeContext, useThemeProvider } from '@/context/ThemeContext';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeState = useThemeProvider();
  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}
