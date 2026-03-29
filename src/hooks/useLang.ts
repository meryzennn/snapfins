import { useContext } from 'react';
import { LanguageContext } from '@/components/Providers';

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLang must be used within an AppProviders');
  }
  return context;
}
