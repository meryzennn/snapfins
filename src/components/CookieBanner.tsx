"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Delay to ensure smooth UX loading
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 pb-6 animate-in slide-in-from-bottom duration-500 drop-shadow-2xl">
      <div className="max-w-4xl mx-auto bg-surface-container-low dark:bg-gray-900 border border-outline-variant/30 shadow-2xl rounded-2xl p-6 md:px-8 py-5 flex flex-col md:flex-row shadow-[0_-10px_40px_rgba(0,0,0,0.1)] items-center gap-6">
        <div className="flex-1 text-[13px] md:text-sm text-on-surface-variant font-medium leading-relaxed">
          <p>
            We use <span className="font-bold text-on-surface">cookies</span> to deliver our services, analyze performance, and ensure our seamless authentication via Google and GitHub. By continuing to use SnapFins, you agree to our <Link href="/privacy" className="text-primary hover:text-primary-container font-bold hover:underline underline-offset-4 transition-colors">Privacy Policy</Link> and <Link href="/terms" className="text-primary hover:text-primary-container font-bold hover:underline underline-offset-4 transition-colors">Terms of Service</Link>.
          </p>
        </div>
        <div className="w-full md:w-auto mt-2 md:mt-0 flex-shrink-0">
          <button onClick={acceptCookies} className="w-full md:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95 text-xs sm:text-sm uppercase tracking-widest focus:ring-4 focus:ring-primary/20">
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
