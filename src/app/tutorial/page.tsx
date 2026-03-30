"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "@/components/AuthModal";
import Footer from '@/components/layout/Footer';

export default function TutorialPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    checkUser();
  }, []);

  const toggleTheme = () => {
    const isDark = theme === "dark";
    const newTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.documentElement.classList.add(isDark ? "transition-to-light" : "transition-to-dark");
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove("transition-to-light", "transition-to-dark");
    });
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-slate-950 font-sans selection:bg-primary/30 selection:text-primary-container transition-colors duration-500">
      {/* Auth Modal */}
      <AuthModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header / Nav */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/" 
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-high dark:bg-slate-900 border border-outline-variant/20 hover:border-primary/50 text-on-surface-variant hover:text-primary transition-all active:scale-90 group/back"
              aria-label="Back to landing"
            >
              <span className="material-symbols-outlined text-[20px] group-hover/back:-translate-x-0.5 transition-transform">arrow_back</span>
            </Link>
            <Link href="/" className="flex items-center gap-2 group">
               <span className="text-xl font-headline font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 group-hover:text-primary transition-colors">SnapFins</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            
            {/* Toggles */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-0.5">
                <button onClick={() => setLang('en')} className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>EN</button>
                <button onClick={() => setLang('id')} className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === 'id' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>ID</button>
              </div>
              <div className="w-10 h-10 flex items-center justify-center">
                {mounted && (
                  <button 
                    onClick={toggleTheme}
                    className="w-full h-full rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-black/60 dark:text-gray-400">
                      {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>


      <main className="relative">
        {/* Section 1: Introduction Section (Hero) */}
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
          <header className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Official Mastery Guide
            </div>
            <h1 className="font-headline font-extrabold text-3xl md:text-5xl text-on-surface dark:text-white mb-6 tracking-tight">
              {t('tutorialHeaderTitle')}
            </h1>
            <p className="text-lg text-on-surface-variant dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              {t('tutorialHeaderSubtitle')}
            </p>
          </header>
        </div>

        {/* Section 2: Step-by-Step Guide */}
        <section id="guide" className="relative py-10 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-16 w-px bg-gradient-to-b from-outline-variant/20 to-transparent"></div>
          <div className="max-w-5xl mx-auto grid gap-6 sm:gap-8">
            
            {/* Step 1 */}
            <section className="relative group p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
                <div className="flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner shadow-primary/20">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">architecture</span>
                  </div>
                  <h2 className="font-headline font-bold text-lg sm:text-xl text-on-surface dark:text-white mb-3 sm:mb-4">
                    {t('tutorialSection1Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
                    {t('tutorialSection1Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[160px] sm:max-w-[220px] aspect-square rounded-2xl bg-surface-container-low dark:bg-slate-800 border-2 border-primary/20 p-3 sm:p-4 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                      <div className="relative z-10 space-y-3">
                         <div className="h-4 w-3/4 bg-primary/20 rounded-full animate-pulse"></div>
                         <div className="h-4 w-1/2 bg-on-surface-variant/10 rounded-full"></div>
                         <div className="h-16 w-full bg-surface-container dark:bg-slate-700 rounded-xl border border-outline-variant/20 flex items-center justify-center">
                           <span className="material-symbols-outlined text-3xl text-primary/40">add_card</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section className="relative group p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-emerald-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col md:flex-row-reverse gap-6 sm:gap-8 items-center">
                <div className="flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner shadow-emerald-500/20">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">photo_camera</span>
                  </div>
                  <h2 className="font-headline font-bold text-lg sm:text-xl text-on-surface dark:text-white mb-3 sm:mb-4">
                    {t('tutorialSection2Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
                    {t('tutorialSection2Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[160px] sm:max-w-[220px] aspect-square rounded-2xl bg-surface-container-low dark:bg-slate-800 border-2 border-emerald-500/20 p-3 sm:p-4 shadow-xl -rotate-3 group-hover:rotate-0 transition-transform duration-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/10 to-transparent"></div>
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                         <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center animate-bounce">
                           <span className="material-symbols-outlined text-2xl text-emerald-500">photo_camera</span>
                         </div>
                         <div className="mt-2 text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Scanning...</div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section className="relative group p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-indigo-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
                <div className="flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner shadow-indigo-500/20">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">grid_view</span>
                  </div>
                  <h2 className="font-headline font-bold text-lg sm:text-xl text-on-surface dark:text-white mb-3 sm:mb-4">
                    {t('tutorialSection3Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
                    {t('tutorialSection3Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[160px] sm:max-w-[220px] aspect-square rounded-2xl bg-surface-container-low dark:bg-slate-800 border-2 border-indigo-500/20 p-2 shadow-xl rotate-1 group-hover:rotate-0 transition-transform duration-700">
                      <div className="grid grid-cols-2 gap-2 h-full">
                         <div className="bg-indigo-500/10 rounded-lg"></div>
                         <div className="bg-indigo-500/20 rounded-lg"></div>
                         <div className="bg-indigo-500/5 rounded-lg"></div>
                         <div className="bg-indigo-500/15 rounded-lg"></div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 4 */}
            <section className="relative group p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-rose-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col md:flex-row-reverse gap-6 sm:gap-8 items-center">
                <div className="flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner shadow-rose-500/20">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">query_stats</span>
                  </div>
                  <h2 className="font-headline font-bold text-lg sm:text-xl text-on-surface dark:text-white mb-3 sm:mb-4">
                    {t('tutorialSection4Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
                    {t('tutorialSection4Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[160px] sm:max-w-[220px] aspect-square rounded-2xl bg-surface-container-low dark:bg-slate-800 border-2 border-rose-500/20 p-3 sm:p-4 shadow-xl -rotate-2 group-hover:rotate-0 transition-transform duration-700">
                      <div className="h-full flex flex-col justify-end">
                         <div className="flex items-end gap-1.5 h-24">
                            <div className="w-full bg-rose-500/20 h-6 rounded-t-lg"></div>
                            <div className="w-full bg-rose-500/40 h-12 rounded-t-lg animate-pulse"></div>
                            <div className="w-full bg-rose-500/60 h-18 rounded-t-lg"></div>
                            <div className="w-full bg-rose-500/80 h-22 rounded-t-lg"></div>
                         </div>
                         <div className="mt-3 border-t border-rose-500/20 pt-3 text-center">
                            <div className="text-rose-500 font-black text-sm uppercase tracking-tighter">+12.4% Net Worth</div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 5 */}
            <section className="relative group p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-blue-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
                <div className="flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner shadow-blue-500/20">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">admin_panel_settings</span>
                  </div>
                  <h2 className="font-headline font-bold text-lg sm:text-xl text-on-surface dark:text-white mb-3 sm:mb-4">
                    {t('tutorialSection5Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
                    {t('tutorialSection5Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[160px] sm:max-w-[220px] aspect-square rounded-2xl bg-surface-container-low dark:bg-slate-800 border-2 border-blue-500/20 p-4 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-700 flex items-center justify-center">
                      <div className="relative">
                         <span className="material-symbols-outlined text-6xl text-blue-500/20">database</span>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="material-symbols-outlined text-3xl text-blue-500 animate-pulse">lock</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 6 */}
            <section className="relative group p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-amber-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex flex-col md:flex-row-reverse gap-6 sm:gap-8 items-center">
                <div className="flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner shadow-amber-500/20">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">currency_exchange</span>
                  </div>
                  <h2 className="font-headline font-bold text-lg sm:text-xl text-on-surface dark:text-white mb-3 sm:mb-4">
                    {t('tutorialSection6Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
                    {t('tutorialSection6Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[160px] sm:max-w-[220px] aspect-square rounded-2xl bg-surface-container-low dark:bg-slate-800 border-2 border-amber-500/20 p-4 shadow-xl -rotate-3 group-hover:rotate-0 transition-transform duration-700">
                      <div className="flex flex-col justify-between h-full py-4 uppercase tracking-[0.2em] font-black pointer-events-none text-[8px] sm:text-[10px]">
                         <div className="flex justify-between items-center text-on-surface-variant/40">
                            <span>USD</span>
                            <span className="text-[8px]">→</span>
                            <span className="text-amber-500">IDR</span>
                         </div>
                         <div className="flex justify-between items-center text-on-surface-variant/40">
                            <span>SOL</span>
                            <span className="text-[8px]">→</span>
                            <span className="text-amber-500">USD</span>
                         </div>
                         <div className="flex justify-between items-center text-on-surface-variant/40">
                            <span>GOLD</span>
                            <span className="text-[8px]">→</span>
                            <span className="text-amber-500">IDR</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        {/* Curious About the Math Bridge (Above CTA) */}
        <section className="mt-12 max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-secondary/5 border border-secondary/20 text-center animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.7s' }}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 blur-[60px] rounded-full"></div>
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-6 shadow-inner shadow-secondary/20">
            <span className="material-symbols-outlined text-2xl">science</span>
          </div>
          <h3 className="font-headline font-black text-xl text-on-surface dark:text-white mb-4 uppercase tracking-tight">Curious about the math?</h3>
          <p className="text-on-surface-variant dark:text-gray-400 mb-8 font-medium italic text-sm sm:text-base px-2 leading-relaxed">
            Go deeper into the triangular arbitrage, neural extraction, and real-time synchronization windows.
          </p>
          <Link 
            href="/engine" 
            className="inline-flex items-center gap-2 text-secondary font-black uppercase tracking-[0.3em] text-[10px] hover:gap-5 transition-all group"
          >
            {t('exploreEngine')}
            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">arrow_forward</span>
          </Link>
        </section>

        {/* Final CTA */}
        <section className="mt-20 mb-24 text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
           <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface dark:text-white mb-8 tracking-tight">Ready to architect your wealth?</h2>
           {user ? (
             <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-white px-7 py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95"
             >
               {t('tutorialCTADashboard')}
               <span className="material-symbols-outlined">rocket_launch</span>
             </Link>
           ) : (
             <button 
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-7 py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95"
             >
               {t('tutorialCTALogin')}
               <span className="material-symbols-outlined">login</span>
             </button>
           )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
