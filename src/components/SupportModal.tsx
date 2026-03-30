"use client";

import { useLang } from "@/hooks/useLang";
import { useScrollLock } from "@/hooks/useScrollLock";
import { motion } from "framer-motion";

interface SupportModalProps {
  onClose: () => void;
}

export default function SupportModal({ onClose }: SupportModalProps) {
  const { t } = useLang();
  useScrollLock(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
 
      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-outline-variant/20 overflow-hidden"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl animate-heart-pulse">
              favorite
            </span>
          </div>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.85, rotate: -45 }}
            onClick={onClose}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-on-surface/5 dark:bg-white/5 sm:bg-transparent hover:bg-surface-container-high dark:hover:bg-slate-800 transition-all duration-300 shadow-sm sm:shadow-none"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-2xl sm:text-xl">
              close
            </span>
          </motion.button>
        </div>
 
        <motion.h3 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="font-headline font-bold text-2xl text-on-surface dark:text-white mb-2"
        >
          {t("donateTitle")}
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="text-on-surface-variant dark:text-gray-400 text-sm leading-relaxed mb-8"
        >
          {t("donateSubtitle")}
        </motion.p>
 
        <div className="space-y-4">
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            href="https://sociabuzz.com/notryzen/tribe"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-2xl bg-[#E9E1FF] dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all active:scale-95 duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-indigo-900 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-indigo-500 transition-colors duration-300">
                <img 
                  src="/sociabuzz.webp" 
                  alt="SociaBuzz" 
                  className="w-6 h-6 object-contain group-hover:scale-110 transition-all duration-300 group-hover:animate-bolt" 
                />
              </div>
              <div>
                <span className="block font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                  SociaBuzz
                </span>
                <span className="block text-[10px] text-indigo-700/60 dark:text-indigo-400/60 font-black uppercase tracking-widest">
                  Support on Local
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </motion.a>
 
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            href="https://ko-fi.com/0x5zen"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 rounded-2xl bg-[#FFF1F1] dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 hover:border-rose-500 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all active:scale-95 duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-rose-900 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-rose-500 transition-colors duration-300 relative overflow-hidden">
                <img 
                  src="/ko_fi.webp" 
                  alt="Ko-fi" 
                  className="w-6 h-6 object-contain group-hover:scale-110 transition-all duration-300 group-hover:animate-heart-pulse" 
                />
              </div>
              <div>
                <span className="block font-bold text-rose-900 dark:text-rose-200 text-sm">
                  Ko-fi
                </span>
                <span className="block text-[10px] text-rose-700/60 dark:text-rose-400/60 font-black uppercase tracking-widest">
                  Buy me a coffee
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-rose-500 group-hover:translate-x-1 transition-all">
              arrow_forward
            </span>
          </motion.a>
        </div>
 
        <p className="text-center text-[10px] text-on-surface-variant/40 mt-8 font-bold uppercase tracking-widest">
          Thank you for your kindness!
        </p>
      </motion.div>
    </div>
  );
}
