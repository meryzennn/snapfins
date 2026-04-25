"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useLang } from "@/hooks/useLang";

const APP_VERSION = "2.1.0";

export default function WhatsNewModal() {
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<"features" | "tutorial">("features");
  useScrollLock(isOpen);

  useEffect(() => {
    setMounted(true);
    const seenVersion = localStorage.getItem("snapfins_whatsnew_seen");
    if (seenVersion !== APP_VERSION) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("snapfins_whatsnew_seen", APP_VERSION);
    // Reset view for next time
    setTimeout(() => setView("features"), 500);
  };

  if (!mounted) return null;

  const features = [
    {
      icon: "sync_saved_locally",
      title: lang === "id" ? "Universal JSON Sync" : "Universal JSON Sync",
      desc: lang === "id" 
        ? "Backup & pindahin data antar akun (Google/GitHub) cuma modal satu file JSON." 
        : "Backup and transfer data between accounts (Google/GitHub) with a single JSON file.",
      color: "bg-blue-500"
    },
    {
      icon: "table_rows",
      title: lang === "id" ? "Detail Tabel Interaktif" : "Interactive Table Details",
      desc: lang === "id" 
        ? "Klik baris tabel di dashboard buat liat detail transaksi lengkap dengan animasi smooth." 
        : "Click table rows in the dashboard to see full transaction details with smooth animations.",
      color: "bg-purple-500"
    },
    {
      icon: "palette",
      title: lang === "id" ? "UI & Hover Refresh" : "UI & Hover Refresh",
      desc: lang === "id" 
        ? "Tampilan tabel di Light Mode sekarang lebih jelas hover-nya. Navigasi makin intuitif." 
        : "Table views in Light Mode now have clearer hover states for intuitive navigation.",
      color: "bg-emerald-500"
    }
  ];

  const tutorials = [
    {
      step: "01",
      title: lang === "id" ? "Cara Backup Data" : "How to Backup",
      desc: lang === "id" 
        ? "Klik foto profil lo > Pilih 'Sync & Backup' > Klik 'Ekspor Data'. File JSON bakal otomatis ter-download." 
        : "Click your profile > Select 'Sync & Backup' > Click 'Export Data'. Your JSON file will download automatically.",
      icon: "cloud_upload"
    },
    {
      step: "02",
      title: lang === "id" ? "Liat Detail Transaksi" : "View Details",
      desc: lang === "id" 
        ? "Di tabel Dashboard atau Assets, cukup tap/klik baris mana aja buat ngebuka detail transaksi lo." 
        : "In the Dashboard or Assets table, simply tap/click any row to open your transaction details.",
      icon: "zoom_in"
    },
    {
      step: "03",
      title: lang === "id" ? "Cara Import Data" : "How to Import",
      desc: lang === "id" 
        ? "Klik foto profil > 'Sync & Backup' > 'Impor Data' > Pilih file JSON backup lo. Data bakal otomatis sinkron!" 
        : "Click profile > 'Sync & Backup' > 'Import Data' > Select your JSON file. Your data will sync instantly!",
      icon: "publish"
    }
  ];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface dark:bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="relative p-8 sm:p-12">
              <AnimatePresence mode="wait">
                {view === "features" ? (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 mb-4">
                        <span className="material-symbols-outlined text-4xl">celebration</span>
                      </div>
                      <h2 className="font-headline font-black text-3xl text-on-surface tracking-tight">
                        {lang === 'id' ? 'Ada yang baru nih!' : "What's New!"}
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {features.map((f, i) => (
                        <div key={i} className="flex gap-5">
                          <div className={`shrink-0 w-12 h-12 rounded-2xl ${f.color} text-white flex items-center justify-center shadow-lg`}>
                            <span className="material-symbols-outlined text-2xl">{f.icon}</span>
                          </div>
                          <div className="space-y-1 pt-1 text-left">
                            <h4 className="font-black text-sm text-on-surface uppercase tracking-wide">{f.title}</h4>
                            <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed opacity-70">{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 space-y-4">
                      <button
                        onClick={handleClose}
                        className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        {lang === 'id' ? 'Gue Ngerti!' : 'Got it!'}
                        <span className="material-symbols-outlined">rocket_launch</span>
                      </button>
                      <button
                        onClick={() => setView("tutorial")}
                        className="w-full py-3 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity"
                      >
                        {lang === 'id' ? 'Lihat Tutorial' : 'Learn How to Use'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="tutorial"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-secondary text-on-secondary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-secondary/30 mb-4">
                        <span className="material-symbols-outlined text-4xl">menu_book</span>
                      </div>
                      <h2 className="font-headline font-black text-3xl text-on-surface tracking-tight">
                        {lang === 'id' ? 'Cara Pakenya' : "Tutorial Guide"}
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {tutorials.map((t, i) => (
                        <div key={i} className="flex gap-5 relative group">
                          <div className="shrink-0 w-12 h-12 rounded-full border-2 border-outline-variant/20 flex items-center justify-center text-xs font-black text-on-surface-variant group-hover:border-secondary group-hover:text-secondary transition-colors">
                            {t.step}
                          </div>
                          <div className="space-y-1 pt-1 text-left">
                            <h4 className="font-black text-sm text-on-surface flex items-center gap-2">
                              {t.title}
                              <span className="material-symbols-outlined text-xs text-secondary opacity-0 group-hover:opacity-100 transition-opacity">{t.icon}</span>
                            </h4>
                            <p className="text-[12px] text-on-surface-variant font-medium leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                              {t.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => setView("features")}
                        className="w-full py-5 rounded-[2rem] border-2 border-outline-variant/20 text-on-surface font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        {lang === 'id' ? 'Kembali' : 'Back to News'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
