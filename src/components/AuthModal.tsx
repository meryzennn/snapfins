"use client";

import React from "react";
import { useLang } from "@/hooks/useLang";
import { createClient } from "@/utils/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useLang();

  if (!isOpen) return null;

  const handleLogin = async (provider: 'google' | 'github') => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === 'github' ? { 
          prompt: "select_account",
        } : undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col max-w-sm w-full border border-outline-variant/20 dark:border-white/10 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline font-bold text-2xl text-on-surface dark:text-white">{t('signIn')}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high dark:hover:bg-white/10 transition-colors text-on-surface-variant dark:text-gray-400">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <p className="text-sm text-on-surface-variant dark:text-gray-400 mb-6">{t('signInSubtitle')}</p>
        <div className="space-y-4">
          <button onClick={() => { onClose(); handleLogin('google'); }} className="group cursor-pointer w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-outline-variant/30 dark:border-white/10 py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:shadow-md hover:-translate-y-1 active:scale-95 duration-300 font-semibold shadow-sm">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            {t('continueWithGoogle')}
          </button>
          <button onClick={() => { onClose(); handleLogin('github'); }} className="group cursor-pointer w-full flex items-center justify-center gap-3 bg-[#24292F] dark:bg-white text-white dark:text-gray-900 py-3 px-4 rounded-xl hover:bg-[#24292f]/90 dark:hover:bg-gray-100 transition-all hover:shadow-md hover:-translate-y-1 active:scale-95 duration-300 font-semibold shadow-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23C10.53 4.8 11.28 4.65 12 4.65c.72 0 1.47.15 2.43.48 2.28-1.545 3.285-1.23 3.285-1.23.645 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            {t('continueWithGithub')}
          </button>
        </div>
      </div>
    </div>
  );
}
