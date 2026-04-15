"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/useLang";
import { useTheme } from "@/hooks/useTheme";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  return (
    <div className="min-h-screen bg-surface-container-lowest dark:bg-slate-950 text-on-surface font-body font-medium selection:bg-primary/20 transition-colors duration-500">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header / Nav (Consistent with Landing/Tutorial/Engine) */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-high dark:bg-slate-900 border border-outline-variant/20 hover:border-primary/50 text-on-surface-variant hover:text-primary transition-all active:scale-90 group/back"
              aria-label="Back to landing"
            >
              <span className="material-symbols-outlined text-[20px] group-hover/back:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
            </Link>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-headline font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 group-hover:text-primary transition-colors">
                SnapFins
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            {/* Toggles */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-lg p-0.5">
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
                    className="w-full h-full rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-black/60 dark:text-gray-400">
                      {theme === "dark" ? "light_mode" : "dark_mode"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-6 max-w-4xl mx-auto text-on-surface-variant leading-relaxed space-y-10">
        <div className="space-y-4 mb-16 border-b border-outline-variant/30 pb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface dark:text-white tracking-tight">
            {t("privacyHeader")}
          </h1>
          <p className="text-lg opacity-60">{t("privacyEffective")}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface dark:text-white">
            {t("privacyIntroTitle")}
          </h2>
          <p className="dark:text-slate-400">{t("privacyIntroText")}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface dark:text-white">
            {t("privacyDataTitle")}
          </h2>
          <ul className="list-disc leading-loose ml-6 space-y-2 dark:text-slate-400">
            <li>
              <strong className="text-on-surface dark:text-white">
                {t("privacyDataList1").split(":")[0]}:
              </strong>
              {t("privacyDataList1").split(":")[1]}
            </li>
            <li>
              <strong className="text-on-surface dark:text-white">
                {t("privacyDataList2").split(":")[0]}:
              </strong>
              {t("privacyDataList2").split(":")[1]}
            </li>
            <li>
              <strong className="text-on-surface dark:text-white">
                {t("privacyDataList3").split(":")[0]}:
              </strong>
              {t("privacyDataList3").split(":")[1]}
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold font-headline text-on-surface dark:text-white">
            {t("privacyAiTitle")}
          </h2>
          <p className="dark:text-slate-400">{t("privacyAiText")}</p>
        </section>

        <section className="space-y-4 mt-10">
          <p className="dark:text-slate-400">
            {t("privacyContact")}{" "}
            <a
              href="mailto:zen@0x5zen.dev"
              className="text-primary font-bold hover:underline"
            >
              zen@0x5zen.dev
            </a>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
