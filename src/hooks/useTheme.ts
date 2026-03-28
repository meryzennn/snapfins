'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'snapfins-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Read initial theme from localStorage or system preference
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return { theme, setTheme };
}
