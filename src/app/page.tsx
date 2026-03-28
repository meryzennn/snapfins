"use client";

import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleTheme = () => {
    const isDark = theme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.documentElement.classList.add(isDark ? 'transition-to-light' : 'transition-to-dark');
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove('transition-to-light', 'transition-to-dark');
    });
  };

  const handleLogin = async (provider: 'google' | 'github') => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="font-body bg-surface text-on-surface antialiased min-h-screen">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col max-w-sm w-full border border-outline-variant/20 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-2xl text-on-surface">{t('signIn')}</h3>
              <button onClick={() => setShowLoginModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <p className="text-sm text-on-surface-variant mb-6">{t('signInSubtitle')}</p>
            <div className="space-y-4">
              <button onClick={() => { setShowLoginModal(false); handleLogin('google'); }} className="group cursor-pointer w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-outline-variant/30 py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:shadow-md hover:-translate-y-1 active:scale-95 duration-300 font-semibold shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                {t('continueWithGoogle')}
              </button>
              <button onClick={() => { setShowLoginModal(false); handleLogin('github'); }} className="group cursor-pointer w-full flex items-center justify-center gap-3 bg-[#24292F] dark:bg-white text-white dark:text-gray-900 py-3 px-4 rounded-xl hover:bg-[#24292f]/90 dark:hover:bg-gray-100 transition-all hover:shadow-md hover:-translate-y-1 active:scale-95 duration-300 font-semibold shadow-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23C10.53 4.8 11.28 4.65 12 4.65c.72 0 1.47.15 2.43.48 2.28-1.545 3.285-1.23 3.285-1.23.645 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                {t('continueWithGithub')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-gray-950/80 backdrop-blur-xl bg-surface-container-low dark:bg-gray-900 shadow-sm border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <span className="text-2xl font-extrabold tracking-tight text-on-surface dark:text-white font-headline group-hover:text-primary transition-colors">SnapFins</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-primary dark:text-primary-container font-semibold transition-colors duration-200" href="#">{t('home')}</a>
            <a className="text-on-surface-variant dark:text-gray-400 hover:text-primary dark:hover:text-primary-container transition-colors duration-200" href="#">{t('features')}</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5">
                <button onClick={() => setLang('en')} className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>EN</button>
                <button onClick={() => setLang('id')} className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === 'id' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>ID</button>
              </div>
              <div className="w-10 h-10 flex items-center justify-center">
                {mounted && (
                  <button 
                    onClick={toggleTheme}
                    className="w-full h-full rounded-full hover:bg-surface-container-high dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-gray-400">
                      {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                  </button>
                )}
              </div>
            </div>
            {user ? (
              <Link href="/dashboard" className="hidden md:block px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all duration-200 ease-in-out shadow-sm">
                {t('navDashboard')}
              </Link>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="hidden md:block px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all duration-200 ease-in-out shadow-sm"
              >
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 overflow-hidden">
        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-semibold mb-6">
            <span className="kinetic-spark"></span>
            {t('heroBadge')}
          </div>
          <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight text-on-surface leading-[1.1] mb-8">
            {t('heroTitle1')}<br/>
            <span className="text-primary-container">{t('heroTitle2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            {user ? (
              <Link 
                href="/dashboard" 
                className="bg-gradient-to-br from-primary to-primary-container px-10 py-5 rounded-lg text-white font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 w-full sm:w-auto text-center"
              >
                {t('navDashboard')}
              </Link>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)} 
                className="bg-gradient-to-br from-primary to-primary-container px-10 py-5 rounded-lg text-white font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 w-full sm:w-auto text-center"
              >
                {t('heroGetStarted')}
              </button>
            )}
          </div>
          
          {/* Hero Visual: Asymmetric Mock-up */}
          <div className="relative w-full max-w-6xl mt-12 group">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Receipt Scan Visual */}
              <div className="md:col-span-5 bg-surface-container-lowest rounded-2xl p-8 shadow-2xl shadow-on-surface/5 transform -rotate-3 hover:rotate-0 transition-transform duration-500 border border-outline-variant/10">
                <img 
                  className="w-full aspect-[3/4] object-cover rounded-lg mb-6 grayscale hover:grayscale-0 transition-all duration-700" 
                  alt="Close-up of a paper receipt on a dark slate surface with a glowing green neon laser line" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCql1V3pS9DzpjkWluWFOXIAhS3_C2oH6btFY-n_PyCmG38hnRzqLEgKxY8NPtJb025KCIXoZyeXnTommVWlrgteiMj8QDsVqhJZ7Yk0AzLb8db0wsJJYfD8pqzqDF-fbPm7u3MNrwUTOXnGjCO2dMZRD3fz2oI23pLm2V7nJFEll7WEqJQBzksLEAP9g2BfnbGRgSQ4OpxwBBZvkA5LOXN1OBIw8nQAQnMzLUkVNLpmBX1ToUQzv2RKI41YP_NG36KIJkEonKznoc" 
                />
                <div className="space-y-3">
                  <div className="h-2 w-3/4 bg-surface-container-high rounded hidden md:block border border-outline-variant/10"></div>
                  <div className="h-2 w-1/2 bg-surface-container-high rounded hidden md:block border border-outline-variant/10"></div>
                </div>
              </div>
              
              {/* Transition Arrow */}
              <div className="hidden md:flex md:col-span-2 justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">trending_flat</span>
              </div>
              
              {/* Spreadsheet Results Visual */}
              <div className="md:col-span-5 bg-surface-container-lowest rounded-2xl p-8 shadow-2xl shadow-on-surface/5 transform rotate-2 hover:rotate-0 transition-transform duration-500 border border-outline-variant/10">
                <div className="overflow-hidden rounded-lg">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-container-low text-on-surface-variant font-medium">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Merchant</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      <tr>
                        <td className="p-3">Oct 24</td>
                        <td className="p-3 font-semibold">Starbucks</td>
                        <td className="p-3 text-secondary text-right font-bold">$5.40</td>
                      </tr>
                      <tr>
                        <td className="p-3">Oct 23</td>
                        <td className="p-3 font-semibold">Amazon</td>
                        <td className="p-3 text-secondary text-right font-bold">$124.99</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-3">Oct 23</td>
                        <td className="p-3 font-semibold text-primary">Solana Purchase</td>
                        <td className="p-3 text-primary text-right font-bold">$500.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-between items-center hidden md:flex">
                  <span className="text-label-sm text-xs font-semibold text-on-surface-variant">Exported to Sheets</span>
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-surface mb-4">{t('featuresSectionTitle')}</h2>
              <p className="text-on-surface-variant max-w-xl">{t('featuresSectionSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-3">{t('feature1Title')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t('feature1Desc')}</p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-secondary text-3xl">grid_view</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-3">{t('feature2Title')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t('feature2Desc')}</p>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-tertiary-container/10 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-tertiary-container text-3xl">account_balance_wallet</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface mb-3">{t('feature3Title')}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{t('feature3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="bg-on-surface dark:bg-surface-container-high rounded-3xl p-12 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[120px] rounded-full"></div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="font-headline font-extrabold text-4xl md:text-5xl text-white mb-8">{t('ctaTitle')}</h2>
              <p className="text-surface-variant/80 dark:text-gray-300 text-lg mb-12">{t('ctaSubtitle')}</p>
              <div className="flex justify-center">
                {user ? (
                  <Link 
                    href="/dashboard" 
                    className="bg-white dark:bg-primary text-on-surface dark:text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-surface-container-lowest dark:hover:bg-primary-container transition-all hover:scale-105 duration-200 inline-block shadow-xl"
                  >
                    {t('navDashboard')}
                  </Link>
                ) : (
                  <button 
                    onClick={() => setShowLoginModal(true)} 
                    className="bg-white dark:bg-primary text-on-surface dark:text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-surface-container-lowest dark:hover:bg-primary-container transition-all hover:scale-105 duration-200 inline-block shadow-xl"
                  >
                    {t('ctaButton')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t-0 bg-surface-container-low dark:bg-gray-950">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            <span className="text-lg font-bold text-on-surface dark:text-white font-headline">SnapFins</span>
            <p className="text-on-surface-variant dark:text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest">{t('footerRights')}</p>
          </div>
          <div className="flex gap-8 font-bold tracking-widest uppercase">
            <Link className="text-on-surface-variant dark:text-gray-500 hover:text-primary dark:hover:text-white transition-colors text-sm font-medium" href="/privacy">{t('privacyPolicy')}</Link>
            <Link className="text-on-surface-variant dark:text-gray-500 hover:text-primary dark:hover:text-white transition-colors text-sm font-medium" href="/terms">{t('termsOfService')}</Link>
            <a className="text-on-surface-variant dark:text-gray-500 hover:text-primary dark:hover:text-white transition-colors text-sm font-medium" href="mailto:zen@0x5zen.dev">{t('support')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
