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
import Link from "next/link";

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  // Manual Entry States
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "GENERAL",
    description: "",
    type: "Debit",
    currency: "IDR",
    amount: "",
    source: "",
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
    const val = parseFloat(trend.replace(/\s+/g, ""));
    const colorClass = isExpense ? (val <= 0 ? "text-secondary bg-secondary-container/20" : "text-error bg-error-container/20") : (val >= 0 ? "text-secondary bg-secondary-container/20" : "text-error bg-error-container/20");
    const strokeColor = "currentColor";

    return (
      <div key={animationKey} className="flex flex-col gap-1 items-start">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${colorClass} shrink-0 w-fit`}>
          <svg width="22" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible shrink-0">
            {val >= 0 ? (
              <>
                <path key={`up-path-${animationKey}`} d="M2 18L8 12L12 16L22 6" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-path" />
                <path key={`up-arrow-${animationKey}`} d="M16 6H22V12" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-fade-scale" />
              </>
            ) : (
              <>
                <path key={`down-path-${animationKey}`} d="M2 6L8 12L12 8L22 18" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-path" />
                <path key={`down-arrow-${animationKey}`} d="M16 18H22V12" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-fade-scale" />
              </>
            )}
          </svg>
          <span>{Math.abs(val).toFixed(1)}%</span>
        </div>
        {context && <span className="text-[9px] font-medium text-on-surface-variant/50 ml-0.5">{context}</span>}
      </div>
    );
  };

  const toggleTheme = () => {
    const isDark = theme === "dark";
    const newTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.documentElement.classList.add(
      isDark ? "transition-to-light" : "transition-to-dark",
    );
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove(
        "transition-to-light",
        "transition-to-dark",
      );
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [ratesInitialized, setRatesInitialized] = useState(false);

  // Local alias for imported function to resolve potential bundler reference issues
  const setRates = updateExchangeRates;

  // Refs for "Click Outside" behavior
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

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
      // User Profile Dropdown
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
      // Currency Dropdown
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyDropdown(false);
      }
      // Category Filter Dropdown
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, selectedMonth, selectedYear]);

  const calculateTotals = () => {
    let incomeCurrent = 0,
      incomePrev = 0;
    let expenseCurrent = 0,
      expensePrev = 0;
    let investmentCurrent = 0,
      investmentPrev = 0;
    let totalIncome = 0,
      totalExpense = 0;

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

      // Update ALL TIME totals for Net Worth
      if (tx.type === "Credit") totalIncome += val;
      else if (tx.type === "Debit" || tx.type === "Investment")
        totalExpense += val;

      if (isAllMonths) {
        // Compare Current Year vs Previous Year
        if (txYear === selectedYear) {
          if (tx.type === "Credit") incomeCurrent += val;
          else if (tx.type === "Debit") expenseCurrent += val;
          else if (tx.type === "Investment") investmentCurrent += val;
        } else if (txYear === selectedYear - 1) {
          if (tx.type === "Credit") incomePrev += val;
          else if (tx.type === "Debit") expensePrev += val;
          else if (tx.type === "Investment") investmentPrev += val;
        }
      } else {
        // Compare Selected Month vs Month Prior
        const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const prevMonthYear =
          selectedMonth === 0 ? selectedYear - 1 : selectedYear;

        if (txMonth === selectedMonth && txYear === selectedYear) {
          if (tx.type === "Credit") incomeCurrent += val;
          else if (tx.type === "Debit") expenseCurrent += val;
          else if (tx.type === "Investment") investmentCurrent += val;
        } else if (txMonth === prevMonth && txYear === prevMonthYear) {
          if (tx.type === "Credit") incomePrev += val;
          else if (tx.type === "Debit") expensePrev += val;
          else if (tx.type === "Investment") investmentPrev += val;
        }
      }
    });

    const netWorthNow = totalIncome - totalExpense;
    const periodBalance = incomeCurrent - expenseCurrent - investmentCurrent;
    const netWorthAtStart = netWorthNow - periodBalance;

    const computeTrend = (curr: number, prev: number, baseline?: number) => {
      if (prev === 0) {
        if (baseline && baseline > 0) return (curr / baseline) * 100;
        return curr > 0 ? 100.0 : (curr < 0 ? -100.0 : null);
      }
      const diff = curr - prev;
      if (Math.abs(diff) < 0.01) return null;
      return (diff / Math.abs(prev)) * 100;
    };

    const iTrend = computeTrend(incomeCurrent, incomePrev);
    const eTrend = computeTrend(expenseCurrent, expensePrev, incomeCurrent);
    const invTrend = computeTrend(investmentCurrent, investmentPrev, incomeCurrent);
    const nwTrend =
      netWorthAtStart === 0
        ? (incomeCurrent > 0 ? (periodBalance / incomeCurrent) * 100 : (periodBalance > 0 ? 100.0 : (periodBalance < 0 ? -100.0 : null)))
        : (periodBalance / Math.abs(netWorthAtStart)) * 100;

    const hasHistory = incomePrev > 0 || expensePrev > 0 || investmentPrev > 0;
    const comparisonContext = isAllMonths
      ? (hasHistory ? `vs ${selectedYear - 1}` : "")
      : (hasHistory ? (lang === "id" ? "vs bulan lalu" : "vs last month") : "");

    return {
      income: formatValue(incomeCurrent, currency, lang),
      expense: formatValue(expenseCurrent, currency, lang),
      investment: formatValue(investmentCurrent, currency, lang),
      netWorth: formatValue(netWorthNow, currency, lang),
      incomeTrend: iTrend !== null ? iTrend.toFixed(1) : "—",
      expenseTrend: eTrend !== null ? eTrend.toFixed(1) : "—",
      investmentTrend: invTrend !== null ? invTrend.toFixed(1) : "—",
      netWorthTrend: nwTrend !== null ? nwTrend.toFixed(1) : "—",
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
      if (tx.type === "Debit") acc[tx.category].spent += amount;
      else if (tx.type === "Credit") acc[tx.category].received += amount;
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

  const fetchTransactions = async () => {
    setIsLoadingTx(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      const meta = userData.user.user_metadata;
      if (meta?.avatar_url) setUserAvatar(meta.avatar_url);
      setUserName(
        meta?.full_name ||
          meta?.name ||
          userData.user.email?.split("@")[0] ||
          "User",
      );
      setUserEmail(userData.user.email || "");

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Map data from DB format to our UI format (is_ai -> isAi)
        const formattedData = data.map((tx) => ({ ...tx, isAi: tx.is_ai }));
        setTransactions(formattedData);
      }
    }
    setIsLoadingTx(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchTransactions();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found");

      // 1. Purge all transactions for this user
      const { count: txCount, error: txError } = await supabase
        .from("transactions")
        .delete({ count: "exact" })
        .eq("user_id", user.id);

      if (txError) throw txError;

      // 2. Clear assets if any
      const { count: assetCount, error: assetError } = await supabase
        .from("assets")
        .delete({ count: "exact" })
        .eq("user_id", user.id);

      if (assetError) console.warn("Asset deletion skip/fail:", assetError);

      // 3. Clear local storage cache
      localStorage.removeItem("snapfins_exchange_rates");
      localStorage.removeItem("snapfins-currency");
      localStorage.removeItem("snapfins-lang");

      // 4. Sign Out and redirect
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(t("deleteAccount") + " failed: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) throw new Error("Not authenticated");

      let amountStr = manualForm.amount;
      // Provide a clean format like "Rp 250,000" or "$ 25.00"
      if (!amountStr.startsWith(manualForm.currency)) {
        amountStr = `${manualForm.currency} ${amountStr}`;
      }

      const newTx = {
        user_id: userData.user.id,
        date: manualForm.date,
        category: manualForm.category.toUpperCase(),
        color: assignColor(manualForm.category.toUpperCase()),
        description: manualForm.description,
        type: manualForm.type,
        amount: manualForm.amount, // Save only the numeric string
        currency: manualForm.currency, // Save explicit currency code
        source: manualForm.source || "Manual Entry",
        is_ai: false,
      };

      const { data: insertedData, error } = await supabase
        .from("transactions")
        .insert([newTx])
        .select();

      if (error) throw error;

      if (insertedData) {
        const mappedTx = { ...insertedData[0], isAi: insertedData[0].is_ai };
        setTransactions((prev) => [mappedTx, ...prev]);
        setShowManualEntry(false);
        setManualForm({
          date: new Date().toISOString().split("T")[0],
          category: "GENERAL",
          description: "",
          type: "Debit",
          currency: "IDR",
          amount: "",
          source: "",
        });
      }
    } catch (err: any) {
      alert("Failed to save: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        setScanError(t("notAuthenticated") || "Please login first to scan receipts.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", lang);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.transaction) {
        // Validation check for non-receipts
        if (data.transaction.isValidReceipt === false) {
          setScanError(
            data.transaction.errorReason || t("tryAgainWithDifferent"),
          );
          return;
        }

        const newTx = {
          user_id: userData.user.id,
          date: data.transaction.date,
          category: data.transaction.category || "GENERAL",
          color: assignColor(data.transaction.category || "GENERAL"),
          description: data.transaction.description,
          type: "Debit",
          amount: data.transaction.amount,
          currency: data.transaction.currency || "IDR", 
          source: "Gemini Vision",
          is_ai: true,
        };

        const { data: insertedData, error } = await supabase
          .from("transactions")
          .insert([newTx])
          .select();

        if (error) throw error;
        
        if (insertedData) {
          const mappedTx = {
            ...insertedData[0],
            isAi: insertedData[0].is_ai,
          };
          // Update both state and trigger external fetch for stability
          setTransactions((prev) => [mappedTx, ...prev]);
          await fetchTransactions(); 
          setScanSuccess({ date: data.transaction.date });
        }
      } else {
        setScanError(data.error || t("scanErrorHint"));
      }
    } catch (error: any) {
      console.error(error);
      setScanError(error.message || t("tryAgainWithDifferent"));
    } finally {
      setIsScanning(false);
      // Reset input value to allow scanning same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="bg-surface p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col w-full max-w-lg border border-outline-variant/20 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-2xl text-on-surface">
                {t("manualEntryTitle")}
              </h3>
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
                          const newCurrency = e.target.value;
                          const raw = manualForm.amount.replace(/\D/g, "");
                          if (raw) {
                            const locale =
                              newCurrency === "IDR" ? "id-ID" : "en-US";
                            const fmt = new Intl.NumberFormat(locale).format(
                              parseInt(raw, 10),
                            );
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
                      value="Debit"
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      Debit
                    </option>
                    <option
                      value="Credit"
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      Credit
                    </option>
                    <option
                      value="Investment"
                      className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      Investment
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  {t("labelSource")}
                </label>
                <input
                  type="text"
                  placeholder={t("placeholderSource")}
                  value={manualForm.source}
                  onChange={(e) =>
                    setManualForm({ ...manualForm, source: e.target.value })
                  }
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
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
                    t("saveTransaction")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scan Error Modal */}
      {scanError && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-red-500/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-red-500 text-4xl">
                error
              </span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              {t("scanErrorTitle")}
            </h3>
            <p className="text-sm text-center text-on-surface-variant leading-relaxed mb-8">
              {scanError}
            </p>
            <button
              onClick={() => setScanError(null)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm active:scale-95"
            >
              {t("tryAgain")}
            </button>
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-error/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-error text-4xl">
                warning
              </span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              {t("deleteAccount")}?
            </h3>
            <p className="text-sm text-center text-on-surface-variant leading-relaxed mb-8">
              {t("deleteAccountWarning")}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full bg-error hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin">
                    sync
                  </span>
                ) : null}
                {isDeleting ? t("deleting") : t("confirmDelete")}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-3 px-4 rounded-xl transition-all active:scale-95"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay for Scanner */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-primary/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
              <span
                className="material-symbols-outlined text-primary text-3xl animate-pulse"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              {t("analyzingReceipt")}
            </h3>
            <p className="text-sm text-center text-on-surface-variant">
              {t("analyzingHint")}
            </p>
          </div>
        </div>
      )}

      {/* TopNavBar Shared Component - v2.1.1 */}
      <nav className="sticky top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 font-headline">
              SnapFins
            </span>
            <div className="hidden md:flex items-center gap-6 font-manrope font-semibold tracking-tight text-sm">
              <a
                className="text-primary font-bold border-b-2 border-primary pb-1"
                href="#"
              >
                {t("navDashboard")}
              </a>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                {t("navAsset")}
              </a>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors"
                href="#"
              >
                {t("navAnalytics")}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5 ml-2 relative"
              ref={currencyDropdownRef}
            >
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black text-primary hover:bg-primary/5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">
                  payments
                </span>
                {currency}
                <span className="material-symbols-outlined text-[10px]">
                  {showCurrencyDropdown ? "expand_less" : "expand_more"}
                </span>
              </button>

              {showCurrencyDropdown && (
                <div className="absolute right-0 top-10 mt-2 w-48 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden text-[11px] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 border-b border-outline-variant/10 font-black text-[9px] uppercase tracking-widest text-on-surface-variant bg-slate-50 dark:bg-slate-800">
                    {t("preferredCurrency")}
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
                    {(Object.keys(currencySymbols) as SupportedCurrency[]).map(
                      (c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setCurrency(c);
                            setShowCurrencyDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between ${currency === c ? "text-primary font-black bg-primary/5" : "text-on-surface font-semibold"}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-primary/60 font-mono w-4">
                              {currencySymbols[c]}
                            </span>
                            {c}
                          </span>
                          {currency === c && (
                            <span className="material-symbols-outlined text-sm">
                              check
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5 ml-2">
              <button
                onClick={() => setLang("en")}
                className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === "en" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("id")}
                className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === "id" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                ID
              </button>
            </div>

            <div
              className="relative border-l border-outline-variant/30 pl-4 ml-4"
              ref={userDropdownRef}
            >
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 hover:bg-surface-container-low p-1 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-extrabold text-on-surface leading-tight">
                    {userName}
                  </p>
                  <p className="text-[9px] font-medium text-on-surface-variant leading-tight opacity-70">
                    {userEmail}
                  </p>
                </div>
                <img
                  alt="User profile"
                  className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover shadow-sm"
                  src={
                    userAvatar ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBE0e9w4xGMbdwDYXMaDw5uETVXAmCsb2dhI8hfIpOO3BPWgMaL0JjQzcpHBM7CT9NYI1ldia3F2nXUV5w3qb3mMDQz-OTK-jeHMEnz039x-WujlEaGvN3up-hQu3sr7A0G-nmdIg9113_eJSO-g9Mpnz1eq1fYd6INd1L0Flb-PXWLfhqXoh5e8wARW0avQOljBQFUftRfAqKCQ6Fw-PDIi6C3txyigy8dE7NZEcNbsgG6NlCq8YmU7KjLMJ2ODW7FZcU7PiQ025U"
                  }
                />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-12 mt-2 w-64 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-outline-variant/10 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">
                      {t("profile")}
                    </p>
                    <p className="text-sm font-bold text-on-surface truncate">
                      {userName}
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate opacity-60">
                      {userEmail}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    {/* Theme Toggle (Moved here) */}
                    {mounted && (
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors text-sm font-bold group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                            {theme === "dark" ? "light_mode" : "dark_mode"}
                          </span>
                          <span>
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                          </span>
                        </div>
                        <div className="w-8 h-4 bg-outline-variant/30 rounded-full relative">
                          <div
                            className={`absolute top-0.5 w-3 h-3 bg-primary rounded-full transition-all ${theme === "dark" ? "right-0.5" : "left-0.5"}`}
                          ></div>
                        </div>
                      </button>
                    )}

                    <div className="h-px bg-outline-variant/10 my-1 mx-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors text-sm font-bold group"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                        logout
                      </span>
                      {t("logout")}
                    </button>

                    <div className="h-px bg-outline-variant/10 my-1 mx-2" />

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors text-sm font-bold group"
                    >
                      <span className="material-symbols-outlined text-error/70 group-hover:text-error transition-colors">
                        delete_forever
                      </span>
                      {t("deleteAccount")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">
              {t("financialOverview")}
            </h1>
            <p className="text-on-surface-variant font-black tracking-[0.2em] uppercase text-[10px] opacity-60 hover:opacity-100 transition-opacity">
              {t("liveStatus")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handleScan}
              className="hidden"
            />
            <button
              onClick={() => setShowManualEntry(true)}
              className="hidden md:flex px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all active:opacity-80 items-center gap-2 cursor-pointer"
            >
              {t("manualEntry")}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-[0_4px_15px_rgba(53,37,205,0.3)] transition-all active:scale-[0.98] flex items-center gap-2 magic-glow-hover cursor-pointer overflow-hidden group"
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
          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-surface-container-low/40 dark:to-slate-800/40">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="h-6 mb-2">
              {totals.netWorthTrend !== "—" && totals.netWorthTrend !== "0.0" && (
                <div className="relative flex justify-between items-start">
                  <TrendIndicator trend={totals.netWorthTrend} context={totals.comparisonContext} />
                </div>
              )}
            </div>
            <div className="relative flex justify-between items-start mb-4 gap-4">
              <div className="min-w-0 flex-grow">
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 truncate">
                  {t("totalNetWorth")}
                </p>
                <div 
                  className={`${totals.netWorth.length > 18 ? "text-lg" : totals.netWorth.length > 15 ? "text-xl" : totals.netWorth.length > 12 ? "text-2xl" : "text-3xl"} text-on-surface font-black font-headline tracking-tighter whitespace-nowrap`} 
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
          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-secondary-container/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="h-6 mb-2">
              {totals.incomeTrend !== "—" && totals.incomeTrend !== "0.0" && (
                <div className="relative flex justify-between items-start">
                  <TrendIndicator trend={totals.incomeTrend} context={totals.comparisonContext} />
                </div>
              )}
            </div>
            <div className="relative flex justify-between items-start mb-4 gap-4">
              <div className="min-w-0 flex-grow">
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 truncate">
                  {selectedMonth === -1 ? t("annualIncome") : t("monthlyIncome")}
                </p>
                <div 
                  className={`${totals.income.length > 18 ? "text-lg" : totals.income.length > 15 ? "text-xl" : totals.income.length > 12 ? "text-2xl" : "text-3xl"} text-secondary font-black font-headline tracking-tighter whitespace-nowrap`} 
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
            <div className="mt-3 pt-3 border-t border-outline-variant/10 flex items-center gap-2 text-[10px] font-bold text-on-surface-variant">
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

          {/* 3. Monthly Investment */}
          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-indigo-500/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="h-6 mb-2">
              {totals.investmentTrend !== "—" && totals.investmentTrend !== "0.0" && (
                <div className="relative flex justify-between items-start">
                  <TrendIndicator trend={totals.investmentTrend} context={totals.comparisonContext} />
                </div>
              )}
            </div>
            <div className="relative flex justify-between items-start mb-4 gap-4">
              <div className="min-w-0 flex-grow">
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 truncate">
                  {selectedMonth === -1 ? t("annualInvestment") : t("monthlyInvestment")}
                </p>
                <div 
                  className={`${totals.investment.length > 18 ? "text-lg" : totals.investment.length > 15 ? "text-xl" : totals.investment.length > 12 ? "text-2xl" : "text-3xl"} text-indigo-500 font-black font-headline tracking-tighter whitespace-nowrap`} 
                  title={totals.investment}
                >
                  {totals.investment}
                </div>
              </div>
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span
                  className="material-symbols-outlined text-indigo-500 text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  rocket_launch
                </span>
              </div>
            </div>
          </div>

          {/* 4. Monthly Expense */}
          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-error-container/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors"></div>
            <div className="h-6 mb-2">
              {totals.expenseTrend !== "—" && totals.expenseTrend !== "0.0" && (
                <div className="relative flex justify-between items-start">
                  <TrendIndicator trend={totals.expenseTrend} isExpense context={totals.comparisonContext} />
                </div>
              )}
            </div>
            <div className="relative flex justify-between items-start mb-4 gap-4">
              <div className="min-w-0 flex-grow">
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 truncate">
                  {selectedMonth === -1 ? t("annualExpense") : t("monthlyExpense")}
                </p>
                <div 
                  className={`${totals.expense.length > 18 ? "text-lg" : totals.expense.length > 15 ? "text-xl" : totals.expense.length > 12 ? "text-2xl" : "text-3xl"} text-error font-black font-headline tracking-tighter whitespace-nowrap`} 
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">
              {t("recentLedger")}
            </h3>
            <div className="flex items-center gap-2 relative" ref={filterDropdownRef}>
              {mounted && (
                <>
                  <div className="flex bg-surface-container-low dark:bg-slate-800 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-1 text-xs font-bold rounded shadow-sm transition-colors cursor-pointer ${viewMode === "grid" ? "bg-surface-container-lowest dark:bg-slate-700 text-foreground" : "text-on-surface-variant hover:text-on-surface"}`}
                    >
                      {t("btnGrid")}
                    </button>
                    <button
                      onClick={() => setViewMode("pivot")}
                      className={`px-3 py-1 text-xs font-bold rounded shadow-sm transition-colors cursor-pointer ${viewMode === "pivot" ? "bg-surface-container-lowest dark:bg-slate-700 text-foreground" : "text-on-surface-variant hover:text-on-surface"}`}
                    >
                      {t("btnPivot")}
                    </button>
                  </div>

                  {/* Period Selector (Year/Month) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Year Select */}
                    <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                      <span className="material-symbols-outlined text-sm text-primary opacity-70">calendar_month</span>
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-transparent border-none text-[11px] font-bold outline-none cursor-pointer p-0 m-0 pr-4 text-on-surface appearance-none"
                      >
                        {availableYears.map(year => (
                          <option key={year} value={year} className="bg-surface-container-lowest text-on-surface">{year}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 pointer-events-none text-xs text-on-surface-variant opacity-50">
                        expand_more
                      </span>
                    </div>

                    {/* Month Select */}
                    <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-transparent border-none text-[11px] font-bold outline-none cursor-pointer p-0 m-0 pr-4 text-on-surface appearance-none"
                      >
                        <option value={-1} className="bg-surface-container-lowest text-on-surface">{t("allMonths")}</option>
                        {(t("months") as unknown as string[]).map((m, idx) => (
                          <option key={idx} value={idx} className="bg-surface-container-lowest text-on-surface">{m}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 pointer-events-none text-xs text-on-surface-variant opacity-50">
                        expand_more
                      </span>
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
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${filterCategory !== "ALL" || showFilterDropdown ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    filter_list
                  </span>
                  {t("colCategory")}
                </button>
                {showFilterDropdown && (
                  <div className="absolute right-0 top-10 mt-2 w-56 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden text-sm animate-in fade-in slide-in-from-top-2 duration-200">
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
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg shadow-sm border border-outline-variant/20">
            <table className="w-full excel-grid bg-surface-container-lowest dark:bg-slate-900/50 text-xs font-body tracking-tight">
              <thead className="bg-slate-100/80 dark:bg-slate-800 text-on-surface-variant uppercase font-bold text-[10px] tracking-widest">
                {viewMode === "grid" ? (
                  <tr>
                    <th className="px-3 py-2 text-left w-24">{t("colDate")}</th>
                    <th className="px-3 py-2 text-left w-32">
                      {t("colCategory")}
                    </th>
                    <th className="px-3 py-2 text-left">
                      {t("colDescription")}
                    </th>
                    <th className="px-3 py-2 text-left w-24">{t("colType")}</th>
                    <th className="px-3 py-2 text-right min-w-[150px]">
                      {t("colAmount")}
                    </th>
                    <th className="px-3 py-2 text-left w-40">
                      {t("colLinkedAssets")}
                    </th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-3 py-2 text-left w-40">
                      {t("colCategory")}
                    </th>
                    <th className="px-3 py-2 text-right w-32">
                      {t("colIncome")}
                    </th>
                    <th className="px-3 py-2 text-right w-32">
                      {t("colExpense")}
                    </th>
                    <th className="px-3 py-2 text-right w-32">
                      {t("colInvested")}
                    </th>
                    <th className="px-3 py-2 text-right w-32">
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
                        className="hover:bg-primary/5 transition-colors group"
                      >
                        <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap">
                          {(() => {
                            if (!tx.date) return "—";
                            const [y, m, d] = tx.date.split("-");
                            return `${d}/${m}/${y}`;
                          })()}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${getCategoryStyle(tx.color)}`}
                          >
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium">
                          <div className="flex items-center gap-2">
                            {tx.description}
                            {tx.isAi && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-2">
                                <span className="material-symbols-outlined text-[10px]">
                                  auto_awesome
                                </span>
                                {t("aiScanned")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className={`px-3 py-2 font-bold ${tx.type === "Credit" ? "text-secondary" : tx.type === "Investment" ? "text-indigo-500" : "text-error"}`}
                        >
                          {tx.type}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-mono font-bold whitespace-nowrap ${tx.type === "Credit" ? "text-secondary" : tx.type === "Investment" ? "text-indigo-500" : ""}`}
                        >
                          <div className={tx.amount.length > 18 ? "text-[9px]" : tx.amount.length > 15 ? "text-[10px]" : ""}>
                          {(() => {
                            // Clean the string (remove symbols if any)
                            let cleanNum = tx.amount.replace(/[^0-9.,-]/g, "");
                            // Normalize based on currency
                            const txCur = normalizeCurrency(
                              tx.currency ||
                                (tx.amount.includes("IDR") ||
                                tx.amount.includes("Rp")
                                  ? "IDR"
                                  : "USD"),
                            );
                            if (txCur === "IDR") {
                              cleanNum = cleanNum
                                .replace(/\./g, "")
                                .replace(/,/g, ".");
                            } else {
                              cleanNum = cleanNum.replace(/,/g, "");
                            }
                            const val = parseFloat(cleanNum) || 0;
                            const sign =
                              tx.type === "Credit"
                                ? "+"
                                : tx.type === "Debit"
                                  ? "-"
                                  : "";
                            return (
                              sign +
                              formatValue(
                                Math.abs(val),
                                tx.currency || currency,
                                lang,
                              )
                            );
                          })()}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-400">
                          {tx.source}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
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
                        className="hover:bg-primary/5 transition-colors group"
                      >
                        <td className="px-3 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${getCategoryStyle(assignColor(row.category))}`}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-secondary font-bold">
                          {row.received > 0
                            ? `+${formatValue(row.received, currency, lang)}`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-error font-bold">
                          {row.spent > 0
                            ? `-${formatValue(row.spent, currency, lang)}`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-indigo-500 font-bold">
                          {row.invested > 0
                            ? formatValue(row.invested, currency, lang)
                            : "-"}
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-mono font-bold ${net > 0 ? "text-secondary" : net < 0 ? "text-error" : "text-slate-500"}`}
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
                      className="px-3 py-16 text-center text-on-surface-variant text-sm font-medium"
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

      {/* Footer Shared Component */}
      <footer className="w-full py-8 mt-auto bg-slate-100 dark:bg-slate-900 border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-10 max-w-7xl mx-auto space-y-4 md:space-y-0">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            SnapFins
          </span>
          <div className="flex gap-8 font-inter text-[11px] uppercase tracking-widest font-medium">
            <a
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300"
              href="/privacy"
            >
              {t("privacyPolicy")}
            </a>
            <a
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300"
              href="/terms"
            >
              {t("termsOfService")}
            </a>
            <a
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300"
              href="#"
            >
              {t("support")}
            </a>
          </div>
          <p className="font-inter text-[11px] uppercase tracking-widest font-medium text-slate-500 dark:text-slate-400">
            {t("footerPrecision")}
          </p>
        </div>
      </footer>
    </>
  );
}
