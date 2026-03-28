'use client';

import { useState, useEffect, useCallback } from 'react';
import { translations, LangKey, TranslationKeys } from '@/lib/i18n';

const STORAGE_KEY = 'snapfins-lang';

export function useLang() {
  const [lang, setLangState] = useState<LangKey>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LangKey | null;
    if (stored === 'en' || stored === 'id') {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((newLang: LangKey) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  // Translator function — t('key', ...args) returns the translated string
  const t = useCallback((key: TranslationKeys, ...args: any[]): string => {
    const val = translations[lang][key];
    if (typeof val === 'function') {
      return (val as (...args: any[]) => string)(...args);
    }
    return val as string;
  }, [lang]);

  return { lang, setLang, t };
}
