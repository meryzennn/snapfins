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
 * Strictly follows user rules for decimals and symbols.
 */
export function formatValue(amount: number, currency: SupportedCurrency): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const symbol = currencySymbols[currency] || '$';
  
  // IDR: Rp30.879 (dots for thousands, no decimals default)
  if (currency === 'IDR') {
    const intPart = Math.round(safeAmount);
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(intPart);
    return `Rp${formatted}`;
  }

  // JPY / KRW: 0 decimals default, commas for thousands
  if (currency === 'JPY' || currency === 'KRW') {
    const intPart = Math.round(safeAmount);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(intPart);
    return `${symbol}${formatted}`;
  }

  // Others: 2 decimals default, commas for thousands, dots for decimals
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  return `${symbol}${formatted}`;
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
  if (upper === 'SGD' || upper === 'S$') return 'SGD';
  if (upper === 'AUD' || upper === 'A$') return 'AUD';
  if (upper === 'BND' || upper === 'B$') return 'BND';
  if (upper === 'MYR' || upper === 'RM') return 'MYR';
  if (upper === 'KRW' || upper === '₩') return 'KRW';
  return 'USD'; // default
}

/**
 * Parses an amount string (which might contain currency symbols, commas, dots) into a raw number.
 */
export function parseAmount(amountStr: string | number | undefined | null, expectedCurrency?: SupportedCurrency): number {
  if (amountStr === undefined || amountStr === null) return 0;
  if (typeof amountStr === 'number') return isNaN(amountStr) ? 0 : amountStr;
  
  const numStr = String(amountStr);
  const txCurrency = expectedCurrency || normalizeCurrency(
    numStr.includes("IDR") || numStr.includes("Rp") ? "IDR" :
    numStr.includes("$") || numStr.includes("USD") ? "USD" :
    numStr.includes("€") || numStr.includes("EUR") ? "EUR" :
    numStr.includes("£") || numStr.includes("GBP") ? "GBP" :
    numStr.includes("¥") || numStr.includes("JPY") || numStr.includes("CNY") ? "JPY" :
    numStr.includes("₩") || numStr.includes("KRW") ? "KRW" : "USD"
  );

  let cleanAmount = numStr.replace(/[^0-9.,-]/g, "");
  if (txCurrency === "IDR") {
    // IDR usually uses dots for thousands separator
    cleanAmount = cleanAmount.replace(/\./g, "").replace(/,/g, ".");
  } else {
    // USD etc uses commas for thousands separator
    cleanAmount = cleanAmount.replace(/,/g, "");
  }

  return parseFloat(cleanAmount) || 0;
}
