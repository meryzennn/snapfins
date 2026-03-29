import { useState } from "react";
import { useLang } from "@/hooks/useLang";
import SupportModal from "@/components/SupportModal";

export default function Footer() {
  const { t } = useLang();
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <footer className="w-full border-t border-outline-variant/10 py-12 pb-36 md:pb-12 bg-surface-container-lowest dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start">
          <p className="font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 font-headline text-2xl">
            SnapFins
          </p>
          <button 
            onClick={() => setShowSupportModal(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-sm group-hover:scale-125 transition-transform">favorite</span>
            {t('supportCreator')}
          </button>
        </div>
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

      {showSupportModal && <SupportModal onClose={() => setShowSupportModal(false)} />}
    </footer>
  );
}
