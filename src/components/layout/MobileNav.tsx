"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/hooks/useLang";

export default function MobileNav() {
  const pathname = usePathname();
  const { t } = useLang();

  const navItems = [
    { name: t("navDashboard"), href: "/dashboard", icon: "dashboard" },
    { name: t("navAsset"), href: "/assets", icon: "account_balance_wallet" },
    { name: t("navAnalytics"), href: "/analytics", icon: "monitoring" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
      <div className="bg-surface/80 dark:bg-slate-900/80 backdrop-blur-xl border border-outline-variant/20 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex justify-around items-center py-3 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex flex-col items-center gap-1 group transition-all duration-300 ${
                isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              <div className={`w-12 h-1 rounded-full mb-1 transition-all ${
                isActive ? "bg-primary opacity-100" : "bg-transparent"
              }`}></div>
              <span 
                className={`material-symbols-outlined ${isActive ? "text-primary" : "text-on-surface-variant"}`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
