"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";
import {
  convert,
  formatValue,
  normalizeCurrency,
  updateExchangeRates,
  type SupportedCurrency,
} from "@/lib/currency";
import { createClient } from "@/utils/supabase/client";
import {
  type Asset,
  getTotalAssetsValue,
  getLiquidAssetsValue,
  getInvestedAssetsValue,
  getAssetsByCategory,
} from "@/lib/assets";
import { AnalyticsSkeleton } from "@/components/Skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// ─── Colour palette (restrained, brand-aligned) ─────────────────────────────
const PALETTE = {
  income:  "#10b981", // emerald-500
  expense: "#f43f5e", // rose-500
  primary: "#6366f1", // indigo-500
  secondary:"#8b5cf6", // violet-500
  muted:   "#64748b", // slate-500
};

const CATEGORY_COLORS: Record<string, string> = {
  "Cash":       "#10b981",
  "Bank":       "#3b82f6",
  "E-wallet":   "#8b5cf6",
  "Crypto":     "#f59e0b",
  "Stock / ETF":"#6366f1",
  "Gold":       "#eab308",
  "Property":   "#14b8a6",
  "Vehicle":    "#64748b",
  "Other":      "#94a3b8",
};

const TX_CATEGORY_COLORS = [
  "#6366f1","#10b981","#f59e0b","#f43f5e","#8b5cf6",
  "#14b8a6","#3b82f6","#eab308","#64748b","#94a3b8",
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const MONTH_SHORT_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_SHORT_ID = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agt","Sep","Okt","Nov","Des"];

const ANALYTICS_TRANSLATIONS = {
  en: {
    pageTitle: "Analytics",
    pageSub: "Your financial picture, in full detail.",
    allMonths: "All Months",
    netWorth: "Net Worth",
    netWorthSub: "Total asset value",
    totalIncome: "Total Income",
    totalExpense: "Total Expense",
    netCashflow: "Net Cashflow",
    liquidAssets: "Liquid Assets",
    invested: "Invested",
    ofNetWorth: "of net worth",
    savingsRate: "savings rate",
    yearLabel: (y: number) => `Year ${y}`,
    monthYear: (m: string, y: number) => `${m} ${y}`,
    netWorthTitle: "Net Worth Trajectory",
    netWorthSub2: (y: number) => `Running cashflow delta for ${y} — indicating how your net worth evolved month by month`,
    noDataYet: "No data yet",
    noDataSub: "Add transactions to see your net worth trajectory over time.",
    incomeVsExpense: "Income vs Expense",
    incomeVsExpenseSub: (y: number) => `Monthly comparison for ${y}`,
    noTransactions: "No transactions",
    noTransactionsSub: "Add transactions to see your income and expense trends.",
    expenseByCategory: "Expense by Category",
    expenseByCategorySub: "Where your money is going",
    noExpensesYet: "No expenses yet",
    noExpensesSub: "Your expense breakdown will appear here once you've added transactions.",
    assetAllocation: "Asset Allocation",
    assetAllocationSub: "How your wealth is distributed",
    noAssets: "No assets",
    noAssetsSub: "Add assets to see your allocation breakdown.",
    liquidVsInvested: "Liquid vs Invested Assets",
    liquidVsInvestedSub: "Understanding your financial flexibility",
    noAssetsYet: "No assets yet",
    noAssetsYetSub: "Add assets to analyse your liquidity profile.",
    liquid: "Liquid",
    spendingTrend: "Monthly Spending Trend",
    spendingTrendSub: (y: number) => `Expense pattern across ${y}`,
    noTxTrend: "No transactions",
    noTxTrendSub: "Your monthly spending trend will appear here.",
    keyInsights: "Key Insights",
    keyInsightsSub: "Data-driven takeaways from your finances",
    noInsights: "Add data to unlock insights",
    noInsightsSub: "Insights are generated from your actual transactions and assets.",
    topSpending: "Top Spending Category",
    noExpensesRecorded: "No expenses recorded",
    savingsRateLabel: "Savings Rate",
    savedThisPeriod: (v: string) => `${v} saved this period`,
    noIncomeRecorded: "No income recorded",
    incomeExpenseRatio: "Income / Expense Ratio",
    healthy: "Healthy — earning more than spending",
    overspending: "⚠ Spending exceeds income",
    noExpenses: "No expenses",
    avgMonthlyExpense: "Average Monthly Expense",
    avgMonthlyExpenseSub: "Average across all 12 months",
    highestSpendingMonth: "Highest Spending Month",
    spentLabel: (v: string) => `${v} spent`,
    lowestSpendingMonth: "Lowest Spending Month",
    largestAssetClass: "Largest Asset Class",
    liquidAssetRatio: "Liquid Asset Ratio",
    readilyAccessible: (v: string) => `${v} readily accessible`,
    incomeLabel: "Income",
    expenseLabel: "Expense",
    netWorthLabel: "Net Worth",
    investedLabel: "Invested",
  },
  id: {
    pageTitle: "Analitik",
    pageSub: "Gambaran keuangan Anda secara lengkap.",
    allMonths: "Semua Bulan",
    netWorth: "Kekayaan Bersih",
    netWorthSub: "Total nilai aset",
    totalIncome: "Total Pemasukan",
    totalExpense: "Total Pengeluaran",
    netCashflow: "Arus Kas Bersih",
    liquidAssets: "Aset Likuid",
    invested: "Diinvestasikan",
    ofNetWorth: "dari kekayaan bersih",
    savingsRate: "tingkat tabungan",
    yearLabel: (y: number) => `Tahun ${y}`,
    monthYear: (m: string, y: number) => `${m} ${y}`,
    netWorthTitle: "Trajektori Kekayaan Bersih",
    netWorthSub2: (y: number) => `Delta arus kas untuk ${y} — menunjukkan bagaimana kekayaan bersih Anda berkembang setiap bulan`,
    noDataYet: "Belum ada data",
    noDataSub: "Tambahkan transaksi untuk melihat trajektori kekayaan bersih Anda.",
    incomeVsExpense: "Pemasukan vs Pengeluaran",
    incomeVsExpenseSub: (y: number) => `Perbandingan bulanan untuk ${y}`,
    noTransactions: "Belum ada transaksi",
    noTransactionsSub: "Tambahkan transaksi untuk melihat tren pemasukan dan pengeluaran.",
    expenseByCategory: "Pengeluaran per Kategori",
    expenseByCategorySub: "Ke mana uang Anda pergi",
    noExpensesYet: "Belum ada pengeluaran",
    noExpensesSub: "Rincian pengeluaran Anda akan muncul di sini setelah Anda menambahkan transaksi.",
    assetAllocation: "Alokasi Aset",
    assetAllocationSub: "Bagaimana kekayaan Anda didistribusikan",
    noAssets: "Belum ada aset",
    noAssetsSub: "Tambahkan aset untuk melihat rincian alokasi Anda.",
    liquidVsInvested: "Aset Likuid vs Diinvestasikan",
    liquidVsInvestedSub: "Memahami fleksibilitas keuangan Anda",
    noAssetsYet: "Belum ada aset",
    noAssetsYetSub: "Tambahkan aset untuk menganalisis profil likuiditas Anda.",
    liquid: "Likuid",
    spendingTrend: "Tren Pengeluaran Bulanan",
    spendingTrendSub: (y: number) => `Pola pengeluaran sepanjang ${y}`,
    noTxTrend: "Belum ada transaksi",
    noTxTrendSub: "Tren pengeluaran bulanan Anda akan muncul di sini.",
    keyInsights: "Wawasan Utama",
    keyInsightsSub: "Kesimpulan berbasis data dari keuangan Anda",
    noInsights: "Tambah data untuk membuka wawasan",
    noInsightsSub: "Wawasan dibuat dari transaksi dan aset nyata Anda.",
    topSpending: "Kategori Pengeluaran Tertinggi",
    noExpensesRecorded: "Belum ada pengeluaran tercatat",
    savingsRateLabel: "Tingkat Tabungan",
    savedThisPeriod: (v: string) => `${v} ditabung periode ini`,
    noIncomeRecorded: "Belum ada pemasukan tercatat",
    incomeExpenseRatio: "Rasio Pemasukan / Pengeluaran",
    healthy: "Sehat — pemasukan lebih besar dari pengeluaran",
    overspending: "⚠ Pengeluaran melebihi pemasukan",
    noExpenses: "Belum ada pengeluaran",
    avgMonthlyExpense: "Rata-rata Pengeluaran Bulanan",
    avgMonthlyExpenseSub: "Rata-rata dari 12 bulan",
    highestSpendingMonth: "Bulan dengan Pengeluaran Tertinggi",
    spentLabel: (v: string) => `${v} dibelanjakan`,
    lowestSpendingMonth: "Bulan dengan Pengeluaran Terendah",
    largestAssetClass: "Kelas Aset Terbesar",
    liquidAssetRatio: "Rasio Aset Likuid",
    readilyAccessible: (v: string) => `${v} mudah diakses`,
    incomeLabel: "Pemasukan",
    expenseLabel: "Pengeluaran",
    netWorthLabel: "Kekayaan Bersih",
    investedLabel: "Diinvestasikan",
  },
};

function parseTxAmount(tx: any, toCurrency: SupportedCurrency): number {
  const numStr: string = tx.amount || "0";
  const txCurrency = normalizeCurrency(
    tx.currency ||
      (numStr.includes("IDR") || numStr.includes("Rp")
        ? "IDR"
        : numStr.includes("$") || numStr.includes("USD")
        ? "USD"
        : numStr.includes("€") ? "EUR"
        : numStr.includes("£") ? "GBP"
        : numStr.includes("¥") ? "JPY"
        : numStr.includes("₩") ? "KRW"
        : toCurrency),
  );
  let clean = numStr.replace(/[^0-9.,-]/g, "");
  if (txCurrency === "IDR") {
    clean = clean.replace(/\./g, "").replace(/,/g, ".");
  } else {
    clean = clean.replace(/,/g, "");
  }
  return convert(parseFloat(clean) || 0, txCurrency, toCurrency);
}

function pct(a: number, b: number): string {
  if (b === 0) return "—";
  return ((a / b) * 100).toFixed(1) + "%";
}

function trendBadge(curr: number, prev: number, reverseSign = false) {
  if (prev === 0) return null;
  const delta = ((curr - prev) / Math.abs(prev)) * 100;
  const isPositive = reverseSign ? delta < 0 : delta > 0;
  const color = isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10";
  const arrow = delta > 0 ? "▲" : "▼";
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded ${color}`}>
      {arrow} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

// ─── Custom Tooltip (dark-themed) ───────────────────────────────────────────
function DarkTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl px-4 py-3 text-xs">
      {label && <p className="text-slate-400 font-bold uppercase tracking-widest mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300 font-medium">{p.name}:</span>
          <span className="text-white font-black">{formatter ? formatter(p.value, p.name) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">{icon}</span>
      <p className="font-bold text-on-surface-variant text-sm">{title}</p>
      <p className="text-on-surface-variant/60 text-xs max-w-xs">{subtitle}</p>
    </div>
  );
}

// ─── Summary Card ────────────────────────────────────────────────────────────
function SummaryCard({
  icon, label, value, badge, sub, accent
}: {
  icon: string; label: string; value: string; badge?: React.ReactNode; sub?: string; accent?: string;
}) {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-[18px] ${accent || "text-primary"}`}>{icon}</span>
          <span className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant">{label}</span>
        </div>
        {badge}
      </div>
      <p className="font-headline font-black text-on-surface text-lg leading-tight tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-on-surface-variant/60 font-medium">{sub}</p>}
    </div>
  );
}

