"use client";

import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { type SupportedCurrency } from "@/lib/currency";

interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  currency: string;
  date: string;
}

interface DeleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transactions: Transaction[];
  isDeleting: boolean;
  lang: string;
  t: (key: string, ...args: any[]) => string;
  formatValue: (val: number, cur: string) => string;
  preferredCurrency: string;
}

export default function DeleteTransactionModal({
  isOpen,
  onClose,
  onConfirm,
  transactions,
  isDeleting,
  lang,
  t,
  formatValue,
  preferredCurrency,
}: DeleteTransactionModalProps) {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const isBulk = transactions.length > 1;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full border border-error/20 animate-in zoom-in duration-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative backdrop glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-error/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6 relative">
          <span className="material-symbols-outlined text-error text-5xl animate-pulse">warning</span>
          <div className="absolute inset-0 rounded-full border-2 border-error/20 animate-ping opacity-20" />
        </div>

        <h3 className="font-headline font-bold text-xl sm:text-2xl text-on-surface dark:text-white mb-3 text-center">
          {isBulk ? t("confirmDeleteSelectedTitle") : t("confirmDeleteTransactionTitle")}
        </h3>

        <div className="w-full bg-surface-container-low dark:bg-slate-800/50 rounded-2xl p-4 mb-8 border border-outline-variant/10">
          {isBulk ? (
            <p className="text-sm text-center text-on-surface-variant font-medium leading-relaxed">
              {t("confirmDeleteSelectedMsg", transactions.length)}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-center text-on-surface-variant font-medium mb-2">
                {t("confirmDeleteTransactionMsg")}
              </p>
              <div className="bg-white/50 dark:bg-slate-900/50 px-4 py-3 rounded-xl border border-outline-variant/5 w-full">
                <p className="text-center font-bold text-on-surface text-base truncate">
                  {transactions[0]?.description}
                </p>
                <p className="text-center font-black text-error text-lg mt-1 tabular-nums">
                  {formatValue(Math.abs(Number(transactions[0]?.amount) || 0), (transactions[0]?.currency || "USD"))}
                </p>
                <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest font-black mt-2 opacity-60">
                  {new Date(transactions[0]?.date).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { dateStyle: 'full' })}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full bg-error hover:bg-red-600 text-white font-black py-4 px-4 rounded-xl transition-all shadow-lg shadow-error/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
          >
            {isDeleting ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">delete_forever</span>
            )}
            {isDeleting ? t("deleting") : (lang === "id" ? "YA, HAPUS SEKARANG" : "YES, DELETE NOW")}
          </button>
          
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full bg-surface-container-high dark:bg-slate-800 text-on-surface font-bold py-4 px-4 rounded-xl transition-all active:scale-95 hover:bg-surface-container-highest cursor-pointer"
          >
            {t("cancel")}
          </button>
        </div>

        <p className="mt-6 text-[10px] text-on-surface-variant font-medium uppercase tracking-[0.2em] opacity-40">
          {lang === "id" ? "Tindakan ini tidak dapat dibatalkan" : "This action cannot be undone"}
        </p>
      </div>
    </div>,
    document.body
  );
}
