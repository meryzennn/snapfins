export type AssetCategory =
  | "Cash"
  | "Bank"
  | "E-wallet"
  | "Crypto"
  | "Stock / ETF"
  | "Gold"
  | "Property"
  | "Vehicle"
  | "Other";

export type ValuationMode = "derived" | "market" | "manual";

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  category: AssetCategory;
  subtype?: string;
  valuation_mode: ValuationMode;
  symbol?: string;
  quantity?: number;
  manual_value?: number;
  current_value: number;
  currency: string;
  base_symbol?: string;
  provider_symbol?: string;
  quote_currency?: string;
  last_price?: number;
  exchange?: string;
  liquidity_level?: "Liquid" | "Illiquid";
  risk_level?: "Low" | "Medium" | "High";
  source_account?: string;
  notes?: string;
  last_valued_at: string;
  created_at: string;
  updated_at: string;
}

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Cash",
  "Bank",
  "E-wallet",
  "Crypto",
  "Stock / ETF",
  "Gold",
  "Property",
  "Vehicle",
  "Other",
];

// Helper to determine default liquidity based on category
export const getDefaultLiquidity = (
  category: AssetCategory,
): "Liquid" | "Illiquid" => {
  const liquidCategories: AssetCategory[] = [
    "Cash",
    "Bank",
    "E-wallet",
    "Crypto",
    "Stock / ETF",
    "Gold",
  ];
  return liquidCategories.includes(category) ? "Liquid" : "Illiquid";
};

// Helper to determine default risk based on category
export const getDefaultRisk = (
  category: AssetCategory,
): "Low" | "Medium" | "High" => {
  if (["Cash", "Bank", "E-wallet"].includes(category)) return "Low";
  if (["Gold", "Property"].includes(category)) return "Medium";
  return "High"; // Crypto, Stock, Vehicle, Other generally higher variability or depreciation risk
};

// Helper to calculate total value of an asset based on mode
export const calculateAssetValue = (
  asset: Partial<Asset>,
  marketPrice: number = 0,
): number => {
  if (asset.valuation_mode === "manual") {
    return Number(asset.manual_value) || 0;
  }
  if (asset.valuation_mode === "market") {
    return (Number(asset.quantity) || 0) * marketPrice;
  }
  return 0; // derived is not supported in MVP
};

// Selectors
export const getTotalAssetsValue = (assets: Asset[]): number => {
  return assets.reduce((total, asset) => total + (Number(asset.current_value) || 0), 0);
};

export const getLiquidAssetsValue = (assets: Asset[]): number => {
  return assets
    .filter((a) => a.liquidity_level === "Liquid")
    .reduce((total, asset) => total + (Number(asset.current_value) || 0), 0);
};

export const getInvestedAssetsValue = (assets: Asset[]): number => {
  return assets
    .filter((a) =>
      ["Crypto", "Stock / ETF", "Gold", "Property"].includes(a.category),
    )
    .reduce((total, asset) => total + (Number(asset.current_value) || 0), 0);
};

export const getAssetsByCategory = (
  assets: Asset[],
): Record<string, number> => {
  const allocation: Record<string, number> = {};
  assets.forEach((asset) => {
    allocation[asset.category] =
      (allocation[asset.category] || 0) + (Number(asset.current_value) || 0);
  });
  return allocation;
};

// Formatting helper
export const formatAssetValue = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};
