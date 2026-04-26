"use client";

import { useRef, useState, useEffect } from "react";

export default function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); 
  const [volume, setVolume] = useState(0); 
  const [lastVolume, setLastVolume] = useState(0.3); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    // Explicitly handle autoplay for mobile browsers
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = isMuted;

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented by browser (e.g. low power mode or strict policy)
          setIsPlaying(false);
        });
      } else if (videoRef.current.paused) {
        setIsPlaying(false);
      }
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Track native fullscreen changes (e.g. pressing Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  // Safe Play/Pause toggle handling browser autoplay policies
  const togglePlay = async () => {
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await videoRef.current.play();
          setIsPlaying(true);
        } catch (error: any) {
          if (error.name !== "AbortError") {
            console.error("Error attempting to play video:", error);
          }
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        const volumeToRestore = lastVolume > 0 ? lastVolume : 0.3;
        videoRef.current.muted = false;
        setVolume(volumeToRestore);
        setIsMuted(false);
      } else {
        setLastVolume(volume);
        videoRef.current.muted = true;
        setVolume(0);
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else {
        videoRef.current.muted = false;
        setIsMuted(false);
        setLastVolume(newVolume);
      }
    }
  };



  return (
    <div className="w-full max-w-7xl mx-auto mt-12 flex flex-col gap-4">
      {/* Advanced Fullscreen Container */}
      <div 
        ref={containerRef}
        className={`relative w-full flex items-center justify-center bg-black/95 group transition-all duration-500 overflow-hidden ${
          isFullscreen 
            ? "h-screen rounded-none border-none shadow-none" 
            : "rounded-[32px] shadow-[0_60px_150px_rgba(88,28,135,0.2)] dark:shadow-[0_60px_150px_rgba(88,28,135,0.4)] border border-purple-500/20"
        }`}
      >
        
        {/* Ambient Blur Static Background (Eliminates Black/Grey Bars organically) */}
        <div
          className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat scale-[1.8] blur-[60px] sm:blur-[120px] md:blur-[180px] brightness-75 opacity-70 md:opacity-90 pointer-events-none transition-opacity duration-1000"
          style={{ backgroundImage: `url('/snapfins-poster.jpg')` }}
        />
        
        {/* Main Video Element */}
        <video
          ref={videoRef}
          autoPlay 
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          poster="/snapfins-poster.jpg"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onSeeking={() => setIsBuffering(true)}
          onSeeked={() => setIsBuffering(false)}
          onClick={togglePlay}
          className={`relative z-10 w-full transition-all duration-500 cursor-pointer shadow-2xl ${
             isFullscreen ? "h-full object-contain" : "h-auto max-h-[80vh] object-cover rounded-[32px]"
          }`}
        >
          <source src="/snapfins.webm" type="video/webm" />
          <source src="/snapfins.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Glass Center Play Button or Loading Spinner */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-500 ${!isPlaying || isBuffering ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}>
          {isBuffering ? (
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20">
              <span className="material-symbols-outlined animate-spin text-2xl sm:text-3xl md:text-4xl text-white/90">
                progress_activity
              </span>
            </div>
          ) : (
            <button 
              onClick={togglePlay}
              className="pointer-events-auto w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 hover:border-white/40 hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] group/centerBtn"
            >
              <span className="material-symbols-outlined flex items-center justify-center text-3xl sm:text-4xl md:text-5xl text-white/90 group-hover/centerBtn:text-white transition-colors duration-300">
                play_arrow
              </span>
            </button>
          )}
        </div>

        {/* Floating Dark Purple Control Bar */}
        <div className={`absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 px-4 md:px-8 transition-opacity duration-300 ${!isPlaying && !isBuffering ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <div className="flex items-center justify-center gap-6 sm:gap-8 text-white bg-black/40 backdrop-blur-2xl rounded-3xl px-6 py-2 md:py-3 w-fit mx-auto border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            
            {/* Volume Control */}
            <div className="flex items-center group/volume">
              <button onClick={toggleMute} className="hover:text-purple-400 hover:scale-110 active:scale-95 transition-all focus:outline-none flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">
                  {isMuted || volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
                </span>
              </button>
              <div className="w-0 overflow-hidden opacity-0 group-hover/volume:w-16 md:group-hover/volume:w-20 group-hover/volume:opacity-100 group-hover/volume:ml-2 md:group-hover/volume:ml-3 transition-all duration-300 ease-in-out hidden sm:flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange} 
                  className="w-full h-1 md:h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-colors" 
                />
              </div>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

            {/* Fullscreen Toggle */}
            <button 
              onClick={toggleFullscreen} 
              className="hover:text-purple-400 hover:scale-110 active:scale-95 transition-all focus:outline-none flex items-center justify-center pr-2"
            >
              <span className="material-symbols-outlined text-2xl">
                {isFullscreen ? "fullscreen_exit" : "fullscreen"}
              </span>
            </button>

          </div>
        </div>
      </div>
      
      {/* Creator Credit Badge (Moved outside the video player) */}
      <div className="flex justify-end px-4 sm:px-6">
        <a 
          href="https://www.instagram.com/xxalfsyr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group text-on-surface-variant hover:text-purple-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase flex items-center gap-2 px-4 py-2 rounded-full border border-transparent hover:border-white/10 hover:bg-white/5 active:bg-white/10 active:scale-95 transition-all duration-300 opacity-60 hover:opacity-100"
        >
          <svg
            className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500 group-hover:text-purple-400 transition-colors duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          Video Animation by @xxalfsyr
        </a>
      </div>
    </div>
  );
}
