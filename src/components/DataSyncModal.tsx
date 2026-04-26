"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useLang } from "@/hooks/useLang";
import { createClient } from "@/utils/supabase/client";

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "backup" | "import";
}

export default function DataSyncModal({ isOpen, onClose }: DataSyncModalProps) {
  const { lang, t } = useLang();
  useScrollLock(isOpen);
  
  const [view, setView] = useState<"selection" | "backup" | "import" | "confirming" | "syncing" | "success" | "error">("selection");
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setView("selection");
      setErrorMsg("");
      setPendingData(null);
    }
  }, [isOpen]);

  const handleBackup = async () => {
    setView("syncing");
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      setView("error");
      setErrorMsg(lang === 'id' ? 'User tidak ditemukan.' : 'User not found.');
      return;
    }

    try {
      const [{ data: transactions }, { data: assets }] = await Promise.all([
        supabase.from("transactions").select("*").eq("user_id", userData.user.id).order("date", { ascending: false }),
        supabase.from("assets").select("*").eq("user_id", userData.user.id)
      ]);

      // VALIDASI DATA KOSONG
      if ((!transactions || transactions.length === 0) && (!assets || assets.length === 0)) {
        setView("error");
        setErrorMsg(lang === 'id' ? 'Waduh, data lo masih kosong nih. Tambahin transaksi dulu baru bisa di-backup ya!' : 'Whoops, your data is empty. Add some transactions or assets first before backing up!');
        return;
      }

      const backupData = {
        app: "snapfins",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        data: {
          transactions: transactions || [],
          assets: assets || []
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `snapfins_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setView("success");
    } catch (err: any) {
      setView("error");
      setErrorMsg(err.message || "Backup failed");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDASI FILE TYPE
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setView("error");
      setErrorMsg(lang === 'id' ? 'File harus berformat .json ya bro!' : 'File must be in .json format!');
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let content;
        
        try {
          content = JSON.parse(text);
        } catch (e) {
          throw new Error(lang === 'id' ? 'File JSON rusak atau tidak valid.' : 'Invalid or corrupted JSON file.');
        }

        // VALIDASI APP TYPE
        if (content.app !== "snapfins") {
          throw new Error(lang === 'id' ? 'File ini bukan format backup Snapfins yang sah.' : 'This file is not a valid Snapfins backup.');
        }

        // VALIDASI DATA KOSONG DI DALAM JSON
        if (!content.data || ((!content.data.transactions || content.data.transactions.length === 0) && (!content.data.assets || content.data.assets.length === 0))) {
          throw new Error(lang === 'id' ? 'File backup ini isinya kosong, nggak ada data yang bisa di-import.' : 'This backup file is empty, no data to import.');
        }

        setPendingData(content.data);
        setView("confirming");
      } catch (err: any) {
        setView("error");
        setErrorMsg(err.message || "File tidak valid.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const performImport = async () => {
    if (!pendingData) return;

    setView("syncing");
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    try {
      const { transactions, assets } = pendingData;
      await Promise.all([
        supabase.from("transactions").delete().eq("user_id", userData.user.id),
        supabase.from("assets").delete().eq("user_id", userData.user.id)
      ]);

      // Map old asset IDs to newly generated UUIDs to prevent collisions
      const assetIdMap: Record<string, string> = {};
      (assets || []).forEach((a: any) => {
        if (a.id) assetIdMap[a.id] = crypto.randomUUID();
      });

      const aToIns = (assets || []).map((a: any) => {
        const { id, user_id, ...rest } = a;
        return { 
          ...rest, 
          id: assetIdMap[id] || id, // use new ID, fallback to old if not mapped
          user_id: userData.user.id 
        };
      });

      const tToIns = (transactions || []).map((t: any) => {
        const { id, user_id, linked_asset_id, ...rest } = t;
        return { 
          ...rest, 
          id: crypto.randomUUID(), // generate new ID for transaction
          linked_asset_id: linked_asset_id ? (assetIdMap[linked_asset_id] || null) : null,
          user_id: userData.user.id 
        };
      });

      if (aToIns.length > 0) {
        const { error } = await supabase.from("assets").insert(aToIns);
        if (error) throw new Error("Assets Error: " + error.message);
      }
      if (tToIns.length > 0) {
        const { error } = await supabase.from("transactions").insert(tToIns);
        if (error) throw new Error("Transactions Error: " + error.message);
      }

      setView("success");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setView("error");
      setErrorMsg(err.message || "Import gagal.");
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface dark:bg-slate-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary`}>
                  <span className="material-symbols-outlined text-2xl">sync</span>
                </div>
                <div>
                  <h2 className="font-headline font-black text-xl text-on-surface">
                    {lang === "id" ? "Sync & Backup" : "Sync & Backup"}
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant opacity-50">
                    Data Portability • JSON Format
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="w-10 h-10 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-10 text-center">
              {view === "selection" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-on-surface">{lang === "id" ? "Pilih Aksi" : "Select Action"}</h3>
                    <p className="text-sm text-on-surface-variant opacity-60">{lang === "id" ? "Mau ekspor data lo atau balikin data lama?" : "Do you want to export your data or restore an old backup?"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setView("backup")}
                      className="group p-6 rounded-3xl bg-surface-container-low dark:bg-slate-800 border-2 border-transparent hover:border-primary/40 hover:bg-primary/5 transition-all space-y-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">upload</span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-sm text-on-surface">{lang === "id" ? "Ekspor Data" : "Export Data"}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium opacity-60">{lang === "id" ? "Backup ke JSON" : "Backup to JSON"}</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setView("import")}
                      className="group p-6 rounded-3xl bg-surface-container-low dark:bg-slate-800 border-2 border-transparent hover:border-secondary/40 hover:bg-secondary/5 transition-all space-y-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">download</span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-sm text-on-surface">{lang === "id" ? "Impor Data" : "Import Data"}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium opacity-60">{lang === "id" ? "Restore dari JSON" : "Restore from JSON"}</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {view === "backup" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-4xl">folder_zip</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-on-surface">{lang === "id" ? "Siap buat Backup?" : "Ready to Backup?"}</h3>
                      <p className="text-sm text-on-surface-variant font-medium leading-relaxed opacity-70">
                        {lang === "id" ? "Semua data transaksi dan aset lo bakal dibundle jadi satu file JSON buat dipindah atau disimpen aman." : "All your transaction and asset data will be bundled into a single JSON file for safekeeping."}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={handleBackup}
                      className="w-full py-5 rounded-2xl bg-primary text-white font-black text-sm transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-outlined">download</span>
                      {lang === "id" ? "Download File Sekarang" : "Download File Now"}
                    </button>
                    <button onClick={() => setView("selection")} className="py-3 text-xs font-bold text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity">
                      {lang === "id" ? "Kembali" : "Go Back"}
                    </button>
                  </div>
                </div>
              )}

              {view === "import" && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-4xl">upload_file</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-on-surface">{lang === "id" ? "Pilih File Backup" : "Choose Backup File"}</h3>
                      <p className="text-sm text-on-surface-variant font-medium leading-relaxed opacity-70">
                        {lang === "id" ? "Pilih file .json hasil ekspor Snapfins lo buat nge-restore data lama ke akun ini." : "Select the .json file exported from Snapfins to restore your old data to this account."}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-5 rounded-2xl bg-secondary text-on-secondary font-black text-sm transition-all active:scale-95 shadow-xl shadow-secondary/20 flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-outlined">publish</span>
                      {lang === "id" ? "Pilih & Upload File" : "Choose & Upload File"}
                    </button>
                    <button onClick={() => setView("selection")} className="py-3 text-xs font-bold text-on-surface-variant opacity-60 hover:opacity-100 transition-opacity">
                      {lang === "id" ? "Kembali" : "Go Back"}
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
              )}

              {view === "confirming" && (
                <div className="space-y-8">
                  <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-4xl">warning</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-headline font-black text-2xl text-on-surface">{lang === "id" ? "Konfirmasi Impor" : "Confirm Import"}</h3>
                    <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                      {lang === "id" ? "Peringatan: Semua data transaksi dan aset lo saat ini bakal dihapus dan diganti sama data dari file ini. Lo yakin mau lanjut?" : "Warning: All your current transactions and assets will be deleted and replaced with the data from this file. Are you sure you want to proceed?"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setView("import")}
                      className="py-4 rounded-2xl bg-surface-container-high text-on-surface font-black text-sm active:scale-95 transition-all"
                    >
                      {lang === "id" ? "Batal" : "Cancel"}
                    </button>
                    <button
                      onClick={performImport}
                      className="py-4 rounded-2xl bg-error text-white font-black text-sm active:scale-95 transition-all shadow-xl shadow-error/20"
                    >
                      {lang === "id" ? "Ya, Restore" : "Yes, Restore"}
                    </button>
                  </div>
                </div>
              )}

              {view === "syncing" && (
                <div className="py-8 flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl text-primary animate-pulse">sync</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-on-surface-variant">{lang === "id" ? "Sedang memproses data lo..." : "Processing your data..."}</p>
                    <p className="text-[10px] text-on-surface-variant opacity-50 italic">{lang === "id" ? "Sabar ya bro, dikit lagi kelar." : "Please hold on, almost done."}</p>
                  </div>
                </div>
              )}

              {view === "success" && (
                <div className="py-8 space-y-6">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20"
                  >
                    <span className="material-symbols-outlined text-4xl">done_all</span>
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="font-headline font-black text-2xl text-on-surface">{lang === "id" ? "Berhasil!" : "Success!"}</h3>
                    <p className="text-sm text-on-surface-variant font-medium">
                      {lang === "id" ? "Data lo udah sukses di-sync. Halaman bakal refresh otomatis..." : "Your data has been successfully synced. The page will refresh automatically..."}
                    </p>
                  </div>
                </div>
              )}

              {view === "error" && (
                <div className="py-8 space-y-6">
                  <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-4xl">priority_high</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-headline font-black text-2xl text-on-surface">{lang === "id" ? "Waduh, Gagal" : "Whoops, Failed"}</h3>
                    <p className="text-sm text-error font-bold leading-relaxed">{errorMsg}</p>
                  </div>
                  <button
                    onClick={() => setView("selection")}
                    className="w-full py-4 rounded-2xl bg-primary text-white font-black text-sm active:scale-95 transition-all"
                  >
                    {lang === "id" ? "Coba Lagi" : "Try Again"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
