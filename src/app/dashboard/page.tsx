"use client"

import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

const assignColor = (category: string) => {
  const map: Record<string, string> = {
    DINING: "purple", GROCERY: "emerald", TECH: "blue", RETAIL: "rose", TRANSPORT: "amber", HEALTH: "rose", HOME: "slate", SALARY: "emerald"
  };
  return map[category] || "slate";
}

const getCategoryStyle = (color: string) => {
  const styles: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    slate: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  };
  return styles[color] || styles.slate;
};

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Manual Entry States
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualForm, setManualForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'GENERAL',
    description: '',
    type: 'Debit',
    currency: 'Rp',
    amount: '',
    source: ''
  });

  const toggleTheme = () => {
    const isDark = theme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.documentElement.classList.add(isDark ? 'transition-to-light' : 'transition-to-dark');
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('transition-to-light', 'transition-to-dark');
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const calculateTotals = () => {
    let income = 0;
    let expense = 0;

    transactions.forEach(tx => {
      // Parse amount strings like "$ 25,000.00" or "Rp 113.500" into numeric values
      let numStr = tx.amount;
      if (numStr.includes('Rp')) {
        numStr = numStr.replace(/\./g, ''); // Fix: IDR dots are thousands separators, not decimals
      } else {
        numStr = numStr.replace(/,/g, '');  // Fix: USD commas are thousands separators
      }
      
      const val = parseFloat(numStr.replace(/[^0-9.-]+/g, "")) || 0;
      if (tx.type === 'Credit') {
        income += val;
      } else if (tx.type === 'Debit') {
        expense += val;
      }
      // Wait: Investment doesn't count towards Expense or Income directly
    });

    // Add a base starting balance so MVP net worth isn't negative for new users
    const baseNetWorth = 10000;
    const netWorth = baseNetWorth + income - expense;

    const format = (num: number) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    };

    return { 
      income: format(income), 
      expense: format(expense), 
      netWorth: format(netWorth) 
    };
  };

  const totals = calculateTotals();

  const fetchTransactions = async () => {
    setIsLoadingTx(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData?.user) {
      if (userData.user.user_metadata?.avatar_url) {
        setUserAvatar(userData.user.user_metadata.avatar_url);
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        // Map data from DB format to our UI format (is_ai -> isAi)
        const formattedData = data.map(tx => ({ ...tx, isAi: tx.is_ai }));
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
        amount: amountStr,
        source: manualForm.source || 'Manual Entry',
        is_ai: false
      };

      const { data: insertedData, error } = await supabase.from('transactions').insert([newTx]).select();

      if (error) throw error;
      
      if (insertedData) {
        const mappedTx = { ...insertedData[0], isAi: insertedData[0].is_ai };
        setTransactions(prev => [mappedTx, ...prev]);
        setShowManualEntry(false);
        setManualForm({ date: new Date().toISOString().split('T')[0], category: 'GENERAL', description: '', type: 'Debit', currency: 'Rp', amount: '', source: '' });
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
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", lang);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.transaction) {
        // Validation check for non-receipts
        if (data.transaction.isValidReceipt === false) {
          setScanError(data.transaction.errorReason || t('tryAgainWithDifferent'));
          return;
        }

        const newTx = {
          date: data.transaction.date,
          category: data.transaction.category || "GENERAL",
          color: assignColor(data.transaction.category || "GENERAL"),
          description: data.transaction.description,
          type: "Debit",
          amount: data.transaction.amount,
          source: "Gemini Vision",
          is_ai: true
        };
        
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const { data: insertedData, error } = await supabase.from('transactions').insert([{ ...newTx, user_id: userData.user.id }]).select();
          if (!error && insertedData) {
            const mappedTx = { ...insertedData[0], isAi: insertedData[0].is_ai };
            setTransactions(prev => [mappedTx, ...prev]);
          } else {
            setScanError(t('scanErrorHint'));
          }
        }
      } else {
        setScanError(data.error || t('scanErrorHint'));
      }
    } catch (error) {
      console.error(error);
      setScanError(t('tryAgainWithDifferent'));
    } finally {
      setIsScanning(false);
      // Reset input value to allow scanning same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col w-full max-w-lg border border-outline-variant/20 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-2xl text-on-surface">{t('manualEntryTitle')}</h3>
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
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('labelDate')}</label>
                  <input type="date" required value={manualForm.date} onChange={e => setManualForm({...manualForm, date: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('labelAmount')}</label>
                  <div className="flex bg-surface-container-low border border-outline-variant/30 rounded-xl focus-within:border-primary transition-colors overflow-hidden">
                    <select 
                      value={manualForm.currency} 
                      onChange={e => {
                        const newCurrency = e.target.value;
                        const raw = manualForm.amount.replace(/\D/g, '');
                        if (raw) {
                          const locale = newCurrency === 'Rp' ? 'id-ID' : 'en-US';
                          const fmt = new Intl.NumberFormat(locale).format(parseInt(raw, 10));
                          setManualForm({...manualForm, currency: newCurrency, amount: fmt});
                        } else {
                          setManualForm({...manualForm, currency: newCurrency});
                        }
                      }} 
                      className="bg-transparent text-on-surface text-sm font-bold pl-3 pr-1 py-3 focus:outline-none border-r border-outline-variant/30 cursor-pointer"
                    >
                      <option value="Rp" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Rp (IDR)</option>
                      <option value="$" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">$ (USD)</option>
                      <option value="€" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">€ (EUR)</option>
                      <option value="£" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">£ (GBP)</option>
                      <option value="¥" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">¥ (JPY)</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder={manualForm.currency === 'Rp' ? "50.000" : "50,000"} 
                      required 
                      value={manualForm.amount} 
                      onChange={e => {
                        const numericStr = e.target.value.replace(/\D/g, '');
                        if (!numericStr) {
                          setManualForm({...manualForm, amount: ""});
                        } else {
                          const locale = manualForm.currency === 'Rp' ? 'id-ID' : 'en-US';
                          setManualForm({...manualForm, amount: new Intl.NumberFormat(locale).format(parseInt(numericStr, 10))});
                        }
                      }} 
                      className="w-full bg-transparent px-3 py-3 text-on-surface text-sm focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('labelDescription')}</label>
                <input type="text" placeholder={t('placeholderDescription')} required value={manualForm.description} onChange={e => setManualForm({...manualForm, description: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('labelCategory')}</label>
                  <input type="text" placeholder={t('placeholderCategory')} required value={manualForm.category} onChange={e => setManualForm({...manualForm, category: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('labelType')}</label>
                  <select value={manualForm.type} onChange={e => setManualForm({...manualForm, type: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors">
                    <option value="Debit" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Debit</option>
                    <option value="Credit" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Credit</option>
                    <option value="Investment" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Investment</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">{t('labelSource')}</label>
                <input type="text" placeholder={t('placeholderSource')} value={manualForm.source} onChange={e => setManualForm({...manualForm, source: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-container text-white px-6 py-4 rounded-xl font-bold transition-all hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-70 disabled:pointer-events-none disabled:scale-100 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                     <><span className="material-symbols-outlined animate-spin text-sm">sync</span> {t('saving')}</>
                  ) : t('saveTransaction')}
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
              <span className="material-symbols-outlined text-red-500 text-4xl">error</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">{t('scanErrorTitle')}</h3>
            <p className="text-sm text-center text-on-surface-variant leading-relaxed mb-8">{scanError}</p>
            <button 
              onClick={() => setScanError(null)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm active:scale-95"
            >
              {t('tryAgain')}
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay for Scanner */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-primary/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">{t('analyzingReceipt')}</h3>
            <p className="text-sm text-center text-on-surface-variant">{t('analyzingHint')}</p>
          </div>
        </div>
      )}

      {/* TopNavBar Shared Component */}
      <nav className="sticky top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 font-headline">SnapFins</span>
            <div className="hidden md:flex items-center gap-6 font-manrope font-semibold tracking-tight text-sm">
              <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">{t('navDashboard')}</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">{t('navAsset')}</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">{t('navAnalytics')}</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">{t('navSettings')}</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            
            <div className="w-8 h-8 flex items-center justify-center">
              {mounted && (
                <span 
                  className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              )}
            </div>

            <div className="flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5 ml-2">
              <button 
                onClick={() => setLang('en')}
                className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >EN</button>
              <button 
                onClick={() => setLang('id')}
                className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === 'id' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >ID</button>
            </div>
            
            <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-4 ml-4">
              <img 
                alt="User profile" 
                className="w-8 h-8 rounded-full border border-outline-variant object-cover" 
                src={userAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuBE0e9w4xGMbdwDYXMaDw5uETVXAmCsb2dhI8hfIpOO3BPWgMaL0JjQzcpHBM7CT9NYI1ldia3F2nXUV5w3qb3mMDQz-OTK-jeHMEnz039x-WujlEaGvN3up-hQu3sr7A0G-nmdIg9113_eJSO-g9Mpnz1eq1fYd6INd1L0Flb-PXWLfhqXoh5e8wARW0avQOljBQFUftRfAqKCQ6Fw-PDIi6C3txyigy8dE7NZEcNbsgG6NlCq8YmU7KjLMJ2ODW7FZcU7PiQ025U"} 
              />
              <button onClick={handleLogout} className="text-xs font-bold text-error bg-error/10 hover:bg-error/20 px-3 py-1.5 rounded-md transition-colors">{t('logout')}</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">{t('financialOverview')}</h1>
            <p className="text-on-surface-variant font-medium tracking-wide text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              {t('liveStatus')}
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
            <button onClick={() => setShowManualEntry(true)} className="hidden md:flex px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all active:opacity-80 items-center gap-2 cursor-pointer">
              {t('manualEntry')}
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-[0_4px_15px_rgba(53,37,205,0.3)] hover:shadow-[0_8px_25px_rgba(53,37,205,0.4)] transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg focus:outline-none" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              {t('scanReceipt')}
            </button>
          </div>
        </header>

        {/* Summary Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-surface-container-low/40 dark:to-slate-800/40">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1">{t('totalNetWorth')}</p>
                <h2 className="text-4xl font-black font-headline tracking-tighter text-on-surface">{totals.netWorth}</h2>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-secondary bg-secondary-container/30 w-fit px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              {t('fromLastMonth')}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-secondary-container/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="relative flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1">{t('monthlyIncome')}</p>
                <h2 className="text-4xl font-black font-headline tracking-tighter text-secondary">{totals.income}</h2>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-on-surface-variant bg-surface-container-low dark:bg-slate-800 w-fit px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-sm">event_repeat</span>
              {t('nextPayout')}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-error-container/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors"></div>
            <div className="relative flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1">{t('monthlyExpense')}</p>
                <h2 className="text-4xl font-black font-headline tracking-tighter text-error">{totals.expense}</h2>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-error text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>credit_score</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-error flex border border-error/10 bg-error-container/30 dark:bg-error-container/10 w-fit px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-sm">warning</span>
              {t('overBudget')}
            </div>
          </div>
        </section>

        {/* Main Data Table Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">{t('recentLedger')}</h3>
            <div className="flex items-center gap-2">
              <div className="flex bg-surface-container-low dark:bg-slate-800 p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-bold bg-surface-container-lowest dark:bg-slate-700 rounded shadow-sm text-foreground">Grid</button>
                <button className="px-3 py-1 text-xs font-bold text-on-surface-variant hover:text-on-surface">Pivot</button>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">filter_list</span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg shadow-sm border border-outline-variant/20">
            <table className="w-full excel-grid bg-surface-container-lowest dark:bg-slate-900/50 text-xs font-body tracking-tight">
              <thead className="bg-slate-100/80 dark:bg-slate-800 text-on-surface-variant uppercase font-bold text-[10px] tracking-widest">
                <tr>
                  <th className="px-3 py-2 text-left w-24">{t('colDate')}</th>
                  <th className="px-3 py-2 text-left w-32">{t('colCategory')}</th>
                  <th className="px-3 py-2 text-left">{t('colDescription')}</th>
                  <th className="px-3 py-2 text-left w-24">{t('colType')}</th>
                  <th className="px-3 py-2 text-right w-32">{t('colAmount')}</th>
                  <th className="px-3 py-2 text-left w-40">{t('colLinkedAssets')}</th>
                </tr>
              </thead>
              <tbody className="text-on-surface divide-y divide-outline-variant/10">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-3 py-2 font-mono text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${getCategoryStyle(tx.color)}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium flex items-center gap-2">
                      {tx.description}
                      {tx.isAi && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full ml-2">
                          <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                          {t('aiScanned')}
                        </span>
                      )}
                    </td>
                    <td className={`px-3 py-2 font-bold ${tx.type === 'Credit' ? 'text-secondary' : tx.type === 'Investment' ? 'text-indigo-500' : 'text-error'}`}>
                      {tx.type}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono font-bold ${tx.type === 'Credit' ? 'text-secondary' : tx.type === 'Investment' ? 'text-indigo-500' : ''}`}>
                      {tx.type === 'Credit' ? '+' : tx.type === 'Debit' ? '-' : ''}{tx.amount}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {tx.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant py-2">
            <span>{t('displayingResults', transactions.length)}</span>
            <div className="flex gap-4">
              <button className="hover:text-primary transition-colors">{t('downloadCSV')}</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Shared Component */}
      <footer className="w-full py-8 mt-auto bg-slate-100 dark:bg-slate-900 border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-10 max-w-7xl mx-auto space-y-4 md:space-y-0">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">SnapFins</span>
          <div className="flex gap-8 font-inter text-[11px] uppercase tracking-widest font-medium">
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300" href="/privacy">{t('privacyPolicy')}</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300" href="/terms">{t('termsOfService')}</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300" href="#">{t('support')}</a>
          </div>
          <p className="font-inter text-[11px] uppercase tracking-widest font-medium text-slate-500 dark:text-slate-400">{t('footerPrecision')}</p>
        </div>
      </footer>
    </>
  );
}
