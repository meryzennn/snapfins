"use client";
import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import SupportModal from "@/components/SupportModal";
import GithubStarButton from "@/components/GithubStarButton";
import { AnimatePresence } from "framer-motion";

export default function Footer({ containerClassName = "max-w-7xl" }: { containerClassName?: string }) {
  const { t } = useLang();
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <footer className="w-full border-t border-outline-variant/10 py-12 pb-36 md:pb-12 bg-surface-container-lowest dark:bg-slate-900/30">
      <div className={`${containerClassName} mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-8`}>
        {/* Left Section: Brand + Copyright */}
        <div className="flex flex-col items-center md:items-start">
          <p className="font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 font-headline text-2xl">
            SnapFins
          </p>
          <p className="font-inter text-[11px] uppercase tracking-widest font-medium text-slate-500 dark:text-slate-400 mt-2 text-center md:text-left">
            © 2026 <a href="https://www.0x5zen.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-all">0x5zen</a>. {t("footerPrecision").split("0x5zen.")[1] || t("footerPrecision")}
          </p>
        </div>

        {/* Center Section: Links */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 font-inter text-[11px] uppercase tracking-widest font-black order-last md:order-none">
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

        {/* Right Section: Support + Github */}
        <div className="flex flex-col items-center md:items-end gap-3 w-full sm:w-auto">
          {/* Reverted Support Button - Indigo Vibe + Fixed Size */}
          <button 
            onClick={() => setShowSupportModal(true)}
            className="group flex items-center justify-center gap-2.5 w-full sm:w-[220px] h-[44px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-[11px] sm:text-xs uppercase tracking-widest hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-indigo-500/20 hover:shadow-lg"
          >
            <span className="material-symbols-outlined text-sm group-hover:scale-125 group-hover:text-rose-500 transition-all animate-heart-pulse">favorite</span>
            {t('supportCreator')}
          </button>

          <GithubStarButton />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
      </AnimatePresence>
    </footer>
  );
}
