"use client";

import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import { type AssetCategory, ASSET_CATEGORIES, type ValuationMode } from "@/lib/assets";

interface AddAssetModalProps {
  onClose: () => void;
  onSubmit: (assetData: any) => Promise<void>;
}

export default function AddAssetModal({ onClose, onSubmit }: AddAssetModalProps) {
  const { t, lang } = useLang();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<AssetCategory>("Cash");
  const [valuationMode, setValuationMode] = useState<ValuationMode>("manual");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [manualValue, setManualValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");

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
          const m = parseFloat(manualValue || "0");
          if (isNaN(m)) throw new Error("Invalid manual value");
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
        current_value: finalCurrentValue,
        last_price: lastPrice,
        quote_currency: quoteCurrency,
        currency: valuationMode === "market" ? (quoteCurrency || currency) : currency,
        notes,
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-2xl flex flex-col w-full max-w-xl border border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h3 className="font-headline font-bold text-3xl text-on-surface dark:text-white mb-1">
              {lang === "id" ? "Tambah Aset" : "Add Asset"}
            </h3>
            <p className="text-sm text-on-surface-variant dark:text-gray-400 font-medium italic opacity-70">
              {step === 1 ? (lang === "id" ? "Pilih tipe aset Anda" : "Choose your asset type") : 
               step === 2 ? (lang === "id" ? "Bagaimana kami akan menilai ini?" : "How should we value this?") : 
               (lang === "id" ? "Masukkan detail aset" : "Enter asset details")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors text-on-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 text-error text-sm font-bold border border-error/20 flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                {error}
            </div>
        )}

        {/* STEP 1: Category */}
        {step === 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-[50vh] pr-2 pb-2 scrollbar-thin">
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
                        {lang === "id" ? "Input Manual" : "Manual Entry"}
                      </span>
                      <span className="text-sm font-medium text-on-surface-variant">
                          {lang === "id" ? "Anda yang menentukan nilainya secara spesifik." : "You explicitly define the total value."}
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
                            <span className={`font-bold text-base block mb-1 flex items-center gap-2 ${valuationMode === "market" ? "text-secondary" : "text-on-surface"}`}>
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

        {/* STEP 3: Details Input */}
        {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-5">
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
                                       Tip: For US stocks use <b>AAPL</b> or <b>NASDAQ:AAPL</b>. <br/>
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

                    {valuationMode === "manual" && (
                         <div className="flex flex-col gap-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant">
                                {lang === "id" ? "Nilai Saat Ini" : "Current Value"} ({currency}) <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                step="any"
                                value={manualValue}
                                onChange={e => setManualValue(e.target.value)}
                                className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-black text-lg tabular-nums placeholder:text-outline/50 transition-colors outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-10 flex justify-between items-center border-t border-outline-variant/10 pt-6">
            {step > 1 ? (
                <button
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors uppercase tracking-widest px-2"
                >
                    {lang === "id" ? "KEMBALI" : "BACK"}
                </button>
            ) : <div />}

            {step < 3 ? (
                 <button
                 onClick={handleNext}
                 className="bg-primary/10 text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2 cursor-pointer"
               >
                 {lang === "id" ? "Lanjut" : "Next"}
                 <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
               </button>
            ) : (
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-primary-container text-white font-bold px-8 py-3 rounded-xl transition-all hover:bg-primary-fixed hover:-translate-y-0.5 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 min-w-[140px] cursor-pointer magic-glow-hover"
                 >
                    {isSubmitting ? (
                        <>
                             <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                             {lang === "id" ? "Menyimpan..." : "Saving..."}
                        </>
                    ) : (
                        lang === "id" ? "Simpan Aset" : "Save Asset"
                    )}
                 </button>
            )}
        </div>
      </div>
    </div>
  );
}
