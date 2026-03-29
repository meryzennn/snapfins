"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useLang } from "@/hooks/useLang";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { useTheme } from "@/hooks/useTheme";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme(); // This ensures the .dark class is applied early
  const { t } = useLang();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        const meta = userData.user.user_metadata;
        if (meta?.avatar_url) setUserAvatar(meta.avatar_url);
        setUserName(
          meta?.full_name ||
            meta?.name ||
            userData.user.email?.split("@")[0] ||
            "User"
        );
        setUserEmail(userData.user.email || "");
      } else {
        // Redirect to landing if no session
        window.location.href = "/";
      }
    };

    fetchUser();
  }, []);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/actions/user", {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete account");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar 
        userName={userName} 
        userEmail={userEmail} 
        userAvatar={userAvatar} 
        onDeleteAccount={() => setShowDeleteConfirm(true)}
      />
      
      <main className="flex-grow">
        {children}
      </main>

      <Footer />
      <MobileNav />

      {/* Global Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-error/20 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6 relative">
              <span className="material-symbols-outlined text-error text-4xl">
                warning
              </span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
              {t("deleteAccount")}?
            </h3>
            <p className="text-sm text-center text-on-surface-variant leading-relaxed mb-8">
              {t("deleteAccountWarning")}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="w-full bg-error hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin">
                    sync
                  </span>
                ) : null}
                {isDeleting ? t("deleting") : t("confirmDelete")}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-3 px-4 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
