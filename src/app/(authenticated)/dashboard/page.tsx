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
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { deleteUserAccountAction } from "@/app/actions/user";
import Link from "next/link";
import SelectionToggle from "@/components/SelectionToggle";
import { DashboardSkeleton } from "@/components/Skeleton";
import RowActionMenu from "@/components/RowActionMenu";
import TransactionModal from "@/components/TransactionModal";
import ScanReceiptModal from "@/components/ScanReceiptModal";
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
  
  // View & Filter States
  const [viewMode, setViewMode] = useState<"grid" | "pivot">("grid");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11, -1 for ALL
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modal States
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [cashAssets, setCashAssets] = useState<any[]>([]);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [showDeleteTxModal, setShowDeleteTxModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [assetRows, setAssetRows] = useState<any[]>([]);
  const [priorNetWorth, setPriorNetWorth] = useState<number | null>(null);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [ratesInitialized, setRatesInitialized] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteQueue, setDeleteQueue] = useState<string[]>([]);
  const [isDeletingRows, setIsDeletingRows] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<any>(null);

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

  // Local alias for imported function
  const setRates = updateExchangeRates;

  // Refs for "Click Outside" behavior
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  // Currency & Rate Initialization
  useEffect(() => {
    const initRates = async () => {
      const CACHE_KEY = "snapfins_exchange_rates";
      const CACHE_TTL = 6 * 60 * 60 * 1000;

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
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, timestamp: Date.now() }));
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
      } finally {
        setRatesInitialized(true);
      }
    };
    initRates();
  }, []);

  // Handle Outside Click & Dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(target)) setShowFilterDropdown(false);
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(target)) setShowYearDropdown(false);
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(target)) setShowMonthDropdown(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowFilterDropdown(false);
        setShowYearDropdown(false);
        setShowMonthDropdown(false);
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

      // EXPLICIT NUMERIC PARSING - No logic guessing!
      const rawVal = Number(tx.amount) || 0;
      const txCurrency = (tx.currency || currency) as SupportedCurrency;
      const val = convert(rawVal, txCurrency, currency as SupportedCurrency);

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
      income: formatValue(incomeCurrent, currency),
      expense: formatValue(expenseCurrent, currency),
      totalAssetsStr: formatValue(totalAssets, currency),
      totalInvestmentStr: formatValue(totalInvestment, currency),
      netWorth: formatValue(netWorthNow, currency),
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


  // ── SHARED DB HELPERS ───────────────────────────────────────────────────
  const applyAssetDelta = async (assetId: string, delta: number, txCurrency: string) => {
    if (!assetId || assetId.trim() === "") return;
    const supabase = createClient();
    const linkedAsset = assetRows.find((a: any) => a.id === assetId);
    if (!linkedAsset) {
      console.warn("applyAssetDelta: asset not found", assetId);
      return;
    }
    const amtInAssetCur = convert(delta, txCurrency as SupportedCurrency, linkedAsset.currency as SupportedCurrency);
    if (isNaN(amtInAssetCur)) return;

    const newValue = Math.max(0, Number(linkedAsset.current_value) + amtInAssetCur);
    const { error } = await supabase.from("assets").update({ current_value: newValue }).eq("id", assetId);
    if (error) {
      console.error("applyAssetDelta error:", error.message);
      return;
    }
    setAssetRows((prev: any[]) =>
      prev.map((a: any) => a.id === assetId ? { ...a, current_value: newValue } : a)
    );
  };

  const handleTransactionSubmit = async (form: any) => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("Auth required");

    const isIDR = form.currency === "IDR";
    const rawAmount = parseFloat(form.amount.replace(isIDR ? /\./g : /,/g, "").replace(/,/g, ".")) || 0;
    const dbType = form.type === "Income" ? "Credit" : "Debit";
    
    const asset = form.linked_asset_id ? assetRows.find((a: any) => a.id === form.linked_asset_id) : null;
    const sourceLabel = asset ? asset.name : (form.source || "Manual Entry");

    const payload = {
      user_id: userData.user.id,
      date: form.date,
      category: form.category.toUpperCase(),
      description: form.description,
      type: dbType,
      amount: rawAmount,
      currency: form.currency,
      source: sourceLabel,
      linked_asset_id: form.linked_asset_id || null,
      is_ai: false,
      color: assignColor(form.category.toUpperCase()),
    };

    if (editingTx) {
      // Reverse old balance
      if (editingTx.linked_asset_id) {
        const oldAmt = Number(editingTx.amount) || 0;
        const oldIsIncome = editingTx.type === "Credit" || editingTx.type === "Income";
        await applyAssetDelta(editingTx.linked_asset_id, oldIsIncome ? -oldAmt : oldAmt, editingTx.currency || "USD");
      }

      const { data, error } = await supabase.from("transactions").update(payload).eq("id", editingTx.id).select();
      if (error) throw error;
      
      if (data?.[0]) {
        // Apply new balance
        if (form.linked_asset_id) {
          await applyAssetDelta(form.linked_asset_id, dbType === "Credit" ? rawAmount : -rawAmount, form.currency);
        }
        setTransactions(prev => prev.map(tx => tx.id === editingTx.id ? { ...data[0], isAi: data[0].is_ai } : tx));
        setEditingTx(null);
        fetchTransactions();
      }
    } else {
      const { data, error } = await supabase.from("transactions").insert([payload]).select();
      if (error) throw error;
      
      if (data?.[0]) {
        if (form.linked_asset_id) {
          await applyAssetDelta(form.linked_asset_id, dbType === "Credit" ? rawAmount : -rawAmount, form.currency);
        }
        setTransactions(prev => [{ ...data[0], isAi: data[0].is_ai }, ...prev]);
        fetchTransactions();
      }
    }
  };

  const handleScanSuccess = async (tempData: any, assetId?: string, amount?: number, cur?: string) => {
    const supabase = createClient();
    const asset = assetId ? assetRows.find((a: any) => a.id === assetId) : null;
    
    // Ensure we have a valid numeric amount
    const rawAmount = Number(amount) || 0;
    
    const payload = {
      user_id: tempData.userId || (await supabase.auth.getUser()).data.user?.id,
      date: tempData.date,
      category: tempData.category || "GENERAL",
      color: assignColor(tempData.category || "GENERAL"),
      description: tempData.description,
      type: "Debit",
      amount: rawAmount,
      currency: cur || "IDR",
      source: asset ? asset.name : "Gemini Vision",
      linked_asset_id: assetId || null,
      is_ai: true,
    };

    const { data, error } = await supabase.from("transactions").insert([payload]).select();
    if (error) throw error;
    
    if (data?.[0]) {
      if (assetId) await applyAssetDelta(assetId, -rawAmount, cur || "IDR");
      setTransactions(prev => [{ ...data[0], isAi: data[0].is_ai }, ...prev]);
      setScanSuccess(data[0]);
      fetchTransactions();
    }
  };

  if (!mounted || isLoadingTx) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <ScanReceiptModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onSuccess={handleScanSuccess}
        cashAssets={cashAssets}
        lang={lang}
        currency={currency}
        t={t as any}
        formatValue={formatValue as any}
      />

      <TransactionModal
        isOpen={showManualEntry}
        onClose={() => {
          setShowManualEntry(false);
          setEditingTx(null);
        }}
        onSubmit={handleTransactionSubmit}
        initialData={editingTx}
        cashAssets={cashAssets}
        lang={lang}
        currency={currency as SupportedCurrency}
        t={t as any}
        formatValue={formatValue as any}
      />

      {showDeleteTxModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-error/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-error text-4xl">warning</span>
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
                {isDeletingRows ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
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
        </div>,
        document.body
      )}

      {scanSuccess && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:pt-4">
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
        </div>,
        document.body
      )}

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-6 md:py-10 space-y-8 md:space-y-10 pb-32 md:pb-12">
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
                  show_chart
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
          <div className="overflow-x-auto select-none flex flex-col custom-scrollbar rounded-xl border border-outline-variant/10 bg-surface-container-lowest/50 dark:bg-slate-900/50 shadow-sm">
            <table className="w-full min-w-[650px] text-left excel-grid bg-surface-container-lowest dark:bg-slate-900/50 text-xs font-body tracking-tight">
              <thead>
                {viewMode === "grid" ? (
                  <tr className="bg-slate-50 dark:bg-slate-900 text-on-surface-variant uppercase font-black text-[10px] tracking-widest border-b border-outline-variant/10 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                    <th className="p-2.5 sm:p-4 pl-6 text-center w-12 hidden sm:table-cell">
                      <SelectionToggle
                        checked={selectedIds.length > 0 && selectedIds.length === paginatedTransactions.length}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < paginatedTransactions.length}
                        onChange={() => handleSelectAll(paginatedTransactions.map(tx => tx.id))}
                      />
                    </th>
                    <th className="p-2.5 sm:p-4 whitespace-nowrap">{t("colDate")}</th>
                    <th className="p-2.5 sm:p-4 whitespace-nowrap hidden sm:table-cell">{t("colCategory")}</th>
                    <th className="p-2.5 sm:p-4 whitespace-nowrap">{t("colDescription")}</th>
                    <th className="p-2.5 sm:p-4 text-left whitespace-nowrap w-[15%]">{t("colType")}</th>
                    <th className="p-2.5 sm:p-4 text-right whitespace-nowrap w-[20%]">{t("colAmount")}</th>
                    <th className="p-2.5 sm:p-4 whitespace-nowrap hidden sm:table-cell">{t("colLinkedAssets")}</th>
                    <th className="p-2 text-center w-12 bg-slate-50 dark:bg-slate-900 border-l border-outline-variant/10"></th>
                  </tr>
                ) : (
                  <tr className="bg-slate-50 dark:bg-slate-900 text-on-surface-variant uppercase font-black text-[10px] tracking-widest border-b border-outline-variant/10 sticky top-0 z-20 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                    <th className="p-2.5 sm:p-4 pl-6 text-left w-40">
                      {t("colCategory")}
                    </th>
                    <th className="p-2.5 sm:p-4 text-right w-32">
                      {t("colIncome")}
                    </th>
                    <th className="p-2.5 sm:p-4 text-right w-32">
                      {t("colExpense")}
                    </th>
                    <th className="p-2.5 sm:p-4 text-right w-32">
                      {t("colInvested")}
                    </th>
                    <th className="p-2.5 sm:p-4 text-right w-32">
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
                        <td className="p-2.5 sm:p-4 pl-6 text-center hidden sm:table-cell">
                          <SelectionToggle
                            checked={selectedIds.includes(tx.id)}
                            onChange={() => handleSelectRow(tx.id)}
                          />
                        </td>
                        <td className="p-2.5 sm:p-4 font-mono text-slate-500 whitespace-nowrap text-[11px] sm:text-sm">
                          {(() => {
                            if (!tx.date) return "—";
                            const [y, m, d] = tx.date.split("-");
                            return `${d}/${m}/${y}`;
                          })()}
                        </td>
                        <td className="p-2.5 sm:p-4 text-[12px] sm:text-sm hidden sm:table-cell">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${getCategoryStyle(tx.color)}`}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td className="p-2.5 sm:p-4 font-medium text-[12px] sm:text-sm">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[80px] sm:max-w-xs block">{tx.description}</span>
                            {tx.isAi && (
                              <span className="inline-flex shrink-0 items-center gap-1 text-[8px] sm:text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-1">
                                <span className="material-symbols-outlined text-[10px]">
                                  auto_awesome
                                </span>
                                {t("aiScanned")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className={`p-2.5 sm:p-4 font-bold text-[12px] sm:text-sm ${tx.type === "Credit" || tx.type === "Income" ? "text-secondary" : tx.type === "Investment" ? "text-indigo-500" : "text-error"}`}
                        >
                          {tx.type === "Credit" || tx.type === "Income" ? t("typeIncome") : tx.type === "Debit" || tx.type === "Expense" ? t("typeExpense") : t("typeInvestment")}
                        </td>
                        <td
                          className={`p-2.5 sm:p-4 text-right font-black tabular-nums text-[13px] sm:text-[14px] ${tx.type === "Income" || tx.type === "Credit" ? "text-secondary" : "text-error"}`}
                        >
                          <div className="flex flex-col items-end">
                            <span className="tabular-nums">
                              {tx.type === "Income" || tx.type === "Credit" ? "+" : "-"}
                              {formatValue(
                                convert(
                                  Math.abs(Number(tx.amount) || 0),
                                  (tx.currency || "USD") as SupportedCurrency,
                                  currency as SupportedCurrency
                                ),
                                currency as SupportedCurrency
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 sm:p-4 text-on-surface-variant font-black text-[10px] sm:text-[11px] uppercase tracking-widest whitespace-nowrap hidden sm:table-cell">
                          {(() => {
                            let content: React.ReactNode = "—";
                            let isLinked = false;
                            
                            if (tx.linked_asset_id) {
                              const linkedA = cashAssets.find((a) => a.id === tx.linked_asset_id);
                              if (linkedA) {
                                content = linkedA.name;
                                isLinked = true;
                              } else {
                                content = tx.source || "—";
                              }
                            } else {
                              content = tx.source || "—";
                            }

                            return (
                              <div className="flex items-center gap-1.5 justify-end md:justify-start">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isLinked ? "bg-primary/40 animate-pulse" : "bg-outline-variant/30"}`}></span>
                                {content}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-1 px-2 text-center kebab-menu-container bg-white dark:bg-slate-950 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-all z-20">
                          <RowActionMenu 
                            actions={[
                              { label: t("btnEdit"), icon: "edit", onClick: () => handleEdit(tx) },
                              { label: t("btnDelete"), icon: "delete", onClick: () => handleDeleteClick([tx.id]), variant: "danger" }
                            ]}
                          />
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
                            ? `+${formatValue(row.received, currency)}`
                            : "-"}
                        </td>
                        <td className="p-4 text-right font-black tabular-nums text-[13px] text-error">
                          {row.spent > 0
                            ? `-${formatValue(row.spent, currency)}`
                            : "-"}
                        </td>
                        <td className="p-4 text-right font-black tabular-nums text-[13px] text-primary">
                          {row.invested > 0
                            ? formatValue(row.invested, currency)
                            : "-"}
                        </td>
                        <td
                          className={`p-4 text-right font-black tabular-nums text-[13px] ${net > 0 ? "text-secondary" : net < 0 ? "text-error" : "text-slate-500"}`}
                        >
                          {net > 0
                            ? `+${formatValue(net, currency)}`
                            : net < 0
                              ? `-${formatValue(Math.abs(net), currency)}`
                              : formatValue(0, currency)}
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
                <div className="flex items-center gap-1 bg-surface-container-low dark:bg-slate-800 p-1 rounded-xl border border-outline-variant/10 shadow-sm">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex items-center justify-center min-w-[32px] h-8 rounded-lg hover:bg-surface-container-lowest dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-on-surface-variant hover:text-primary active:scale-95"
                    title={t("btnPrev")}
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  
                  <div className="flex items-center gap-1 mx-1">
                    {(() => {
                      const range: (number | string)[] = [];
                      const delta = 1;
                      const left = currentPage - delta;
                      const right = currentPage + delta + 1;
                      
                      for (let i = 1; i <= totalPages; i++) {
                        if (i === 1 || i === totalPages || (i >= left && i < right)) {
                          range.push(i);
                        } else if (range[range.length - 1] !== "...") {
                          range.push("...");
                        }
                      }
                      
                      return range.map((p, idx) => (
                        typeof p === 'number' ? (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(p)}
                            className={`min-w-[32px] h-8 rounded-lg text-[11px] font-black transition-all cursor-pointer active:scale-90 ${currentPage === p ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "text-on-surface-variant hover:bg-surface-container-lowest dark:hover:bg-slate-700 hover:text-on-surface"}`}
                          >
                            {p}
                          </button>
                        ) : (
                          <span key={idx} className="px-1 text-on-surface-variant opacity-40 text-[11px] font-black tracking-widest">{p}</span>
                        )
                      ));
                    })()}
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center justify-center min-w-[32px] h-8 rounded-lg hover:bg-surface-container-lowest dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-on-surface-variant hover:text-primary active:scale-95"
                    title={t("btnNext")}
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
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



    </>
  );
}
