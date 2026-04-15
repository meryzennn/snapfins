"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createClient } from "@/utils/supabase/client";

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTx: any, linkedAssetId?: string, amount?: number, currency?: string) => Promise<void>;
  cashAssets: any[];
  lang: string;
  currency: string;
  t: (key: string) => any;
  formatValue: (val: number, cur: string) => string;
}

export default function ScanReceiptModal({
  isOpen,
  onClose,
  onSuccess,
  cashAssets,
  lang,
  currency,
  t,
  formatValue,
}: ScanReceiptModalProps) {
  const [mounted, setMounted] = useState(false);
  const [scanStep, setScanStep] = useState<"select" | "camera" | "analyzing" | "confirm">("select");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanningLogs, setScanningLogs] = useState<string[]>([]);
  const [tempScanData, setTempScanData] = useState<any>(null);
  const [scanSource, setScanSource] = useState<"camera" | "upload" | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [supportsTorch, setSupportsTorch] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    setMounted(true);
    return () => stopCamera();
  }, []);

  // Reset state on close
  useEffect(() => {
    if (!isOpen && mounted) {
      handleFullReset();
    }
  }, [isOpen]);

  const handleFullReset = () => {
    stopCamera();
    clearTimeout(inactivityTimerRef.current as any);
    setScanStep("select");
    setScanError(null);
    setScanningLogs([]);
    setTempScanData(null);
    setScanSource(null);
    setIsScanning(false);
    setFlashOn(false);
    setSupportsTorch(false);
  };

  const startCamera = async () => {
    setScanSource("camera");
    setScanStep("camera");
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          aspectRatio: { ideal: 9/16 }
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Check for torch capabilities
      const track = stream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const capabilities = track.getCapabilities();
        if ((capabilities as any).torch) {
          setSupportsTorch(true);
        }
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setScanError(t("cameraAccessDenied") || "Camera access denied. Please check permissions.");
      setScanStep("select");
    }
  };

  // Inactivity timeout handler
  useEffect(() => {
    if (scanStep === 'camera') {
      inactivityTimerRef.current = setTimeout(() => {
        stopCamera();
        setScanError(lang === 'id' ? "Anda terlalu lama membuka kamera tanpa aktivitas." : "You too long open the camera without interaction.");
        setScanStep("select");
      }, 60000); // 60 seconds
    } else {
       if (inactivityTimerRef.current) {
         clearTimeout(inactivityTimerRef.current);
       }
    }
    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [scanStep, lang]);

  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const newState = !flashOn;
        await track.applyConstraints({
          advanced: [{ torch: newState }] as any
        });
        setFlashOn(newState);
      } catch (err) {
        console.warn("Torch constraint failed", err);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setFlashOn(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            stopCamera();
            processScanData(blob);
          }
        }, "image/jpeg", 0.9);
      }
    }
  };

  const processScanData = async (file: File | Blob, isUpload = false) => {
    if (isUpload) setScanSource("upload");
    setScanStep("analyzing");
    setScanError(null);
    setScanningLogs(["> Establishing connection to Gemini AI..."]);

    const addLog = (msg: string, delay: number) => 
      new Promise(resolve => setTimeout(() => {
        setScanningLogs(prev => [...prev, msg]);
        resolve(null);
      }, delay));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", lang);

      const scanPromise = fetch("/api/scan", { method: "POST", body: formData });
      
      await addLog("> Accessing visual processing matrix... [OK]", 800);
      await addLog("> Extracting merchant and total... [IN PROGRESS]", 1200);

      const res = await scanPromise;
      const data = await res.json();

      if (res.ok && data.transaction) {
        if (data.transaction.isValidReceipt === false) {
          throw new Error(data.transaction.errorReason || t("tryAgainWithDifferent"));
        }

        await addLog("> Validating tax categories... [DONE]", 600);
        await addLog("> Ready for confirmation.", 400);

        setTempScanData(data.transaction);
        setScanStep("confirm");
      } else {
        throw new Error(data.error || t("scanErrorHint"));
      }
    } catch (error: any) {
      setScanError(error.message || t("tryAgainWithDifferent"));
      setScanStep("select");
    }
  };

  const handleFinalize = async () => {
    if (!tempScanData) return;
    setIsScanning(true);
    try {
      await onSuccess(
        tempScanData, 
        tempScanData.linkedAssetId, 
        Number(tempScanData.amount), 
        tempScanData.currency
      );
      onClose();
    } catch (error: any) {
      alert("Failed to save: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-md px-2 pt-2 pb-20 sm:p-6 animate-in fade-in duration-300 overflow-y-auto">
        <canvas ref={canvasRef} className="hidden" />
        <div 
          className="bg-surface dark:bg-slate-900 p-3 sm:p-10 rounded-3xl shadow-2xl flex flex-col w-full sm:max-w-xl max-h-[calc(100svh-40px)] sm:max-h-[85svh] border border-white/10 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Modal Header */}
          <div className="flex justify-between items-center mb-3 sm:mb-8 relative z-10 shrink-0">
            <div>
              <h3 className="font-headline font-bold text-lg sm:text-3xl text-on-surface dark:text-white mb-0.5 sm:mb-1">
                {scanStep === 'select' ? t("scanReceipt") : 
                 scanStep === 'camera' ? (t("cameraCapture") || "Camera Scan") : 
                 scanStep === 'analyzing' ? (t("analyzing") || "Analyzing...") : 
                 t("confirmEntry")}
              </h3>
              <p className="text-[10px] sm:text-sm text-on-surface-variant dark:text-gray-400 font-medium italic opacity-70">
                {scanStep === 'select' ? "Choose your input source" : 
                 scanStep === 'camera' ? "Align receipt within the frame" : 
                 scanStep === "analyzing" ? "Gemini AI is processing your image" : 
                 "Verify the extracted information"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors text-on-surface-variant cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin scrollbar-thumb-outline-variant/30 scrollbar-track-transparent">
            {scanStep === "select" && (
              <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-right-4 duration-500">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-4 sm:p-8 rounded-2xl border-2 border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl sm:text-3xl">photo_camera</span>
                  </div>
                  <span className="font-bold text-sm sm:text-lg">{lang === 'id' ? 'Gunakan Kamera' : 'Use Camera'}</span>
                  <span className="text-[10px] text-on-surface-variant mt-1 hidden sm:block">{lang === 'id' ? 'Scan struk fisik' : 'Scan physical receipt'}</span>
                </button>

                <label className="flex flex-col items-center justify-center p-4 sm:p-8 rounded-2xl border-2 border-outline-variant/20 bg-surface-container-low dark:bg-slate-800/50 hover:border-secondary hover:bg-secondary/5 transition-all group cursor-pointer">
                  <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processScanData(file, true);
                      }}
                  />
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl sm:text-3xl">upload_file</span>
                  </div>
                  <span className="font-bold text-sm sm:text-lg">{lang === 'id' ? 'Upload Struk' : 'Upload Receipt'}</span>
                  <span className="text-[10px] text-on-surface-variant mt-1 hidden sm:block">{lang === 'id' ? 'Pilih dari galeri' : 'Select from gallery'}</span>
                </label>
              </div>
            )}

            {scanStep === 'camera' && (
              <div className="relative rounded-2xl overflow-hidden aspect-[9/16] max-h-[75svh] sm:max-h-[65svh] mx-auto bg-slate-950 border-2 border-primary/30 shadow-2xl animate-in zoom-in duration-300">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {supportsTorch && (
                  <button 
                    onClick={toggleFlash}
                    className="absolute top-4 right-4 z-[60] w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-lg cursor-pointer"
                  >
                    <span className={`material-symbols-outlined ${flashOn ? 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]' : ''}`}>
                      {flashOn ? 'flash_on' : 'flash_off'}
                    </span>
                  </button>
                )}

                <div className="absolute inset-0 scanner-overlay-gradient pointer-events-none">
                  <div className="scanner-corner top-4 left-4 border-t-4 border-l-4"></div>
                  <div className="scanner-corner top-4 right-4 border-t-4 border-r-4"></div>
                  <div className="scanner-corner bottom-4 left-4 border-b-4 border-l-4"></div>
                  <div className="scanner-corner bottom-4 right-4 border-b-4 border-r-4"></div>
                  <div className="animate-scan-line"></div>
                </div>
                <div className="absolute bottom-8 inset-x-0 flex justify-center items-center">
                  <button 
                    onClick={capturePhoto}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-primary p-1 bg-white/20 backdrop-blur-sm group hover:scale-110 transition-all cursor-pointer"
                  >
                    <div className="w-full h-full rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:bg-primary-container">
                      <span className="material-symbols-outlined text-white text-2xl sm:text-3xl">camera_alt</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {scanStep === 'analyzing' && (
              <div className="flex flex-col items-center py-10 animate-in fade-in duration-500">
                <div className="relative w-32 h-32 sm:w-48 sm:h-48 mb-8">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-secondary/20 border-b-secondary animate-spin [animation-duration:2s]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-4xl sm:text-6xl animate-pulse">auto_awesome</span>
                  </div>
                </div>
                <h4 className="text-lg sm:text-xl font-bold dark:text-white mb-6 flex items-center gap-3">
                  <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
                  Analyzing with Gemini AI...
                </h4>
                <div className="w-full bg-slate-950 rounded-2xl p-6 font-mono text-[10px] sm:text-xs text-secondary shadow-lg border border-white/5 space-y-2 max-h-40 overflow-y-auto">
                  {scanningLogs.map((log, idx) => (
                    <div key={idx} className={idx === scanningLogs.length - 1 ? "terminal-cursor" : ""}>{log}</div>
                  ))}
                </div>
              </div>
            )}

            {scanStep === 'confirm' && tempScanData && (
              <div className="animate-in slide-in-from-right-4 duration-500 space-y-4">
                <div className="bg-surface-container-low dark:bg-slate-800/80 rounded-2xl p-4 sm:p-6 border border-outline-variant/30">
                  <div className="grid grid-cols-2 gap-y-4">
                    <div className="col-span-2 flex items-center gap-3 mb-1">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant opacity-60">Merchant</p>
                          <p className="font-bold text-base sm:text-xl text-on-surface dark:text-white capitalize">{tempScanData.description}</p>
                       </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant opacity-60">Date</p>
                      <p className="font-bold text-sm text-on-surface dark:text-white">{tempScanData.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant opacity-60">Category</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                        {tempScanData.category}
                      </span>
                    </div>
                    <div className="col-span-2 pt-3 border-t border-outline-variant/10">
                      <p className="text-[10px] uppercase tracking-widest font-black text-secondary">Total Amount</p>
                      <p className="font-black text-2xl sm:text-3xl text-on-surface dark:text-white tracking-tighter">
                        {formatValue(Number(tempScanData.amount), (tempScanData.currency || currency))}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-primary ml-1 mb-1.5">
                    {lang === 'id' ? 'Bayar dari Akun' : 'Paid from Account'} <span className="text-error font-black">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={tempScanData.linkedAssetId || ""}
                      onChange={(e) => setTempScanData({ ...tempScanData, linkedAssetId: e.target.value })}
                      className="w-full bg-surface-container-low dark:bg-slate-800 border-2 border-outline-variant/20 focus:border-secondary rounded-xl px-4 py-3 text-on-surface font-bold text-sm transition-colors outline-none cursor-pointer appearance-none pr-10"
                    >
                      <option value="">{lang === 'id' ? "— Pilih Akun Pembayar —" : "— Select Paying Account —"}</option>
                      {cashAssets.map((a: any) => (
                        <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-50">expand_more</span>
                  </div>
                </div>
              </div>
            )}

            {scanError && (
              <div className="mt-4 flex flex-col gap-3 animate-in shake duration-500">
                <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-error text-xl">error</span>
                  <p className="text-xs font-bold text-error leading-relaxed">{scanError}</p>
                </div>
                <button
                  onClick={() => {
                    if (scanSource === "camera") startCamera();
                    else handleFullReset(); // Returns to selection
                  }}
                  className="w-full py-3 rounded-xl bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-white font-bold hover:bg-surface-variant transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  {lang === 'id' ? 'Coba Lagi' : 'Try Again'}
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {scanStep === 'confirm' && tempScanData && (
            <div className="mt-6 sm:mt-10 flex gap-3 shrink-0 relative z-10 border-t border-outline-variant/10 pt-4 sm:pt-6">
              <button
                onClick={() => setScanStep('select')}
                className="flex-1 py-3.5 rounded-xl bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-white font-bold hover:bg-surface-variant transition-all cursor-pointer text-sm"
              >
                {lang === 'id' ? 'Coba Lagi' : 'Try Again'}
              </button>
              <button
                onClick={handleFinalize}
                disabled={isScanning || !tempScanData?.linkedAssetId}
                className="flex-[1.5] py-3.5 rounded-xl bg-secondary text-white font-black hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                {isScanning ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : (lang === 'id' ? 'Konfirmasi' : 'Confirm Entry')}
              </button>
            </div>
          )}
        </div>
      </div>
    ),
    document.body
  );
}
