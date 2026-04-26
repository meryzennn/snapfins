"use client";

import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import AuthModal from "@/components/AuthModal";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import SupportModal from "@/components/SupportModal";
import Footer from "@/components/layout/Footer";
import { useScrollLock } from "@/hooks/useScrollLock";
import { LandingPageSkeleton } from "@/components/Skeleton";
import { useReveal } from "@/hooks/useReveal";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { AnimatePresence } from "framer-motion";
import InstallPWAButton from "@/components/InstallPWAButton";
import HeroVideo from "@/components/HeroVideo";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Reveal refs for each major section
  const heroRef = useReveal();
  const featRef = useReveal();
  const guideRef = useReveal();
  const ctaRef = useReveal();

  useEffect(() => {
    setMounted(true);
    const checkUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        
        // Redirect to dashboard if logged in, unless they explicitly clicked 
        // to explore the landing page (e.g. from the dashboard logo)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("explore") !== "true") {
          router.replace("/dashboard");
        }
      }
    };
    checkUser();
  }, [router]);

  // Ref to prevent scroll spy from overriding a click-set section
  // while the smooth scroll animation is still playing.
  const clickLockedRef = useRef(false);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    // Lock the scroll spy for 700ms (longer than CSS scroll-smooth transition)
    clickLockedRef.current = true;
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      clickLockedRef.current = false;
    }, 700);
  };

  useEffect(() => {
    const sections = ["home", "features", "guide"];

    let ticking = false;

    const getActiveSection = () => {
      // Don't override while a nav click is still animating
      if (clickLockedRef.current) {
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      let current = "home";

      if (scrollY >= 80) {
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top + scrollY - 120 <= scrollY) {
            current = id;
          }
        }
      }

      setActiveSection((prev) => prev !== current ? current : prev);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(getActiveSection);
        ticking = true;
      }
    };

    getActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Apply scroll lock specifically when the Login Modal is open.
  // SupportModal handles its own scroll lock internally.
  useScrollLock(showLoginModal);

  const toggleTheme = () => {
    const isDark = theme === "dark";
    const newTheme = isDark ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.documentElement.classList.add(
      isDark ? "transition-to-light" : "transition-to-dark",
    );
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove(
        "transition-to-light",
        "transition-to-dark",
      );
    });
  };

  const handleLogin = async (provider: "google" | "github") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams:
          provider === "github"
            ? {
                prompt: "select_account",
              }
            : undefined,
      },
    });
  };

  // We remove the full-page LandingPageSkeleton blocker so the real header and content are SSR'd.
  // This prevents the "flash of unstyled content" or large layout shifts on the header
  // when switching from skeleton to real page, and significantly improves SEO.

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 font-body text-on-surface antialiased scroll-smooth">
      {/* Login Modal */}
      <AnimatePresence mode="wait">
        {showLoginModal && (
          <AuthModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-gray-950/80 backdrop-blur-xl bg-surface-container-low dark:bg-gray-900 shadow-sm border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 font-headline group-hover:text-primary transition-colors">
              SnapFins
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a
              className={`${activeSection === "home" ? "text-primary dark:text-primary-container font-bold" : "text-on-surface-variant dark:text-gray-400 font-semibold"} transition-all duration-300 cursor-pointer`}
              href="#home"
              onClick={() => handleNavClick("home")}
            >
              {t("home")}
            </a>
            <a
              className={`${activeSection === "features" ? "text-primary dark:text-primary-container font-bold" : "text-on-surface-variant dark:text-gray-400 font-semibold"} transition-all duration-300 cursor-pointer`}
              href="#features"
              onClick={() => handleNavClick("features")}
            >
              {t("features")}
            </a>
            <a
              className={`${activeSection === "guide" ? "text-primary dark:text-primary-container font-bold" : "text-on-surface-variant dark:text-gray-400 font-semibold"} transition-all duration-300 cursor-pointer`}
              href="#guide"
              onClick={() => handleNavClick("guide")}
            >
              {t("navGuide")}
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <InstallPWAButton variant="header" />
            <div className="flex items-center gap-2">
              <div className="flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5">
                <button
                  onClick={() => setLang("en")}
                  className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === "en" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("id")}
                  className={`text-[10px] font-bold px-2 py-1.5 rounded-md transition-colors ${lang === "id" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  ID
                </button>
              </div>
              <div className="w-10 h-10 flex items-center justify-center">
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    className="w-full h-full rounded-full hover:bg-surface-container-high dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant dark:text-gray-400">
                      {theme === "dark" ? "light_mode" : "dark_mode"}
                    </span>
                  </button>
                )}
              </div>
            </div>
            {user ? (
              <ProfileDropdown
                userName={
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email?.split("@")[0] ||
                  "User"
                }
                userEmail={user.email}
                userAvatar={
                  user.user_metadata?.avatar_url || user.user_metadata?.picture
                }
                showDashboardLink={true}
              />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="hidden md:block px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all duration-200 ease-in-out shadow-sm"
              >
                {t("login")}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 overflow-hidden">
        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <section
          id="home"
          ref={heroRef}
          className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto"
        >
          <div
            data-reveal="fade"
            data-reveal-delay="0"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container text-xs font-semibold mb-6"
          >
            <span className="kinetic-spark"></span>
            {t("heroBadge")}
          </div>
          <h1
            data-reveal="text"
            data-reveal-delay="1"
            className="font-headline font-extrabold text-4xl md:text-7xl lg:text-8xl tracking-tight text-on-surface leading-[1.1] mb-8"
          >
            {t("heroTitle1")}
            <br />
            <span className="text-primary-container">{t("heroTitle2")}</span>
          </h1>
          <p
            data-reveal="text"
            data-reveal-delay="2"
            className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            {t("heroSubtitle")}
          </p>
          <div
            data-reveal="text"
            data-reveal-delay="3"
            className="flex flex-row gap-3 sm:gap-4 justify-center items-stretch mb-20 w-full max-w-lg mx-auto sm:max-w-none"
          >
            {user ? (
              <Link
                href="/dashboard"
                className="bg-gradient-to-br from-primary to-primary-container px-4 py-4 sm:px-10 sm:py-5 rounded-xl text-white font-bold text-sm sm:text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 flex-1 sm:flex-none flex items-center justify-center text-center"
              >
                {t("navDashboard")}
              </Link>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-br from-primary to-primary-container px-4 py-4 sm:px-10 sm:py-5 rounded-xl text-white font-bold text-sm sm:text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 flex-1 sm:flex-none flex items-center justify-center text-center"
              >
                {t("heroGetStarted")}
              </button>
            )}
            <button
              onClick={() => setShowSupportModal(true)}
              className="bg-surface-container-high dark:bg-slate-800 px-4 py-4 sm:px-8 sm:py-5 rounded-xl text-on-surface dark:text-white font-bold text-xs sm:text-lg border border-outline-variant/30 hover:bg-surface-container-highest dark:hover:bg-slate-700 transition-all active:scale-95 flex-1 sm:flex-none flex items-center justify-center text-center gap-1.5 sm:gap-2 group shadow-sm hover:shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-1"
            >
              <span className="material-symbols-outlined text-rose-500 text-lg sm:text-2xl group-hover:scale-125 transition-all animate-heart-pulse">
                favorite
              </span>
              <span>{t("supportCreator")}</span>
            </button>
          </div>

          {/* Hero Video Component */}
          <div data-reveal="scale" data-reveal-delay="4" className="w-full">
            <HeroVideo />
          </div>


        </section>

        {/* ── Features Section ─────────────────────────────────────────────── */}
        <section
          id="features"
          ref={featRef}
          className="py-24 px-6 bg-surface-container-low dark:bg-slate-900/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full -z-10 animate-pulse delay-700"></div>

          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2
                data-reveal="text"
                data-reveal-delay="0"
                className="font-headline font-bold text-3xl md:text-5xl text-on-surface dark:text-white mb-6"
              >
                {t("featuresSectionTitle")}
              </h2>
              <p
                data-reveal="text"
                data-reveal-delay="1"
                className="text-on-surface-variant dark:text-gray-400 max-w-2xl mx-auto text-lg"
              >
                {t("featuresSectionSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                data-reveal="card"
                data-reveal-delay="2"
                className="group bg-surface/80 dark:bg-slate-900/40 backdrop-blur-xl p-6 sm:p-7 rounded-[32px] border border-white/20 dark:border-white/5 hover:border-primary transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1 duration-500 relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-4xl">
                    auto_awesome
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface dark:text-white mb-4">
                  {t("feature1Title")}
                </h3>
                <p className="text-on-surface-variant dark:text-gray-400 leading-relaxed">
                  {t("feature1Desc")}
                </p>
              </div>

              <div
                data-reveal="card"
                data-reveal-delay="3"
                className="group bg-surface/80 dark:bg-slate-900/40 backdrop-blur-xl p-6 sm:p-7 rounded-[32px] border border-white/20 dark:border-white/5 hover:border-indigo-500 transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1 duration-500 relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-indigo-500 text-4xl">
                    currency_exchange
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface dark:text-white mb-4">
                  {t("feature3Title")}
                </h3>
                <p className="text-on-surface-variant dark:text-gray-400 leading-relaxed">
                  {t("feature3Desc")}
                </p>
              </div>

              <div
                data-reveal="card"
                data-reveal-delay="4"
                className="group bg-surface/80 dark:bg-slate-900/40 backdrop-blur-xl p-6 sm:p-7 rounded-[32px] border border-white/20 dark:border-white/5 hover:border-emerald-500 transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1 duration-500 relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-emerald-500 text-4xl">
                    analytics
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface dark:text-white mb-4">
                  Precision Analytics
                </h3>
                <p className="text-on-surface-variant dark:text-gray-400 leading-relaxed">
                  Experience the clarity of real-time trend badges and growth
                  tracking. Every calculation is verified for maximum accuracy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Guide / Tutorial Section ──────────────────────────────────────── */}
        <section
          id="guide"
          ref={guideRef}
          className="relative py-40 px-6 overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-20 w-px bg-gradient-to-b from-outline-variant/20 to-transparent"></div>

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <span
                data-reveal="fade"
                data-reveal-delay="0"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
              >
                Getting Started
              </span>
              <h2
                data-reveal="text"
                data-reveal-delay="1"
                className="font-headline font-black text-4xl md:text-5xl text-on-surface dark:text-white mt-8 tracking-tighter"
              >
                {t("tutorialTitle")}
              </h2>
            </div>

            <div className="space-y-12 relative">
              {/* Connecting Line */}
              <div className="absolute left-[20px] top-4 bottom-4 w-px bg-gradient-to-b from-primary via-secondary to-transparent hidden sm:block"></div>

              {[
                {
                  num: 1,
                  color: "bg-primary",
                  border: "group-hover:border-primary",
                  title: "tutorialStep1",
                  desc: "step1Desc",
                  textColor: "text-primary",
                  shadow: "shadow-primary/20",
                  delay: 2,
                },
                {
                  num: 2,
                  color: "bg-secondary",
                  border: "group-hover:border-secondary",
                  title: "tutorialStep2",
                  desc: "step2Desc",
                  textColor: "text-secondary",
                  shadow: "shadow-secondary/20",
                  delay: 3,
                },
                {
                  num: 3,
                  color: "bg-indigo-500",
                  border: "group-hover:border-indigo-500",
                  title: "tutorialStep3",
                  desc: "step3Desc",
                  textColor: "text-indigo-500",
                  shadow: "shadow-indigo-500/20",
                  delay: 4,
                },
                {
                  num: 4,
                  color: "bg-emerald-500",
                  border: "group-hover:border-emerald-500",
                  title: "tutorialStep4",
                  desc: "step4Desc",
                  textColor: "text-emerald-500",
                  shadow: "shadow-emerald-500/20",
                  delay: 5,
                  badge: true,
                },
                {
                  num: 5,
                  color: "bg-rose-500",
                  border: "group-hover:border-rose-500",
                  title: "tutorialStep5",
                  desc: "step5Desc",
                  textColor: "text-rose-500",
                  shadow: "shadow-rose-500/20",
                  delay: 6,
                },
              ].map((step) => (
                <div
                  key={step.num}
                  data-reveal="card"
                  data-reveal-delay={step.delay}
                  className="relative group sm:pl-16"
                >
                  <div
                    className={`absolute left-0 top-0 w-10 h-10 rounded-full ${step.color} text-white flex items-center justify-center font-bold text-lg shadow-lg ${step.shadow} z-10 hidden sm:flex`}
                  >
                    {step.num}
                  </div>
                  <div
                    className={`bg-surface-container-low dark:bg-slate-900/50 p-6 sm:p-7 rounded-[32px] border border-outline-variant/10 ${step.border} transition-colors`}
                  >
                    {step.badge && (
                      <div className="flex bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 w-fit">
                        AI Powered
                      </div>
                    )}
                    <h3 className="font-headline font-bold text-xl text-on-surface dark:text-white mb-3 flex items-center gap-3">
                      <span className={`sm:hidden ${step.textColor}`}>
                        {step.num}.
                      </span>{" "}
                      {t(step.title as any)}
                    </h3>
                    <p className="text-on-surface-variant dark:text-gray-400 leading-relaxed font-medium">
                      {t(step.desc as any)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div
              data-reveal
              data-reveal-delay="7"
              className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/tutorial"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-primary/20 hover:border-primary/50 text-white bg-primary font-bold transition-all hover:scale-105 active:scale-95 group shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-200">
                  menu_book
                </span>
                {t("viewDetailedTutorial")}
              </Link>
              <Link
                href="/engine"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-secondary/20 hover:border-secondary/50 text-secondary font-bold transition-all hover:bg-secondary/5 group active:scale-95 italic"
              >
                <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
                  science
                </span>
                {t("exploreEngine")}
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA Section ──────────────────────────────────────────────────── */}
        {!user && (
          <section
            id="cta"
            ref={ctaRef}
            className="py-24 px-6 max-w-7xl mx-auto"
          >
            <div
              data-reveal="scale"
              data-reveal-delay="0"
              className="bg-on-surface dark:bg-surface-container-high rounded-3xl p-12 md:p-24 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[120px] rounded-full"></div>
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2
                  data-reveal="text"
                  data-reveal-delay="1"
                  className="font-headline font-extrabold text-4xl md:text-5xl text-white mb-8"
                >
                  {t("ctaTitle")}
                </h2>
                <p
                  data-reveal="text"
                  data-reveal-delay="2"
                  className="text-surface-variant/80 dark:text-gray-300 text-lg mb-12"
                >
                  {t("ctaSubtitle")}
                </p>
                <div
                  data-reveal
                  data-reveal-delay="3"
                  className="flex justify-center"
                >
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-white dark:bg-primary text-on-surface dark:text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-surface-container-lowest dark:hover:bg-primary-container transition-all hover:scale-105 duration-200 inline-block shadow-xl"
                  >
                    {t("ctaButton")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <AnimatePresence mode="wait">
        {showSupportModal && (
          <SupportModal onClose={() => setShowSupportModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
