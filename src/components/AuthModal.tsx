"use client";

import React from "react";
import { useLang } from "@/hooks/useLang";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:pt-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-surface dark:bg-slate-900 p-8 rounded-3xl shadow-2xl flex flex-col max-w-sm w-full border border-outline-variant/20 dark:border-white/10"
      >
        <div className="flex justify-between items-center mb-6">
          <motion.h3 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-headline font-bold text-2xl text-on-surface dark:text-white"
          >
            {t('signIn')}
          </motion.h3>
          <motion.button 
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.85, rotate: -45 }}
            onClick={onClose} 
            className="w-12 h-12 rounded-full flex items-center justify-center bg-on-surface/5 dark:bg-white/5 sm:bg-transparent hover:bg-on-surface/10 dark:hover:bg-white/10 transition-all duration-300 text-on-surface-variant dark:text-gray-400 cursor-pointer shadow-sm sm:shadow-none"
          >
            <span className="material-symbols-outlined text-2xl sm:text-xl">close</span>
          </motion.button>
        </div>
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-on-surface-variant dark:text-gray-400 mb-6"
        >
          {t('signInSubtitle')}
        </motion.p>
        
        <div className="space-y-4">
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => { onClose(); handleLogin('google'); }} 
            className="group cursor-pointer w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-outline-variant/30 dark:border-white/10 py-4 px-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 duration-500 font-bold shadow-md relative overflow-hidden group-hover:animate-rainbow"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-red-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-125 group-hover:rotate-[360deg] transition-all duration-700 z-10" />
            <span className="z-10">{t('continueWithGoogle')}</span>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 rounded-2xl pointer-events-none group-hover:animate-rainbow transition-all" />
          </motion.button>
 
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="relative py-2"
          >
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
              <span className="bg-surface dark:bg-slate-900 px-4 text-on-surface-variant/40">OR</span>
            </div>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => { onClose(); handleLogin('github'); }} 
            className="group cursor-pointer w-full flex items-center justify-center gap-3 bg-[#24292F] dark:bg-white text-white dark:text-gray-900 py-4 px-4 rounded-2xl hover:bg-[#1a1e22] dark:hover:bg-gray-100 transition-all hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 duration-500 font-bold shadow-md relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-125 group-hover:animate-pulse transition-all duration-500 z-10"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23C10.53 4.8 11.28 4.65 12 4.65c.72 0 1.47.15 2.43.48 2.28-1.545 3.285-1.23 3.285-1.23.645 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            <span className="z-10">{t('continueWithGithub')}</span>
            <div className="absolute inset-0 bg-transparent group-hover:animate-cosmic rounded-2xl pointer-events-none group-hover:border group-hover:border-white/20 transition-all" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
