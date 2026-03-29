"use client";

import { useLang } from "@/hooks/useLang";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="w-full border-t border-outline-variant/10 py-12 pb-36 md:pb-12 bg-surface-container-lowest dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="font-headline font-black text-2xl tracking-tighter opacity-20 dark:opacity-40 text-on-surface">
          SnapFins
        </p>
        <div className="flex gap-8 font-inter text-[11px] uppercase tracking-widest font-medium">
          <a
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300"
            href="/privacy"
          >
            {t("privacyPolicy")}
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300"
            href="/terms"
          >
            {t("termsOfService")}
          </a>
          <a
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-opacity duration-300"
            href="mailto:zen@0x5zen.dev"
          >
            {t("support")}
          </a>
        </div>
        <p className="font-inter text-[11px] uppercase tracking-widest font-medium text-slate-500 dark:text-slate-400">
          {t("footerPrecision")}
        </p>
      </div>
    </footer>
  );
}
