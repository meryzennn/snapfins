import { NextResponse } from "next/server";

// We use a small memory cache to avoid spamming the exchange for identical requests within a 5-min window.
const CACHE_TTL_SECONDS = 300; 
const priceCache = new Map<string, { price: number; timestamp: number }>();

export interface PriceRequestItem {
  symbol: string;
  type: "crypto" | "stock" | string;
}

export interface PriceResponseItem {
  symbol: string;
  price: number | null;
  cached: boolean;
  error?: string;
  updatedAt: number;
  quote_currency?: string;
  base_symbol?: string;
  exchange?: string;
  provider_symbol?: string;
}

// Support GET for single item (used by AddAssetModal)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol")?.toUpperCase();
    const type = searchParams.get("type"); // 'crypto' or 'stock'

    if (!symbol || !type) {
      return NextResponse.json({ error: "Missing source symbol or type" }, { status: 400 });
    }

    const result = await fetchQuote(symbol, type);
    if (result.error) {
       return NextResponse.json({ error: result.error, ...result }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Support POST for bulk fetching (used by Assets page Smart Refresh)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const items: PriceRequestItem[] = body.items || [];

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Missing or invalid items array" }, { status: 400 });
        }

        const results = await Promise.all(
            items.map(item => fetchQuote(item.symbol, item.type))
        );

        return NextResponse.json({ results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Internal Fetcher Definition
async function fetchQuote(symbol: string, type: string): Promise<PriceResponseItem> {
    const cacheKey = `${type}_${symbol}`.toUpperCase();
    const cached = priceCache.get(cacheKey) as any;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_SECONDS * 1000) {
        return { 
          symbol, 
          price: cached.price, 
          cached: true, 
          updatedAt: cached.timestamp,
          quote_currency: cached.quote_currency,
          base_symbol: cached.base_symbol,
          exchange: cached.exchange,
          provider_symbol: cached.provider_symbol
        };
    }

    let price: number | null = null;
    let errorMsg: string | undefined;
    
    let quote_currency: string | undefined;
    let base_symbol: string | undefined;
    let exchange: string | undefined;
    let provider_symbol: string | undefined;

    try {
        if (type === "crypto" || type === "Crypto") {
            // Check if symbol already has USDT or is raw
            base_symbol = symbol;
            exchange = "CRYPTO";
            provider_symbol = `${symbol}USDT`;
            quote_currency = "USD";
            
            const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${provider_symbol}`, { cache: "no-store", next: { revalidate: 0 } });
            
            if (res.ok) {
                const data = await res.json();
                price = parseFloat(data.price);
            } else {
                errorMsg = `Could not fetch crypto price from Binance for ${provider_symbol}`;
            }
        } else if (type === "stock" || type === "Stock / ETF") {
            // Parse TradingView format: EXCHANGE:SYMBOL
            let parsedExchange = "";
            let parsedSymbol = symbol;
            
            if (symbol.includes(":")) {
                const parts = symbol.split(":");
                parsedExchange = parts[0].toUpperCase();
                parsedSymbol = parts[1].toUpperCase();
            }
            
            base_symbol = parsedSymbol;
            exchange = parsedExchange || "US"; // Default to US if none provided
            
            // Map TradingView exchange syntax to Yahoo Finance suffix
            let yahooSuffix = "";
            if (exchange === "IDX") yahooSuffix = ".JK";
            else if (exchange === "LSE") yahooSuffix = ".L";
            else if (exchange === "TSE") yahooSuffix = ".T";
            else if (exchange === "HKEX") yahooSuffix = ".HK";
            else if (exchange === "ASX") yahooSuffix = ".AX";
            else if (exchange === "TSX") yahooSuffix = ".TO";
            else if (exchange === "SGX") yahooSuffix = ".SI";
            else if (exchange === "EURONEXT") yahooSuffix = ".PA"; // Simplification for demo
            
            provider_symbol = `${parsedSymbol}${yahooSuffix}`;
            
            const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${provider_symbol}`, { 
              headers: { "User-Agent": "Mozilla/5.0" },
              cache: "no-store", 
              next: { revalidate: 0 } 
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.chart && data.chart.result && data.chart.result.length > 0) {
                   const meta = data.chart.result[0].meta;
                   price = meta.regularMarketPrice;
                   quote_currency = meta.currency;
                   if (meta.exchangeName && exchange === "US") {
                       exchange = meta.exchangeName.toUpperCase();
                   }
                } else {
                   errorMsg = `Invalid data structure from Yahoo Finance for ${provider_symbol}`;
                }
            } else {
                errorMsg = `Could not fetch stock price for ${provider_symbol}. Ensure ticker format is correct.`;
            }
        } else {
             errorMsg = `Unsupported asset type: ${type}`;
        }
    } catch (err: any) {
        errorMsg = err.message;
    }

    if (price !== null && price > 0 && !errorMsg) {
        const now = Date.now();
        priceCache.set(cacheKey, { 
          price, 
          timestamp: now,
          quote_currency,
          base_symbol,
          exchange,
          provider_symbol
        } as any);
        return { 
          symbol, 
          price, 
          cached: false, 
          updatedAt: now,
          quote_currency,
          base_symbol,
          exchange,
          provider_symbol
        };
    }

    return { 
      symbol, 
      price: null, 
      cached: false, 
      error: errorMsg || "Failed to derive price", 
      updatedAt: Date.now(),
      base_symbol,
      exchange,
      provider_symbol
    };
}
