import { NextResponse } from "next/server";

// We use a small memory cache to avoid spamming the exchange for identical requests within a 5-min window.
const CACHE_TTL_SECONDS = 300;
const priceCache = new Map<string, { price: number; timestamp: number }>();

// Separate cache for CoinGecko symbol → coin ID lookups (longer TTL: 1 hour)
const COINGECKO_ID_TTL_MS = 60 * 60 * 1000;
const coinIdCache = new Map<string, { id: string; timestamp: number }>();

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
            base_symbol = symbol;
            exchange = "COINGECKO";
            quote_currency = "USD";

            // Step 1: Resolve symbol → CoinGecko coin ID (with its own cache)
            const idCacheKey = symbol.toUpperCase();
            const cachedId = coinIdCache.get(idCacheKey);
            let coinId: string | null = null;

            if (cachedId && Date.now() - cachedId.timestamp < COINGECKO_ID_TTL_MS) {
                coinId = cachedId.id;
            } else {
                const searchRes = await fetch(
                    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`,
                    { cache: "no-store", next: { revalidate: 0 } }
                );

                if (!searchRes.ok) {
                    errorMsg = `Could not search CoinGecko for symbol: ${symbol}`;
                } else {
                    const searchData = await searchRes.json();
                    const coins: Array<{ id: string; symbol: string }> = searchData.coins || [];

                    // Prefer an exact symbol match; fall back to the first result
                    const match =
                        coins.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase()) ||
                        coins[0];

                    if (!match) {
                        errorMsg = `No CoinGecko listing found for symbol: ${symbol}`;
                    } else {
                        coinId = match.id;
                        coinIdCache.set(idCacheKey, { id: coinId, timestamp: Date.now() });
                    }
                }
            }

            if (coinId) {
                provider_symbol = coinId;

                // Step 2: Fetch USD price by coin ID
                const priceRes = await fetch(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`,
                    { cache: "no-store", next: { revalidate: 0 } }
                );

                if (priceRes.ok) {
                    const priceData = await priceRes.json();
                    price = priceData[coinId]?.usd ?? null;
                    if (price === null) {
                        errorMsg = `Price not available from CoinGecko for ${symbol} (id: ${coinId})`;
                    }
                } else {
                    errorMsg = `Could not fetch price from CoinGecko for ${symbol} (id: ${coinId})`;
                }
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
