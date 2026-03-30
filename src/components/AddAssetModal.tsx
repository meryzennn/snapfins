"use client";

import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { type AssetCategory, ASSET_CATEGORIES, type ValuationMode } from "@/lib/assets";
import { currencySymbols, type SupportedCurrency } from "@/lib/currency";
import { useScrollLock } from "@/hooks/useScrollLock";

type AcquisitionMode = "opening_balance" | "via_transaction";

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
  const [notes, setNotes] = useState("");

  // Step 3 extra: via_transaction source
  const [sourceAssetId, setSourceAssetId] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");

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
        notes,
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

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col w-full max-w-xl max-h-[calc(100svh-2rem)] border border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 relative z-10 shrink-0">
          <div>
            <h3 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface dark:text-white mb-1">
              {lang === "id" ? "Tambah Aset" : "Add Asset"}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant dark:text-gray-400 font-medium italic opacity-70">
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
        <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 text-error text-sm font-bold border border-error/20 flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

        {step === 0 && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">

            {/* Decision guide */}
            <div className="text-[11px] text-on-surface-variant/60 bg-surface-container-low/60 rounded-xl px-4 py-3 leading-relaxed border border-outline-variant/10">
              {lang === "id" ? (
                <>
                  <span className="font-bold text-on-surface-variant">Panduan cepat: </span>
                  Sudah punya uang/aset? → <b>Tambah Saldo yang Dimiliki</b>. Beli aset baru pakai uang yang ada? → <b>Beli / Pindahkan ke Aset</b>. Mau catat gaji atau pengeluaran? → gunakan <b>Manual Entry</b> di halaman Beranda.
                </>
              ) : (
                <>
                  <span className="font-bold text-on-surface-variant">Quick guide: </span>
                  Already have money or assets? → <b>Add Existing Balance</b>. Buying a new asset with existing cash? → <b>Buy / Move Into Asset</b>. Recording salary or bills? → use <b>Manual Entry</b> on the Dashboard.
                </>
              )}
            </div>

            {/* Option A: Add Existing Balance */}
            <button
              onClick={() => setAcquisitionMode("opening_balance")}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
                acquisitionMode === "opening_balance"
                  ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(53,37,205,0.15)]"
                  : "border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-outline-variant/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${acquisitionMode === "opening_balance" ? "bg-primary text-white" : "bg-outline-variant/20 text-on-surface"}`}>
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
                <span className="text-[10px] text-on-surface-variant/50">
                  {lang === "id"
                    ? "✓ Menambah Total Aset & Net Worth  ·  ✗ Bukan pendapatan bulanan"
                    : "✓ Increases Total Assets & Net Worth  ·  ✗ Not monthly income"}
                </span>
                {acquisitionMode === "opening_balance" && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-[10px]">check</span>
                    {lang === "id" ? "Disarankan untuk mulai" : "Recommended to start"}
                  </span>
                )}
              </div>
            </button>

            {/* Option B: Buy / Move Into Asset */}
            <button
              onClick={() => setAcquisitionMode("via_transaction")}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
                acquisitionMode === "via_transaction"
                  ? "border-secondary bg-secondary/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-outline-variant/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${acquisitionMode === "via_transaction" ? "bg-secondary text-white" : "bg-outline-variant/20 text-on-surface"}`}>
                <span className="material-symbols-outlined text-lg">swap_horiz</span>
              </div>
              <div>
                <span className={`font-bold text-base block mb-1 ${acquisitionMode === "via_transaction" ? "text-secondary" : "text-on-surface"}`}>
                  {lang === "id" ? "Beli / Pindahkan ke Aset" : "Buy / Move Into Asset"}
                </span>
                <span className="text-sm font-medium text-on-surface-variant block mb-1.5">
                  {lang === "id"
                    ? "Gunakan ini saat membeli saham, kripto, atau aset lain menggunakan uang yang ada di akun bank/kas Anda."
                    : "Use this when you buy crypto, stocks, or other assets using money from an existing cash/bank account."}
                </span>
                <span className="text-[10px] text-on-surface-variant/50">
                  {lang === "id"
                    ? "✓ Memotong saldo akun asal  ·  ✗ Bukan pendapatan  ·  ✗ Net worth tidak berubah banyak"
                    : "✓ Deducts source account  ·  ✗ Not income  ·  ✗ Net worth stays roughly the same"}
                </span>
              </div>
            </button>

            <p className="text-[11px] text-on-surface-variant/40 text-center pt-1 mb-4">
              {lang === "id"
                ? "💡 Pendapatan/pengeluaran rutin? Pakai Manual Entry di halaman Beranda."
                : "💡 Got salary or bills? Use Manual Entry on the Dashboard instead."}
            </p>
          </div>
        )}

        {/* STEP 1: Category */}
        {step === 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 duration-500 pb-4">
            {ASSET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  category === cat
                    ? "border-primary bg-primary/5 text-primary shadow-[0_0_15px_rgba(53,37,205,0.15)]"
                    : "border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-outline-variant/50 text-on-surface"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${category === cat ? "bg-primary/10" : "bg-outline-variant/10"}`}>
                  <span className="material-symbols-outlined text-2xl">
                    {cat === "Cash" ? "payments" : cat === "Bank" ? "account_balance" : cat === "E-wallet" ? "account_balance_wallet" : cat === "Crypto" ? "currency_bitcoin" : cat === "Stock / ETF" ? "monitoring" : cat === "Gold" ? "diamond" : cat === "Property" ? "real_estate_agent" : cat === "Vehicle" ? "directions_car" : "category"}
                  </span>
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-center">{cat}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: Valuation Mode */}
        {step === 2 && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setValuationMode("manual")}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
                valuationMode === "manual"
                  ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(53,37,205,0.15)]"
                  : "border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-outline-variant/50"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${valuationMode === "manual" ? "bg-primary text-white" : "bg-outline-variant/20 text-on-surface"}`}>
                <span className="material-symbols-outlined text-lg">edit_square</span>
              </div>
              <div>
                <span className={`font-bold text-base block mb-1 ${valuationMode === "manual" ? "text-primary" : "text-on-surface"}`}>
                  {lang === "id" ? "Input Manual" : "Manual Value"}
                </span>
                <span className="text-sm font-medium text-on-surface-variant">
                  {lang === "id" ? "Anda yang menentukan nilainya secara spesifik." : "You explicitly define the total current value."}
                </span>
              </div>
            </button>

            {(["Crypto", "Stock / ETF"].includes(category)) && (
              <button
                onClick={() => setValuationMode("market")}
                className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
                  valuationMode === "market"
                    ? "border-secondary bg-secondary/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-outline-variant/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${valuationMode === "market" ? "bg-secondary text-white" : "bg-outline-variant/20 text-on-surface"}`}>
                  <span className="material-symbols-outlined text-lg">query_stats</span>
                </div>
                <div>
                  <span className={`font-bold text-base block mb-1 ${valuationMode === "market" ? "text-secondary" : "text-on-surface"}`}>
                    {lang === "id" ? "Harga Pasar Otomatis" : "Auto Market Price"}
                  </span>
                  <span className="text-sm font-medium text-on-surface-variant">
                    {lang === "id" ? "Nilai dihitung otomatis via Harga Pasar × Kuantitas." : "Value automatically derived from Live Market Price × Quantity."}
                  </span>
                </div>
              </button>
            )}

            {(["Bank", "E-wallet", "Cash"].includes(category)) && (
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
        <div className="mt-6 sm:mt-10 flex justify-between items-center border-t border-outline-variant/10 pt-6 shrink-0 relative z-10">
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
  );
}
