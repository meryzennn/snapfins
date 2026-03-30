"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/hooks/useLang";
import { type AssetCategory, ASSET_CATEGORIES, type ValuationMode } from "@/lib/assets";
import { currencySymbols, type SupportedCurrency } from "@/lib/currency";
import { useScrollLock } from "@/hooks/useScrollLock";

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

interface EditAssetModalProps {
  initialData: any;
  onClose: () => void;
  onSubmit: (assetData: any) => Promise<void>;
}

export default function EditAssetModal({ initialData, onClose, onSubmit }: EditAssetModalProps) {
  const { t, lang } = useLang();
  useScrollLock(true);
  const [step, setStep] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const initialCurrency = (initialData.currency || "USD") as SupportedCurrency;
  
  // Format initial manual value for the text input
  const formattedInitialValue = useMemo(() => {
    // raw values from DB
    const val = initialData.manual_value ?? (initialData.valuation_mode === "manual" ? initialData.current_value : null);
    if (val === null || val === undefined || val === "") return "";
    
    const num = Number(val);
    if (isNaN(num)) return "";

    const locale = initialCurrency === "IDR" ? "id-ID" : "en-US";
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: initialCurrency === "IDR" ? 0 : 2
    }).format(num);
  }, [initialData.manual_value, initialData.current_value, initialData.valuation_mode, initialCurrency]);

  const [category, setCategory] = useState<AssetCategory>(initialData.category as AssetCategory || "Cash");
  const [valuationMode, setValuationMode] = useState<ValuationMode>(initialData.valuation_mode as ValuationMode || "manual");
  const [name, setName] = useState(initialData.name || "");
  const [symbol, setSymbol] = useState(initialData.symbol || "");
  const [quantity, setQuantity] = useState(initialData.quantity ? String(initialData.quantity) : "");
  const [manualValue, setManualValue] = useState(formattedInitialValue);
  const [currency, setCurrency] = useState<SupportedCurrency>(initialCurrency);
  const [notes, setNotes] = useState(initialData.notes || "");
  const [gramWeight, setGramWeight] = useState("");

  // Gram to Ounce Converter for Gold
  useEffect(() => {
    if (category === "Gold" && gramWeight) {
      const g = parseFloat(gramWeight);
      if (!isNaN(g)) {
        const oz = g * 0.0321507;
        setQuantity(oz.toFixed(3));
      }
    }
  }, [gramWeight, category]);

  // Auto-set symbol for Gold if shifted to market mode
  useEffect(() => {
    if (category === "Gold" && valuationMode === "market" && !symbol) {
      setSymbol("GC=F");
    }
  }, [category, valuationMode, symbol]);

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
          // Parse localized number (handle dots/commas based on currency)
          // For IDR: 50.000 -> 50000
          // For USD: 50,000.50 -> 50000.5
          let raw = manualValue;
          if (currency === "IDR") {
            raw = raw.replace(/\./g, "").replace(/,/g, "."); 
          } else {
            raw = raw.replace(/,/g, ""); 
          }
          const m = parseFloat(raw);
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
        base_symbol: baseSymbol || initialData.base_symbol,
        provider_symbol: providerSymbol || initialData.provider_symbol,
        exchange: exchange || initialData.exchange,
        quantity: finalQuantity,
        manual_value: finalManualValue,
        current_value: valuationMode === "market" ? finalCurrentValue : finalManualValue,
        last_price: lastPrice || initialData.last_price,
        quote_currency: quoteCurrency || initialData.quote_currency,
        currency: valuationMode === "market" ? (quoteCurrency || initialData.currency) : currency,
        notes,
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    (
      <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 sm:pt-4 overflow-y-auto"
           onClick={onClose}>
      <div 
        className="bg-surface dark:bg-slate-900 p-4 sm:p-10 rounded-3xl shadow-2xl flex flex-col w-full sm:max-w-xl max-h-[calc(100svh-180px)] sm:max-h-[85svh] border border-white/10 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex justify-between items-center mb-3 sm:mb-8 relative z-10 shrink-0">
          <div>
             <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
                <span className="material-symbols-outlined text-primary bg-primary/10 p-1 sm:p-2 rounded-xl text-lg sm:text-2xl">edit</span>
                <h3 className="font-headline font-bold text-lg sm:text-2xl text-on-surface dark:text-white">
                {lang === "id" ? "Edit Aset" : "Edit Asset"}
                </h3>
             </div>
            <p className="text-[10px] sm:text-sm text-on-surface-variant dark:text-gray-400 font-medium italic opacity-70">
              {step === 1 ? (lang === "id" ? "Pilih tipe aset Anda" : "Choose your asset type") : 
               step === 2 ? (lang === "id" ? "Bagaimana kami akan menilai ini?" : "How should we value this?") : 
               (lang === "id" ? "Ubah detail aset" : "Modify asset details")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors text-on-surface-variant cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>


        <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent">
          {error && (
              <div className="mb-6 p-4 rounded-xl bg-error/10 text-error text-sm font-bold border border-error/20 flex items-center gap-3">
                  <span className="material-symbols-outlined">error</span>
                  {error}
              </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in slide-in-from-right-4 duration-500 overflow-y-auto pb-2 scrollbar-thin">
              {UI_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name as AssetCategory)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                      category === cat.name 
                      ? "border-primary bg-primary/5 text-primary shadow-[0_0_15px_rgba(53,37,205,0.15)]" 
                      : "border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-outline-variant/50 text-on-surface"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${category === cat.name ? "bg-primary/10" : "bg-outline-variant/10"}`}>
                      <span className="material-symbols-outlined text-2xl">
                      {cat.icon}
                      </span>
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider text-center">{lang === "id" ? cat.labelId : cat.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-500">
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

                  {["Crypto", "Stock"].includes(category) ? (
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

          {step === 3 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                  <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">
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
                      
                      {valuationMode === "market" ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">
                                      {category === "Gold" ? "SYMBOL" : "TICKER / SYMBOL"} <span className="text-error">*</span>
                                  </label>
                                  {category === "Gold" ? (
                                    <div className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-primary/20 rounded-xl px-4 py-3 text-on-surface font-black flex items-center gap-2">
                                      <span className="material-symbols-outlined text-sm text-primary">verified</span>
                                      GC=F (Gold Spot)
                                    </div>
                                  ) : (
                                    <input
                                        type="text"
                                        required
                                        value={symbol}
                                        onChange={e => setSymbol(e.target.value)}
                                        className="w-full uppercase bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-bold placeholder:text-outline/50 transition-colors outline-none"
                                        placeholder={category === "Crypto" ? "BTC" : "NASDAQ:AAPL"}
                                        maxLength={20}
                                    />
                                  )}
                              </div>

                              <div className="flex flex-col gap-1.5">
                                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">
                                      {category === "Gold" ? (lang === "id" ? "BERAT (ONS)" : "WEIGHT (OZ)") : (lang === "id" ? "KUANTITAS" : "QUANTITY")} <span className="text-error">*</span>
                                  </label>
                                  <input
                                      type="number"
                                      required
                                      step="any"
                                      value={quantity}
                                      onChange={e => setQuantity(e.target.value)}
                                      className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-bold tabular-nums placeholder:text-outline/40 transition-colors outline-none"
                                      placeholder="0"
                                  />
                                  {category === "Gold" && (
                                    <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-primary">
                                          {lang === "id" ? "KALKULATOR GRAM KE ONS" : "GRAM TO OUNCE CONVERTER"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="number"
                                          value={gramWeight}
                                          onChange={(e) => setGramWeight(e.target.value)}
                                          className="w-full bg-transparent border-b border-primary/30 text-xs font-bold text-on-surface outline-none focus:border-primary"
                                          placeholder={lang === "id" ? "Gram (Cth. 10)" : "Grams (e.g. 10)"}
                                        />
                                        <span className="text-[10px] font-bold text-on-surface-variant shrink-0">
                                          → {quantity || "0"} Oz
                                        </span>
                                      </div>
                                    </div>
                                  )}
                              </div>
                          </div>
                      ) : (
                           <div className="flex flex-col gap-1.5">
                              <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">
                                  {["Cash", "Bank", "E-wallet"].includes(category) 
                                    ? (lang === "id" ? "SALDO SAAT INI" : "CURRENT BALANCE")
                                    : (lang === "id" ? "NILAI SAAT INI" : "CURRENT VALUE")} <span className="text-error">*</span>
                              </label>
                              <div className="flex bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus-within:border-primary rounded-xl overflow-hidden transition-colors">
                                  <div className="relative shrink-0 flex items-center bg-surface-container-low dark:bg-slate-800/50">
                                      <select
                                          value={currency}
                                          onChange={(e) => {
                                              setCurrency(e.target.value as SupportedCurrency);
                                          }}
                                          className="bg-transparent text-on-surface text-[10px] font-black pl-3 pr-6 py-2.5 focus:outline-none cursor-pointer w-20 shrink-0 appearance-none h-full"
                                      >
                                          {Object.keys(currencySymbols).map((c) => (
                                              <option key={c} value={c} className="bg-surface dark:bg-slate-900 text-on-surface">
                                                  {c}
                                              </option>
                                          ))}
                                      </select>
                                      <span className="material-symbols-outlined absolute right-1.5 pointer-events-none text-[10px] text-on-surface-variant opacity-50">
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
                           </div>
                      )}

                      {/* 3. Notes */}
                      <div className="flex flex-col gap-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">
                          {lang === "id" ? "Catatan (Opsional)" : "Notes (Optional)"}
                        </label>
                        <textarea
                          className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-sm font-semibold max-h-24 scrollbar-thin"
                          placeholder={lang === "id" ? "Contoh: Jangka panjang" : "e.g. Long term hold"}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                  </div>
              </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-4 sm:mt-10 flex justify-between items-center border-t border-outline-variant/10 pt-4 sm:pt-6 shrink-0 relative z-10">
                <button
                  onClick={handlePrev}
                  disabled={step === 3 || isSubmitting}
                  className={`text-on-surface-variant font-bold text-xs sm:text-sm hover:text-on-surface transition-colors uppercase tracking-widest px-2 cursor-pointer ${step === 3 ? "opacity-0 pointer-events-none" : ""}`}
                >
                  {lang === "id" ? "KEMBALI" : "BACK"}
                </button>

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
                        lang === "id" ? "Simpan Perubahan" : "Save Changes"
                    )}
                 </button>
        </div>
      </div>
    </div>
    ),
    document.body
  );
}
