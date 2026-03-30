"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { createClient } from "@/utils/supabase/client";

interface ProfileDropdownProps {
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  onDeleteAccount?: () => void;
  showDashboardLink?: boolean;
}

export default function ProfileDropdown({ 
  userName, 
  userEmail, 
  userAvatar, 
  onDeleteAccount,
  showDashboardLink = true
}: ProfileDropdownProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 md:gap-3 hover:bg-surface-container-low dark:hover:bg-white/5 p-1 rounded-xl transition-all active:scale-95 cursor-pointer"
      >
        <div className="text-right hidden sm:block text-slate-900 dark:text-white">
          <p className="text-[11px] font-extrabold text-on-surface dark:text-white leading-tight">{userName || 'User'}</p>
          <p className="text-[9px] font-medium text-on-surface-variant dark:text-gray-400 leading-tight opacity-70">
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
          showDropdown
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto visible"
            : "opacity-0 -translate-y-8 scale-90 pointer-events-none invisible"
        }`}
      >
        <div className="px-5 py-4 border-b border-outline-variant/10 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{t("profile")}</p>
          <p className="text-sm font-bold text-on-surface dark:text-white truncate">{userName}</p>
          <p className="text-[10px] text-on-surface-variant dark:text-gray-400 truncate opacity-60">{userEmail}</p>
        </div>

        <div className="p-2 space-y-1">
          {showDashboardLink && (
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-sm font-bold group"
              onClick={() => setShowDropdown(false)}
            >
              <span className="material-symbols-outlined text-on-surface-variant dark:text-gray-400 group-hover:text-primary transition-colors">
                dashboard
              </span>
              <span>{t("navDashboard")}</span>
            </Link>
          )}

          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-sm font-bold group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant dark:text-gray-400 group-hover:text-primary transition-colors">
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-sm font-bold group"
          >
            <span className="material-symbols-outlined text-on-surface-variant dark:text-gray-400 group-hover:text-primary transition-colors">
              logout
            </span>
            {t("logout")}
          </button>

          {onDeleteAccount && (
            <>
              <div className="h-px bg-outline-variant/10 my-1 mx-2" />
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onDeleteAccount();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors text-sm font-bold group"
              >
                <span className="material-symbols-outlined text-on-surface-variant dark:text-gray-400 group-hover:text-error transition-colors">
                  delete_forever
                </span>
                {t("deleteAccount")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
