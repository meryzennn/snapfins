"use client";

import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";
import {
  convert,
  formatValue,
  normalizeCurrency,
  updateExchangeRates,
  currencySymbols,
  currencyNames,
  type SupportedCurrency,
} from "@/lib/currency";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { deleteUserAccountAction } from "@/app/actions/user";
import { useScrollLock } from "@/hooks/useScrollLock";
import Link from "next/link";
import SelectionToggle from "@/components/SelectionToggle";
const assignColor = (category: string) => {
  const map: Record<string, string> = {
    DINING: "purple",
    GROCERY: "emerald",
    TECH: "blue",
    RETAIL: "rose",
    TRANSPORT: "amber",
    HEALTH: "rose",
    HOME: "slate",
    SALARY: "emerald",
  };
  return map[category] || "slate";
};

const getCategoryStyle = (color: string) => {
  const styles: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    purple:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    emerald:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    slate: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    indigo:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  };
  return styles[color] || styles.slate;
};


export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<{ date: string } | null>(null);
  // View & Filter States
  const [viewMode, setViewMode] = useState<"grid" | "pivot">("grid");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  ); // 0-11, -1 for ALL
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  // Manual Entry States
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cashAssets, setCashAssets] = useState<any[]>([]);
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "GENERAL",
    description: "",
    type: "Expense",
    currency: currency, // Use user's preference
    amount: "",
    source: "",
    linked_asset_id: "",
  });

  // --- Trend Indicator Component with 5s Loop ---
  const TrendIndicator = ({ trend, isExpense = false, context }: { trend: string, isExpense?: boolean, context?: string }) => {
    const [animationKey, setAnimationKey] = useState(0);

    useEffect(() => {
      if (!mounted || trend === "—") return;
      const interval = setInterval(() => {
        setAnimationKey((prev) => prev + 1);
      }, 5000);
      return () => clearInterval(interval);
    }, [mounted, trend]);

    if (!mounted || trend === "—") return null;
    
    if (trend === "NEW") {
      return (
        <div key={animationKey} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-on-surface-variant bg-surface-container/40 shrink-0 w-fit transition-all duration-500 hover:scale-105 shadow-sm border border-outline-variant/20 tracking-wider uppercase">
            <span>{lang === "id" ? "Baru periode ini" : "New this period"}</span>
          </div>
        </div>
      );
    }

    const val = parseFloat(trend.replace(/[^\d.-]/g, ""));
    const isUp = val > 0;
    const isDown = val < 0;
    const colorClass = isExpense 
      ? (isDown ? "text-secondary bg-secondary-container/20" : isUp ? "text-error bg-error-container/20" : "text-on-surface-variant bg-surface-container/20") 
      : (isUp ? "text-secondary bg-secondary-container/20" : isDown ? "text-error bg-error-container/20" : "text-on-surface-variant bg-surface-container/20");
    const strokeColor = "currentColor";

    return (
      <div key={animationKey} className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${colorClass} shrink-0 w-fit transition-all duration-500 hover:scale-105 shadow-sm`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible shrink-0">
            {isUp || val === 0 ? (
              <>
                <path key={`up-path-${animationKey}`} d="M2 18L8 12L12 16L22 6" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-path" />
                <path key={`up-arrow-${animationKey}`} d="M16 6H22V12" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-fade-scale" />
              </>
            ) : (
              <>
                <path key={`down-path-${animationKey}`} d="M2 6L8 12L12 8L22 18" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-path" />
                <path key={`down-arrow-${animationKey}`} d="M16 18H22V12" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-fade-scale" />
              </>
            )}
          </svg>
          <span className="tabular-nums">{Math.abs(val).toFixed(1)}%</span>
        </div>
        {context && <span className="text-[10px] font-bold text-on-surface-variant/40 whitespace-nowrap uppercase tracking-wider">{context}</span>}
      </div>
    );
  };

  const [transactions, setTransactions] = useState<any[]>([]);
  // Raw asset rows from DB — totalAssets is derived at render time (reactive to currency changes)
  const [assetRows, setAssetRows] = useState<any[]>([]);
  const [priorNetWorth, setPriorNetWorth] = useState<number | null>(null);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [ratesInitialized, setRatesInitialized] = useState(false);
  
  // Selection & Action States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [showDeleteTxModal, setShowDeleteTxModal] = useState(false);
  const [deleteQueue, setDeleteQueue] = useState<string[]>([]);
  const [isDeletingRows, setIsDeletingRows] = useState(false);

  // Local alias for imported function to resolve potential bundler reference issues
  const setRates = updateExchangeRates;

  // Refs for "Click Outside" behavior
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  // Immersive Scan States (New)
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanStep, setScanStep] = useState<'select' | 'camera' | 'analyzing' | 'confirm'>('select');
  const [scanningLogs, setScanningLogs] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [tempScanData, setTempScanData] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply scroll lock if any modal is visible
  useScrollLock(!!(showManualEntry || showDeleteTxModal || scanSuccess || showScanModal || isScanning || scanError));

  // Currency & Rate Initialization
  useEffect(() => {
    const initRates = async () => {
      const CACHE_KEY = "snapfins_exchange_rates";
      const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { rates, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setRates(rates);
            setRatesInitialized(true);
            return;
          }
        }

        // Fetch new rates if cache missing or expired
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();

        if (data && data.rates) {
          setRates(data.rates);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              rates: data.rates,
              timestamp: Date.now(),
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      } finally {
        setRatesInitialized(true);
      }
    };

    initRates();
  }, []);

  // Outside Click Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Category Filter Dropdown
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
      // Year Dropdown
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setShowYearDropdown(false);
      }
      // Month Dropdown
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMonthDropdown(false);
      }
      
      // Kebab Menu Close on Outside Click
      if (!(event.target as Element).closest(".kebab-menu-container")) {
        setOpenMenuId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFilterDropdown(false);
        setShowYearDropdown(false);
        setShowMonthDropdown(false);
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, selectedMonth, selectedYear]);

  // ── totalAssets derived at render time ──────────────────────────────────
  // Placed ABOVE calculateTotals to avoid TDZ ReferenceError.
  // Reactive to currency changes, assetRows updates, and exchange rate changes.
  const totalAssets = assetRows.reduce((sum, item) => {
    const val = Number(item.current_value) || 0;
    const assetCur = (item.currency || "USD") as SupportedCurrency;
    return sum + convert(val, assetCur, currency as SupportedCurrency);
  }, 0);

  // Filtered Investment Assets (non-cash equivalents)
  const totalInvestment = assetRows.reduce((sum, item) => {
    const cat = (item.category || "").toUpperCase();
    const isInvest = ["STOCK / ETF", "CRYPTO", "GOLD", "PROPERTY", "VEHICLE", "OTHER"].includes(cat);
    if (!isInvest) return sum;
    const val = Number(item.current_value) || 0;
    const assetCur = (item.currency || "USD") as SupportedCurrency;
    return sum + convert(val, assetCur, currency as SupportedCurrency);
  }, 0);

  const calculateTotals = () => {
    let incomeCurrent = 0,
      incomePrev = 0;
    let expenseCurrent = 0,
      expensePrev = 0;

    // Define the Period we are looking at
    // If selectedMonth is -1 (ALL), we look at the entire year
    const isAllMonths = selectedMonth === -1;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();

      // Extract numeric value safely
      let numStr = tx.amount;
      const txCurrency = normalizeCurrency(
        tx.currency ||
          (numStr.includes("IDR") || numStr.includes("Rp")
            ? "IDR"
            : numStr.includes("$") || numStr.includes("USD")
              ? "USD"
              : numStr.includes("€") || numStr.includes("EUR")
                ? "EUR"
                : numStr.includes("£") || numStr.includes("GBP")
                  ? "GBP"
                  : numStr.includes("¥") ||
                      numStr.includes("JPY") ||
                      numStr.includes("CNY")
                    ? "JPY"
                    : numStr.includes("₩") || numStr.includes("KRW")
                      ? "KRW"
                      : currency),
      );

      let cleanAmount = numStr.replace(/[^0-9.,-]/g, "");
      if (txCurrency === "IDR") {
        cleanAmount = cleanAmount.replace(/\./g, "").replace(/,/g, ".");
      } else {
        cleanAmount = cleanAmount.replace(/,/g, "");
      }

      const rawVal = parseFloat(cleanAmount) || 0;
      const val = convert(rawVal, txCurrency, currency);

      // Only Income / Expense for period reporting — no Investment in cashflow
      if (isAllMonths) {
        if (txYear === selectedYear) {
          if (tx.type === "Credit" || tx.type === "Income") incomeCurrent += val;
          else if (tx.type === "Debit" || tx.type === "Expense") expenseCurrent += val;
        } else if (txYear === selectedYear - 1) {
          if (tx.type === "Credit" || tx.type === "Income") incomePrev += val;
          else if (tx.type === "Debit" || tx.type === "Expense") expensePrev += val;
        }
      } else {
        const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const prevMonthYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

        if (txMonth === selectedMonth && txYear === selectedYear) {
          if (tx.type === "Credit" || tx.type === "Income") incomeCurrent += val;
          else if (tx.type === "Debit" || tx.type === "Expense") expenseCurrent += val;
        } else if (txMonth === prevMonth && txYear === prevMonthYear) {
          if (tx.type === "Credit" || tx.type === "Income") incomePrev += val;
          else if (tx.type === "Debit" || tx.type === "Expense") expensePrev += val;
        }
      }
    });

    // ── NET WORTH: Asset-driven ──────────────────────────────────────────────
    // Net Worth = total asset value (not income minus expense).
    // priorNetWorth is a snapshot persisted in localStorage from the previous session.
    const netWorthNow = totalAssets;

    const computeTrend = (curr: number, prev: number) => {
      if (prev === 0) {
        if (curr === 0) return null;
        return "NEW";
      }
      const diff = curr - prev;
      if (Math.abs(diff) < 0.01) return 0.0;
      return (diff / Math.abs(prev)) * 100.0;
    };

    const iTrend = (incomeCurrent !== null && !isNaN(incomeCurrent)) ? computeTrend(incomeCurrent, incomePrev) : null;
    const eTrend = (expenseCurrent !== null && !isNaN(expenseCurrent)) ? computeTrend(expenseCurrent, expensePrev) : null;

    // NW trend vs prior snapshoted net worth (localStorage). 
    // If no prior snapshot exists, we derive an "Implied Baseline" 
    // based on this period's net savings (Income - Expense).
    const currentPeriodDelta = (incomeCurrent || 0) - (expenseCurrent || 0);
    const impliedBaseline = netWorthNow - currentPeriodDelta;
    
    // Choose between actual snapshot or implied delta-based trend
    const baselineForTrend = priorNetWorth !== null ? priorNetWorth : impliedBaseline;
    const nwTrend = computeTrend(netWorthNow, baselineForTrend) || (netWorthNow > 0 ? "NEW" : null);

    const hasHistory = incomePrev > 0 || expensePrev > 0;
    const comparisonContext = isAllMonths
      ? (hasHistory ? `vs ${selectedYear - 1}` : "")
      : (hasHistory ? (lang === "id" ? "vs bulan lalu" : "vs last month") : "");

    return {
      income: formatValue(incomeCurrent, currency, lang),
      expense: formatValue(expenseCurrent, currency, lang),
      totalAssetsStr: formatValue(totalAssets, currency, lang),
      totalInvestmentStr: formatValue(totalInvestment, currency, lang),
      netWorth: formatValue(netWorthNow, currency, lang),
      incomeTrend: iTrend !== null ? (iTrend === "NEW" ? "NEW" : (iTrend as number).toFixed(1)) : "—",
      expenseTrend: eTrend !== null ? (eTrend === "NEW" ? "NEW" : (eTrend as number).toFixed(1)) : "—",
      netWorthTrend: nwTrend !== null ? (nwTrend === "NEW" ? "NEW" : (nwTrend as number).toFixed(1)) : "—",
      comparisonContext,
    };
  };

  const totals = calculateTotals();

  // Dynamically calculate days remaining until end of period
  const daysLeftLabel = (() => {
    const today = new Date();
    const isCurrentYear = selectedYear === today.getFullYear();
    const isCurrentMonth = selectedMonth === today.getMonth();

    if (selectedMonth === -1) {
      // Annual view
      if (!isCurrentYear) return null;
      const endOfYear = new Date(selectedYear, 11, 31);
      const diff = Math.ceil((endOfYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `${Math.max(0, diff)} ${lang === "id" ? "hari tersisa tahun ini" : "days left this year"}`;
    } else {
      // Monthly view
      if (!isCurrentYear || !isCurrentMonth) return null;
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const diff = lastDay - today.getDate();
      return `${Math.max(0, diff)} ${lang === "id" ? "hari tersisa bulan ini" : "days left this month"}`;
    }
  })();

  // Filter transactions based on active category and period
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    const mMatch = selectedMonth === -1 || txDate.getMonth() === selectedMonth;
    const yMatch = txDate.getFullYear() === selectedYear;
    const cMatch = filterCategory === "ALL" || tx.category === filterCategory;
    return mMatch && yMatch && cMatch;
  });

  // Year list for filtering (dynamic based on data + sensible defaults)
  const availableYears = (() => {
    const currentYear = new Date().getFullYear();
    const dataYears = transactions.map((t) => new Date(t.date).getFullYear());
    const years = Array.from(new Set([currentYear, currentYear - 1, ...dataYears]));
    
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const list = [];
    for (let y = minYear; y <= maxYear; y++) list.push(y);
    return list.sort((a, b) => b - a);
  })();

  // Pagination Logic
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Derive available categories for filter dropdown dynamically
  const availableCategories = [
    "ALL",
    ...Array.from(new Set(transactions.map((t) => t.category))),
  ].sort();

  // Calculate Pivot Data (grouped by category)
  const pivotData = filteredTransactions.reduce(
    (acc, tx) => {
      const numStr = tx.amount;
      const txCurrency = normalizeCurrency(
        tx.currency ||
          (numStr.includes("IDR") || numStr.includes("Rp")
            ? "IDR"
            : numStr.includes("$") || numStr.includes("USD")
              ? "USD"
              : numStr.includes("€") || numStr.includes("EUR")
                ? "EUR"
                : numStr.includes("£") || numStr.includes("GBP")
                  ? "GBP"
                  : numStr.includes("¥") ||
                      numStr.includes("JPY") ||
                      numStr.includes("CNY")
                    ? "JPY"
                    : numStr.includes("₩") || numStr.includes("KRW")
                      ? "KRW"
                      : "USD"),
      );

      let cleanAmount = numStr.replace(/[^0-9.,-]/g, "");
      if (txCurrency === "IDR") {
        cleanAmount = cleanAmount.replace(/\./g, "").replace(/,/g, ".");
      } else {
        cleanAmount = cleanAmount.replace(/,/g, "");
      }

      const rawVal = parseFloat(cleanAmount) || 0;
      const amount = convert(rawVal, txCurrency, currency);

      if (!acc[tx.category]) {
        acc[tx.category] = {
          category: tx.category,
          spent: 0,
          received: 0,
          invested: 0,
        };
      }
      if (tx.type === "Debit" || tx.type === "Expense") acc[tx.category].spent += amount;
      else if (tx.type === "Credit" || tx.type === "Income") acc[tx.category].received += amount;
      else if (tx.type === "Investment") acc[tx.category].invested += amount;

      return acc;
    },
    {} as Record<
      string,
      { category: string; spent: number; received: number; invested: number }
    >,
  );

  const pivotRows = (
    Object.values(pivotData) as {
      category: string;
      spent: number;
      received: number;
      invested: number;
    }[]
  ).sort((a, b) => b.spent - a.spent);

  // Pagination for Pivot if categories are many
  const paginatedPivotRows = pivotRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalPages =
    viewMode === "grid"
      ? Math.ceil(filteredTransactions.length / pageSize)
      : Math.ceil(pivotRows.length / pageSize);

  const handleDownloadCSV = () => {
    const periodLabel = selectedMonth === -1 
      ? `${selectedYear}` 
      : `${(t("months") as unknown as string[])[selectedMonth]}_${selectedYear}`;

    if (viewMode === "grid") {
      const headers = [
        t("colDate"),
        t("colCategory"),
        t("colDescription"),
        t("colType"),
        t("colAmount"),
        t("colLinkedAssets"),
      ];
      const rows = filteredTransactions.map((tx) => [
        tx.date,
        tx.category,
        tx.description.replace(/,/g, ""),
        tx.type,
        tx.amount.replace(/[^0-9.]/g, ""),
        tx.source ? tx.source.replace(/,/g, "") : "",
      ]);
      const csvContent = [
        headers.join(","),
        ...rows.map((e) => e.join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `snapfins_ledger_${periodLabel}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        t("colCategory"),
        t("colIncome"),
        t("colExpense"),
        t("colInvested"),
        t("colNetBalance"),
      ];
      const rows = pivotRows.map((r) => [
        r.category,
        r.received,
        r.spent,
        r.invested,
        r.received - r.spent,
      ]);
      const csvContent = [
        headers.join(","),
        ...rows.map((e) => e.join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `snapfins_pivot_${periodLabel}_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  const dashboardSmartRefresh = async (currentRows: any[], userId: string, prefCurrency: SupportedCurrency) => {
    const now = Date.now();
    const stale = currentRows.filter((a: any) => {
      if (a.valuation_mode !== "market" || !a.symbol || !a.quantity) return false;
      const lastValued = new Date(a.last_valued_at || a.updated_at).getTime();
      const ageMs = now - lastValued;
      if (a.category === "Crypto" && ageMs > 15 * 60 * 1000) return true;
      if (a.category !== "Crypto" && ageMs > 60 * 60 * 1000) return true;
      return false;
    });

    if (stale.length === 0) return;

    try {
      const items = stale.map((a: any) => ({
        symbol: a.symbol,
        type: a.category === "Crypto" ? "crypto" : "stock",
      }));
      const res = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!json.results) return;

      const supabase = createClient();
      const updatedMap: Record<string, number> = {};
      for (let i = 0; i < stale.length; i++) {
        const asset = stale[i];
        const quote = json.results[i];
        if (quote && quote.price && !quote.error) {
          const newCurrentValue = Number(asset.quantity) * quote.price;
          await supabase.from("assets").update({
            last_price: quote.price,
            current_value: newCurrentValue,
            last_valued_at: new Date(quote.updatedAt).toISOString(),
          }).eq("id", asset.id);
          updatedMap[asset.id] = newCurrentValue;
        }
      }

      // Patch the in-memory rows with refreshed current_values → triggers recompute of totalAssets
      setAssetRows(prev =>
        prev.map(item =>
          updatedMap[item.id] !== undefined
            ? { ...item, current_value: updatedMap[item.id] }
            : item
        )
      );
    } catch (err) {
      console.warn("Dashboard smart refresh silently failed", err);
    }
  };

  const fetchTransactions = async () => {

    setIsLoadingTx(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      const { data: assetData, error: assetError } = await supabase
        .from("assets")
        .select("id, name, current_value, currency, symbol, category, quantity, valuation_mode, last_valued_at, updated_at")
        .eq("user_id", userData.user.id);

      if (!error && data) {
        const formattedData = data.map((tx) => ({ ...tx, isAi: tx.is_ai }));
        setTransactions(formattedData);
      }

      if (!assetError && assetData) {
        // Store raw rows — totalAssets is computed reactively at render time
        setAssetRows(assetData);
        // Populate cash/bank/e-wallet assets for the Source Account dropdown
        const cashTypes = ["Cash", "Bank", "E-wallet"];
        setCashAssets(assetData.filter((a: any) => cashTypes.includes(a.category)));

        // Compute initial total for localStorage NW snapshot (at fetch time, rates should be initialized)
        const initialTotal = assetData.reduce((sum: number, item: any) => {
          const val = Number(item.current_value) || 0;
          const assetCur = (item.currency || "USD") as SupportedCurrency;
          return sum + convert(val, assetCur, currency as SupportedCurrency);
        }, 0);

        // Persist prior NW snapshot for trend comparison (read first, then update)
        const NW_KEY = `snapfins_prior_nw_${userData.user.id}`;
        try {
          const stored = localStorage.getItem(NW_KEY);
          if (stored) {
            const { value, savedAt } = JSON.parse(stored);
            const ageMs = Date.now() - savedAt;
            if (ageMs > 30 * 60 * 1000) {
              setPriorNetWorth(value);
            }
          }
          localStorage.setItem(NW_KEY, JSON.stringify({ value: initialTotal, savedAt: Date.now() }));
        } catch { /* localStorage unavailable — trend will just be hidden */ }

        // Lightweight smart refresh of stale market assets
        dashboardSmartRefresh(assetData, userData.user.id, currency as SupportedCurrency);
      }
    } else {
      // Not authenticated, redirect to landing
      window.location.href = "/";
    }
    setIsLoadingTx(false);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  const handleEdit = (tx: any) => {
    setEditingTx(tx);
    
    // Determine the locale for formatting the initial field value
    const editCurrency = tx.currency || currency;
    const locale = editCurrency === "IDR" ? "id-ID" : "en-US";
    
    // Ensure amount is a number and format it for the input field
    const numericAmount = parseFloat(tx.amount.toString().replace(/[^0-9.-]/g, "")) || 0;
    const formattedAmount = new Intl.NumberFormat(locale).format(numericAmount);

    setManualForm({
      date: tx.date || new Date().toISOString().split("T")[0],
      category: tx.category || "GENERAL",
      description: tx.description || "",
      type: tx.type === "Debit" ? "Expense" : tx.type === "Credit" ? "Income" : tx.type,
      currency: editCurrency,
      amount: formattedAmount,
      source: tx.source || "",
      linked_asset_id: tx.linked_asset_id || "",
    });
    setShowManualEntry(true);
  };

  const handleDeleteClick = (ids: string[]) => {
    setDeleteQueue(ids);
    setShowDeleteTxModal(true);
  };

  const confirmDeleteBatch = async () => {
    if (deleteQueue.length === 0) return;
    setIsDeletingRows(true);
    const supabase = createClient();
    
    try {
      // Reverse asset balances for any linked transactions before deleting
      const linkedTxs = transactions.filter(
        tx => deleteQueue.includes(tx.id) && tx.linked_asset_id
      );

      for (const tx of linkedTxs) {
        const linkedAsset = assetRows.find((a: any) => a.id === tx.linked_asset_id);
        if (linkedAsset) {
          const txAmt = parseFloat(tx.amount.toString().replace(/[^0-9.-]/g, "")) || 0;
          const txCur = (tx.currency || "USD") as SupportedCurrency;
          const assetCur = (linkedAsset.currency || "USD") as SupportedCurrency;
          const amtInAssetCur = convert(txAmt, txCur, assetCur);
          // Reverse: Income had added, Expense had subtracted
          const isIncome = tx.type === "Credit" || tx.type === "Income";
          const reversalDelta = isIncome ? -amtInAssetCur : amtInAssetCur;
          const newValue = Math.max(0, Number(linkedAsset.current_value) + reversalDelta);
          await supabase.from("assets").update({ current_value: newValue }).eq("id", linkedAsset.id);
          setAssetRows((prev: any[]) =>
            prev.map((a: any) => a.id === linkedAsset.id ? { ...a, current_value: newValue } : a)
          );
        }
      }

      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", deleteQueue);

      if (!error) {
        setTransactions(prev => prev.filter(tx => !deleteQueue.includes(tx.id)));
        setSelectedIds(prev => prev.filter(id => !deleteQueue.includes(id)));
        setShowDeleteTxModal(false);
        setDeleteQueue([]);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeletingRows(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchTransactions();
  }, []);


  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) throw new Error("Not authenticated");

      // 1. Smart Locale-Aware Parser
      const isIDR = manualForm.currency === "IDR";
      const rawText = manualForm.amount.toString();
      let finalAmount: number;
      
      if (isIDR) {
        const cleaned = rawText.replace(/\./g, "").replace(/,/g, ".");
        finalAmount = parseFloat(cleaned);
      } else {
        const cleaned = rawText.replace(/,/g, "");
        finalAmount = parseFloat(cleaned);
      }

      if (isNaN(finalAmount)) throw new Error("Invalid amount entered");

      // 2. Map UI labels to DB internal types (CRITICAL FOR DB INTEGRITY)
      const dbType = manualForm.type === "Expense" ? "Debit" 
                   : manualForm.type === "Income" ? "Credit" 
                   : manualForm.type;

      // 3. Build Payload
      // If a linked asset is selected, use its name as the source label for the Linked Assets column
      const linkedAssetForPayload = manualForm.linked_asset_id
        ? assetRows.find((a: any) => a.id === manualForm.linked_asset_id)
        : null;
      const sourceLabel = linkedAssetForPayload
        ? linkedAssetForPayload.name
        : manualForm.source || (editingTx ? editingTx.source : "Manual Entry");

      const txPayload: any = {
        user_id: userData.user.id,
        date: manualForm.date,
        category: manualForm.category.toUpperCase(),
        description: manualForm.description,
        type: dbType,
        amount: Number(finalAmount),
        currency: manualForm.currency,
        source: sourceLabel,
        linked_asset_id: manualForm.linked_asset_id || null,
      };

      // Guard: only fire when assetId is a real non-empty UUID string.
      const applyAssetDeltaInternal = async (assetId: string, delta: number, txCurrency: string) => {
        if (!assetId || assetId.trim() === "") return;
        const linkedAsset = assetRows.find((a: any) => a.id === assetId);
        if (!linkedAsset) {
          console.warn("applyAssetDelta: asset not found for id", assetId);
          return;
        }
        const amtInAssetCur = convert(delta, txCurrency as SupportedCurrency, linkedAsset.currency as SupportedCurrency);
        const newValue = Math.max(0, Number(linkedAsset.current_value) + amtInAssetCur);
        const { error: assetUpdateError } = await supabase.from("assets").update({ current_value: newValue }).eq("id", assetId);
        if (assetUpdateError) {
          console.error("applyAssetDelta DB error:", assetUpdateError.message);
          return;
        }
        setAssetRows((prev: any[]) =>
          prev.map((a: any) => a.id === assetId ? { ...a, current_value: newValue } : a)
        );
      };

      if (editingTx) {
        const targetId = editingTx.id;

        // Reverse OLD asset balance effect before applying the update
        if (editingTx.linked_asset_id) {
          const oldAmt = parseFloat(editingTx.amount.toString().replace(/[^0-9.-]/g, "")) || 0;
          const oldIsIncome = editingTx.type === "Credit" || editingTx.type === "Income";
          const oldDelta = oldIsIncome ? -oldAmt : oldAmt; // reversal
          await applyAssetDeltaInternal(editingTx.linked_asset_id, oldDelta, editingTx.currency || "USD");
        }

        const { data: updatedData, error: updateError } = await supabase
          .from("transactions")
          .update(txPayload)
          .eq("id", targetId)
          .select();

        if (updateError) {
          throw new Error(`DB Error: ${updateError.message} (${updateError.code})`);
        }

        if (updatedData && updatedData.length > 0) {
          // Apply NEW asset balance effect
          if (manualForm.linked_asset_id) {
            const newIsIncome = dbType === "Credit";
            const newDelta = newIsIncome ? finalAmount : -finalAmount;
            await applyAssetDeltaInternal(manualForm.linked_asset_id, newDelta, manualForm.currency);
          }

          const mappedTx = { ...updatedData[0], isAi: updatedData[0].is_ai };
          setTransactions((prev) =>
            prev.map(tx => tx.id === targetId ? mappedTx : tx)
          );
          setShowManualEntry(false);
          setEditingTx(null);
          fetchTransactions();
        } else {
          throw new Error("Failed to update transaction. It may have been deleted or you do not have permission.");
        }
      } else {
        // INSERT New Transaction
        txPayload.is_ai = false;
        txPayload.color = assignColor(manualForm.category.toUpperCase());

        const { data: insertedData, error: insertError } = await supabase
          .from("transactions")
          .insert([txPayload])
          .select();

        if (insertError) throw insertError;

        if (insertedData && insertedData.length > 0) {
          // Apply asset balance change for the linked account
          if (manualForm.linked_asset_id) {
            const isIncome = dbType === "Credit";
            const delta = isIncome ? finalAmount : -finalAmount;
            await applyAssetDeltaInternal(manualForm.linked_asset_id, delta, manualForm.currency);
          }

          const mappedTx = { ...insertedData[0], isAi: insertedData[0].is_ai };
          setTransactions((prev) => [mappedTx, ...prev]);
          setShowManualEntry(false);
          fetchTransactions();
        }
      }

      // Reset Form
      setManualForm({
        date: new Date().toISOString().split("T")[0],
        category: "GENERAL",
        description: "",
        type: "Expense",
        currency,
        amount: "",
        source: "",
        linked_asset_id: "",
      });

    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startCamera = async () => {
    setScanStep("camera");
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setScanError(t("cameraAccessDenied") || "Camera access denied. Please check permissions.");
      setScanStep("select");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const processScanData = async (file: File | Blob) => {
    setScanStep("analyzing");
    setScanError(null);
    setScanningLogs(["> Establishing connection to Gemini AI..."]);

    // Staggered log gimmick
    const addLog = (msg: string, delay: number) => 
      new Promise(resolve => setTimeout(() => {
        setScanningLogs(prev => [...prev, msg]);
        resolve(null);
      }, delay));

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error(t("notAuthenticated") || "Please login first to scan receipts.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", lang);

      // Animation start
      const scanPromise = fetch("/api/scan", { method: "POST", body: formData });
      
      await addLog("> Accessing visual processing matrix... [OK]", 800);
      await addLog("> Extracting merchant and total... [IN PROGRESS]", 1200);

      const res = await scanPromise;
      const data = await res.json();

      if (res.ok && data.transaction) {
        if (data.transaction.isValidReceipt === false) {
          throw new Error(data.transaction.errorReason || t("tryAgainWithDifferent"));
        }

        await addLog("> Validating tax categories... [DONE]", 600);
        await addLog("> Ready for confirmation.", 400);

        setTempScanData({
          ...data.transaction,
          userId: userData.user.id
        });
        setScanStep("confirm");
      } else {
        throw new Error(data.error || t("scanErrorHint"));
      }
    } catch (error: any) {
      console.error(error);
      setScanError(error.message || t("tryAgainWithDifferent"));
      setScanStep("select");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            stopCamera();
            processScanData(blob);
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowScanModal(true); // Open the modal so the user sees the progress/error
    await processScanData(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyAssetDelta = async (assetId: string, delta: number, txCurrency: string) => {
    if (!assetId || assetId.trim() === "") return;
    const supabase = createClient();
    const linkedAsset = assetRows.find((a: any) => a.id === assetId);
    if (!linkedAsset) {
      console.warn("applyAssetDelta (shared): asset not found for id", assetId);
      return;
    }
    const amtInAssetCur = convert(delta, txCurrency as SupportedCurrency, linkedAsset.currency as SupportedCurrency);
    
    // CRITICAL: Prevent NaN from reaching the database
    if (isNaN(amtInAssetCur)) {
      console.error("applyAssetDelta (shared): Calculated delta is NaN. Aborting DB update.");
      return;
    }

    const newValue = Math.max(0, Number(linkedAsset.current_value) + amtInAssetCur);
    
    if (isNaN(newValue)) {
      console.error("applyAssetDelta (shared): New value is NaN. Aborting DB update.");
      return;
    }

    const { error: assetUpdateError } = await supabase.from("assets").update({ current_value: newValue }).eq("id", assetId);
    if (assetUpdateError) {
      console.error("applyAssetDelta (shared) DB error:", assetUpdateError.message);
      return;
    }
    setAssetRows((prev: any[]) =>
      prev.map((a: any) => a.id === assetId ? { ...a, current_value: newValue } : a)
    );
  };

  const finalizeScan = async () => {
    if (!tempScanData) return;
    setIsScanning(true);
    try {
      const supabase = createClient();
      const linkedAsset = assetRows.find((a: any) => a.id === tempScanData.linkedAssetId);
      const sourceName = linkedAsset ? linkedAsset.name : "Gemini Vision";
      
      const cleanAmount = Number(tempScanData.amount);
      if (isNaN(cleanAmount)) {
        throw new Error("Invalid transaction amount: NaN");
      }

      const newTx = {
        user_id: tempScanData.userId,
        date: tempScanData.date,
        category: tempScanData.category || "GENERAL",
        color: assignColor(tempScanData.category || "GENERAL"),
        description: tempScanData.description,
        type: "Debit", // Normalize to DB schema type for Expenses
        amount: String(cleanAmount), // Save as string but guaranteed numeric
        currency: tempScanData.currency || "IDR",
        source: sourceName,
        linked_asset_id: tempScanData.linkedAssetId || null,
        is_ai: true,
      };

      const { data: insertedData, error } = await supabase
        .from("transactions")
        .insert([newTx])
        .select();

      if (error) throw error;
      
      if (insertedData) {
        // Apply balance update
        if (tempScanData.linkedAssetId) {
          await applyAssetDelta(tempScanData.linkedAssetId, -cleanAmount, tempScanData.currency || "IDR");
        }
        
        const mappedTx = { ...insertedData[0], isAi: insertedData[0].is_ai };
        setTransactions((prev) => [mappedTx, ...prev]);
        await fetchTransactions();
        setShowScanModal(false);
        setTempScanData(null);
        setScanStep("select");
      }
    } catch (error: any) {
      alert("Failed to save: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Immersive Scan Modal */}
      {showScanModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-2xl flex flex-col w-full max-w-xl border border-white/10 relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="font-headline font-bold text-3xl text-on-surface dark:text-white mb-1">
                  {scanStep === 'select' ? t("scanReceipt") : 
                   scanStep === 'camera' ? t("cameraCapture") || "Camera Scan" : 
                   scanStep === 'analyzing' ? t("analyzing") || "Analyzing..." : 
                   t("confirmEntry")}
                </h3>
                <p className="text-sm text-on-surface-variant dark:text-gray-400 font-medium italic opacity-70">
                  {scanStep === 'select' ? "Choose your input source" : 
                   scanStep === 'camera' ? "Align receipt within the frame" : 
                   scanStep === "analyzing" ? "Gemini AI is processing your image" : 
                   "Verify the extracted information"}
                </p>
              </div>
              <button
                onClick={() => {
                  stopCamera();
                  setShowScanModal(false);
                  setScanStep("select");
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Step 1: Selection */}
            {scanStep === 'select' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={startCamera}
                  className="group relative flex flex-col items-center justify-center p-12 bg-surface-container-low dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-outline-variant/30 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-4xl">photo_camera</span>
                  </div>
                  <span className="font-bold text-on-surface dark:text-white">Camera View</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center p-12 bg-surface-container-low dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-outline-variant/30 hover:border-secondary hover:bg-secondary/5 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-secondary text-4xl">image</span>
                  </div>
                  <span className="font-bold text-on-surface dark:text-white">Gallery Upload</span>
                </button>
              </div>
            )}

            {/* Step 2: Camera Live */}
            {scanStep === 'camera' && (
              <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-black border-2 border-primary/30 shadow-2xl animate-in zoom-in duration-300">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {/* Scanner Overlay UI */}
                <div className="absolute inset-0 scanner-overlay-gradient pointer-events-none">
                  {/* Corners */}
                  <div className="scanner-corner top-4 left-4 border-t-4 border-l-4"></div>
                  <div className="scanner-corner top-4 right-4 border-t-4 border-r-4"></div>
                  <div className="scanner-corner bottom-4 left-4 border-b-4 border-l-4"></div>
                  <div className="scanner-corner bottom-4 right-4 border-b-4 border-r-4"></div>
                  
                  {/* Scan Line */}
                  <div className="animate-scan-line"></div>
                </div>

                {/* Capture Button */}
                <div className="absolute bottom-10 inset-x-0 flex justify-center items-center gap-6">
                  <button 
                    onClick={() => { stopCamera(); setScanStep('select'); }}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined">restart_alt</span>
                  </button>
                  <button 
                    onClick={capturePhoto}
                    className="w-20 h-20 rounded-full border-4 border-primary p-1 bg-white/20 backdrop-blur-sm group hover:scale-110 transition-all cursor-pointer"
                  >
                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:bg-primary-container">
                      <span className="material-symbols-outlined text-white text-3xl">camera_alt</span>
                    </div>
                  </button>
                  <div className="w-12 h-12"></div>
                </div>
              </div>
            )}

            {/* Step 3: Analyzing Gimmick */}
            {scanStep === 'analyzing' && (
              <div className="flex flex-col items-center py-10 animate-in fade-in duration-500">
                <div className="relative w-48 h-48 mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-secondary/20 border-b-secondary animate-spin [animation-duration:2s]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-6xl animate-pulse">auto_awesome</span>
                  </div>
                </div>
                
                <h4 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-3">
                  <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
                  Analyzing with Gemini AI...
                </h4>

                {/* Terminal-style Logs */}
                <div className="w-full bg-slate-950 rounded-2xl p-6 font-mono text-xs text-secondary shadow-lg border border-white/5 space-y-2 max-h-40 overflow-y-auto">
                  {scanningLogs.map((log, idx) => (
                    <div key={idx} className={idx === scanningLogs.length - 1 ? "terminal-cursor" : ""}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Confirm Entry */}
            {scanStep === 'confirm' && tempScanData && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <div className="bg-surface-container-low dark:bg-slate-800/80 rounded-2xl p-6 border border-outline-variant/30 mb-8">
                  <div className="grid grid-cols-2 gap-y-6">
                    <div className="col-span-2 flex items-center gap-4 mb-2">
                       <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant opacity-60">Merchant</p>
                          <p className="font-bold text-xl text-on-surface dark:text-white capitalize">{tempScanData.description}</p>
                       </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant opacity-60">Date</p>
                      <p className="font-bold text-on-surface dark:text-white">{tempScanData.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant opacity-60">Category</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                        {tempScanData.category}
                      </span>
                    </div>
                    <div className="col-span-2 pt-4 border-t border-outline-variant/10 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-secondary">Total Amount</p>
                        <p className="font-black text-3xl text-on-surface dark:text-white tracking-tighter">
                          {tempScanData.currency} {tempScanData.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                    <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-70">
                      {lang === 'id' ? 'Bayar dari Akun' : 'Paid from Account'} <span className="text-error font-black">*</span>
                    </label>
                    <div className="relative">
                        <select
                          value={tempScanData.linkedAssetId || ""}
                          onChange={(e) => setTempScanData({ ...tempScanData, linkedAssetId: e.target.value })}
                          className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-secondary rounded-xl px-4 py-3.5 text-on-surface font-bold text-sm transition-colors outline-none cursor-pointer appearance-none pr-10"
                        >
                          <option value="">{lang === 'id' ? "— Pilih Akun Pembayar —" : "— Select Paying Account —"}</option>
                          {cashAssets.map((a: any) => (
                            <option key={a.id} value={a.id}>
                              {a.name} ({a.currency})
                            </option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-50">
                          expand_more
                        </span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed italic border-l-2 border-secondary/30 pl-3">
                      {lang === 'id' 
                        ? "Gemini membaca struk, tapi Anda yang menentukan akun mana yang terdebit." 
                        : "Gemini reads the receipt, but you choose which account paid for it."}
                    </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setScanStep('select')}
                    className="flex-1 py-4 rounded-2xl bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-white font-bold hover:bg-surface-variant transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  {cashAssets.length > 0 ? (
                    <button 
                      onClick={finalizeScan}
                      disabled={isScanning || !tempScanData?.linkedAssetId}
                      className="flex-1 py-4 rounded-2xl bg-secondary text-white font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isScanning ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "Confirm Entry"}
                    </button>
                  ) : (
                    <a
                      href="/assets"
                      className="flex-1 py-4 rounded-2xl bg-primary text-white font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      {lang === "id" ? "Tambah Akun Dulu" : "Add Account First"}
                    </a>
                  )}
                </div>
              </div>
            )}

            {scanError && (
              <div className="mt-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="text-xs font-semibold text-error-container">{scanError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-surface p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col w-full max-w-lg border border-outline-variant/20 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline font-bold text-2xl text-on-surface">
                  {editingTx ? t("editTransaction") : t("manualEntryTitle")}
                </h3>
                {!editingTx && (
                  <p className="text-xs text-on-surface-variant/60 font-medium mt-0.5">
                    {lang === "id"
                      ? "Catat peristiwa arus kas — pendapatan atau pengeluaran"
                      : "Record a cashflow event — income or expense"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowManualEntry(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    {t("labelDate")}
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, date: e.target.value })
                    }
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    {t("labelAmount")}
                  </label>
                  <div className="flex bg-surface-container-low border border-outline-variant/30 rounded-xl focus-within:border-primary transition-colors overflow-hidden">
                    <div className="relative flex items-center">
                      <select
                        value={manualForm.currency}
                        onChange={(e) => {
                          const newCurrency = e.target.value as SupportedCurrency;
                          const raw = manualForm.amount.replace(/[^0-9]/g, "");
                          
                          if (raw) {
                            const locale = newCurrency === "IDR" ? "id-ID" : "en-US";
                            const numericVal = parseInt(raw, 10);
                            const fmt = new Intl.NumberFormat(locale).format(numericVal);
                            
                            setManualForm({
                              ...manualForm,
                              currency: newCurrency,
                              amount: fmt,
                            });
                          } else {
                            setManualForm({
                              ...manualForm,
                              currency: newCurrency,
                            });
                          }
                        }}
                        className="bg-transparent text-on-surface text-[10px] font-black pl-3 pr-6 py-3 focus:outline-none border-r border-outline-variant/30 cursor-pointer w-20 shrink-0 appearance-none"
                      >
                        {Object.keys(currencySymbols).map((c) => (
                          <option
                            key={c}
                            value={c}
                            className="bg-surface dark:bg-slate-900 text-on-surface"
                          >
                            {c}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-1.5 pointer-events-none text-xs text-on-surface-variant opacity-50">
                        expand_more
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder={
                        manualForm.currency === "IDR" ? "50.000" : "50,000"
                      }
                      required
                      value={manualForm.amount}
                      onChange={(e) => {
                        const numericStr = e.target.value.replace(/\D/g, "");
                        if (!numericStr) {
                          setManualForm({ ...manualForm, amount: "" });
                        } else {
                          const locale =
                            manualForm.currency === "IDR" ? "id-ID" : "en-US";
                          setManualForm({
                            ...manualForm,
                            amount: new Intl.NumberFormat(locale).format(
                              parseInt(numericStr, 10),
                            ),
                          });
                        }
                      }}
                      className="flex-grow bg-transparent px-3 py-3 text-on-surface text-sm focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("labelDescription")}
                </label>
                <input
                  type="text"
                  placeholder={t("placeholderDescription")}
                  required
                  value={manualForm.description}
                  onChange={(e) =>
                    setManualForm({
                      ...manualForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    {t("labelCategory")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("placeholderCategory")}
                    required
                    value={manualForm.category}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, category: e.target.value })
                    }
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    {t("labelType")}
                  </label>
                  <select
                    value={manualForm.type}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, type: e.target.value })
                    }
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                  >
                    <option
                      value="Expense"
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {t("typeExpense")}
                    </option>
                    <option
                      value="Income"
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {t("typeIncome")}
                    </option>
                  </select>
                  <p className="text-[10px] text-on-surface-variant/55 mt-1.5 leading-relaxed">
                    {manualForm.type === "Income"
                      ? (lang === "id"
                          ? "Uang yang Anda terima sekarang — gaji, transfer masuk, atau refund."
                          : "Money received now — such as salary, transfer in, or refund.")
                      : (lang === "id"
                          ? "Uang yang Anda keluarkan — tagihan, belanja, atau pembayaran."
                          : "Money spent now — such as bills, food, or purchases.")}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {manualForm.type === "Income"
                    ? (lang === "id" ? "Akun Tujuan" : "Destination Account")
                    : (lang === "id" ? "Akun Sumber" : "Source Account")}
                </label>
                <select
                  value={manualForm.linked_asset_id}
                  onChange={(e) => setManualForm({ ...manualForm, linked_asset_id: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="">{lang === "id" ? "— Pilih Akun —" : "— Select Account —"}</option>
                  {cashAssets.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name}{a.currency ? ` (${a.currency})` : ""}
                    </option>
                  ))}
                </select>
                {!manualForm.linked_asset_id ? (
                  <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1.5 font-bold">
                    <span className="material-symbols-outlined text-sm">info</span>
                    {lang === "id"
                      ? "Butuh akun Kas/Bank/E-wallet sebelum mencatat transaksi."
                      : "Need a Cash/Bank/E-wallet account before recording transactions."}
                  </p>
                ) : (
                  <p className="text-[10px] text-on-surface-variant/55 mt-1.5">
                    {manualForm.type === "Income"
                      ? (lang === "id"
                          ? "✓ Saldo akun ini akan bertambah · Net Worth akan naik"
                          : "✓ This account balance will increase · Net Worth goes up")
                      : (lang === "id"
                          ? "✓ Saldo akun ini akan berkurang · Net Worth akan turun"
                          : "✓ This account balance will decrease · Net Worth goes down")}
                  </p>
                )}
              </div>

              <div className="pt-4">
                {cashAssets.length === 0 ? (
                  <a
                    href="/assets"
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    {lang === "id" ? "Tambah Akun di Halaman Aset" : "Add Your First Account in Assets"}
                  </a>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !manualForm.linked_asset_id}
                    className="w-full bg-primary hover:bg-primary-container text-white px-6 py-4 rounded-xl font-bold transition-all hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-70 disabled:pointer-events-none disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">
                          sync
                        </span>{" "}
                        {t("saving")}
                      </>
                    ) : (
                      editingTx ? t("btnEdit") : t("saveTransaction")
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Transaction Confirmation Modal */}
      {showDeleteTxModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-error/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-error text-4xl">
                warning
              </span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2 text-center">
              {deleteQueue.length > 1 ? t("confirmDeleteSelectedTitle") : t("confirmDeleteTransactionTitle")}
            </h3>
            <p className="text-sm text-center text-on-surface-variant leading-relaxed mb-8">
              {deleteQueue.length > 1 ? t("confirmDeleteSelectedMsg", deleteQueue.length) : t("confirmDeleteTransactionMsg")}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={confirmDeleteBatch}
                disabled={isDeletingRows}
                className="w-full bg-error hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                {isDeletingRows ? (
                  <span className="material-symbols-outlined animate-spin text-sm">
                    sync
                  </span>
                ) : null}
                {isDeletingRows ? t("deleting") : t("btnDelete")}
              </button>
              <button
                onClick={() => setShowDeleteTxModal(false)}
                disabled={isDeletingRows}
                className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-3 px-4 rounded-xl transition-all active:scale-95"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Scan Success Modal (Jump to Date) */}
      {scanSuccess && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-primary/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-primary text-4xl">
                check_circle
              </span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              {t("scanSuccessTitle")}
            </h3>
            <p className="text-sm text-center text-on-surface-variant leading-relaxed mb-4">
              {t("scanSuccessDate", scanSuccess.date)}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  const d = new Date(scanSuccess.date);
                  setSelectedMonth(d.getMonth());
                  setSelectedYear(d.getFullYear());
                  setScanSuccess(null);
                }}
                className="w-full bg-primary hover:bg-primary-container text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  visibility
                </span>
                {t("viewTransaction")}
              </button>
              <button
                onClick={() => setScanSuccess(null)}
                className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-3 px-4 rounded-xl transition-all active:scale-95"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-6 md:py-10 space-y-8 md:space-y-10 pb-32 md:pb-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
              {t("financialOverview")}
            </h1>
            <p className="text-on-surface-variant font-black tracking-[0.2em] uppercase text-[9px] md:text-[10px] opacity-60 hover:opacity-100 transition-opacity">
              {t("liveStatus")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                setEditingTx(null);
                setManualForm({
                  date: new Date().toISOString().split("T")[0],
                  category: "GENERAL",
                  description: "",
                  type: "Expense",
                  currency,
                  amount: "",
                  source: "",
                  linked_asset_id: "",
                });
                setShowManualEntry(true);
              }}
              className="flex sm:hidden px-5 py-3 rounded-xl border border-outline-variant text-on-surface font-bold text-sm hover:bg-surface-container-low transition-all active:scale-[0.98] items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">edit_note</span>
              {t("manualEntry")}
            </button>
            <button
              onClick={() => {
                setEditingTx(null);
                setManualForm({
                  date: new Date().toISOString().split("T")[0],
                  category: "GENERAL",
                  description: "",
                  type: "Expense",
                  currency,
                  amount: "",
                  source: "",
                  linked_asset_id: "",
                });
                setShowManualEntry(true);
              }}
              className="hidden sm:flex md:flex px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all active:opacity-80 items-center gap-2 cursor-pointer"
            >
              {t("manualEntry")}
            </button>
            <button
              onClick={() => setShowScanModal(true)}
              className="px-5 py-4 sm:py-2.5 rounded-xl sm:rounded-lg bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-[0_4px_15px_rgba(53,37,205,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 magic-glow-hover cursor-pointer overflow-hidden group"
            >
              <span
                className="material-symbols-outlined text-lg focus:outline-none animate-stars-float"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <span className="relative z-10">{t("scanReceipt")}</span>
            </button>
          </div>
        </header>

        {/* Summary Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Total Net Worth */}
          <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-surface-container-low/40 dark:to-slate-800/40">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="h-6 mb-2">
              {totals.netWorthTrend !== "—" && (
                <div className="relative flex justify-between items-start">
                  <TrendIndicator trend={totals.netWorthTrend} context={totals.comparisonContext} />
                </div>
              )}
            </div>
            <div className="relative flex justify-between items-start gap-4">
              <div className="min-w-0 flex-grow">
                <div className="h-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 leading-tight">
                    {t("totalNetWorth")}
                  </p>
                </div>
                <div 
                  className={`${totals.netWorth.length > 20 ? "text-base" : totals.netWorth.length > 18 ? "text-lg" : totals.netWorth.length > 15 ? "text-xl" : totals.netWorth.length > 12 ? "text-2xl" : "text-3xl"} text-on-surface font-black font-headline tracking-tighter break-all sm:whitespace-nowrap`} 
                  title={totals.netWorth}
                >
                  {totals.netWorth}
                </div>
              </div>
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span
                  className="material-symbols-outlined text-primary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_balance
                </span>
              </div>
            </div>
          </div>

          {/* 2. Monthly Income */}
          <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-secondary-container/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="h-6 mb-2">
              {totals.incomeTrend !== "—" && totals.incomeTrend !== "0.0" && (
                <div className="relative flex justify-between items-start">
                  <TrendIndicator trend={totals.incomeTrend} context={totals.comparisonContext} />
                </div>
              )}
            </div>
            <div className="relative flex justify-between items-start gap-4">
              <div className="min-w-0 flex-grow">
                <div className="h-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 leading-tight">
                    {selectedMonth === -1 ? t("annualIncome") : t("monthlyIncome")}
                  </p>
                </div>
                <div 
                  className={`${totals.income.length > 20 ? "text-base" : totals.income.length > 18 ? "text-lg" : totals.income.length > 15 ? "text-xl" : totals.income.length > 12 ? "text-2xl" : "text-3xl"} text-secondary font-black font-headline tracking-tighter break-all sm:whitespace-nowrap`} 
                  title={totals.income}
                >
                  {totals.income}
                </div>
              </div>
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span
                  className="material-symbols-outlined text-secondary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  insights
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-outline-variant/10 flex items-center gap-2 text-[10px] font-bold text-on-surface-variant">
              {daysLeftLabel && (
                <>
                  <span className="material-symbols-outlined text-sm">
                    calendar_month
                  </span>
                  {daysLeftLabel}
                </>
              )}
            </div>
          </div>

          <Link href="/assets" className="glass-card p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-surface-container-low/40 dark:to-slate-800/40 cursor-pointer block hover:shadow-2xl transition-all duration-300">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
            <div className="h-6 mb-2 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-secondary rounded-full kinetic-spark shadow-[0_0_4px_rgba(16,185,129,0.8)]"></span>
                <span className="text-[9px] uppercase tracking-widest text-secondary font-black opacity-80 group-hover:opacity-100 transition-opacity">MARKET SYNC</span>
            </div>
            <div className="relative flex justify-between items-start gap-4">
              <div className="min-w-0 flex-grow">
                <div className="h-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 leading-tight">
                    {lang === "id" ? "Total Investasi" : "Total Investment"}
                  </p>
                </div>
                <div 
                  className={`${totals.totalInvestmentStr.length > 20 ? "text-base" : totals.totalInvestmentStr.length > 18 ? "text-lg" : totals.totalInvestmentStr.length > 15 ? "text-xl" : totals.totalInvestmentStr.length > 12 ? "text-2xl" : "text-3xl"} text-primary font-black font-headline tracking-tighter break-all sm:whitespace-nowrap transition-transform duration-300 group-hover:-translate-y-0.5`} 
                  title={totals.totalInvestmentStr}
                >
                  {totals.totalInvestmentStr}
                </div>
              </div>
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20 group-hover:bg-primary/5 transition-colors">
                <span
                  className="material-symbols-outlined text-primary text-2xl transition-transform duration-300 group-hover:scale-110"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_balance
                </span>
              </div>
            </div>
          </Link>

          {/* 4. Monthly Expense */}
          <div className="glass-card p-5 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-error-container/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors"></div>
            <div className="h-6 mb-2">
              {totals.expenseTrend !== "—" && totals.expenseTrend !== "0.0" && (
                <div className="relative flex justify-between items-start">
                  <TrendIndicator trend={totals.expenseTrend} isExpense context={totals.comparisonContext} />
                </div>
              )}
            </div>
            <div className="relative flex justify-between items-start gap-4">
              <div className="min-w-0 flex-grow">
                <div className="h-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 leading-tight">
                    {selectedMonth === -1 ? t("annualExpense") : t("monthlyExpense")}
                  </p>
                </div>
                <div 
                  className={`${totals.expense.length > 20 ? "text-base" : totals.expense.length > 18 ? "text-lg" : totals.expense.length > 15 ? "text-xl" : totals.expense.length > 12 ? "text-2xl" : "text-3xl"} text-error font-black font-headline tracking-tighter break-all sm:whitespace-nowrap`} 
                  title={totals.expense}
                >
                  {totals.expense}
                </div>
              </div>
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span
                  className="material-symbols-outlined text-error text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  credit_score
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Data Table Section */}
        <section className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-on-surface font-headline tracking-tight">
                {t("recentLedger")}
              </h3>
              <p className="text-[10px] text-on-surface-variant/50 font-medium mt-0.5">
                {lang === "id"
                  ? "Transaksi menunjukkan uang masuk dan keluar bulan ini."
                  : "Transactions show money moving in and out this period."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 relative" ref={filterDropdownRef}>
              {mounted && (
                <>
                  {/* View Toggle */}
                  <div className="flex bg-surface-container-low dark:bg-slate-800 p-1 rounded-xl shadow-inner-sm">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-slate-700 text-primary shadow-sm scale-105" : "text-on-surface-variant hover:text-on-surface"}`}
                    >
                      {t("btnGrid")}
                    </button>
                    <button
                      onClick={() => setViewMode("pivot")}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${viewMode === "pivot" ? "bg-white dark:bg-slate-700 text-primary shadow-sm scale-105" : "text-on-surface-variant hover:text-on-surface"}`}
                    >
                      {t("btnPivot")}
                    </button>
                  </div>

                  <div className="h-4 w-px bg-outline-variant/30 hidden sm:block"></div>

                  {/* Period Selector Group */}
                  <div className="flex items-center gap-2">
                    {/* Year Selector */}
                    <div className="relative" ref={yearDropdownRef}>
                      <button 
                        onClick={() => setShowYearDropdown(!showYearDropdown)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface shadow-sm transition-all hover:border-outline-variant cursor-pointer ${showYearDropdown ? "ring-2 ring-primary/20 border-primary" : ""}`}
                      >
                        <span className="material-symbols-outlined text-sm text-primary/70">calendar_month</span>
                        <span className="text-[11px] font-bold">{selectedYear}</span>
                        <span className="material-symbols-outlined text-xs text-on-surface-variant opacity-50">
                          {showYearDropdown ? "expand_less" : "expand_more"}
                        </span>
                      </button>

                      <div 
                        className={`absolute left-0 lg:left-0 top-11 w-32 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden dropdown-transition origin-top-left ${
                          showYearDropdown 
                            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible" 
                            : "opacity-0 -translate-y-8 scale-90 pointer-events-none invisible"
                        }`}
                      >
                        <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
                          {availableYears.map(year => (
                            <button
                              key={year}
                              onClick={() => {
                                setSelectedYear(year);
                                setShowYearDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between text-[11px] ${selectedYear === year ? "text-primary font-black bg-primary/5" : "text-on-surface font-semibold"}`}
                            >
                              {year}
                              {selectedYear === year && (
                                <span className="material-symbols-outlined text-sm">check</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Month Selector */}
                    <div className="relative" ref={monthDropdownRef}>
                      <button 
                        onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface shadow-sm transition-all hover:border-outline-variant cursor-pointer ${showMonthDropdown ? "ring-2 ring-primary/20 border-primary" : ""}`}
                      >
                        <span className="text-[11px] font-bold">
                          {selectedMonth === -1 ? t("allMonths") : (t("months") as unknown as string[])[selectedMonth]}
                        </span>
                        <span className="material-symbols-outlined text-xs text-on-surface-variant opacity-50">
                          {showMonthDropdown ? "expand_less" : "expand_more"}
                        </span>
                      </button>

                      <div 
                        className={`absolute left-0 lg:left-0 top-11 w-44 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden dropdown-transition origin-top-left ${
                          showMonthDropdown 
                            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible" 
                            : "opacity-0 -translate-y-8 scale-90 pointer-events-none invisible"
                        }`}
                      >
                        <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin">
                          <button
                            onClick={() => {
                              setSelectedMonth(-1);
                              setShowMonthDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between text-[11px] ${selectedMonth === -1 ? "text-primary font-black bg-primary/5" : "text-on-surface font-semibold"}`}
                          >
                            {t("allMonths")}
                            {selectedMonth === -1 && (
                              <span className="material-symbols-outlined text-sm">check</span>
                            )}
                          </button>
                          <div className="h-[1px] bg-outline-variant/10 mx-2 my-1"></div>
                          {(t("months") as unknown as string[]).map((m, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedMonth(idx);
                                setShowMonthDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between text-[11px] ${selectedMonth === idx ? "text-primary font-black bg-primary/5" : "text-on-surface font-semibold"}`}
                            >
                              {m}
                              {selectedMonth === idx && (
                                <span className="material-symbols-outlined text-sm">check</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-4 w-px bg-outline-variant/30 hidden sm:block"></div>
                </>
              )}

              {/* Active Filter Pill */}
              {filterCategory !== "ALL" && (
                <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider animate-in fade-in zoom-in duration-200 shadow-sm">
                  <span className="opacity-70">{t("colCategory")}:</span>
                  <span className="text-primary-container bg-primary/10 px-1 rounded">
                    {filterCategory}
                  </span>
                  <button
                    onClick={() => setFilterCategory("ALL")}
                    className="material-symbols-outlined text-[16px] ml-1 hover:text-error transition-colors cursor-pointer p-0.5 rounded-full hover:bg-error/10"
                    title={t("resetFilter")}
                  >
                    close
                  </button>
                </div>
              )}

              <div className="relative flex items-center" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-sm ${filterCategory !== "ALL" || showFilterDropdown ? "border-primary bg-primary/10 text-primary" : "border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    filter_list
                  </span>
                  {t("colCategory")}
                  {filterCategory !== "ALL" && (
                     <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  )}
                </button>
                <div 
                  className={`absolute right-0 top-12 mt-2 w-56 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden text-sm dropdown-transition origin-top-right ${
                    showFilterDropdown 
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible" 
                      : "opacity-0 -translate-y-8 scale-90 pointer-events-none invisible"
                  }`}
                >
                  <div className="px-4 py-3 border-b border-outline-variant/10 font-black text-[10px] uppercase tracking-widest text-on-surface-variant bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                    {t("filterPrompt")}
                    {filterCategory !== "ALL" && (
                      <button
                        onClick={() => setFilterCategory("ALL")}
                        className="text-error hover:underline text-[9px] uppercase"
                      >
                        {t("resetFilter")}
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin">
                    <button
                      onClick={() => {
                        setFilterCategory("ALL");
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors text-xs cursor-pointer flex items-center justify-between ${filterCategory === "ALL" ? "text-primary font-black bg-primary/5" : "text-on-surface font-semibold"}`}
                    >
                      {t("filterAll")}
                      {filterCategory === "ALL" && (
                        <span className="material-symbols-outlined text-sm">
                          check
                        </span>
                      )}
                    </button>
                    <div className="h-[1px] bg-outline-variant/10 mx-2 my-1"></div>
                    {availableCategories
                      .filter((c) => c !== "ALL")
                      .map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors text-xs cursor-pointer flex items-center justify-between ${filterCategory === cat ? "text-primary font-black bg-primary/5" : "text-on-surface font-semibold"}`}
                        >
                          {cat}
                          {filterCategory === cat && (
                            <span className="material-symbols-outlined text-sm">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">
                    {selectedIds.length}
                  </span>
                  <p className="text-sm font-bold text-on-surface">
                    {typeof t("itemsSelected") === 'function' ? t("itemsSelected", selectedIds.length) : `${selectedIds.length} items Selected`}
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedIds([])}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-on-surface-variant hover:text-on-surface font-bold text-xs transition-colors cursor-pointer"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedIds)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-error text-white font-black text-xs shadow-lg shadow-error/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    {t("btnDelete")}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-x-auto flex flex-col min-h-[450px] custom-scrollbar rounded-lg shadow-sm border border-outline-variant/20">
            <table className="w-full excel-grid bg-surface-container-lowest dark:bg-slate-900/50 text-xs font-body tracking-tight">
              <thead className="bg-slate-50 dark:bg-slate-900 text-on-surface-variant uppercase font-bold text-[10px] tracking-widest border-b border-outline-variant/10 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                {viewMode === "grid" ? (
                  <tr>
                    <th className="p-4 text-center w-10">
                      <SelectionToggle
                        checked={selectedIds.length > 0 && selectedIds.length === paginatedTransactions.length}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedTransactions.length}
                        onChange={() => handleSelectAll(paginatedTransactions.map(tx => tx.id))}
                      />
                    </th>
                    <th className="p-4 text-left w-24">{t("colDate")}</th>
                    <th className="p-4 text-left w-32">
                      {t("colCategory")}
                    </th>
                    <th className="p-4 text-left">
                      {t("colDescription")}
                    </th>
                    <th className="p-4 text-left w-24">{t("colType")}</th>
                    <th className="p-4 text-right min-w-[150px]">
                      {t("colAmount")}
                    </th>
                    <th className="p-4 text-left w-40">
                      {t("colLinkedAssets")}
                    </th>
                    <th className="p-4 text-center w-24 sticky right-0 bg-slate-50 dark:bg-slate-900 z-30 border-l border-outline-variant/10">{t("colActions")}</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="p-4 text-left w-40">
                      {t("colCategory")}
                    </th>
                    <th className="p-4 text-right w-32">
                      {t("colIncome")}
                    </th>
                    <th className="p-4 text-right w-32">
                      {t("colExpense")}
                    </th>
                    <th className="p-4 text-right w-32">
                      {t("colInvested")}
                    </th>
                    <th className="p-4 text-right w-32">
                      {t("colNetBalance")}
                    </th>
                  </tr>
                )}
              </thead>
              <tbody className="text-on-surface">
                {viewMode === "grid" ? (
                  paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className={`hover:bg-grid-row-hover dark:hover:bg-slate-800/50 transition-colors group border-b border-outline-variant/5 text-sm font-semibold ${selectedIds.includes(tx.id) ? "bg-primary/[0.08]" : ""}`}
                      >
                        <td className="p-4 text-center">
                          <SelectionToggle
                            checked={selectedIds.includes(tx.id)}
                            onChange={() => handleSelectRow(tx.id)}
                          />
                        </td>
                        <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                          {(() => {
                            if (!tx.date) return "—";
                            const [y, m, d] = tx.date.split("-");
                            return `${d}/${m}/${y}`;
                          })()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${getCategoryStyle(tx.color)}`}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[120px] sm:max-w-xs block">{tx.description}</span>
                            {tx.isAi && (
                              <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-1">
                                <span className="material-symbols-outlined text-[10px]">
                                  auto_awesome
                                </span>
                                {t("aiScanned")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className={`px-3 py-2 font-bold ${tx.type === "Credit" || tx.type === "Income" ? "text-secondary" : tx.type === "Investment" ? "text-indigo-500" : "text-error"}`}
                        >
                          {tx.type === "Credit" || tx.type === "Income" ? t("typeIncome") : tx.type === "Debit" || tx.type === "Expense" ? t("typeExpense") : t("typeInvestment")}
                        </td>
                        <td
                          className={`p-4 text-right font-black tabular-nums text-[14px] ${tx.type === "Income" || tx.type === "Credit" ? "text-secondary" : "text-error"}`}
                        >
                          <div className="flex flex-col items-end">
                            <span className="tabular-nums">
                              {tx.type === "Income" || tx.type === "Credit" ? "+" : "-"}
                              {formatValue(
                                Math.abs(convert(
                                  parseFloat(String(tx.amount).replace(/[^0-9.,-]/g, "")) || 0,
                                  (tx.currency || "IDR") as SupportedCurrency,
                                  currency as SupportedCurrency
                                )),
                                currency as SupportedCurrency,
                                lang
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant font-black text-[11px] uppercase tracking-widest whitespace-nowrap">
                          {(() => {
                            if (tx.linked_asset_id) {
                              const linkedA = cashAssets.find(
                                (a) => a.id === tx.linked_asset_id,
                              );
                              return linkedA ? (
                                <div className="flex items-center gap-1.5 justify-end md:justify-start">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse"></span>
                                  {linkedA.name}
                                </div>
                              ) : (
                                tx.source
                              );
                            }
                            return tx.source || "—";
                          })()}
                        </td>
                        <td className={`p-4 text-center kebab-menu-container sticky right-0 bg-white dark:bg-slate-950 group-hover:bg-grid-row-hover dark:group-hover:bg-[#1a202c] border-l border-outline-variant/10 transition-all ${openMenuId === tx.id ? "z-40 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.3)]" : "z-20"}`}>
                          <div className="relative flex items-center justify-center text-left w-full h-full">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === tx.id ? null : tx.id);
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[20px]">more_vert</span>
                            </button>
                            
                            {openMenuId === tx.id && (
                              <div className="absolute right-0 mt-1 w-32 bg-surface-container dark:bg-slate-800/95 backdrop-blur-md border border-outline-variant/30 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.15)] z-50 py-1.5 origin-top-right animate-in fade-in zoom-in-95 duration-200 divide-y divide-outline-variant/10">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(tx);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-between group/item cursor-pointer"
                                >
                                  <span className="text-[11px] font-bold text-on-surface group-hover/item:text-primary transition-colors">{t("btnEdit")}</span>
                                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover/item:text-primary transition-colors">edit</span>
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick([tx.id]);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full text-left px-4 py-2 hover:bg-error/5 dark:hover:bg-error/10 transition-colors flex items-center justify-between group/item cursor-pointer"
                                >
                                  <span className="text-[11px] font-bold text-error">{t("btnDelete")}</span>
                                  <span className="material-symbols-outlined text-[16px] text-error">delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-3 py-16 text-center text-on-surface-variant text-sm font-medium"
                      >
                        {t("noTransactions")}
                      </td>
                    </tr>
                  )
                ) : paginatedPivotRows.length > 0 ? (
                  paginatedPivotRows.map((row) => {
                    const net = row.received - row.spent;
                    return (
                      <tr
                        key={row.category}
                        className="hover:bg-grid-row-hover dark:hover:bg-slate-800/30 transition-colors border-b border-outline-variant/10 font-semibold text-sm"
                      >
                        <td className="p-4">
                          <span
                            className={`px-1.5 py-0.5 rounded font-black uppercase text-[10px] tracking-widest ${getCategoryStyle(assignColor(row.category))}`}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-black tabular-nums text-[13px] text-secondary">
                          {row.received > 0
                            ? `+${formatValue(row.received, currency, lang)}`
                            : "-"}
                        </td>
                        <td className="p-4 text-right font-black tabular-nums text-[13px] text-error">
                          {row.spent > 0
                            ? `-${formatValue(row.spent, currency, lang)}`
                            : "-"}
                        </td>
                        <td className="p-4 text-right font-black tabular-nums text-[13px] text-primary">
                          {row.invested > 0
                            ? formatValue(row.invested, currency, lang)
                            : "-"}
                        </td>
                        <td
                          className={`p-4 text-right font-black tabular-nums text-[13px] ${net > 0 ? "text-secondary" : net < 0 ? "text-error" : "text-slate-500"}`}
                        >
                          {net > 0
                            ? `+${formatValue(net, currency, lang)}`
                            : net < 0
                              ? `-${formatValue(Math.abs(net), currency, lang)}`
                              : formatValue(0, currency, lang)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-4 text-center text-on-surface-variant text-sm font-medium"
                    >
                      {t("noTransactions")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant py-2">
            <span>{t("displayingResults", filteredTransactions.length)}</span>
            <div className="flex items-center gap-4">
              {totalPages > 1 && (
                <div className="flex items-center gap-2 mr-4 bg-surface-container-low dark:bg-slate-800 p-1 rounded-lg border border-outline-variant/10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-container-lowest dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">
                      chevron_left
                    </span>
                    {t("btnPrev")}
                  </button>
                  <span className="px-2 border-x border-outline-variant/20">
                    {t("pageIndicator", currentPage, totalPages)}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-container-lowest dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {t("btnNext")}
                    <span className="material-symbols-outlined text-sm">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
              <button
                onClick={handleDownloadCSV}
                className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
                {t("downloadCSV")}
              </button>
            </div>
          </div>
        </section>
      </main>



      {/* Hidden processing elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleScan}
        className="hidden"
      />
    </>
  );
}
