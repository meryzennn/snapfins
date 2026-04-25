"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/hooks/useLang";
import { type AssetCategory, ASSET_CATEGORIES, type ValuationMode } from "@/lib/assets";
import { currencySymbols, type SupportedCurrency } from "@/lib/currency";
import { useScrollLock } from "@/hooks/useScrollLock";

type AcquisitionMode = "opening_balance" | "via_transaction";

const UI_CATEGORIES = [
  { name: "Cash", icon: "payments", label: "Cash", labelId: "Tunai" },
  { name: "Bank", icon: "account_balance", label: "Bank Account", labelId: "Rekening Bank" },
  { name: "E-wallet", icon: "account_balance_wallet", label: "E-Wallet", labelId: "Dompet Digital" },
  { name: "Crypto", icon: "currency_bitcoin", label: "Crypto", labelId: "Kripto" },
  { name: "Stock / ETF", icon: "monitoring", label: "Stocks / ETF", labelId: "Saham / ETF" },
  { name: "Gold", icon: "home_storage", label: "Gold", labelId: "Emas" },
  { name: "Property", icon: "home", label: "Property", labelId: "Properti" },
  { name: "Vehicle", icon: "directions_car", label: "Vehicle", labelId: "Kendaraan" },
  { name: "Other", icon: "more_horiz", label: "Other", labelId: "Lainnya" },
];

interface AddAssetModalProps {
  onClose: () => void;
  onSubmit: (assetData: any) => Promise<void>;
  /** Cash/Bank/E-wallet assets to show in the source-account picker */
  cashAssets?: any[];
}

