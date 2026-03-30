"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/hooks/useLang";
import { useScrollLock } from "@/hooks/useScrollLock";

interface DeleteAssetModalProps {
  assets: any[]; // Changed from single asset
  onClose: () => void;
  onConfirm: () => void;
  lang: string;
}

export default function DeleteAssetModal({ assets, onClose, onConfirm, lang }: DeleteAssetModalProps) {
  const [mounted, setMounted] = useState(false);
  useScrollLock(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || assets.length === 0) return null;

  const isBulk = assets.length > 1;
  const singleAsset = assets[0];

  return createPortal(
    (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div 
          className="bg-surface dark:bg-slate-900 p-6 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md w-full border border-error/20 animate-in zoom-in duration-300 relative overflow-hidden text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative backdrop glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-error/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mb-6 relative">
            <span className="material-symbols-outlined text-error text-5xl">warning</span>
            <div className="absolute inset-0 rounded-full border-2 border-error/20 animate-ping opacity-20" />
          </div>

          <h3 className="font-headline font-bold text-2xl text-on-surface dark:text-white mb-2 leading-tight">
            {isBulk 
              ? (lang === "id" ? `Hapus ${assets.length} Aset?` : `Delete ${assets.length} Assets?`)
              : (lang === "id" ? "Hapus " : "Delete ") + singleAsset.name + "?"}
          </h3>

          <div className="bg-surface-container-low dark:bg-slate-800/50 rounded-2xl p-4 mb-8 border border-outline-variant/10 w-full text-center">
            {isBulk ? (
              <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                {lang === "id" 
                  ? `Anda akan menghapus ${assets.length} aset terpilih secara permanen. Tindakan ini tidak dapat dibatalkan.` 
                  : `You are about to permanently delete ${assets.length} selected assets. This action is irreversible.`}
              </p>
            ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="px-2 py-0.5 bg-outline-variant/10 text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-md border border-outline-variant/5">
                    {singleAsset.category}
                  </span>
                  <p className="text-sm font-medium text-on-surface-variant leading-relaxed text-center">
                    {lang === "id" 
                      ? "Aset ini akan dihapus secara permanen. Mutasi historis akan tetap tersimpan tetapi tidak lagi terhubung." 
                      : "This asset will be permanently removed. Legacy transactions will remain but will be unlinked."}
                  </p>
                </div>
            )}
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={onConfirm} 
              className="w-full bg-error hover:bg-red-600 text-white font-black py-4 px-4 rounded-xl transition-all shadow-lg shadow-error/20 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">delete_forever</span>
              {isBulk 
                ? (lang === "id" ? "YA, HAPUS SEMUA" : "YES, DELETE ALL")
                : (lang === "id" ? "YA, HAPUS ASET" : "YES, DELETE ASSET")}
            </button>
            
            <button 
              onClick={onClose} 
              className="w-full bg-surface-container-high dark:bg-slate-800 text-on-surface font-bold py-4 px-4 rounded-xl transition-all active:scale-95 hover:bg-surface-container-highest cursor-pointer"
            >
              {lang === "id" ? "BATAL" : "CANCEL"}
            </button>
          </div>

          <p className="mt-6 text-[10px] text-on-surface-variant font-medium uppercase tracking-[0.2em] opacity-40">
            {lang === "id" ? "Tindakan ini tidak dapat dibatalkan" : "This action cannot be undone"}
          </p>
        </div>
      </div>
    ),
    document.body
  );
}
