'use client';

import { useState, useEffect, useCallback } from 'react';
import { SupportedCurrency, normalizeCurrency } from '@/lib/currency';

const STORAGE_KEY = 'snapfins-currency';

export function useCurrency() {
  const [currency, setCurrencyState] = useState<SupportedCurrency>('USD');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedCurrency | null;
    if (stored) {
      setCurrencyState(normalizeCurrency(stored));
    }
  }, []);

  const setCurrency = useCallback((newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  }, []);

  return { currency, setCurrency };
}