export default function AddAssetModal({ onClose, onSubmit, cashAssets = [] }: AddAssetModalProps) {
  const { t, lang } = useLang();
  useScrollLock(true);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Step 0: Acquisition mode
  const [acquisitionMode, setAcquisitionMode] = useState<AcquisitionMode>("opening_balance");

  // Step 1: Category
  const [category, setCategory] = useState<AssetCategory>("Cash");

  // Step 2: Valuation mode
  const [valuationMode, setValuationMode] = useState<ValuationMode>("manual");

  // Step 3: Asset details
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [manualValue, setManualValue] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Step 3 extra: via_transaction source
  const [sourceAssetId, setSourceAssetId] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [gramWeight, setGramWeight] = useState("");

  // Auto-set symbol for Gold
  useEffect(() => {
    if (category === "Gold" && valuationMode === "market") {
      setSymbol("GC=F"); // Use Gold Futures (more stable in Yahoo Chart API than XAUUSD=X)
      if (!name) setName(lang === "id" ? "Emas Spot" : "Gold Spot");
    }
  }, [category, valuationMode, lang, name]);

  // Gram to Ounce Converter
  useEffect(() => {
    if (category === "Gold" && gramWeight) {
      const g = parseFloat(gramWeight);
      if (!isNaN(g)) {
        const oz = g * 0.0321507;
        setQuantity(oz.toFixed(3));
      }
    }
  }, [gramWeight, category]);

  const TOTAL_STEPS = 3; // 0-indexed: 0,1,2,3

  const handleNext = () => {
    if (step === 1 && !category) return;
    if (step === 2 && !valuationMode) return;
    setStep((s) => s + 1);
  };

  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!name.trim()) throw new Error(lang === "id" ? "Nama aset wajib diisi" : "Asset name is required");

      let finalCurrentValue = 0;
      let finalQuantity = null;
      let finalManualValue = null;
      let lastPrice = null;
      let baseSymbol = null;
      let providerSymbol = null;
      let quoteCurrency = null;
      let exchange = null;

      if (valuationMode === "manual") {
        const raw = manualValue.replace(/[^0-9]/g, "");
        const m = raw ? parseInt(raw, 10) : 0;
        if (isNaN(m)) throw new Error("Invalid value entered");
        finalManualValue = m;
        finalCurrentValue = m;
      } else if (valuationMode === "market") {
        const q = parseFloat(quantity || "0");
        if (isNaN(q) || q <= 0) throw new Error("Invalid quantity");
        finalQuantity = q;

        if (!symbol.trim()) throw new Error("Symbol required for market valuation");

        const type = category === "Crypto" ? "crypto" : "stock";
        const res = await fetch(`/api/prices?symbol=${symbol}&type=${type}`);
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || (lang === "id" ? "Gagal memuat harga pasar" : "Failed to fetch market price"));

        lastPrice = data.price;
        baseSymbol = data.base_symbol;
        providerSymbol = data.provider_symbol;
        quoteCurrency = data.quote_currency;
        exchange = data.exchange;
        finalCurrentValue = data.price * q;
      }

      // For via_transaction: use purchaseAmount if provided, else default to finalCurrentValue
      const resolvedPurchaseAmount = acquisitionMode === "via_transaction" && purchaseAmount
        ? parseFloat(purchaseAmount)
        : finalCurrentValue;

      await onSubmit({
        name,
        category,
        valuation_mode: valuationMode,
        symbol: symbol?.toUpperCase() || null,
        base_symbol: baseSymbol,
        provider_symbol: providerSymbol,
        exchange: exchange,
        quantity: finalQuantity,
        manual_value: finalManualValue,
        current_value: valuationMode === "market" ? finalCurrentValue : finalManualValue,
        last_price: lastPrice,
        quote_currency: quoteCurrency,
        currency: valuationMode === "market" ? (quoteCurrency || "USD") : (currency as SupportedCurrency),
        // Acquisition metadata — consumed by handleAddAsset in assets/page.tsx
        acquisition_mode: acquisitionMode,
        source_asset_id: acquisitionMode === "via_transaction" ? (sourceAssetId || null) : null,
        purchase_amount: acquisitionMode === "via_transaction" ? resolvedPurchaseAmount : null,
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabel = () => {
    if (step === 0) return lang === "id" ? "Apa yang ingin Anda lakukan?" : "What would you like to do?";
    if (step === 1) return lang === "id" ? "Pilih tipe aset Anda" : "Choose your asset type";
    if (step === 2) return lang === "id" ? "Bagaimana kami akan menilai ini?" : "How should we value this?";
    return lang === "id" ? "Masukkan detail aset" : "Enter asset details";
  };

  const submitLabel = () => {
    if (isSubmitting) return lang === "id" ? "Menyimpan..." : "Saving...";
    if (acquisitionMode === "via_transaction") return lang === "id" ? "Simpan & Catat Pembelian" : "Save & Record Purchase";
    return lang === "id" ? "Simpan Saldo Awal" : "Save Opening Balance";
  };

  if (!mounted) return null;

  return createPortal(
    (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-md px-3 pt-6 pb-32 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
      <div
        className="bg-surface p-4 sm:p-10 rounded-3xl shadow-2xl flex flex-col w-full sm:max-w-xl max-h-[calc(100svh-180px)] sm:max-h-[85svh] border border-outline-variant/20 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center mb-3 sm:mb-8 relative z-10 shrink-0">
          <div>
            <h3 className="font-headline font-bold text-lg sm:text-3xl text-on-surface dark:text-white leading-tight">
              {lang === "id" ? "Tambah Aset" : "Add Asset"}
            </h3>
            <p className="text-[10px] sm:text-sm text-on-surface-variant dark:text-gray-400 font-medium italic opacity-70 mt-0.5 sm:mt-1">
              {stepLabel()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors text-on-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 text-error text-sm font-bold border border-error/20 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

        {step === 0 && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setAcquisitionMode("opening_balance")}
              className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
                acquisitionMode === "opening_balance"
                  ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(53,37,205,0.15)]"
                  : "border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-outline-variant/50"
              }`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${acquisitionMode === "opening_balance" ? "bg-primary text-white" : "bg-outline-variant/20 text-on-surface"}`}>
                <span className="material-symbols-outlined text-lg">account_balance</span>
              </div>
              <div>
                <span className={`font-bold text-base block mb-1 ${acquisitionMode === "opening_balance" ? "text-primary" : "text-on-surface"}`}>
                  {lang === "id" ? "Tambah Saldo yang Dimiliki" : "Add Existing Balance"}
                </span>
                <span className="text-sm font-medium text-on-surface-variant block mb-1.5">
                  {lang === "id"
                    ? "Untuk uang atau aset yang sudah Anda miliki sebelum menggunakan SnapFins."
                    : "For money or assets you already had before using SnapFins."}
                </span>
              </div>
            </button>

            <button
              onClick={() => setAcquisitionMode("via_transaction")}
              className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
                acquisitionMode === "via_transaction"
                  ? "border-secondary bg-secondary/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-outline-variant/50"
              }`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${acquisitionMode === "via_transaction" ? "bg-secondary text-white" : "bg-outline-variant/20 text-on-surface"}`}>
                <span className="material-symbols-outlined text-lg">swap_horiz</span>
              </div>
              <div>
                <span className={`font-bold text-base block mb-1 ${acquisitionMode === "via_transaction" ? "text-secondary" : "text-on-surface"}`}>
                  {lang === "id" ? "Beli / Pindahkan ke Aset" : "Buy / Move Into Asset"}
                </span>
                <span className="text-sm font-medium text-on-surface-variant block mb-1.5">
                  {lang === "id"
                    ? "Catat pembelian aset baru menggunakan dana dari akun kas/bank Anda."
                    : "Record a new asset purchase using funds from your cash/bank account."}
                </span>
                <span className="text-[10px] text-on-surface-variant/50">
                  {lang === "id"
                    ? "✓ Terhubung ke pengeluaran  ·  ✓ Saldo kas otomatis berkurang"
                    : "✓ Connected to spending  ·  ✓ Cash balance auto-reduces"}
                </span>
              </div>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-right-4 duration-500">
            {UI_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name as AssetCategory)}
                className={`p-3 sm:p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  category === cat.name
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-outline-variant/10 bg-surface-container-low hover:border-outline-variant/30"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  category === cat.name ? "bg-primary text-white" : "bg-outline-variant/10 text-on-surface-variant"
                }`}>
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                </div>
                <span className={`text-[11px] sm:text-xs font-black uppercase tracking-widest ${
                  category === cat.name ? "text-primary" : "text-on-surface"
                }`}>
                  {lang === "id" ? cat.labelId : cat.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => setValuationMode("manual")}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                valuationMode === "manual"
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/10 bg-surface-container-low hover:border-outline-variant/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${valuationMode === "manual" ? "bg-primary text-white" : "bg-outline-variant/10"}`}>
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <div>
                <span className="font-bold block text-on-surface">{lang === "id" ? "Update Manual" : "Manual Update"}</span>
                <span className="text-xs text-on-surface-variant">{lang === "id" ? "Anda memasukkan total nilainya sendiri" : "You enter the total value yourself"}</span>
              </div>
            </button>

            {["Crypto", "Stock / ETF", "Gold"].includes(category) ? (
              <button
                onClick={() => setValuationMode("market")}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  valuationMode === "market"
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/10 bg-surface-container-low hover:border-outline-variant/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${valuationMode === "market" ? "bg-primary text-white" : "bg-outline-variant/10"}`}>
                  <span className="material-symbols-outlined">show_chart</span>
                </div>
                <div>
                  <span className="font-bold block text-on-surface">{lang === "id" ? "Harga Pasar (Live)" : "Market Price (Live)"}</span>
                  <span className="text-xs text-on-surface-variant">{lang === "id" ? "Otomatis update sesuai harga real-time" : "Auto-updates with real-time market data"}</span>
                </div>
              </button>
            ) : (
              <button disabled className="flex items-start gap-4 p-5 rounded-2xl border-2 border-outline-variant/10 bg-surface-container-low/50 dark:bg-slate-800/30 opacity-60 cursor-not-allowed text-left relative overflow-hidden">
                <div className="absolute top-3 right-4">
                  <span className="text-[9px] uppercase tracking-widest font-black bg-outline-variant/20 text-on-surface-variant px-2 py-1 rounded-md">Coming Soon</span>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-outline-variant/20 text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">sync</span>
                </div>
                <div className="pr-16">
                  <span className="font-bold text-base block mb-1 text-on-surface-variant">
                    {lang === "id" ? "Sinkronisasi Akun" : "Account Sync"}
                  </span>
                  <span className="text-sm font-medium text-on-surface-variant">
                    {lang === "id" ? "Akan terhubung langsung dengan mutasi." : "Will derive balances automatically from accounts."}
                  </span>
                </div>
              </button>
            )}
          </div>
        )}

        {/* STEP 3: Details */}
        {step === 3 && (
          <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-5">
              {/* Asset Name */}
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                  {lang === "id" ? "Nama Aset" : "Asset Name"} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-semibold placeholder:text-outline/50 transition-colors outline-none"
                  placeholder={lang === "id" ? "Cth. Dana Darurat" : "e.g., Emergency Fund"}
                />
              </div>

              {/* Market fields */}
              {valuationMode === "market" && (
                <div className="grid grid-cols-2 gap-4">
                  {category === "Gold" ? (
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                        Symbol/Ticker <span className="text-error">*</span>
                      </label>
                      <div className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-primary/20 rounded-xl px-4 py-3 text-on-surface font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">verified</span>
                        GC=F (Gold Spot)
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1.5 opacity-80 leading-relaxed italic">
                        {lang === "id" ? "Terhubung ke harga emas dunia secara real-time." : "Connected to real-time global gold spot prices."}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                        Symbol/Ticker <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={symbol}
                        onChange={e => setSymbol(e.target.value)}
                        className="w-full uppercase bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-bold placeholder:text-outline/50 transition-colors outline-none"
                        placeholder={category === "Crypto" ? "BTC" : "NASDAQ:AAPL or IDX:BBCA"}
                        maxLength={20}
                      />
                      {category === "Stock / ETF" && (
                        <p className="text-[10px] text-on-surface-variant mt-1.5 opacity-80 leading-relaxed">
                          Tip: For US stocks use <b>AAPL</b> or <b>NASDAQ:AAPL</b>. <br />
                          For Int'l use Prefix, e.g. <b>IDX:BBCA</b>.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                      {lang === "id" ? "Kuantitas" : "Quantity"} <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-bold tabular-nums placeholder:text-outline/50 transition-colors outline-none"
                      placeholder="0"
                    />
                    {category === "Gold" && (
                      <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-primary">
                            {lang === "id" ? "PENGUBAH GRAM KE ONS" : "GRAM TO OUNCE CONVERTER"}
                          </span>
                          <span className="material-symbols-outlined text-xs text-primary">calculate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={gramWeight}
                            onChange={(e) => setGramWeight(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/30 text-xs font-bold text-on-surface outline-none focus:border-primary"
                            placeholder="Grams (e.g. 10)"
                          />
                          <span className="text-[10px] font-bold text-on-surface-variant shrink-0">
                            → {quantity || "0"} Oz
                          </span>
                        </div>
                        <p className="text-[9px] text-on-surface-variant/70 mt-1">
                          {lang === "id" 
                            ? "* 1 gram ≈ 0.03215 ons troy. Kuantitas akan otomatis diperbarui." 
                            : "* 1 gram ≈ 0.03215 oz troy. Quantity updates automatically."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Manual value */}
              {valuationMode === "manual" && (
                <div className="flex flex-col gap-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                    {lang === "id" ? "Nilai Saat Ini" : "Current Value"} <span className="text-error">*</span>
                  </label>
                  <div className="flex bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus-within:border-primary rounded-xl overflow-hidden transition-colors">
                    <div className="relative shrink-0 flex items-center bg-surface-container-low dark:bg-slate-800/50">
                      <select
                        value={currency}
                        onChange={(e) => {
                          const newCurrency = e.target.value as SupportedCurrency;
                          const raw = manualValue.replace(/[^0-9]/g, "");
                          if (raw) {
                            const locale = newCurrency === "IDR" ? "id-ID" : "en-US";
                            const numericVal = parseInt(raw, 10);
                            const fmt = new Intl.NumberFormat(locale).format(numericVal);
                            setCurrency(newCurrency);
                            setManualValue(fmt);
                          } else {
                            setCurrency(newCurrency);
                          }
                        }}
                        className="bg-transparent text-on-surface text-[11px] font-black pl-4 pr-8 py-3 focus:outline-none cursor-pointer w-24 shrink-0 appearance-none h-full"
                      >
                        {Object.keys(currencySymbols).map((c) => (
                          <option key={c} value={c} className="bg-surface dark:bg-slate-900 text-on-surface">
                            {c}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-2 pointer-events-none text-xs text-on-surface-variant opacity-50">
                        expand_more
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={manualValue}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        if (raw) {
                          const locale = currency === "IDR" ? "id-ID" : "en-US";
                          const numericVal = parseInt(raw, 10);
                          const fmt = new Intl.NumberFormat(locale).format(numericVal);
                          setManualValue(fmt);
                        } else {
                          setManualValue("");
                        }
                      }}
                      className="w-full bg-transparent px-4 py-3 text-on-surface font-black text-lg tabular-nums placeholder:text-outline/40 transition-colors outline-none border-l border-outline-variant/20"
                      placeholder={currency === "IDR" ? "50.000" : "50,000"}
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant/60 font-medium italic">
                    {lang === "id"
                      ? `Saldo aset dalam format ${currencySymbols[currency as SupportedCurrency] || currency}.`
                      : `Asset balance in ${currencySymbols[currency as SupportedCurrency] || currency} format.`}
                  </p>
                </div>
              )}



              {/* via_transaction: source account + purchase amount */}
              {acquisitionMode === "via_transaction" && (
                <div className="pt-2 border-t border-outline-variant/20 space-y-4">
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider">
                    {lang === "id" ? "Detail Pembelian (Opsional)" : "Purchase Details (Optional)"}
                  </p>

                  <div className="flex flex-col gap-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                      {lang === "id" ? "Akun Sumber Dana" : "Source Account"}
                    </label>
                    <select
                      value={sourceAssetId}
                      onChange={e => setSourceAssetId(e.target.value)}
                      className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-secondary rounded-xl px-4 py-3 text-on-surface text-sm transition-colors outline-none cursor-pointer"
                    >
                      <option value="">{lang === "id" ? "— Tidak memotong saldo apapun —" : "— No deduction from any account —"}</option>
                      {cashAssets.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.currency})
                        </option>
                      ))}
                    </select>
                    {cashAssets.length === 0 && (
                      <p className="text-[10px] text-amber-500 mt-1">
                        {lang === "id" ? "Belum ada aset Kas/Bank. Tambahkan dulu sebagai Opening Balance." : "No Cash/Bank assets yet. Add one first as Opening Balance."}
                      </p>
                    )}
                  </div>

                  {sourceAssetId && (
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                        {lang === "id" ? "Jumlah yang Dibayar" : "Amount Paid"}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={purchaseAmount}
                        onChange={e => setPurchaseAmount(e.target.value)}
                        className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-secondary rounded-xl px-4 py-3 text-on-surface font-bold tabular-nums placeholder:text-outline/50 transition-colors outline-none"
                        placeholder={manualValue || "0.00"}
                      />
                      <p className="text-[10px] text-on-surface-variant opacity-70">
                        {lang === "id"
                          ? "Jumlah yang akan dikurangi dari akun sumber. Kosongkan untuk menggunakan nilai aset."
                          : "Amount to deduct from the source account. Leave blank to use the asset value."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-3 sm:mt-10 flex justify-between items-center border-t border-outline-variant/10 pt-3 sm:pt-6 shrink-0 relative z-10">
          {step > 0 ? (
            <button
              onClick={handlePrev}
              disabled={isSubmitting}
              className="text-on-surface-variant font-bold text-xs sm:text-sm hover:text-on-surface transition-colors uppercase tracking-widest px-2 cursor-pointer"
            >
              {lang === "id" ? "KEMBALI" : "BACK"}
            </button>
          ) : <div />}

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="bg-primary/10 text-primary font-bold px-6 sm:px-8 py-3 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              {lang === "id" ? "Lanjut" : "Next"}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary-container text-white font-bold px-6 sm:px-8 py-3 rounded-xl transition-all hover:bg-primary-fixed hover:-translate-y-0.5 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 min-w-[140px] sm:min-w-[160px] cursor-pointer magic-glow-hover text-sm sm:text-base"
            >
              {isSubmitting && (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              )}
              {submitLabel()}
            </button>
          )}
        </div>
      </div>
    </div>
    ),
    document.body
  );
}
