"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";
import { convert, formatValue, currencySymbols, type SupportedCurrency } from "@/lib/currency";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import AddAssetModal from "@/components/AddAssetModal";
import {
  type Asset,
  getTotalAssetsValue,
  getLiquidAssetsValue,
  getInvestedAssetsValue,
  getAssetsByCategory,
} from "@/lib/assets";

export default function AssetsPage() {
  const { theme, setTheme } = useTheme();
  const { lang, t } = useLang();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);

  // States for top nav
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchAssets();

    const handleClickOutside = (event: MouseEvent) => {
        if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
          setShowCurrencyDropdown(false);
        }
        if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
          setShowUserDropdown(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      const meta = userData.user.user_metadata;
      if (meta?.avatar_url) setUserAvatar(meta.avatar_url);
      setUserName(meta?.full_name || meta?.name || userData.user.email?.split("@")[0] || "User");
      setUserEmail(userData.user.email || "");

      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAssets(data);
        performSmartRefresh(data, userData.user.id);
      }
    } else {
      window.location.href = "/";
    }
    setIsLoading(false);
  };

  const performSmartRefresh = async (currentAssets: Asset[], userId: string) => {
    const now = Date.now();
    const assetsToUpdate = currentAssets.filter((a) => {
        if (a.valuation_mode !== "market" || !a.symbol || !a.quantity) return false;
        
        const lastValued = new Date(a.last_valued_at || a.updated_at).getTime();
        const ageMs = now - lastValued;
        
        // 15 mins for crypto, 60 mins for stocks
        if (a.category === "Crypto" && ageMs > 15 * 60 * 1000) return true;
        if (a.category === "Stock / ETF" && ageMs > 60 * 60 * 1000) return true;
        return false;
    });

    if (assetsToUpdate.length === 0) return;

    const items = assetsToUpdate.map(a => ({
        symbol: a.symbol!,
        type: a.category === "Crypto" ? "crypto" : "stock"
    }));

    try {
        const res = await fetch("/api/prices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        });
        const json = await res.json();
        
        if (json.results) {
            const supabase = createClient();
            let updatedAny = false;
            
            const newAssets = [...currentAssets];

            for (let i = 0; i < assetsToUpdate.length; i++) {
                const asset = assetsToUpdate[i];
                const quote = json.results[i];

                if (quote && quote.price && !quote.error) {
                    const newCurrentValue = Number(asset.quantity) * quote.price;
                    const newDateISO = new Date(quote.updatedAt).toISOString();
                    
                    const { error } = await supabase.from("assets")
                        .update({ 
                            last_price: quote.price, 
                            current_value: newCurrentValue,
                            last_valued_at: newDateISO
                        })
                        .eq("id", asset.id);

                    if (!error) {
                        updatedAny = true;
                        const idx = newAssets.findIndex(x => x.id === asset.id);
                        if (idx >= 0) {
                            newAssets[idx] = { 
                                ...newAssets[idx], 
                                last_price: quote.price, 
                                current_value: newCurrentValue,
                                last_valued_at: newDateISO
                            };
                        }
                    }
                }
            }

            if (updatedAny) {
                setAssets(newAssets);
            }
        }
    } catch (err) {
        console.warn("Smart refresh silently failed", err);
    }
  };


  const handleAddAsset = async (assetData: any) => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const { error } = await supabase.from("assets").insert({
        ...assetData,
        user_id: userData.user.id
    });

    if (!error) {
        await fetchAssets();
    } else {
        throw new Error(error.message);
    }
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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const normalizedAssets = assets.map(asset => {
    const rawVal = Number(asset.current_value) || 0;
    const valInPrefCurrency = convert(rawVal, asset.currency as SupportedCurrency, currency as SupportedCurrency);
    return { ...asset, current_value: valInPrefCurrency };
  });

  const totalAssets = getTotalAssetsValue(normalizedAssets);
  const liquidAssets = getLiquidAssetsValue(normalizedAssets);
  const investedAssets = getInvestedAssetsValue(normalizedAssets);
  const allocation = getAssetsByCategory(normalizedAssets);

  const allocEntries = Object.entries(allocation).sort((a, b) => b[1] - a[1]);
  
  const getCategoryColor = (cat: string) => {
      const colors: Record<string, string> = {
          "Cash": "bg-emerald-500",
          "Bank": "bg-blue-500",
          "E-wallet": "bg-cyan-500",
          "Crypto": "bg-purple-500",
          "Stock / ETF": "bg-indigo-500",
          "Gold": "bg-amber-500",
          "Property": "bg-rose-500",
          "Vehicle": "bg-slate-500",
          "Other": "bg-gray-500"
      };
      return colors[cat] || "bg-gray-500";
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
       <nav className="sticky top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-4 sm:px-6 py-2 md:py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex items-center gap-2 cursor-pointer group">
              <span className="text-lg md:text-xl font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 font-headline group-hover:text-primary transition-colors">
                SnapFins
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 font-manrope font-semibold tracking-tight text-sm">
              <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/dashboard">
                {t("navDashboard")}
              </Link>
              <Link className="text-primary font-bold border-b-2 border-primary pb-1" href="/assets">
                {t("navAsset")}
              </Link>
              <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                {t("navAnalytics")}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className={`flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5 relative ${showCurrencyDropdown ? "z-[60]" : ""}`} ref={currencyDropdownRef}>
              <button onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)} className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-md text-[9px] md:text-[10px] font-black text-primary hover:bg-primary/5 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-xs md:text-sm">payments</span>
                <span className="xs:inline">{currency}</span>
                <span className="material-symbols-outlined text-[10px]">{showCurrencyDropdown ? "expand_less" : "expand_more"}</span>
              </button>

                <div className={`absolute right-0 lg:left-0 top-10 mt-2 w-48 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden text-[11px] dropdown-transition origin-top-right lg:origin-top-left ${showCurrencyDropdown ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible" : "opacity-0 -translate-y-8 scale-90 pointer-events-none invisible"}`}>
                  <div className="px-3 py-2 border-b border-outline-variant/10 font-black text-[9px] uppercase tracking-widest text-on-surface-variant bg-slate-50 dark:bg-slate-800">{t("preferredCurrency")}</div>
                  <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
                    {(Object.keys(currencySymbols) as SupportedCurrency[]).map((c) => (
                        <button key={c} onClick={() => { setCurrency(c); setShowCurrencyDropdown(false); }} className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between ${currency === c ? "text-primary font-black bg-primary/5" : "text-on-surface font-semibold"}`}>
                          <span className="flex items-center gap-2"><span className="text-primary/60 font-mono w-4">{currencySymbols[c]}</span>{c}</span>
                          {currency === c && <span className="material-symbols-outlined text-sm">check</span>}
                        </button>
                    ))}
                  </div>
                </div>
            </div>

            <div className="relative" ref={userDropdownRef}>
              <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="w-8 h-8 rounded-full overflow-hidden border-2 border-outline-variant/30 flex items-center justify-center bg-primary text-white font-bold text-xs hover:border-primary transition-colors">
                  {userAvatar ? <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" /> : userName?.charAt(0).toUpperCase() || "U"}
              </button>
              <div className={`absolute right-0 top-12 mt-2 w-64 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden dropdown-transition origin-top-right ${showUserDropdown ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible" : "opacity-0 -translate-y-8 scale-90 pointer-events-none invisible"}`}>
                  <div className="px-5 py-4 border-b border-outline-variant/10 bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{t("profile")}</p>
                    <p className="text-sm font-bold text-on-surface truncate">{userName}</p>
                    <p className="text-[10px] text-on-surface-variant truncate opacity-60">{userEmail}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {mounted && (
                      <button onClick={toggleTheme} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors text-sm font-bold group">
                        <div className="flex items-center gap-3"><span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">{theme === "dark" ? "light_mode" : "dark_mode"}</span><span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span></div>
                        <div className="w-8 h-4 bg-outline-variant/30 rounded-full relative"><div className={`absolute top-0.5 w-3 h-3 bg-primary rounded-full transition-all ${theme === "dark" ? "right-0.5" : "left-0.5"}`}></div></div>
                      </button>
                    )}
                    <div className="h-px bg-outline-variant/10 my-1 mx-2" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors text-sm font-bold group">
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">logout</span>{t("logout")}
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 py-6 md:py-10 space-y-8 md:space-y-10 pb-32 md:pb-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface font-headline">
              {lang === "id" ? "Kekayaan Bersih" : "Net Worth & Assets"}
            </h1>
            <p className="text-on-surface-variant font-black tracking-[0.2em] uppercase text-[9px] md:text-[10px] opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-secondary rounded-full kinetic-spark"></span>
              {lang === "id" ? "PELACAKAN AKTIF" : "LIVE TRACKING"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowAddAssetModal(true)}
              className="px-5 py-4 sm:py-2.5 rounded-xl sm:rounded-lg bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-[0_4px_15px_rgba(53,37,205,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 magic-glow-hover cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg focus:outline-none">add</span>
              <span className="relative z-10">{lang === "id" ? "Tambah Aset" : "Add Asset"}</span>
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                { 
                  label: lang === "id" ? "Total Aset" : "Total Assets", 
                  val: formatValue(totalAssets, currency, lang), 
                  icon: "account_balance",
                  gradient: "bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-surface-container-low/40 dark:to-slate-800/40",
                  iconBg: "bg-primary/5 group-hover:bg-primary/10",
                  textClass: "text-on-surface"
                },
                { 
                  label: lang === "id" ? "Aset Likuid" : "Liquid Assets", 
                  val: formatValue(liquidAssets, currency, lang), 
                  icon: "water_drop",
                  gradient: "bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-secondary-container/10",
                  iconBg: "bg-secondary/5 group-hover:bg-secondary/10",
                  textClass: "text-secondary font-black"
                },
                { 
                  label: lang === "id" ? "Aset Diinvestasikan" : "Invested Assets", 
                  val: formatValue(investedAssets, currency, lang), 
                  icon: "trending_up",
                  gradient: "bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-surface-container-low/40 dark:to-slate-800/40",
                  iconBg: "bg-primary/5 group-hover:bg-primary/10",
                  textClass: "text-on-surface"
                }
            ].map((card, idx) => (
                <div key={idx} className={`glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group ${card.gradient}`}>
                    <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl transition-colors ${card.iconBg}`}></div>
                    
                    <div className="relative flex justify-between items-start mb-4 gap-4 mt-6">
                        <div className="min-w-0 flex-grow">
                            <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1 truncate">
                                {card.label}
                            </p>
                            <div className={`${card.val.length > 15 ? "text-xl" : "text-3xl"} ${card.textClass} font-headline tracking-tighter truncate`} title={card.val}>
                                {card.val}
                            </div>
                        </div>
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {card.icon}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </section>

        {allocEntries.length > 0 && (
            <section className="glass-card p-6 md:p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden relative group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
                    <div>
                    <h2 className="font-headline font-bold text-xl text-on-surface">
                        {lang === "id" ? "Alokasi Portofolio" : "Portfolio Allocation"}
                    </h2>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">
                        {lang === "id" ? "Distribusi aset berdasarkan kategori." : "Asset distribution by category."}
                    </p>
                    </div>
                </div>
                
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-surface-container-low mb-6 shadow-inner border border-outline-variant/10">
                    {allocEntries.map(([cat, val]) => {
                        const perc = (val / totalAssets) * 100;
                        return (
                            <div 
                                key={cat} 
                                style={{ width: `${perc}%` }} 
                                className={`${getCategoryColor(cat)} h-full transition-all duration-1000 border-r border-background/20 hover:brightness-110`}
                                title={`${cat}: ${perc.toFixed(1)}%`}
                            />
                        );
                    })}
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
                    {allocEntries.map(([cat, val]) => (
                        <div key={cat} className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(cat)} shadow-sm`}></span>
                            <span className="font-bold text-[11px] text-on-surface uppercase tracking-wider">{cat}</span>
                            <span className="font-black text-[11px] text-on-surface-variant tabular-nums ml-1">{((val / totalAssets) * 100).toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </section>
        )}

        <section className="glass-card rounded-3xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden flex flex-col relative min-h-[400px]">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 md:p-8 border-b border-outline-variant/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md gap-4">
                <div>
                  <h2 className="font-headline font-bold text-xl text-on-surface">
                    {lang === "id" ? "Kepemilikan Aset" : "Asset Holdings"}
                  </h2>
                </div>
              </div>

             <div className="flex-1 overflow-x-auto">
                {isLoading ? (
                    <div className="w-full h-[300px] flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-[300px]">
                        <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-primary opacity-80">
                            inventory_2
                        </span>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
                        {lang === "id" ? "Belum ada aset" : "No Assets Found"}
                        </h3>
                        <p className="text-sm text-on-surface-variant max-w-sm font-medium">
                        {lang === "id" ? "Lacak kekayaan Anda dengan menambahkan aset ke portofolio Anda." : "Track your wealth by adding your first asset to your portfolio."}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-left excel-grid">
                        <thead>
                            <tr className="bg-surface-container-lowest/80 dark:bg-slate-900/80 text-on-surface-variant text-[10px] uppercase tracking-widest font-black sticky top-0 z-10 backdrop-blur-md">
                                <th className="p-4 pl-6 whitespace-nowrap">{lang === "id" ? "Aset" : "Asset"}</th>
                                <th className="p-4 whitespace-nowrap">{lang === "id" ? "Kategori" : "Category"}</th>
                                <th className="p-4 text-right whitespace-nowrap">{lang === "id" ? "Kuantitas" : "Quantity"}</th>
                                <th className="p-4 text-right whitespace-nowrap">{lang === "id" ? "Nilai" : "Value"}</th>
                                <th className="p-4 text-center whitespace-nowrap hidden sm:table-cell">{lang === "id" ? "Diperbarui" : "Updated"}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 text-sm font-semibold bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm">
                            {normalizedAssets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-grid-row-hover dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex flex-col">
                                            <span className="text-on-surface font-bold text-[14px] truncate max-w-[150px] sm:max-w-xs">{asset.name}</span>
                                            {asset.symbol && <span className="text-[10px] font-black tracking-widest text-primary uppercase mt-0.5">{asset.symbol}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${asset.category === "Crypto" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" : asset.category === "Cash" || asset.category === "Bank" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"}`}>
                                            {asset.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-on-surface font-black tabular-nums text-[13px]">
                                            {asset.quantity ? Number(asset.quantity).toLocaleString("en-US", { maximumFractionDigits: 6 }) : "—"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-on-surface font-black tabular-nums text-[14px]">
                                                {formatValue(asset.current_value, currency, lang)}
                                            </span>
                                            <div className="flex items-center gap-1 mt-0.5">
                                              {asset.valuation_mode === "manual" ? (
                                                  <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">MANUAL</span>
                                              ) : asset.valuation_mode === "market" ? (
                                                  <>
                                                    <span className="inline-block w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.8)]"></span>
                                                    <span className="text-[9px] uppercase tracking-widest text-secondary font-black">MARKET</span>
                                                  </>
                                              ) : null}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center hidden sm:table-cell text-on-surface-variant font-bold text-[11px] uppercase tracking-widest">
                                        {new Date(asset.last_valued_at).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric" })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
             </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation - v1.0.1 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4">
        <div className="bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex justify-around items-center py-3">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-8 h-1 bg-transparent rounded-full mb-1"></div>
            <span className="material-symbols-outlined text-on-surface-variant">dashboard</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t("navDashboard")}</span>
          </Link>
          
          <Link href="/assets" className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-1 bg-primary rounded-full mb-1 opacity-100"></div>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t("navAsset")}</span>
          </Link>

          <Link href="#" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-8 h-1 bg-transparent rounded-full mb-1"></div>
            <span className="material-symbols-outlined text-on-surface-variant">monitoring</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t("navAnalytics")}</span>
          </Link>
        </div>
      </div>
      

      {showAddAssetModal && (
          <AddAssetModal onClose={() => setShowAddAssetModal(false)} onSubmit={handleAddAsset} />
      )}
    </>
  );
}
