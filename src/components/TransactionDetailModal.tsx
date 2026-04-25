"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { formatValue, type SupportedCurrency } from "@/lib/currency";
import { useEffect, useState } from "react";

interface TransactionDetailModalProps {
  transaction: any;
  onClose: () => void;
  onEdit: (tx: any) => void;
  onDelete: (id: string) => void;
  lang: string;
  currency: SupportedCurrency;
  t: (key: string) => string;
}

export default function TransactionDetailModal({
  transaction,
  onClose,
  onEdit,
  onDelete,
  lang,
  currency,
  t,
}: TransactionDetailModalProps) {
  useScrollLock(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !transaction) return null;

  const isIncome = transaction.type === "Credit" || transaction.type === "Income";
  const isInvestment = transaction.type === "Investment";
  
  const getCategoryStyle = (color: string) => {
    const styles: Record<string, string> = {
      blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      slate: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    };
    return styles[color] || styles.slate;
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ 
          type: "spring",
          damping: 25,
          stiffness: 300
        }}
        className="relative w-full max-w-lg bg-surface dark:bg-slate-950 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden perspective-1000"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background Element */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 blur-3xl rounded-full opacity-20 pointer-events-none transition-colors duration-1000 ${isIncome ? 'bg-secondary' : isInvestment ? 'bg-indigo-500' : 'bg-error'}`} />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-surface-container-high dark:bg-slate-800 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:scale-110 active:scale-90 transition-all duration-300 z-10 group"
          aria-label="Close detail"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">close</span>
        </button>

        <div className="p-8 sm:p-12 space-y-8">
          {/* Header Area */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getCategoryStyle(transaction.color)}`}>
                {transaction.category}
              </span>
              {transaction.isAi && (
                <span className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                  AI SCANNED
                </span>
              )}
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-on-surface font-headline leading-tight tracking-tight">
              {transaction.description}
            </h2>
            
            <div className="flex items-center gap-4 text-on-surface-variant/60 text-xs font-bold uppercase tracking-[0.1em]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">calendar_month</span>
                {(() => {
                  if (!transaction.date) return "—";
                  const [y, m, d] = transaction.date.split("-");
                  return `${d}/${m}/${y}`;
                })()}
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">payments</span>
                {transaction.source || "Manual Entry"}
              </div>
            </div>
          </div>

          {/* Amount Display */}
          <div className={`p-8 rounded-[2rem] border ${isIncome ? 'bg-secondary/5 border-secondary/20' : isInvestment ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-error/5 border-error/20'} flex flex-col items-center justify-center text-center space-y-2`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isIncome ? 'text-secondary' : isInvestment ? 'text-indigo-500' : 'text-error'}`}>
              {isIncome ? t("typeIncome") : isInvestment ? t("typeInvestment") : t("typeExpense")}
            </span>
            <div className={`text-4xl sm:text-5xl font-black font-headline tracking-tighter tabular-nums ${isIncome ? 'text-secondary' : isInvestment ? 'text-indigo-500' : 'text-error'}`}>
              {isIncome ? "+" : isInvestment ? "" : "-"}
              {formatValue(
                Math.abs(Number(transaction.amount) || 0),
                transaction.currency as SupportedCurrency
              )}
            </div>
            {transaction.currency !== currency && (
              <div className="text-sm font-bold text-on-surface-variant/50 tabular-nums">
                ≈ {formatValue(
                  Math.abs(Number(transaction.amount) || 0),
                  currency
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                onEdit(transaction);
                onClose();
              }}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-surface-container-high dark:bg-slate-800 text-on-surface font-bold text-sm hover:bg-primary/10 hover:text-primary transition-all duration-300 active:scale-95 group"
            >
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">edit</span>
              {lang === "id" ? "Ubah Data" : "Edit Details"}
            </button>
            <button
              onClick={() => {
                onDelete(transaction.id);
                onClose();
              }}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-error/5 text-error font-bold text-sm hover:bg-error/10 transition-all duration-300 active:scale-95 group"
            >
              <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">delete</span>
              {lang === "id" ? "Hapus" : "Delete"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
