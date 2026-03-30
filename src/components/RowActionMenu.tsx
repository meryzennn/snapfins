"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Action {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface RowActionMenuProps {
  actions: Action[];
}

export default function RowActionMenu({ actions }: RowActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click was NOT on the trigger AND NOT inside the menu
      const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(event.target as Node);
      const isOutsideMenu = menuRef.current && !menuRef.current.contains(event.target as Node);

      if (isOutsideTrigger && isOutsideMenu) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    const handleScroll = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOpen) {
      setIsOpen(false);
    } else {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPosition({
          top: rect.top + rect.height + 6,
          right: window.innerWidth - rect.right,
        });
        setIsOpen(true);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer group/btn"
      >
        <span className="material-symbols-outlined text-[18px] sm:text-[20px] group-hover/btn:scale-110 transition-transform">
          menu
        </span>
      </button>

      {mounted &&
        isOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-36 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-[9999] py-1.5 animate-in fade-in zoom-in-95 duration-200 divide-y divide-white/5"
            style={{
              top: menuPosition.top,
              right: menuPosition.right,
              transform:
                menuPosition.top > window.innerHeight / 2
                  ? "translateY(-100%) translateY(-36px)"
                  : "none",
              transformOrigin: "top right",
            }}
          >
            {actions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger the action first to ensure parent state updates
                  action.onClick();
                  // Then close the menu
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors flex items-center justify-between group/item cursor-pointer"
              >
                <span
                  className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                    action.variant === "danger"
                      ? "text-rose-400 group-hover/item:text-rose-300"
                      : "text-white/90 group-hover/item:text-primary-container"
                  }`}
                >
                  {action.label}
                </span>
                <span
                  className={`material-symbols-outlined text-[16px] transition-all group-hover/item:scale-110 ${
                    action.variant === "danger" ? "text-rose-400" : "text-primary-container"
                  }`}
                >
                  {action.icon}
                </span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
