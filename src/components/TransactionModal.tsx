"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { type SupportedCurrency, currencySymbols, currencyNames, convert } from "@/lib/currency";

const TRANSACTION_CATEGORIES = [
  { id: "GENERAL", en: "General", idr: "Umum" },
  { id: "FOOD & DRINK", en: "Food & Drink", idr: "Makan & Minum" },
  { id: "TRANSPORTATION", en: "Transportation", idr: "Transportasi" },
  { id: "SHOPPING", en: "Shopping", idr: "Belanja" },
  { id: "ENTERTAINMENT", en: "Entertainment", idr: "Hiburan" },
  { id: "BILLS & UTILITIES", en: "Bills & Utilities", idr: "Tagihan & Utilitas" },
  { id: "HEALTH & PERSONAL CARE", en: "Health & Personal Care", idr: "Kesehatan & Perawatan" },
  { id: "EDUCATION", en: "Education", idr: "Pendidikan" },
  { id: "INVESTMENT", en: "Investment", idr: "Investasi" },
  { id: "OTHERS", en: "Others", idr: "Lainnya" },
];

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: any;
  cashAssets: any[];
  lang: string;
  currency: string;
  t: (key: string) => any;
  formatValue: (val: number, cur: string) => string;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  cashAssets,
  lang,
  currency,
  t,
  formatValue,
}: TransactionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    category: initialData?.category || "GENERAL",
    description: initialData?.description || "",
    type: initialData?.type === "Credit" || initialData?.type === "Income" ? "Income" : "Expense",
    currency: initialData?.currency || currency,
    amount: initialData?.amount ? String(initialData.amount).replace(/[^0-9.,]/g, "") : "",
    source: initialData?.source || "",
    linked_asset_id: initialData?.linked_asset_id || "",
  });
  const [isCurrencySelectorOpen, setIsCurrencySelectorOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  
  const currencySelectorRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // If clicking inside the anchor button/container
      if (currencySelectorRef.current && currencySelectorRef.current.contains(target)) return;
      // If clicking inside the portaled dropdown itself
      if (target.closest('.currency-dropdown-portal')) return;

      setIsCurrencySelectorOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const prevCurrencyRef = useRef<string>(form.currency);

  const parseAmountString = (val: string, cur: string) => {
    if (!val) return 0;
    const isIDR = cur === "IDR";
    let raw = val;
    if (isIDR) {
      // IDR uses '.' for thousands and ',' for decimals
      raw = raw.replace(/\./g, "").replace(/,/g, ".");
    } else {
      // Others use ',' for thousands and '.' for decimals
      raw = raw.replace(/,/g, "");
    }
    return parseFloat(raw) || 0;
  };

  // Auto-convert amount when currency changes
  useEffect(() => {
    if (prevCurrencyRef.current !== form.currency) {
      if (form.amount) {
        const numericVal = parseAmountString(form.amount, prevCurrencyRef.current);
        const converted = convert(numericVal, prevCurrencyRef.current as SupportedCurrency, form.currency as SupportedCurrency);
        const formatted = formatAmountString(String(converted), form.currency);
        setForm(prev => ({ ...prev, amount: formatted }));
      }
      prevCurrencyRef.current = form.currency;
    }
  }, [form.currency]);

  const updateDropdownPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  const getLocaleForCurrency = (cur: string) => {
    switch (cur) {
      case "IDR": return "id-ID";
      case "EUR": return "de-DE";
      case "JPY": return "ja-JP";
      case "CNY": return "zh-CN";
      default: return "en-US";
    }
  };

  const formatAmountString = (val: string, cur: string) => {
    if (!val) return "";
    const locale = getLocaleForCurrency(cur);
    const isIDR = cur === "IDR";
    
    // Remove all non-numeric characters except the decimal separator
    // For IDR/EUR usually ',', for USD/others usually '.'
    const raw = isIDR 
      ? val.replace(/[^0-9,]/g, "") 
      : val.replace(/[^0-9.]/g, "");

    if (!raw) return "";

    const parts = isIDR ? raw.split(",") : raw.split(".");
    
    // Format the integer part
    const intPart = parseInt(parts[0].replace(/\D/g, ""), 10);
    if (isNaN(intPart)) return "";
    
    let formatted = new Intl.NumberFormat(locale).format(intPart);
    
    // Add decimal part back if it exists
    if (parts.length > 1) {
      formatted += (isIDR ? "," : ".") + parts[1].slice(0, 2);
    } else if (raw.endsWith(isIDR ? "," : ".")) {
      formatted += (isIDR ? "," : ".");
    }
    
    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (!form.description) throw new Error(lang === "id" ? "Deskripsi wajib diisi" : "Description is required");
      if (!form.amount) throw new Error(lang === "id" ? "Jumlah wajib diisi" : "Amount is required");
      if (!form.linked_asset_id) throw new Error(lang === "id" ? "Pilih akun pembayaran/penerima" : "Please select a payment/receiving account");
      
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const isIDR = form.currency === "IDR";

  return createPortal(
    (
      <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-md px-3 pt-6 pb-32 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
        <div 
          className="bg-surface dark:bg-slate-900 p-4 sm:p-10 rounded-3xl shadow-2xl flex flex-col w-full sm:max-w-xl max-h-[calc(100svh-180px)] sm:max-h-[85svh] border border-white/10 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Modal Header */}
          <div className="flex justify-between items-center mb-3 sm:mb-8 relative z-10 shrink-0">
            <div>
              <h3 className="font-headline font-bold text-lg sm:text-2xl text-on-surface dark:text-white">
                {initialData ? t("editTransaction") : t("manualEntryTitle")}
              </h3>
              <p className="text-[10px] sm:text-sm text-on-surface-variant dark:text-gray-400 font-medium italic opacity-70">
                {lang === "id" ? "Catat laporan arus kas Anda" : "Record your cashflow entry"}
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
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-error/10 text-error text-xs font-bold border border-error/20 flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {/* Transaction Type Toggles */}
            <div className="flex bg-surface-container-low dark:bg-slate-800 p-1.5 rounded-xl border border-outline-variant/10">
              <button
                onClick={() => setForm({ ...form, type: "Expense" })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${form.type === "Expense" ? "bg-error text-white shadow-lg shadow-error/20" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                <span className="material-symbols-outlined text-sm">remove_circle</span>
                {lang === "id" ? "PENGELUARAN" : "EXPENSE"}
              </button>
              <button
                onClick={() => setForm({ ...form, type: "Income" })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${form.type === "Income" ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                {lang === "id" ? "PENDAPATAN" : "INCOME"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">{t("colDate")}</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-semibold outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">{t("colCategory")}</label>
                <div className="flex bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus-within:border-primary rounded-xl overflow-hidden transition-colors">
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })}
                    className="w-full bg-transparent px-4 py-3 text-on-surface font-semibold outline-none placeholder:text-outline-variant/30"
                    placeholder={lang === "id" ? "Misal: MAKANAN" : "e.g., FOOD"}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">{lang === "id" ? "Deskripsi" : "Description"}</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-semibold placeholder:text-outline-variant transition-colors outline-none"
                placeholder={lang === "id" ? "Cth. Makan Siang" : "e.g., Lunch at Cafe"}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">{t("colAmount")}</label>
              <div className="flex bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus-within:border-primary rounded-xl overflow-visible transition-colors">
                <div className="relative" ref={currencySelectorRef}>
                  <button
                    type="button"
                    onClick={() => {
                      updateDropdownPos(currencySelectorRef);
                      setIsCurrencySelectorOpen(!isCurrencySelectorOpen);
                    }}
                    className="flex items-center gap-2 h-full px-4 py-3 border-r border-outline-variant/20 hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    <span className="text-on-surface text-xs font-black">{form.currency}</span>
                    <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isCurrencySelectorOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>

                  {isCurrencySelectorOpen && createPortal(
                    <div 
                      style={{ top: `${dropdownPos.top + 8}px`, left: `${dropdownPos.left}px` }}
                      className="fixed z-[120] w-48 bg-surface dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-200 currency-dropdown-portal"
                    >
                      <div className="max-h-60 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
                        {Object.keys(currencySymbols).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, currency: c as SupportedCurrency });
                              setIsCurrencySelectorOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-primary/10 transition-colors group ${form.currency === c ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex flex-col">
                              <span className={`text-[11px] font-black tracking-widest ${form.currency === c ? 'text-primary' : 'text-on-surface'}`}>{c}</span>
                              <span className="text-[9px] text-on-surface-variant font-medium opacity-60">{(currencyNames as any)[c]}</span>
                            </div>
                            <span className={`text-xs font-bold ${form.currency === c ? 'text-primary' : 'text-on-surface-variant/40'}`}>
                              {currencySymbols[c as SupportedCurrency]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
                <input
                  type="text"
                  value={form.amount}
                  onChange={(e) => {
                    const fmt = formatAmountString(e.target.value, form.currency);
                    setForm({ ...form, amount: fmt });
                  }}
                  className="w-full bg-transparent px-4 py-3 text-on-surface font-black text-xl tabular-nums outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1">
                {lang === "id" ? "Bayar dari / Terima ke Akun" : "Pay via / Receive into Account"} <span className="text-error font-black">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.linked_asset_id}
                  onChange={(e) => setForm({ ...form, linked_asset_id: e.target.value })}
                  className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-primary rounded-xl px-4 py-3 text-on-surface font-bold text-sm outline-none appearance-none cursor-pointer"
                >
                  <option value="">{lang === "id" ? "— Pilih Akun —" : "— Select Account —"}</option>
                  {cashAssets.map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-40">
                  <span className="material-symbols-outlined text-lg">expand_more</span>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant font-medium italic opacity-60 ml-1">
                {lang === "id" ? "*Wajib diisi. Saldo akun akan terupdate secara otomatis." : "*Required. Account balances will update automatically."}
              </p>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="mt-6 sm:mt-10 flex border-t border-outline-variant/10 pt-4 sm:pt-6 shrink-0 relative z-10">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full ${form.type === "Income" ? "bg-secondary shadow-secondary/20" : "bg-primary shadow-primary/20"} text-white font-black py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined">{initialData ? "save" : "add_task"}</span>
                  {initialData ? (lang === "id" ? "SIMPAN PERUBAHAN" : "SAVE CHANGES") : (lang === "id" ? "TAMBAH TRANSAKSI" : "ADD TRANSACTION")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    ),
    document.body
  );
}
