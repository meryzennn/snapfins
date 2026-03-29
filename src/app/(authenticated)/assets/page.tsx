"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";
import { convert, formatValue, currencySymbols, type SupportedCurrency } from "@/lib/currency";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import AddAssetModal from "@/components/AddAssetModal";
import EditAssetModal from "@/components/EditAssetModal";
import SelectionToggle from "@/components/SelectionToggle";
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
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const pageSize = 10;


  useEffect(() => {
    setMounted(true);
    fetchAssets();

    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.kebab-menu-container')) {
          setOpenMenuId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
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

  const fetchAssets = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {

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

    // Strip acquisition metadata before inserting into assets table
    const { acquisition_mode, source_asset_id, purchase_amount, ...cleanAssetData } = assetData;

    const { data: inserted, error } = await supabase.from("assets").insert({
      ...cleanAssetData,
      user_id: userData.user.id,
    }).select().single();

    if (error) throw new Error(error.message);

    // via_transaction: deduct purchase amount from the source cash/bank asset
    if (acquisition_mode === "via_transaction" && source_asset_id && purchase_amount) {
      const sourceAsset = assets.find(a => a.id === source_asset_id);
      if (sourceAsset) {
        const newValue = Math.max(0, Number(sourceAsset.current_value) - Number(purchase_amount));
        await supabase.from("assets").update({ current_value: newValue }).eq("id", source_asset_id);
      }
    }

    await fetchAssets();
  };

  const handleEditAsset = async (assetData: any) => {
    if (!editingAsset) return;
    const supabase = createClient();
    const { error } = await supabase.from("assets").update(assetData).eq("id", editingAsset.id);
    if (!error) {
        setEditingAsset(null);
        await fetchAssets();
    } else {
        throw new Error(error.message);
    }
  };

  const handleDeleteAsset = async () => {
    if (!deletingAsset) return;
    const supabase = createClient();
    const { error } = await supabase.from("assets").delete().eq("id", deletingAsset.id);
    if (!error) {
        setDeletingAsset(null);
        await fetchAssets();
    } else {
        alert(error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const supabase = createClient();
    const { error } = await supabase.from("assets").delete().in("id", selectedIds);
    if (!error) {
        setSelectedIds([]);
        await fetchAssets();
    } else {
        alert(error.message);
    }
  };


  const normalizedAssets = assets.map(asset => {
    const rawVal = Number(asset.current_value) || 0;
    const valInPrefCurrency = convert(rawVal, asset.currency as SupportedCurrency, currency as SupportedCurrency);
    return { ...asset, current_value: valInPrefCurrency };
  });

  const totalPages = Math.ceil(normalizedAssets.length / pageSize) || 1;
  const paginatedAssets = normalizedAssets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectAll = (ids: string[]) => {
    if (selectedIds.length === normalizedAssets.length && normalizedAssets.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(normalizedAssets.map(a => a.id));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sel) => sel !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

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
            <p className="text-[11px] text-on-surface-variant/50 font-medium pt-0.5">
              {lang === "id"
                ? "Aset menunjukkan apa yang Anda miliki saat ini. Net Worth = Total Aset − Kewajiban."
                : "Assets show what you own right now. Net Worth = Total Assets − Liabilities."}
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

        <section className="glass-card rounded-3xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden flex flex-col relative min-h-[300px]">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 md:p-8 border-b border-outline-variant/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md gap-4">
                <div>
                  <h2 className="font-headline font-bold text-xl text-on-surface">
                    {lang === "id" ? "Kepemilikan Aset" : "Asset Holdings"}
                  </h2>
                </div>
              </div>

             <div className="flex-1 overflow-x-auto flex flex-col min-h-[450px] custom-scrollbar">
                {selectedIds.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-primary/5 border-b border-primary/20 animate-in slide-in-from-top-2 duration-300">
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
                        {lang === "id" ? "Batal" : "Cancel"}
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-error text-white font-black text-xs shadow-lg shadow-error/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        {lang === "id" ? "Hapus Terpilih" : "Delete Selected"}
                      </button>
                    </div>
                  </div>
                )}
                {isLoading ? (
                    <div className="w-full h-[300px] flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-[340px]">
                        <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-outline-variant/10">
                          <span className="material-symbols-outlined text-4xl text-primary opacity-90 leading-none">
                              inventory_2
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
                          {lang === "id" ? "Portfolio Anda masih kosong" : "Your portfolio is empty"}
                        </h3>
                        <p className="text-sm text-on-surface-variant max-w-sm font-medium mb-6">
                          {lang === "id"
                            ? "Mulai dengan menambahkan akun bank, kas, atau aset investasi yang sudah Anda miliki."
                            : "Start by adding the bank accounts, cash, or investments you already have."}
                        </p>
                        <div className="flex flex-col gap-2 text-left max-w-xs w-full">
                          <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/50 mb-1">
                            {lang === "id" ? "Panduan memulai:" : "Getting started:"}
                          </p>
                          <div className="flex items-start gap-2.5 text-[11px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-primary text-[14px] mt-0.5 shrink-0">looks_one</span>
                            <span>{lang === "id" ? <><b>Tambah Saldo yang Dimiliki</b> — untuk akun bank atau kas yang sudah ada.</> : <><b>Add Existing Balance</b> — for bank accounts or cash you already have.</>}</span>
                          </div>
                          <div className="flex items-start gap-2.5 text-[11px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-secondary text-[14px] mt-0.5 shrink-0">looks_two</span>
                            <span>{lang === "id" ? <><b>Lalu catat pendapatan/pengeluaran</b> di Dashboard menggunakan Manual Entry.</> : <><b>Then record income/expense</b> on the Dashboard using Manual Entry.</>}</span>
                          </div>
                          <div className="flex items-start gap-2.5 text-[11px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-amber-400 text-[14px] mt-0.5 shrink-0">looks_3</span>
                            <span>{lang === "id" ? <><b>Beli / Pindahkan ke Aset</b> untuk mencatat pembelian saham/kripto dari kas Anda.</> : <><b>Buy / Move Into Asset</b> to record buying stocks or crypto from your cash.</>}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowAddAssetModal(true)}
                          className="mt-7 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-[0_4px_15px_rgba(53,37,205,0.25)] transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">add</span>
                          {lang === "id" ? "Tambah Aset Pertama" : "Add Your First Asset"}
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-left excel-grid">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 text-on-surface-variant text-[10px] uppercase tracking-widest font-black sticky top-0 z-10 border-b border-outline-variant/10">
                                <th className="p-4 pl-6 text-center w-12">
                                  <SelectionToggle
                                    checked={selectedIds.length > 0 && selectedIds.length === normalizedAssets.length}
                                    indeterminate={selectedIds.length > 0 && selectedIds.length < normalizedAssets.length}
                                    onChange={() => handleSelectAll([])}
                                  />
                                </th>
                                <th className="p-4 whitespace-nowrap">{lang === "id" ? "Aset" : "Asset"}</th>
                                <th className="p-4 whitespace-nowrap">{lang === "id" ? "Kategori" : "Category"}</th>
                                <th className="p-4 text-right whitespace-nowrap">{lang === "id" ? "Kuantitas" : "Quantity"}</th>
                                <th className="p-4 text-right whitespace-nowrap">{lang === "id" ? "Nilai" : "Value"}</th>
                                <th className="p-4 text-center whitespace-nowrap hidden sm:table-cell">{lang === "id" ? "Diperbarui" : "Updated"}</th>
                                <th className="p-4 text-center whitespace-nowrap w-24 sticky right-0 bg-slate-50 dark:bg-slate-900 z-30 border-l border-outline-variant/10">
                                    {lang === "id" ? "Aksi" : "Actions"}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10 text-sm font-semibold bg-white/20 dark:bg-slate-900/20 backdrop-blur-sm">
                            {paginatedAssets.map((asset) => (
                                <tr key={asset.id} className={`hover:bg-grid-row-hover dark:hover:bg-slate-800/50 transition-colors group ${selectedIds.includes(asset.id) ? "bg-primary/[0.08]" : ""}`}>
                                    <td className="p-4 pl-6 text-center">
                                      <SelectionToggle
                                        checked={selectedIds.includes(asset.id)}
                                        onChange={() => handleSelectRow(asset.id)}
                                      />
                                    </td>
                                    <td className="p-4">
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
                                                  <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1">
                                                        <span className="inline-block w-1.5 h-1.5 bg-secondary rounded-full animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.8)]"></span>
                                                        <span className="text-[9px] uppercase tracking-widest text-secondary font-black">MARKET</span>
                                                    </div>
                                                    <span className="text-[8px] uppercase tracking-widest text-on-surface-variant font-bold opacity-70 mt-0.5">
                                                        VIA {asset.exchange === 'CRYPTO' ? 'BINANCE' : asset.exchange && asset.exchange !== 'US' ? asset.exchange : 'YAHOO FIN'}
                                                    </span>
                                                  </div>
                                              ) : null}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center hidden sm:table-cell text-on-surface-variant font-bold text-[11px] uppercase tracking-widest">
                                        {new Date(asset.last_valued_at).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { month: "short", day: "numeric" })}
                                    </td>
                                    <td className={`p-4 text-center kebab-menu-container sticky right-0 bg-white dark:bg-slate-950 border-l border-outline-variant/10 transition-all ${openMenuId === asset.id ? "z-40 shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.1)] dark:shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.3)]" : "z-20"}`}>
                                        <div className="relative inline-block text-left">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === asset.id ? null : asset.id);
                                                }}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                            
                                            {openMenuId === asset.id && (
                                                <div className="absolute right-0 mt-1 w-32 bg-surface-container dark:bg-slate-800/95 backdrop-blur-md border border-outline-variant/30 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.15)] z-50 py-1.5 origin-top-right animate-in fade-in zoom-in-95 duration-200 divide-y divide-outline-variant/10">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingAsset(asset);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors flex items-center justify-between group/item cursor-pointer"
                                                    >
                                                        <span className="text-[11px] font-bold text-on-surface group-hover/item:text-primary transition-colors">{t("btnEdit") || "Edit"}</span>
                                                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover/item:text-primary transition-colors">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeletingAsset(asset);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2 hover:bg-error/5 dark:hover:bg-error/10 transition-colors flex items-center justify-between group/item cursor-pointer"
                                                    >
                                                        <span className="text-[11px] font-bold text-error">{t("btnDelete") || "Delete"}</span>
                                                        <span className="material-symbols-outlined text-[16px] text-error">delete</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
             </div>

             {/* Pagination */}
             {totalPages > 1 && (
                 <div className="flex items-center justify-between p-4 border-t border-outline-variant/20 bg-surface-container-lowest/50 dark:bg-slate-900/50">
                    <div className="text-xs font-bold text-on-surface-variant">
                        {lang === "id" ? `Halaman ${currentPage} dari ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                    </div>
                 </div>
             )}
        </section>
      </main>

      

      {showAddAssetModal && (
        <AddAssetModal
          onClose={() => setShowAddAssetModal(false)}
          onSubmit={handleAddAsset}
          cashAssets={assets.filter(a => ["Cash", "Bank", "E-wallet"].includes(a.category))}
        />
      )}

      {editingAsset && (
        <EditAssetModal
          initialData={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSubmit={handleEditAsset}
        />
      )}

      {deletingAsset && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-2xl flex flex-col w-full max-w-md border border-white/10 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mb-6 mx-auto">
                    <span className="material-symbols-outlined text-3xl">warning</span>
                </div>
                <h3 className="font-headline font-bold text-2xl text-on-surface text-center mb-2">
                    {lang === "id" ? "Hapus " : "Delete "}<span className="text-primary truncate block">{deletingAsset.name}</span>?
                </h3>
                <p className="text-center text-sm font-medium text-on-surface-variant mb-8">
                    {lang === "id" ? "Aset ini akan dihapus secara permanen. Mutasi historis terkait tidak akan terhapus." : "This asset will be permanently removed from your portfolio. Legacy transactions will remain intact."}
                </p>
                <div className="flex gap-4">
                    <button onClick={() => setDeletingAsset(null)} className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-outline-variant/20 text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer">
                        {lang === "id" ? "Batal" : "Cancel"}
                    </button>
                    <button onClick={handleDeleteAsset} className="flex-1 py-3 px-4 rounded-xl font-bold bg-error text-white hover:bg-error/90 transition-colors shadow-lg shadow-error/20 cursor-pointer">
                        {lang === "id" ? "Hapus Aset" : "Delete Asset"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}
