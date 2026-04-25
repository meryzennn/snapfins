"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLang } from "@/hooks/useLang";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useCurrency } from "@/hooks/useCurrency";
import { convert, formatValue, type SupportedCurrency } from "@/lib/currency";
import { createClient } from "@/utils/supabase/client";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import DataSyncModal from "@/components/DataSyncModal";

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
  const { t, lang } = useLang();
  const { currency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showGDriveModal, setShowGDriveModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useScrollLock(showLogoutConfirm);

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

  const confirmLogout = async () => {
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

  const handleExportAllData = async () => {
    setIsExporting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      alert("Authentication required");
      setIsExporting(false);
      return;
    }

    try {
      const [{ data: transactions }, { data: assets }] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", userData.user.id).order("date", { ascending: false }),
        supabase.from("assets").select("*").eq("user_id", userData.user.id)
      ]);

      if (!transactions || !assets) throw new Error("Failed to fetch data");

      // Create workbook
      const wb = XLSX.utils.book_new();

      // 1. Summary Sheet
      const totalAssetsValue = assets.reduce((sum, a) => {
        const val = Number(a.current_value) || 0;
        const assetCur = (a.currency || "USD") as SupportedCurrency;
        return sum + convert(val, assetCur, currency as SupportedCurrency);
      }, 0);

      const summaryData = [
        ["Financial Summary Report"],
        [],
        ["Metric", "Value", "Notes"],
        ["Export Date", new Date().toLocaleString(), ""],
        ["User", userName || userEmail, ""],
        ["Base Currency", currency, "All converted metrics use this base"],
        ["Total Assets Value", totalAssetsValue, `Converted to ${currency}`],
        ["Transacton Count", transactions.length, ""],
        ["Asset Count", assets.length, ""],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      // 2. Assets Sheet
      const assetHeaders = [["Asset Name", "Category", "Current Value", "Currency", "Symbol", "Last Updated"]];
      const assetRows = assets.map(a => [
        a.name,
        a.category,
        a.current_value,
        a.currency,
        a.symbol || "-",
        a.updated_at ? new Date(a.updated_at).toLocaleDateString() : "-"
      ]);
      const wsAssets = XLSX.utils.aoa_to_sheet([...assetHeaders, ...assetRows]);
      XLSX.utils.book_append_sheet(wb, wsAssets, "Assets");

      // 3. Transactions Sheet
      const txHeaders = [["Date", "Category", "Description", "Type", "Amount", "Currency", "Source Account"]];
      const txRows = transactions.map(tx => [
        tx.date,
        tx.category,
        tx.description,
        tx.type,
        tx.amount,
        tx.currency,
        tx.source || "-"
      ]);
      const wsTransactions = XLSX.utils.aoa_to_sheet([...txHeaders, ...txRows]);
      XLSX.utils.book_append_sheet(wb, wsTransactions, "Transactions");

      // Trigger download
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `snapfins_report_${timestamp}.xlsx`);
      
      setShowDropdown(false);
    } catch (err) {
      console.error(err);
      alert("Failed to export Excel. Please try again.");
    } finally {
      setIsExporting(false);
    }
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

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 top-12 mt-2 w-64 bg-white dark:bg-slate-900 border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden origin-top-right"
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
                onClick={handleExportAllData}
                disabled={isExporting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-sm font-bold group disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-on-surface-variant dark:text-gray-400 group-hover:text-primary transition-colors ${isExporting ? 'animate-spin' : ''}`}>
                  {isExporting ? 'sync' : 'download'}
                </span>
                <span>{isExporting ? (lang === 'id' ? 'Mengekspor...' : 'Exporting...') : (lang === 'id' ? 'Ekspor Data (Excel)' : 'Export Data (Excel)')}</span>
              </button>

              <div className="h-px bg-outline-variant/10 my-1 mx-2" />

              <button
                onClick={() => {
                  setShowGDriveModal(true);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-sm font-bold group"
              >
                <span className="material-symbols-outlined text-on-surface-variant dark:text-gray-400 group-hover:text-primary transition-colors">
                  sync
                </span>
                <span>{lang === 'id' ? 'Sync & Backup' : 'Sync & Backup'}</span>
              </button>

              <div className="h-px bg-outline-variant/10 my-1 mx-2" />

              <button
                onClick={() => {
                  setShowLogoutConfirm(true);
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-sm font-bold group"
              >
                <span className="material-symbols-outlined text-on-surface-variant dark:text-gray-400 group-hover:text-primary transition-colors">
                  logout
                </span>
                {t("logout")}
              </button>

              {onDeleteAccount && (
                <>
                  <div className="h-4" />
                  <div className="h-px bg-error/20 mx-2" />
                  <div className="h-1" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onDeleteAccount();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 transition-colors text-sm font-bold group"
                  >
                    <span className="material-symbols-outlined text-error/60 group-hover:text-error transition-colors">
                      delete_forever
                    </span>
                    {t("deleteAccount")}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DataSyncModal
        isOpen={showGDriveModal}
        onClose={() => setShowGDriveModal(false)}
        mode="backup" // This prop will now be handled inside the modal for initial state
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-surface dark:bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl">logout</span>
            </div>
            <h3 className="font-headline font-black text-2xl text-on-surface mb-2">
              {lang === 'id' ? 'Beneran mau Keluar?' : 'Leaving so soon?'}
            </h3>
            <p className="text-sm text-on-surface-variant font-medium opacity-60 mb-8">
              {lang === 'id' ? 'Jangan lupa balik lagi ya bro buat pantau aset lo!' : 'Don\'t forget to come back and track your assets!'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-4 rounded-2xl bg-surface-container-high text-on-surface font-black text-sm active:scale-95 transition-all"
              >
                {lang === 'id' ? 'Batal' : 'Stay'}
              </button>
              <button
                onClick={confirmLogout}
                className="py-4 rounded-2xl bg-primary text-white font-black text-sm active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                {lang === 'id' ? 'Ya, Logout' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
