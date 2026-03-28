export type SupportedCurrency = 'USD' | 'IDR' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'SGD' | 'AUD' | 'BND' | 'MYR' | 'KRW';

// Static base rates (USD as 1.0) - used as initial fallback
const initialRates: Record<SupportedCurrency, number> = {
  USD: 1.0,
  IDR: 15850.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.0,
  CNY: 7.23,
  SGD: 1.34,
  AUD: 1.53,
  BND: 1.34,
  MYR: 4.73,
  KRW: 1345.0
};

// Global mutable object for rates
export const exchangeRates: Record<SupportedCurrency, number> = { ...initialRates };

/**
 * Updates the global exchange rates safely
 */
export function updateExchangeRates(newRates: Record<string, number>) {
  Object.keys(exchangeRates).forEach(c => {
    if (newRates[c]) {
      exchangeRates[c as SupportedCurrency] = newRates[c];
    }
  });
}

export const currencySymbols: Record<SupportedCurrency, string> = {
  USD: '$',
  IDR: 'Rp',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  SGD: 'S$',
  AUD: 'A$',
  BND: 'B$',
  MYR: 'RM',
  KRW: '₩'
};

export const currencyNames: Record<SupportedCurrency, string> = {
  USD: 'US Dollar',
  IDR: 'Indonesian Rupiah',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  CNY: 'Chinese Yuan',
  SGD: 'Singapore Dollar',
  AUD: 'Australian Dollar',
  BND: 'Brunei Dollar',
  MYR: 'Malaysian Ringgit',
  KRW: 'South Korean Won'
};

/**
 * Converts an amount from one currency to another using currently loaded rates.
 */
export function convert(amount: number, from: SupportedCurrency, to: SupportedCurrency): number {
  if (from === to) return amount;
  // Use the current state of the global exchangeRates object
  const usdAmount = amount / (exchangeRates[from] || 1);
  return usdAmount * (exchangeRates[to] || 1);
}

/**
 * Formats a numeric value as a localized currency string.
 */
export function formatValue(amount: number, currency: SupportedCurrency, lang: 'en' | 'id'): string {
  const locale = lang === 'id' ? 'id-ID' : 'en-US';
  
  // Custom Rupiah format for clarity
  if (currency === 'IDR') {
    return 'Rp ' + new Intl.NumberFormat(locale).format(Math.round(amount));
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Normalizes input currency strings (e.g. "Rp", "$", "IDR") to SupportedCurrency code.
 */
export function normalizeCurrency(c: string): SupportedCurrency {
  const upper = c?.toUpperCase() || '';
  if (upper === 'RP' || upper === 'IDR') return 'IDR';
  if (upper === '$' || upper === 'USD') return 'USD';
  if (upper === 'EUR' || upper === '€') return 'EUR';
  if (upper === 'GBP' || upper === '£') return 'GBP';
  if (upper === 'JPY' || upper === '¥') return 'JPY';
  if (upper === 'CNY') return 'CNY';
  if (upper === 'SGD') return 'SGD';
  if (upper === 'AUD') return 'AUD';
  if (upper === 'BND') return 'BND';
  if (upper === 'MYR') return 'MYR';
  if (upper === 'KRW') return 'KRW';
  return 'USD'; // default
}
