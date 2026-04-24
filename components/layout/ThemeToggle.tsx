'use client';

import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'hybrid';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo híbrido'}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo híbrido futurista'}
      style={{
        position: 'relative',
        width: 52,
        height: 26,
        borderRadius: 13,
        cursor: 'pointer',
        border: `1.5px solid ${isDark ? '#00e5e5' : '#cbd5e1'}`,
        background: isDark ? '#1a3a55' : '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        padding: '3px',
        transition: 'background 0.3s, border-color 0.3s',
        outline: 'none',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: isDark ? '#00e5e5' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          lineHeight: 1,
          transform: isDark ? 'translateX(26px)' : 'translateX(0)',
          transition: 'transform 0.3s, background 0.3s',
          boxShadow: isDark ? '0 0 6px rgba(0,229,229,0.5)' : '0 1px 3px rgba(0,0,0,0.15)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