// ─── Insight Card ────────────────────────────────────────────────────────────
function InsightCard({ icon, title, value, sub, color }: {
  icon: string; title: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color || "bg-primary/10"}`}>
        <span className={`material-symbols-outlined text-[18px] ${color ? "text-white" : "text-primary"}`}
          style={color ? { fontVariationSettings: "'FILL' 1" } : {}}
        >{icon}</span>
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant">{title}</p>
        <p className="font-black text-on-surface text-sm truncate">{value}</p>
        {sub && <p className="text-[10px] text-on-surface-variant/60">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-headline font-black text-on-surface text-base tracking-tight">{title}</h2>
      {sub && <p className="text-[11px] text-on-surface-variant/70 mt-0.5">{sub}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const { theme } = useTheme();
  const { lang } = useLang();
  const { currency } = useCurrency();

  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratesReady, setRatesReady] = useState(false);

  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1 = all
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const cur = currency as SupportedCurrency;

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    // Init exchange rates (same pattern as dashboard)
    (async () => {
      try {
        const CACHE_KEY = "snapfins_exchange_rates";
        const CACHE_TTL = 6 * 60 * 60 * 1000;
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { rates, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            updateExchangeRates(rates);
            setRatesReady(true);
            return;
          }
        }
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data?.rates) {
          updateExchangeRates(data.rates);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, timestamp: Date.now() }));
        }
      } catch { /* use static fallbacks */ }
      finally { setRatesReady(true); }
    })();

    // Fetch data
    (async () => {
      setIsLoading(true);
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) { setIsLoading(false); return; }

      const [{ data: txData }, { data: assetData }] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", userData.user.id).order("date", { ascending: true }),
        supabase.from("assets").select("*").eq("user_id", userData.user.id),
      ]);

      if (txData) setTransactions(txData);
      if (assetData) setAssets(assetData as Asset[]);
      setIsLoading(false);
    })();

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleOutsideClick(e: MouseEvent) {
    const t = e.target as Element;
    if (!t.closest(".year-drop")) setShowYearDropdown(false);
    if (!t.closest(".month-drop")) setShowMonthDropdown(false);
  }

  // ── Available Years ────────────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const curr = new Date().getFullYear();
    const dataYears = transactions.map(t => new Date(t.date).getFullYear());
    const set = new Set([curr, curr - 1, ...dataYears]);
    const arr = Array.from(set).sort((a, b) => b - a);
    return arr;
  }, [transactions]);

  const t = ANALYTICS_TRANSLATIONS[lang as "en" | "id"] || ANALYTICS_TRANSLATIONS.en;
  const monthsLabels = lang === "id" ? MONTH_SHORT_ID : MONTH_SHORT_EN;

  // ── Filter transactions for selected period ────────────────────────────────
  const filteredTx = useMemo(() =>
    transactions.filter(tx => {
      const d = new Date(tx.date);
      const yMatch = d.getFullYear() === selectedYear;
      const mMatch = selectedMonth === -1 || d.getMonth() === selectedMonth;
      return yMatch && mMatch;
    }),
  [transactions, selectedYear, selectedMonth]);

  // ── Core aggregates (in target currency) ───────────────────────────────────
  const { totalIncome, totalExpense, totalInvestment } = useMemo(() => {
    let inc = 0, exp = 0, inv = 0;
    filteredTx.forEach(tx => {
      const v = parseTxAmount(tx, cur);
      if (tx.type === "Income" || tx.type === "Credit") inc += v;
      else if (tx.type === "Expense" || tx.type === "Debit") exp += v;
      else if (tx.type === "Investment") inv += v;
    });
    return { totalIncome: inc, totalExpense: exp, totalInvestment: inv };
  }, [filteredTx, cur]);

  // ── Previous period for month-over-month ───────────────────────────────────
  const prevPeriodTx = useMemo(() => {
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      if (selectedMonth === -1) return d.getFullYear() === selectedYear - 1;
      const pm = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const py = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      return d.getFullYear() === py && d.getMonth() === pm;
    });
  }, [transactions, selectedYear, selectedMonth]);

  const { prevIncome, prevExpense } = useMemo(() => {
    let inc = 0, exp = 0;
    prevPeriodTx.forEach(tx => {
      const v = parseTxAmount(tx, cur);
      if (tx.type === "Income" || tx.type === "Credit") inc += v;
      else if (tx.type === "Expense" || tx.type === "Debit") exp += v;
    });
    return { prevIncome: inc, prevExpense: exp };
  }, [prevPeriodTx, cur]);

  // ── Asset aggregates ───────────────────────────────────────────────────────
  const { netWorth, liquidAssets, investedAssets, assetsByCategory } = useMemo(() => {
    if (!ratesReady) return { netWorth: 0, liquidAssets: 0, investedAssets: 0, assetsByCategory: {} as Record<string, number> };
    const converted = assets.map(a => ({
      ...a,
      current_value: convert(Number(a.current_value) || 0, normalizeCurrency(a.currency || "USD"), cur),
      currency: cur,
    }));
    return {
      netWorth: getTotalAssetsValue(converted as Asset[]),
      liquidAssets: getLiquidAssetsValue(converted as Asset[]),
      investedAssets: getInvestedAssetsValue(converted as Asset[]),
      assetsByCategory: getAssetsByCategory(converted as Asset[]),
    };
  }, [assets, ratesReady, cur]);

  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netCashflow / totalIncome) * 100 : 0;

  // ── Monthly income/expense chart data ─────────────────────────────────────
  const monthlyChartData = useMemo(() => {
    const map: Record<string, { month: string; income: number; expense: number }> = {};
    // only show the selected year
    transactions
      .filter(tx => new Date(tx.date).getFullYear() === selectedYear)
      .forEach(tx => {
        const m = new Date(tx.date).getMonth();
        const key = MONTH_SHORT_EN[m];
        if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
        const v = parseTxAmount(tx, cur);
        if (tx.type === "Income" || tx.type === "Credit") map[key].income += v;
        else if (tx.type === "Expense" || tx.type === "Debit") map[key].expense += v;
      });
    return MONTH_SHORT_EN.map(m => map[m] || { month: m, income: 0, expense: 0 });
  }, [transactions, selectedYear, cur]);

  // ── Expense category breakdown ─────────────────────────────────────────────
  const expByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTx.forEach(tx => {
      if (tx.type !== "Expense" && tx.type !== "Debit") return;
      map[tx.category] = (map[tx.category] || 0) + parseTxAmount(tx, cur);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTx, cur]);

  // ── Asset allocation chart data ────────────────────────────────────────────
  const assetAllocationData = useMemo(() =>
    Object.entries(assetsByCategory)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value),
  [assetsByCategory]);

  // ── Spending trend (monthly expense only, full year) ──────────────────────
  const spendTrend = useMemo(() => monthlyChartData.map(d => ({
    month: d.month,
    expense: d.expense,
  })), [monthlyChartData]);

  // ── Net worth over time (derives monthly snapshot from cumulative tx) ──────
  const netWorthOverTime = useMemo(() => {
    // We can only approximate using the current netWorth and working BACKWARDS
    // month by month through transactions to reconstruct history.
    // Start from netWorth (today) and subtract/add transactions in reverse.
    const txByMonth: Record<string, number> = {};
    transactions
      .filter(tx => new Date(tx.date).getFullYear() === selectedYear)
      .forEach(tx => {
        const m = new Date(tx.date).getMonth();
        const key = MONTH_SHORT_EN[m];
        const v = parseTxAmount(tx, cur);
        if (tx.type === "Income" || tx.type === "Credit") txByMonth[key] = (txByMonth[key] || 0) + v;
        else if (tx.type === "Expense" || tx.type === "Debit") txByMonth[key] = (txByMonth[key] || 0) - v;
      });

    // Forward accumulation: running cashflow total
    let running = 0;
    return MONTH_SHORT_EN.map(m => {
      running += txByMonth[m] || 0;
      return { month: m, netWorth: running };
    });
  }, [transactions, selectedYear, cur, netWorth]);

  // ── Insights ──────────────────────────────────────────────────────────────
  const topExpenseCategory = expByCategory[0];
  const biggestAssetCategory = assetAllocationData[0];
  const liquidRatio = netWorth > 0 ? (liquidAssets / netWorth) * 100 : 0;
  const avgMonthlyExpense = monthlyChartData.reduce((s, d) => s + d.expense, 0) / 12;

  // Best / worst spending month
  const { bestMonth, worstMonth } = useMemo(() => {
    const nonZero = spendTrend.filter(d => d.expense > 0);
    if (!nonZero.length) return { bestMonth: null, worstMonth: null };
    const sorted = [...nonZero].sort((a, b) => a.expense - b.expense);
    return { bestMonth: sorted[0], worstMonth: sorted[sorted.length - 1] };
  }, [spendTrend]);

  // ── Format helper (inside component scope) ────────────────────────────────
  const fmt = (v: number) => formatValue(v, cur, lang as "en" | "id");

  // ── Loading / skeleton ────────────────────────────────────────────────────
  if (!mounted || isLoading) {
    return <AnalyticsSkeleton />;
  }

  const hasTransactions = transactions.length > 0;
  const hasAssets = assets.length > 0;

  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10 space-y-8">

        {/* ── Page Header + Filters ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline font-black text-2xl tracking-tight text-on-surface">{t.pageTitle}</h1>
            <p className="text-sm text-on-surface-variant mt-1">{t.pageSub}</p>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Year */}
            <div className="relative year-drop">
              <button
                onClick={() => { setShowYearDropdown(v => !v); setShowMonthDropdown(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-black text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>
                {selectedYear}
                <span className="material-symbols-outlined text-[12px] text-on-surface-variant">{showYearDropdown ? "expand_less" : "expand_more"}</span>
              </button>
              {showYearDropdown && (
                <div className="absolute right-0 top-10 bg-surface-container dark:bg-slate-800 border border-outline-variant/20 rounded-xl shadow-xl z-50 py-1.5 min-w-[100px] animate-in fade-in zoom-in-95 duration-150">
                  {availableYears.map(y => (
                    <button key={y} onClick={() => { setSelectedYear(y); setShowYearDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-primary/10 cursor-pointer ${y === selectedYear ? "text-primary" : "text-on-surface"}`}
                    >{y}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Month */}
            <div className="relative month-drop">
              <button
                onClick={() => { setShowMonthDropdown(v => !v); setShowYearDropdown(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-black text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] text-primary">date_range</span>
                {selectedMonth === -1 ? t.allMonths : monthsLabels[selectedMonth]}
                <span className="material-symbols-outlined text-[12px] text-on-surface-variant">{showMonthDropdown ? "expand_less" : "expand_more"}</span>
              </button>
              {showMonthDropdown && (
                <div className="absolute right-0 top-10 bg-surface-container dark:bg-slate-800 border border-outline-variant/20 rounded-xl shadow-xl z-50 py-1.5 min-w-[130px] animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => { setSelectedMonth(-1); setShowMonthDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-primary/10 cursor-pointer ${selectedMonth === -1 ? "text-primary" : "text-on-surface"}`}
                  >{t.allMonths}</button>
                  {monthsLabels.map((m, i) => (
                    <button key={m} onClick={() => { setSelectedMonth(i); setShowMonthDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-primary/10 cursor-pointer ${i === selectedMonth ? "text-primary" : "text-on-surface"}`}
                    >{m}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PART A: Summary Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            icon="account_balance"
            label={t.netWorth}
            value={hasAssets ? fmt(netWorth) : "—"}
            badge={hasAssets ? trendBadge(netWorth, netWorth * 0.97) : undefined}
            sub={t.netWorthSub}
            accent="text-indigo-500"
          />
          <SummaryCard
            icon="trending_up"
            label={t.totalIncome}
            value={hasTransactions ? fmt(totalIncome) : "—"}
            badge={hasTransactions ? trendBadge(totalIncome, prevIncome) : undefined}
            sub={selectedMonth === -1 ? t.yearLabel(selectedYear) : t.monthYear(monthsLabels[selectedMonth], selectedYear)}
            accent="text-emerald-500"
          />
          <SummaryCard
            icon="trending_down"
            label={t.totalExpense}
            value={hasTransactions ? fmt(totalExpense) : "—"}
            badge={hasTransactions ? trendBadge(totalExpense, prevExpense, true) : undefined}
            sub={selectedMonth === -1 ? t.yearLabel(selectedYear) : t.monthYear(monthsLabels[selectedMonth], selectedYear)}
            accent="text-rose-500"
          />
          <SummaryCard
            icon="savings"
            label={t.netCashflow}
            value={hasTransactions ? fmt(netCashflow) : "—"}
            sub={savingsRate !== 0 ? `${savingsRate.toFixed(1)}% ${t.savingsRate}` : ""}
            accent={netCashflow >= 0 ? "text-emerald-500" : "text-rose-500"}
          />
          <SummaryCard
            icon="water_drop"
            label={t.liquidAssets}
            value={hasAssets ? fmt(liquidAssets) : "—"}
            sub={hasAssets && netWorth > 0 ? `${((liquidAssets / netWorth) * 100).toFixed(1)}% ${t.ofNetWorth}` : ""}
            accent="text-blue-500"
          />
          <SummaryCard
            icon="rocket_launch"
            label={t.invested}
            value={hasAssets ? fmt(investedAssets) : "—"}
            sub={hasAssets && netWorth > 0 ? `${((investedAssets / netWorth) * 100).toFixed(1)}% ${t.ofNetWorth}` : ""}
            accent="text-violet-500"
          />
        </div>

        {/* ── PART B: Net Worth Over Time ───────────────────────────────── */}
        <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-5 shadow-sm">
          <SectionHeader
            title={t.netWorthTitle}
            sub={t.netWorthSub2(selectedYear)}
          />
          {!hasTransactions ? (
            <EmptyState icon="show_chart" title={t.noDataYet} subtitle={t.noDataSub} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={netWorthOverTime} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.primary} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={PALETTE.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v).replace(/\s/g, "")} width={70} />
                <Tooltip content={<DarkTooltip formatter={(v: number) => fmt(v)} />} />
                <Area type="monotone" dataKey="netWorth" name={t.netWorthLabel} stroke={PALETTE.primary} strokeWidth={2.5} fill="url(#nwGradient)" dot={false} activeDot={{ r: 5, fill: PALETTE.primary }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── PART B: Income vs Expense Over Time ──────────────────────── */}
        <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-5 shadow-sm">
          <SectionHeader
            title={t.incomeVsExpense}
            sub={t.incomeVsExpenseSub(selectedYear)}
          />
          {!hasTransactions ? (
            <EmptyState icon="bar_chart" title={t.noTransactions} subtitle={t.noTransactionsSub} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v).replace(/\s/g, "")} width={70} />
                <Tooltip content={<DarkTooltip formatter={(v: number) => fmt(v)} />} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 12 }} />
                <Bar dataKey="income" name={t.incomeLabel} fill={PALETTE.income} radius={[4,4,0,0]} maxBarSize={28} />
                <Bar dataKey="expense" name={t.expenseLabel} fill={PALETTE.expense} radius={[4,4,0,0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── PART B: Expense Breakdown + Asset Allocation ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Expense Breakdown */}
          <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-5 shadow-sm">
            <SectionHeader title={t.expenseByCategory} sub={t.expenseByCategorySub} />
            {expByCategory.length === 0 ? (
              <EmptyState icon="donut_large" title={t.noExpensesYet} subtitle={t.noExpensesSub} />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={expByCategory} cx="50%" cy="50%" innerRadius={54} outerRadius={80} dataKey="value" paddingAngle={2} strokeWidth={0}>
                      {expByCategory.map((_, i) => (
                        <Cell key={i} fill={TX_CATEGORY_COLORS[i % TX_CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip formatter={(v: number) => fmt(v)} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  {expByCategory.slice(0, 7).map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: TX_CATEGORY_COLORS[i % TX_CATEGORY_COLORS.length] }} />
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest truncate flex-1">{d.name}</span>
                      <span className="text-[11px] font-black text-on-surface tabular-nums shrink-0">{pct(d.value, totalExpense)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Asset Allocation */}
          <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-5 shadow-sm">
            <SectionHeader title={t.assetAllocation} sub={t.assetAllocationSub} />
            {assetAllocationData.length === 0 ? (
              <EmptyState icon="pie_chart" title={t.noAssets} subtitle={t.noAssetsSub} />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={assetAllocationData} cx="50%" cy="50%" innerRadius={54} outerRadius={80} dataKey="value" paddingAngle={2} strokeWidth={0}>
                      {assetAllocationData.map((d) => (
                        <Cell key={d.name} fill={CATEGORY_COLORS[d.name] || PALETTE.muted} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip formatter={(v: number) => fmt(v)} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  {assetAllocationData.map(d => (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[d.name] || PALETTE.muted }} />
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest truncate flex-1">{d.name}</span>
                      <span className="text-[11px] font-black text-on-surface tabular-nums shrink-0">{pct(d.value, netWorth)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── PART B: Liquid vs Invested ────────────────────────────────── */}
        <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-5 shadow-sm">
          <SectionHeader title={t.liquidVsInvested} sub={t.liquidVsInvestedSub} />
          {!hasAssets ? (
            <EmptyState icon="water_drop" title={t.noAssetsYet} subtitle={t.noAssetsYetSub} />
          ) : (
            <div className="flex flex-col gap-4">
              {/* Stacked bar visualization */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-8 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                  {netWorth > 0 && (
                    <>
                      <div
                        className="h-full bg-blue-500 transition-all duration-700 flex items-center justify-center"
                        style={{ width: `${(liquidAssets / netWorth) * 100}%` }}
                      >
                        {liquidAssets / netWorth > 0.12 && (
                          <span className="text-[9px] font-black text-white uppercase tracking-wider px-1">{t.liquid}</span>
                        )}
                      </div>
                      <div
                        className="h-full bg-violet-500 transition-all duration-700 flex items-center justify-center"
                        style={{ width: `${(investedAssets / netWorth) * 100}%` }}
                      >
                        {investedAssets / netWorth > 0.12 && (
                          <span className="text-[9px] font-black text-white uppercase tracking-wider px-1">{t.investedLabel}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: t.liquid, value: liquidAssets, color: "bg-blue-500/10 text-blue-500", pctVal: liquidRatio },
                  { label: t.investedLabel, value: investedAssets, color: "bg-violet-500/10 text-violet-500", pctVal: netWorth > 0 ? (investedAssets / netWorth) * 100 : 0 },
                  { label: t.netWorthLabel, value: netWorth, color: "bg-indigo-500/10 text-indigo-500", pctVal: 100 },
                ].map(item => (
                  <div key={item.label} className={`rounded-xl p-3 ${item.color.split(" ")[0]}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${item.color.split(" ")[1]}`}>{item.label}</p>
                    <p className="font-black text-on-surface text-sm tabular-nums mt-1">{fmt(item.value)}</p>
                    <p className="text-[10px] text-on-surface-variant/60">{item.pctVal.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── PART B: Spending Trend ──────────────────────────────────────── */}
        <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/20 rounded-2xl p-5 shadow-sm">
          <SectionHeader title={t.spendingTrend} sub={t.spendingTrendSub(selectedYear)} />
          {!hasTransactions ? (
            <EmptyState icon="timeline" title={t.noTxTrend} subtitle={t.noTxTrendSub} />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={spendTrend} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.expense} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={PALETTE.expense} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt(v).replace(/\s/g, "")} width={70} />
                <Tooltip content={<DarkTooltip formatter={(v: number) => fmt(v)} />} />
                <Area type="monotone" dataKey="expense" name={t.expenseLabel} stroke={PALETTE.expense} strokeWidth={2.5} fill="url(#expGradient)" dot={false} activeDot={{ r: 5, fill: PALETTE.expense }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── PART C: Insight Cards ─────────────────────────────────────── */}
        <div>
          <SectionHeader title={t.keyInsights} sub={t.keyInsightsSub} />
          {!hasTransactions && !hasAssets ? (
            <EmptyState icon="lightbulb" title={t.noInsights} subtitle={t.noInsightsSub} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hasTransactions && (
                <>
                  <InsightCard
                    icon="category"
                    title={t.topSpending}
                    value={topExpenseCategory ? topExpenseCategory.name : "—"}
                    sub={topExpenseCategory ? `${fmt(topExpenseCategory.value)} (${pct(topExpenseCategory.value, totalExpense)})` : t.noExpensesRecorded}
                    color="bg-rose-500"
                  />
                  <InsightCard
                    icon="percent"
                    title={t.savingsRateLabel}
                    value={totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : "—"}
                    sub={totalIncome > 0 ? t.savedThisPeriod(fmt(netCashflow)) : t.noIncomeRecorded}
                    color={savingsRate >= 0 ? "bg-emerald-500" : "bg-rose-500"}
                  />
                  <InsightCard
                    icon="balance"
                    title={t.incomeExpenseRatio}
                    value={totalExpense > 0 ? `${(totalIncome / totalExpense).toFixed(2)}×` : "—"}
                    sub={totalExpense > 0 ? (totalIncome >= totalExpense ? t.healthy : t.overspending) : t.noExpenses}
                    color={totalIncome >= totalExpense ? "bg-emerald-500" : "bg-amber-500"}
                  />
                  <InsightCard
                    icon="trending_down"
                    title={t.avgMonthlyExpense}
                    value={avgMonthlyExpense > 0 ? fmt(avgMonthlyExpense) : "—"}
                    sub={t.avgMonthlyExpenseSub}
                    color="bg-violet-500"
                  />
                  {worstMonth && (
                    <InsightCard
                      icon="warning"
                      title={t.highestSpendingMonth}
                      value={worstMonth.month}
                      sub={t.spentLabel(fmt(worstMonth.expense))}
                      color="bg-rose-600"
                    />
                  )}
                  {bestMonth && (
                    <InsightCard
                      icon="thumb_up"
                      title={t.lowestSpendingMonth}
                      value={bestMonth.month}
                      sub={t.spentLabel(fmt(bestMonth.expense))}
                      color="bg-emerald-600"
                    />
                  )}
                </>
              )}
              {hasAssets && (
                <>
                  <InsightCard
                    icon="pie_chart"
                    title={t.largestAssetClass}
                    value={biggestAssetCategory ? biggestAssetCategory.name : "—"}
                    sub={biggestAssetCategory ? `${fmt(biggestAssetCategory.value)} (${pct(biggestAssetCategory.value, netWorth)})` : ""}
                    color="bg-indigo-500"
                  />
                  <InsightCard
                    icon="water_drop"
                    title={t.liquidAssetRatio}
                    value={netWorth > 0 ? `${liquidRatio.toFixed(1)}%` : "—"}
                    sub={t.readilyAccessible(fmt(liquidAssets))}
                    color="bg-blue-500"
                  />
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
