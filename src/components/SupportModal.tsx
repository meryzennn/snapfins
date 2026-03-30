"use client";

import { useLang } from "@/hooks/useLang";
import { useScrollLock } from "@/hooks/useScrollLock";

interface SupportModalProps {
  onClose: () => void;
}

export default function SupportModal({ onClose }: SupportModalProps) {
  const { t } = useLang();
  useScrollLock(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-outline-variant/20 animate-in zoom-in-95 fade-in duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">
              favorite
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              close
            </span>
          </button>
        </div>

        <h3 className="font-headline font-bold text-2xl text-on-surface dark:text-white mb-2">
          {t("donateTitle")}
        </h3>
        <p className="text-on-surface-variant dark:text-gray-400 text-sm leading-relaxed mb-8">
          {t("donateSubtitle")}
        </p>

        <div className="space-y-4">
          <a
            href="https://sociabuzz.com/notryzen/tribe"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-2xl bg-[#E9E1FF] dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 hover:border-primary transition-all active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-indigo-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-primary text-xl">
                  bolt
                </span>
              </div>
              <div>
                <span className="block font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                  SociaBuzz
                </span>
                <span className="block text-[10px] text-indigo-700/60 dark:text-indigo-400/60 font-black uppercase tracking-widest">
                  Support on Local
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              arrow_forward
            </span>
          </a>

          <a
            href="https://ko-fi.com/0x5zen"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-2xl bg-[#FFF1F1] dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 hover:border-rose-500 transition-all active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-rose-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-rose-500 text-xl">
                  coffee
                </span>
              </div>
              <div>
                <span className="block font-bold text-rose-900 dark:text-rose-200 text-sm">
                  Ko-fi
                </span>
                <span className="block text-[10px] text-rose-700/60 dark:text-rose-400/60 font-black uppercase tracking-widest">
                  Buy me a coffee
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
              arrow_forward
            </span>
          </a>
        </div>

        <p className="text-center text-[10px] text-on-surface-variant/40 mt-8 font-bold uppercase tracking-widest">
          Thank you for your kindness!
        </p>
      </div>
    </div>
  );
}
