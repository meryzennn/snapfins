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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
             <span className="text-xl font-headline font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 group-hover:text-primary transition-colors">SnapFins</span>
          </Link>
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

      {/* Floating Back Arrow — sticky left center */}
      <Link
        href="/"
        aria-label="Back to Home"
        className="fixed left-4 top-6 z-[60]
          w-11 h-11 rounded-full
          flex items-center justify-center
          bg-white/80 dark:bg-slate-900/80
          backdrop-blur-md
          border border-outline-variant/20
          shadow-lg shadow-black/10
          hover:shadow-primary/30 hover:shadow-xl
          hover:border-primary/40
          hover:scale-110
          active:scale-90
          transition-all duration-200 ease-out
          group/back"
      >
        <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover/back:text-primary group-hover/back:-translate-x-0.5 transition-all duration-150">
          arrow_back
        </span>
      </Link>

      <main className="relative">
        {/* Section 1: Introduction Section (Hero) */}
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-32">
          <header className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Official Mastery Guide
            </div>
            <h1 className="font-headline font-extrabold text-4xl md:text-6xl text-on-surface dark:text-white mb-8 tracking-tight">
              {t('tutorialHeaderTitle')}
            </h1>
            <p className="text-xl text-on-surface-variant dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              {t('tutorialHeaderSubtitle')}
            </p>
          </header>
        </div>

        {/* Section 2: Step-by-Step Guide */}
        <section id="guide" className="relative py-20 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-px bg-gradient-to-b from-outline-variant/20 to-transparent"></div>
          <div className="max-w-5xl mx-auto grid gap-12 sm:gap-16">
            
            {/* Step 1 */}
            <section className="relative group p-5 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-white dark:bg-slate-900 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-primary/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex flex-col md:flex-row gap-8 sm:gap-10 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-inner shadow-primary/20">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">architecture</span>
                  </div>
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface dark:text-white mb-4 sm:mb-6">
                    {t('tutorialSection1Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-base sm:text-lg leading-relaxed font-medium">
                    {t('tutorialSection1Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-square rounded-3xl bg-surface-container-low dark:bg-slate-800 border-2 border-primary/20 p-4 sm:p-6 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                      <div className="relative z-10 space-y-4">
                         <div className="h-6 w-3/4 bg-primary/20 rounded-full animate-pulse"></div>
                         <div className="h-6 w-1/2 bg-on-surface-variant/10 rounded-full"></div>
                         <div className="h-20 w-full bg-surface-container dark:bg-slate-700 rounded-2xl border border-outline-variant/20 flex items-center justify-center">
                           <span className="material-symbols-outlined text-4xl text-primary/40">add_card</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section className="relative group p-5 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-white dark:bg-slate-900 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-emerald-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col md:flex-row-reverse gap-8 sm:gap-10 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-inner shadow-emerald-500/20">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">photo_camera</span>
                  </div>
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface dark:text-white mb-4 sm:mb-6">
                    {t('tutorialSection2Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-base sm:text-lg leading-relaxed font-medium">
                    {t('tutorialSection2Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-square rounded-3xl bg-surface-container-low dark:bg-slate-800 border-2 border-emerald-500/20 p-4 sm:p-6 shadow-2xl -rotate-3 group-hover:rotate-0 transition-transform duration-700 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/10 to-transparent"></div>
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                         <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center animate-bounce">
                           <span className="material-symbols-outlined text-4xl text-emerald-500">photo_camera</span>
                         </div>
                         <div className="mt-4 text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Scanning receipt...</div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section className="relative group p-5 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-white dark:bg-slate-900 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-indigo-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex flex-col md:flex-row gap-8 sm:gap-10 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-inner shadow-indigo-500/20">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">grid_view</span>
                  </div>
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface dark:text-white mb-4 sm:mb-6">
                    {t('tutorialSection3Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-base sm:text-lg leading-relaxed font-medium">
                    {t('tutorialSection3Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-square rounded-3xl bg-surface-container-low dark:bg-slate-800 border-2 border-indigo-500/20 p-2 shadow-2xl rotate-1 group-hover:rotate-0 transition-transform duration-700">
                      <div className="grid grid-cols-2 gap-2 h-full">
                         <div className="bg-indigo-500/10 rounded-xl"></div>
                         <div className="bg-indigo-500/20 rounded-xl"></div>
                         <div className="bg-indigo-500/5 rounded-xl"></div>
                         <div className="bg-indigo-500/15 rounded-xl"></div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 4 */}
            <section className="relative group p-5 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-white dark:bg-slate-900 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-rose-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col md:flex-row-reverse gap-8 sm:gap-10 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-inner shadow-rose-500/20">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl">query_stats</span>
                  </div>
                  <h2 className="font-headline font-bold text-2xl sm:text-3xl text-on-surface dark:text-white mb-4 sm:mb-6">
                    {t('tutorialSection4Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-base sm:text-lg leading-relaxed font-medium">
                    {t('tutorialSection4Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-square rounded-3xl bg-surface-container-low dark:bg-slate-800 border-2 border-rose-500/20 p-4 sm:p-6 shadow-2xl -rotate-2 group-hover:rotate-0 transition-transform duration-700">
                      <div className="h-full flex flex-col justify-end">
                         <div className="flex items-end gap-2 h-32">
                            <div className="w-full bg-rose-500/20 h-10 rounded-t-lg"></div>
                            <div className="w-full bg-rose-500/40 h-20 rounded-t-lg animate-pulse"></div>
                            <div className="w-full bg-rose-500/60 h-28 rounded-t-lg"></div>
                            <div className="w-full bg-rose-500/80 h-32 rounded-t-lg"></div>
                         </div>
                         <div className="mt-4 border-t border-rose-500/20 pt-4 text-center">
                            <div className="text-rose-500 font-black text-lg">+12.4% Net Worth</div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 5 */}
            <section className="relative group p-6 sm:p-10 rounded-[40px] bg-white dark:bg-slate-900 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-blue-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-8 shadow-inner shadow-blue-500/20">
                    <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                  </div>
                  <h2 className="font-headline font-bold text-3xl text-on-surface dark:text-white mb-6">
                    {t('tutorialSection5Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-lg leading-relaxed font-medium">
                    {t('tutorialSection5Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[300px] aspect-square rounded-3xl bg-surface-container-low dark:bg-slate-800 border-2 border-blue-500/20 p-6 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700 flex items-center justify-center">
                      <div className="relative">
                         <span className="material-symbols-outlined text-8xl text-blue-500/20">database</span>
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <span className="material-symbols-outlined text-5xl text-blue-500 animate-pulse">lock</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Step 6 */}
            <section className="relative group p-6 sm:p-10 rounded-[40px] bg-white dark:bg-slate-900 shadow-2xl shadow-black/5 dark:shadow-black/20 border border-outline-variant/10 hover:border-amber-500/30 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex flex-col md:flex-row-reverse gap-10 items-center">
                <div className="flex-1">
                  <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-8 shadow-inner shadow-amber-500/20">
                    <span className="material-symbols-outlined text-3xl">currency_exchange</span>
                  </div>
                  <h2 className="font-headline font-bold text-3xl text-on-surface dark:text-white mb-6">
                    {t('tutorialSection6Title')}
                  </h2>
                  <p className="text-on-surface-variant dark:text-gray-400 text-lg leading-relaxed font-medium">
                    {t('tutorialSection6Desc')}
                  </p>
                </div>
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-[300px] aspect-square rounded-3xl bg-surface-container-low dark:bg-slate-800 border-2 border-amber-500/20 p-8 shadow-2xl -rotate-3 group-hover:rotate-0 transition-transform duration-700">
                      <div className="flex flex-col justify-between h-full py-4 uppercase tracking-[0.2em] font-black pointer-events-none">
                         <div className="flex justify-between items-center text-on-surface-variant/40">
                            <span>USD</span>
                            <span className="text-xs">→</span>
                            <span className="text-amber-500">IDR</span>
                         </div>
                         <div className="flex justify-between items-center text-on-surface-variant/40">
                            <span>SOL</span>
                            <span className="text-xs">→</span>
                            <span className="text-amber-500">USD</span>
                         </div>
                         <div className="flex justify-between items-center text-on-surface-variant/40">
                            <span>GOLD</span>
                            <span className="text-xs">→</span>
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
        <section className="mt-20 max-w-2xl mx-auto p-10 rounded-[40px] bg-secondary/5 border border-secondary/20 text-center animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.7s' }}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-[80px] rounded-full"></div>
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mx-auto mb-8 shadow-inner shadow-secondary/20">
            <span className="material-symbols-outlined text-3xl">science</span>
          </div>
          <h3 className="font-headline font-black text-2xl text-on-surface dark:text-white mb-6 uppercase tracking-tight">Curious about the math?</h3>
          <p className="text-on-surface-variant dark:text-gray-400 mb-10 font-medium italic text-lg px-4 leading-relaxed">
            Go deeper into the triangular arbitrage, neural extraction, and real-time synchronization windows.
          </p>
          <Link 
            href="/engine" 
            className="inline-flex items-center gap-2 text-secondary font-black uppercase tracking-[0.3em] text-xs hover:gap-6 transition-all group"
          >
            {t('exploreEngine')}
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">arrow_forward</span>
          </Link>
        </section>

        {/* Final CTA */}
        <section className="mt-40 mb-48 text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
           <h2 className="font-headline font-bold text-4xl text-on-surface dark:text-white mb-10 tracking-tight">Ready to architect your wealth?</h2>
           {user ? (
             <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95"
             >
               {t('tutorialCTADashboard')}
               <span className="material-symbols-outlined">rocket_launch</span>
             </Link>
           ) : (
             <button 
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95"
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
