"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import { createClient } from "@/utils/supabase/client";
import Footer from "@/components/layout/Footer";

export default function EnginePage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-primary/20 transition-colors duration-500 font-serif">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header / Nav (Consistent with Landing/Tutorial) */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group font-sans">
             <span className="text-xl font-headline font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 group-hover:text-primary transition-colors">SnapFins</span>
          </Link>
          <div className="flex items-center gap-6 font-sans">
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

      {/* Floating Back Button */}
      <Link 
        href="/" 
        className="fixed top-24 right-6 z-[60] flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-outline-variant/20 shadow-xl hover:shadow-primary/10 hover:-translate-y-0.5 transition-all group/back active:scale-95"
      >
        <span className="material-symbols-outlined text-sm group-hover/back:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{t('backToHome')}</span>
      </Link>

      {/* Main Document Container */}
      <main className="max-w-4xl mx-auto px-8 pt-32 pb-40">
        
        {/* Document Header */}
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white leading-tight mb-6 font-sans tracking-tight">
            {t('whitepaperTitle')}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 text-[10px] font-sans font-black uppercase tracking-[0.2em] text-black/40 dark:text-white/40 border-y border-black/5 dark:border-white/5 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] opacity-30">Protocol</span>
              <span className="text-black dark:text-white">Technical Whitepaper</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] opacity-30">Release</span>
              <span className="text-black dark:text-white">v1.0.4 | March 2026</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] opacity-30">Lead Architect</span>
              <a href="https://www.0x5zen.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-all">0x5zen</a>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] opacity-30">Classification</span>
              <span className="text-black dark:text-white italic">Public Release</span>
            </div>
          </div>
        </header>

        {/* Abstract Section */}
        <section className="mb-24 bg-black/[0.02] dark:bg-white/[0.02] p-10 rounded-2xl border border-black/5 dark:border-white/5 italic text-lg leading-relaxed text-black/80 dark:text-white/80">
          <span className="font-sans font-black uppercase text-xs tracking-widest block mb-4 font-sans not-italic opacity-40">{t('whitepaperAbstractLabel')}</span>
          &ldquo;{t('whitepaperAbstract')}&rdquo;
        </section>

        {/* Table of Contents */}
        <nav className="mb-32 p-8 border border-black/5 dark:border-white/5 rounded-2xl font-sans">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 opacity-40 font-sans">{t('whitepaperContentsLabel')}</h2>
          <ul className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const keys = [
                'whitepaperIntroTitle',
                'whitepaperSection1DeepTitle',
                'whitepaperSection2DeepTitle',
                'whitepaperSection3DeepTitle',
                'whitepaperSection4DeepTitle',
                'whitepaperConclusionTitle'
              ];
              const titleKey = keys[num - 1] as any;
              
              return (
                <li key={num}>
                  <button 
                    onClick={() => scrollToSection(`section-${num}`)}
                    className="w-full text-left text-sm font-bold p-4 -mx-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-4 text-black/60 dark:text-white/60 group font-sans"
                  >
                    <span className="w-6 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">{num}.0</span>
                    <span className="group-hover:translate-x-1 group-hover:text-black dark:group-hover:text-white transition-all">
                      {t(titleKey)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-32 prose prose-lg dark:prose-invert max-w-none prose-headings:font-sans prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:leading-[1.8] prose-p:text-black/80 dark:prose-p:text-white/70">
          
          {/* 1.0 Intro */}
          <section id="section-1" className="scroll-mt-24">
            <h2 className="text-2xl mb-8">{t('whitepaperIntroTitle')}</h2>
            <p className="text-xl leading-relaxed">
              {t('whitepaperIntroText')}
            </p>
          </section>

          {/* 2.0 Neural Vision */}
          <section id="section-2" className="scroll-mt-24">
            <h2 className="text-2xl mb-8">{t('whitepaperSection1DeepTitle')}</h2>
            <p>
              {t('whitepaperSection1DeepText')}
            </p>
            
            <div className="my-12 p-8 bg-black dark:bg-slate-900 rounded-2xl border border-white/5 font-mono text-sm overflow-hidden relative group">
              <div className="absolute top-3 right-4 text-[10px] font-black text-white/20 uppercase tracking-widest">VISION_TO_JSON_KERNEL</div>
              <div className="text-indigo-400">INPUT: <span className="text-white">MultimodalImage(Receipt)</span></div>
              <div className="text-indigo-400">PROMPT: <span className="text-emerald-400">"Infer {`{merchant, total, currency}`} from hierarchical spatial cues"</span></div>
              <div className="mt-4 border-t border-white/10 pt-4 text-blue-400">
                RESULT: <span className="text-amber-400">{`{ "confidence": 0.992, "deterministic": true }`}</span>
              </div>
            </div>
          </section>

          {/* 3.0 USD Pivot Math */}
          <section id="section-3" className="scroll-mt-24">
            <h2 className="text-2xl mb-8">{t('whitepaperSection2DeepTitle')}</h2>
            <p>
              {t('whitepaperSection2DeepText')}
            </p>

            <div className="my-12 p-12 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold tracking-widest font-sans opacity-40 mb-8 underline decoration-primary decoration-2 underline-offset-8">{t('whitepaperEquationTitle')}</span>
              <div className="text-4xl md:text-5xl italic font-serif text-black dark:text-white mb-4">
                V = Σ(Q<sub>i</sub> × (P<sub>i</sub> / P<sub>usd</sub>)) - ΣL<sub>i</sub>
              </div>
              <p className="text-xs font-sans font-bold opacity-40 mt-4 tracking-wider">
                {t('whitepaperEquationLegend')}
              </p>
            </div>
          </section>

          {/* 4.0 Data Mesh */}
          <section id="section-4" className="scroll-mt-24">
            <h2 className="text-2xl mb-8">{t('whitepaperSection3DeepTitle')}</h2>
            <p>
              {t('whitepaperSection3DeepText')}
            </p>

            {/* Real Data Source Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 font-sans">
              <a 
                href="https://www.binance.com/en/binance-api" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex flex-col items-center p-8 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all"
              >
                <div className="w-12 h-12 bg-[#F3BA2F]/10 rounded-full flex items-center justify-center mb-4 overflow-hidden p-2">
                  <img src="/binance.webp" alt="Binance Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] mb-1">BINANCE API</span>
                <span className="text-[8px] opacity-40">{t('whitepaperSourceLabel')}: BINANCE.COM</span>
              </a>

              <a 
                href="https://finance.yahoo.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex flex-col items-center p-8 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all"
              >
                <div className="w-12 h-12 bg-[#720e9e]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl font-black text-[#720e9e]">Y!</span>
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] mb-1 uppercase">Yahoo Finance</span>
                <span className="text-[8px] opacity-40 uppercase">{t('whitepaperSourceLabel')}: Finance.Yahoo</span>
              </a>

              <a 
                href="https://openexchangerates.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex flex-col items-center p-8 rounded-2xl border border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                   <svg viewBox="0 0 24 24" className="w-8 h-8 fill-blue-500" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v10h-2V7z"/></svg>
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] mb-1">OPENEXCHANGE</span>
                <span className="text-[8px] opacity-40">{t('whitepaperSourceLabel')}: OXR.ORG</span>
              </a>
            </div>
          </section>

          {/* 5.0 Privacy */}
          <section id="section-5" className="scroll-mt-24">
            <h2 className="text-2xl mb-8">{t('whitepaperSection4DeepTitle')}</h2>
            <p>
              {t('whitepaperSection4DeepText')}
            </p>
          </section>

          {/* 6.0 Conclusion */}
          <section id="section-6" className="scroll-mt-24">
            <h2 className="text-2xl mb-8">{t('whitepaperConclusionTitle')}</h2>
            <p className="text-xl leading-relaxed opacity-90 border-l-4 border-black dark:border-white pl-8 py-4">
              {t('whitepaperConclusionText')}
            </p>
          </section>

        </div>
      </main>

      <Footer containerClassName="max-w-5xl" />
    </div>
  );
}
