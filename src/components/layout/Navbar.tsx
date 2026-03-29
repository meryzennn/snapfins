"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useCurrency } from "@/hooks/useCurrency";
import { currencySymbols, type SupportedCurrency } from "@/lib/currency";
import { createClient } from "@/utils/supabase/client";

interface NavbarProps {
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  onDeleteAccount: () => void;
}

export default function Navbar({ userName, userEmail, userAvatar, onDeleteAccount }: NavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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

  const navItems = [
    { name: t("navDashboard"), href: "/dashboard", icon: "dashboard" },
    { name: t("navAsset"), href: "/assets", icon: "account_balance_wallet" },
    { name: t("navAnalytics"), href: "/analytics", icon: "monitoring" },
  ];

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-outline-variant/30">
      <div className="flex justify-between items-center w-full px-4 sm:px-6 py-2 md:py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 cursor-pointer group">
            <span className="text-lg md:text-xl font-extrabold tracking-tighter text-indigo-700 dark:text-indigo-300 font-headline group-hover:text-primary transition-colors">
              SnapFins
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 font-manrope font-semibold tracking-tight text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors flex flex-col relative py-1 ${
                  pathname === item.href
                    ? "text-primary font-bold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-2 duration-300"></span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div
            className={`flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5 relative ${
              showCurrencyDropdown ? "z-[60]" : ""
            }`}
            ref={currencyDropdownRef}
          >
            <button
              onClick={() => {
                setShowCurrencyDropdown(!showCurrencyDropdown);
                setShowUserDropdown(false);
              }}
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-1.5 rounded-md text-[9px] md:text-[10px] font-black text-primary hover:bg-primary/5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs md:text-sm">payments</span>
              <span className="xs:inline">{currency}</span>
              <span className="material-symbols-outlined text-[10px]">
                {showCurrencyDropdown ? "expand_less" : "expand_more"}
              </span>
            </button>

            <div
              className={`absolute right-0 lg:left-0 top-10 mt-2 w-48 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden text-[11px] dropdown-transition origin-top-right lg:origin-top-left ${
                showCurrencyDropdown
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible"
                  : "opacity-0 -translate-y-8 scale-90 pointer-events-none invisible"
              }`}
            >
              <div className="px-3 py-2 border-b border-outline-variant/10 font-black text-[9px] uppercase tracking-widest text-on-surface-variant bg-slate-50 dark:bg-slate-800">
                {t("preferredCurrency")}
              </div>
              <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
                {(Object.keys(currencySymbols) as SupportedCurrency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between ${
                      currency === c
                        ? "text-primary font-black bg-primary/5"
                        : "text-on-surface font-semibold"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-primary/60 font-mono w-4">{currencySymbols[c]}</span>
                      {c}
                    </span>
                    {currency === c && <span className="material-symbols-outlined text-sm">check</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5">
            <button
              onClick={() => setLang("en")}
              className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-1.5 rounded-md transition-colors ${
                lang === "en" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("id")}
              className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-1.5 rounded-md transition-colors ${
                lang === "id" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              ID
            </button>
          </div>

          <div
            className="relative border-l border-outline-variant/30 pl-2 md:pl-4 ml-1 md:ml-4"
            ref={userDropdownRef}
          >
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowCurrencyDropdown(false);
              }}
              className="flex items-center gap-2 md:gap-3 hover:bg-surface-container-low p-1 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              <div className="text-right hidden sm:block text-slate-900 dark:text-white">
                <p className="text-[11px] font-extrabold text-on-surface leading-tight">{userName}</p>
                <p className="text-[9px] font-medium text-on-surface-variant leading-tight opacity-70">
                  {userEmail}
                </p>
              </div>
              <img
                alt="User profile"
                referrerPolicy="no-referrer"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary/20 object-cover shadow-sm"
                src={
                  userAvatar ||
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBE0e9w4xGMbdwDYXMaDw5uETVXAmCsb2dhI8hfIpOO3BPWgMaL0JjQzcpHBM7CT9NYI1ldia3F2nXUV5w3qb3mMDQz-OTK-jeHMEnz039x-WujlEaGvN3up-hQu3sr7A0G-nmdIg9113_eJSO-g9Mpnz1eq1fYd6INd1L0Flb-PXWLfhqXoh5e8wARW0avQOljBQFUftRfAqKCQ6Fw-PDIi6C3txyigy8dE7NZEcNbsgG6NlCq8YmU7KjLMJ2ODW7FZcU7PiQ025U"
                }
              />
            </button>

            <div
              className={`absolute right-0 top-12 mt-2 w-64 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden dropdown-transition origin-top-right ${
                showUserDropdown
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible"
                  : "opacity-0 -translate-y-8 scale-90 pointer-events-none invisible"
              }`}
            >
              <div className="px-5 py-4 border-b border-outline-variant/10 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{t("profile")}</p>
                <p className="text-sm font-bold text-on-surface truncate">{userName}</p>
                <p className="text-[10px] text-on-surface-variant truncate opacity-60">{userEmail}</p>
              </div>

              <div className="p-2 space-y-1">
                {mounted && (
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors text-sm font-bold group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                        {theme === "dark" ? "light_mode" : "dark_mode"}
                      </span>
                      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                    </div>
                    <div className="w-8 h-4 bg-outline-variant/30 rounded-full relative">
                      <div
                        className={`absolute top-0.5 w-3 h-3 bg-primary rounded-full transition-all ${
                          theme === "dark" ? "right-0.5" : "left-0.5"
                        }`}
                      ></div>
                    </div>
                  </button>
                )}

                <div className="h-px bg-outline-variant/10 my-1 mx-2" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-low transition-colors text-sm font-bold group"
                >
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                    logout
                  </span>
                  {t("logout")}
                </button>

                <div className="h-px bg-outline-variant/10 my-1 mx-2" />

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onDeleteAccount();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors text-sm font-bold group"
                >
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-error transition-colors">
                    delete_forever
                  </span>
                  {t("deleteAccount")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
