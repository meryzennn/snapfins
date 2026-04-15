"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/hooks/useLang";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(true); // Default to true to avoid hydration mismatch blinking
  const { t } = useLang();

  useEffect(() => {
    // Check if app is already installed in PWA mode
    const checkStandalone = () => {
      const isStand = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone === true);
      setIsStandalone(isStand);
    };
    
    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the native install prompt
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      // We don't nullify deferredPrompt right away because user might cancel
      // but actually yes, prompt() can only be called once per event.
      setDeferredPrompt(null);
    } else {
      // Fallback for iOS Safari or unsupported browsers that don't fire beforeinstallprompt
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert("To install SnapFins on iOS, tap the Share icon at the bottom of Safari, then select 'Add to Home Screen'.");
      } else {
        alert("To install SnapFins, use your browser's menu (usually Top Right) and select 'Install App' or 'Add to Home Screen'.");
      }
    }
  };

  // Hide the button completely if the app is already installed as a PWA
  if (isStandalone) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="bg-indigo-500/10 dark:bg-indigo-500/20 px-8 py-5 rounded-lg text-indigo-700 dark:text-indigo-300 font-bold text-lg border border-indigo-500/30 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-all active:scale-95 w-full sm:w-auto text-center flex items-center justify-center gap-2 group shadow-sm hover:shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-1"
    >
      <span className="material-symbols-outlined group-hover:scale-125 transition-transform animate-pulse">download_for_offline</span>
      {t('installApp')}
    </button>
  );
}
