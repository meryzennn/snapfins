"use client";

import { useRef, useState, useEffect } from "react";

export default function HeroVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blurVideoRef = useRef<HTMLVideoElement>(null); // Provides the ambient background blur for fullscreen
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true); 
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0); 
  const [lastVolume, setLastVolume] = useState(0.1); 
  const [isSliding, setIsSliding] = useState(false); 
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Synchronize Play/Pause for both main video and ambient blur video
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (blurVideoRef.current) blurVideoRef.current.pause();
      } else {
        videoRef.current.play();
        if (blurVideoRef.current) blurVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        const volumeToRestore = lastVolume > 0 ? lastVolume : 0.29;
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

  const handleTimeUpdate = () => {
    if (videoRef.current && !isSliding) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  // Synchronize timeline seeking for both videos
  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (videoRef.current) {
      const targetTime = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = targetTime;
      if (blurVideoRef.current) blurVideoRef.current.currentTime = targetTime;
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
        
        {/* Ambient Blur Video Background (Eliminates Black/Grey Bars organically) */}
        <video
          ref={blurVideoRef}
          autoPlay
          loop
          muted 
          playsInline
          className="absolute inset-0 z-0 w-full h-full object-cover scale-[1.8] blur-[120px] sm:blur-[180px] brightness-75 opacity-70 md:opacity-90 pointer-events-none transition-opacity duration-1000"
        >
          <source src="/snapfins.mp4" type="video/mp4" />
        </video>
        
        {/* Main Video Element */}
        <video
          ref={videoRef}
          autoPlay 
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
          className={`relative z-10 w-full transition-all duration-500 cursor-pointer shadow-2xl ${
             isFullscreen ? "h-full object-contain" : "h-auto max-h-[80vh] object-cover rounded-[32px]"
          }`}
        >
          <source src="/snapfins.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Glass Center Play Button */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-500 ${!isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}>
          <button 
            onClick={togglePlay}
            className="pointer-events-auto w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 hover:border-white/40 hover:shadow-[0_0_40px_rgba(147,51,234,0.4)] group/centerBtn"
          >
            <span className="material-symbols-outlined flex items-center justify-center text-4xl md:text-5xl text-white/90 group-hover/centerBtn:text-white transition-colors duration-300">
              play_arrow
            </span>
          </button>
        </div>

        {/* Floating Dark Purple Control Bar */}
        <div className={`absolute bottom-0 left-0 right-0 z-30 py-6 px-4 md:px-8 transition-opacity duration-300 ${!isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <div className="flex items-center gap-3 md:gap-5 text-white bg-black/40 backdrop-blur-2xl rounded-2xl p-2 md:p-3 max-w-4xl mx-auto border border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            
            {/* Play/Pause Button */}
            <button onClick={togglePlay} className="hover:text-purple-400 hover:scale-110 active:scale-95 transition-all focus:outline-none flex items-center justify-center pl-2">
              <span className="material-symbols-outlined text-3xl">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
            
            {/* Timeline */}
            <div className="flex-1 flex items-center mx-1 md:mx-3 h-6 relative group/timeline cursor-pointer">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="0.1" 
                value={progress}
                onChange={handleTimelineChange}
                onMouseDown={() => setIsSliding(true)}
                onMouseUp={() => setIsSliding(false)}
                onTouchStart={() => setIsSliding(true)}
                onTouchEnd={() => setIsSliding(false)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="absolute left-0 right-0 h-1.5 md:h-2 bg-white/10 rounded-full pointer-events-none group-hover/timeline:bg-white/20 transition-colors">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full flex justify-end items-center pointer-events-none transition-all duration-75 ease-linear shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                  style={{ width: `${progress}%` }}
                >
                  <div className="w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover/timeline:opacity-100 group-hover/timeline:scale-125 transition-all shadow-md translate-x-1.5"></div>
                </div>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center group/volume">
              <button onClick={toggleMute} className="hover:text-purple-400 hover:scale-110 active:scale-95 transition-all focus:outline-none flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">
                  {isMuted || volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
                </span>
              </button>
              <div className="w-0 overflow-hidden opacity-0 group-hover/volume:w-16 md:group-hover/volume:w-20 group-hover/volume:opacity-100 group-hover/volume:ml-2 md:group-hover/volume:ml-3 transition-all duration-300 ease-in-out flex items-center">
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
