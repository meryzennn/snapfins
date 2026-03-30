"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/hooks/useLang";
import { useScrollLock } from "@/hooks/useScrollLock";

interface DeleteAssetModalProps {
  assetName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAssetModal({ assetName, onClose, onConfirm }: DeleteAssetModalProps) {
  const { lang } = useLang();
  const [mounted, setMounted] = useState(false);
  useScrollLock(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-3 pb-[80px] sm:pb-0 sm:p-6 animate-in fade-in duration-300">
        <div 
          className="bg-surface p-6 sm:p-10 rounded-3xl shadow-2xl flex flex-col w-full sm:max-w-xl max-h-[85svh] border border-outline-variant/20 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mb-6 mx-auto">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h3 className="font-headline font-bold text-2xl text-on-surface text-center mb-2 text-balance leading-tight">
            {lang === "id" ? "Hapus " : "Delete "}<span className="text-primary">{assetName}</span>?
          </h3>
          <p className="text-center text-sm font-medium text-on-surface-variant mb-8 leading-relaxed">
            {lang === "id" ? "Aset ini akan dihapus secara permanen. Mutasi historis terkait tidak akan terhapus." : "This asset will be permanently removed from your portfolio. Legacy transactions will remain intact."}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              className="flex-1 py-3.5 px-4 rounded-xl font-bold border-2 border-outline-variant/20 text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer active:scale-95 transition-all"
            >
              {lang === "id" ? "Batal" : "Cancel"}
            </button>
            <button 
              onClick={onConfirm} 
              className="flex-1 py-3.5 px-4 rounded-xl font-bold bg-error text-white hover:bg-error/90 transition-colors shadow-lg shadow-error/20 cursor-pointer active:scale-95 transition-all"
            >
              {lang === "id" ? "Hapus Aset" : "Delete Asset"}
            </button>
          </div>
        </div>
      </div>
    ),
    document.body
  );
}
