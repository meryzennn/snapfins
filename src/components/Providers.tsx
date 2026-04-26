'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, LangKey, TranslationKeys } from '@/lib/i18n';
import { SupportedCurrency, normalizeCurrency } from '@/lib/currency';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface LanguageContextType {
  lang: LangKey;
  setLang: (lang: LangKey) => void;
  t: (key: TranslationKeys, ...args: any[]) => string;
}

interface CurrencyContextType {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

// --- Contexts ---
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Provider Component ---
const LANG_STORAGE_KEY = 'snapfins-lang';
const CURRENCY_STORAGE_KEY = 'snapfins-currency';
const THEME_STORAGE_KEY = 'snapfins-theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangKey>('en');
  const [currency, setCurrencyState] = useState<SupportedCurrency>('USD');
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem(LANG_STORAGE_KEY) as LangKey | null;
    if (storedLang === 'en' || storedLang === 'id') setLangState(storedLang);

    const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as SupportedCurrency | null;
    if (storedCurrency) setCurrencyState(normalizeCurrency(storedCurrency));

    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setThemeState(storedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(prefersDark ? 'dark' : 'light');
    }
    
    setMounted(true);
  }, []);

  // Theme effect
  useEffect(() => {
    if (!mounted) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, mounted]);

  const setLang = useCallback((newLang: LangKey) => {
    if (newLang === lang) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setLangState(newLang);
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
      setIsTransitioning(false);
      window.location.reload();
    }, 150);
  }, [lang]);

  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    if (newCurrency === currency) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrencyState(newCurrency);
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
      setIsTransitioning(false);
      window.location.reload();
    }, 150);
  }, [currency]);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const t = useCallback((key: TranslationKeys, ...args: any[]): string => {
    const val = translations[lang][key];
    if (typeof val === 'function') {
      return (val as (...args: any[]) => string)(...args);
    }
    return (val as string) || key;
  }, [lang]);

  // Prevent hydration mismatch by only rendering once mounted
  // or return the structure but with initial server-safe values
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
          {children}
          
          <AnimatePresence>
            {isTransitioning && (
              <motion.div
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="fixed inset-0 z-[9999] bg-background/50 pointer-events-auto"
              />
            )}
          </AnimatePresence>
        </CurrencyContext.Provider>
      </LanguageContext.Provider>
    </ThemeContext.Provider>
  );
}
