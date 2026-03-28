"use client"

import { useTheme } from "next-themes";
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
  const [mounted, setMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [transactions, setTransactions] = useState([
    { id: 1, date: "2024-05-18", category: "CRYPTO", color: "blue", description: "Buying 1.5 SOL", type: "Debit", amount: "$245.22", source: "Phantom Wallet", isAi: false },
    { id: 2, date: "2024-05-17", category: "DINING", color: "purple", description: "Solaria", type: "Debit", amount: "$32.10", source: "Amex Gold", isAi: true },
    { id: 3, date: "2024-05-15", category: "SALARY", color: "emerald", description: "Gaji Bulanan", type: "Credit", amount: "$8,500.00", source: "Citibank Main", isAi: false },
    { id: 4, date: "2024-05-14", category: "METAL", color: "amber", description: "Emas Antam (10g)", type: "Debit", amount: "$780.00", source: "Vault 01", isAi: false },
    { id: 5, date: "2024-05-12", category: "HOME", color: "slate", description: "Utilities", type: "Debit", amount: "$120.45", source: "Auto-Pay Hub", isAi: false },
    { id: 6, date: "2024-05-10", category: "SUB", color: "indigo", description: "Netflix Subscription", type: "Debit", amount: "$15.99", source: "Virtual Card", isAi: false },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.transaction) {
        const newTx = {
          id: Date.now(),
          date: data.transaction.date,
          category: data.transaction.category || "GENERAL",
          color: assignColor(data.transaction.category || "GENERAL"),
          description: data.transaction.description,
          type: "Debit",
          amount: data.transaction.amount,
          source: "Gemini Vision",
          isAi: true
        };
        // Prepend new transaction to the table
        setTransactions(prev => [newTx, ...prev]);
      } else {
        alert("Failed to scan receipt: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during scanning.");
    } finally {
      setIsScanning(false);
      // Reset input value to allow scanning same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Loading Overlay for Scanner */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-primary/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-primary text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">Analyzing Receipt</h3>
            <p className="text-sm text-center text-on-surface-variant">Gemini AI is examining your document and extracting merchant data...</p>
          </div>
        </div>
      )}

      {/* TopNavBar Shared Component */}
      <nav className="sticky top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 font-headline">SnapFins</span>
            <div className="hidden md:flex items-center gap-6 font-manrope font-semibold tracking-tight text-sm">
              <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">Dashboard</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Asset</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Analytics</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Settings</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group w-8 h-8 flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer">language</span>
            </div>
            
            <div className="w-8 h-8 flex items-center justify-center">
              {mounted && (
                <span 
                  className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 border-l border-outline-variant/30 pl-4 ml-2">
              <img alt="User profile" className="w-8 h-8 rounded-full border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE0e9w4xGMbdwDYXMaDw5uETVXAmCsb2dhI8hfIpOO3BPWgMaL0JjQzcpHBM7CT9NYI1ldia3F2nXUV5w3qb3mMDQz-OTK-jeHMEnz039x-WujlEaGvN3up-hQu3sr7A0G-nmdIg9113_eJSO-g9Mpnz1eq1fYd6INd1L0Flb-PXWLfhqXoh5e8wARW0avQOljBQFUftRfAqKCQ6Fw-PDIi6C3txyigy8dE7NZEcNbsgG6NlCq8YmU7KjLMJ2ODW7FZcU7PiQ025U" />
              <button onClick={handleLogout} className="text-xs font-bold text-error bg-error/10 hover:bg-error/20 px-3 py-1.5 rounded-md transition-colors">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 space-y-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">Financial Overview</h1>
            <p className="text-on-surface-variant font-medium tracking-wide text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Financial Intelligence (LIVE)
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
            <button className="hidden md:flex px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container-low transition-all active:opacity-80 items-center gap-2">
              Manual Entry
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm shadow-[0_4px_15px_rgba(53,37,205,0.3)] hover:shadow-[0_8px_25px_rgba(53,37,205,0.4)] transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg focus:outline-none" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Scan Receipt
            </button>
          </div>
        </header>

        {/* Summary Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-surface-container-low/40 dark:to-slate-800/40">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="relative flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1">Total Net Worth</p>
                <h2 className="text-4xl font-black font-headline tracking-tighter text-on-surface">$142,850.42</h2>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-secondary bg-secondary-container/30 w-fit px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +4.2% from last month
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-secondary-container/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="relative flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1">Monthly Income</p>
                <h2 className="text-4xl font-black font-headline tracking-tighter text-secondary">$12,400.00</h2>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-on-surface-variant bg-surface-container-low dark:bg-slate-800 w-fit px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-sm">event_repeat</span>
              Next payout in 4 days
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden group bg-gradient-to-br from-white/60 dark:from-slate-900/60 to-error-container/10">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors"></div>
            <div className="relative flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-surface-variant mb-1">Monthly Expense</p>
                <h2 className="text-4xl font-black font-headline tracking-tighter text-error">$4,120.50</h2>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-outline-variant/20">
                <span className="material-symbols-outlined text-error text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>credit_score</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-error flex border border-error/10 bg-error-container/30 dark:bg-error-container/10 w-fit px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-sm">warning</span>
              12% above budget limit
            </div>
          </div>
        </section>

        {/* Main Data Table Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">Recent Transaction Ledger</h3>
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
                  <th className="px-3 py-2 text-left w-24">Date</th>
                  <th className="px-3 py-2 text-left w-32">Category</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-left w-24">Type</th>
                  <th className="px-3 py-2 text-right w-32">Amount</th>
                  <th className="px-3 py-2 text-left w-40">Linked Assets</th>
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
                          AI SCANNED
                        </span>
                      )}
                    </td>
                    <td className={`px-3 py-2 font-bold ${tx.type === 'Credit' ? 'text-secondary' : 'text-error'}`}>
                      {tx.type}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono font-bold ${tx.type === 'Credit' ? 'text-secondary' : ''}`}>
                      {tx.amount}
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
            <span>Displaying {transactions.length} of {1240 + (transactions.length - 6)} results</span>
            <div className="flex gap-4">
              <button className="hover:text-primary transition-colors">Download CSV</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Shared Component */}
      <footer className="w-full py-8 mt-auto bg-slate-100 dark:bg-slate-900 border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center px-10 max-w-7xl mx-auto space-y-4 md:space-y-0">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">SnapFins</span>
          <div className="flex gap-8 font-inter text-[11px] uppercase tracking-widest font-medium">
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300" href="#">Privacy Policy</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300" href="#">Terms of Service</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300" href="#">Support</a>
          </div>
          <p className="font-inter text-[11px] uppercase tracking-widest font-medium text-slate-500 dark:text-slate-400">© 2024 SnapFins. Precision Wealth Instruments.</p>
        </div>
      </footer>
    </>
  );
}
