import { useContext } from 'react';
import { CurrencyContext } from '@/components/Providers';

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within an AppProviders');
  }
  return context;
}
