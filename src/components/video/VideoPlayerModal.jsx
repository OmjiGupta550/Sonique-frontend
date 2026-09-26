"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useUIStore } from "../../store/useUIStore";
import { usePlayerStore } from "../../store/usePlayerStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, Tv } from "lucide-react";

export function VideoPlayerModal() {
  const { activeVideoId, closeVideo, accentColor } = useUIStore();
  const {
    queue,
    shuffledQueue,
    isShuffle,
    currentIndex,
    togglePlay,
  } = usePlayerStore();

  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeQueue = isShuffle ? shuffledQueue : queue;
  const activePlaybackTrack = activeQueue[currentIndex];
  const videoId = activePlaybackTrack?.id || activeVideoId;
  const trackTitle = activePlaybackTrack?.title || "";

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeVideo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeVideo]);

  const handleTogglePlay = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  const isVisible = Boolean(activeVideoId && videoId);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Dark Backdrop Overlay with Smooth Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl z-[58] select-none cursor-pointer"
            onClick={closeVideo}
          />

          {/* Ambient Color Glow Orbs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none z-[58]"
            style={{ backgroundColor: accentColor }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[100px] pointer-events-none z-[58]"
            style={{ backgroundColor: accentColor }}
          />

          {/* Video Modal Container with Buttery Spring Entrance & Exit */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 pointer-events-none select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 300,
                mass: 0.85,
              }}
              className={`relative w-full bg-zinc-950 border border-white/15 rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] aspect-video pointer-events-auto transform-gpu ${
                isFullscreen ? "max-w-7xl max-h-[90vh]" : "max-w-4xl lg:max-w-5xl max-h-[80vh]"
              }`}
            >
              {/* Main Video Box with smooth anchor placeholder */}
              <div className="flex-1 w-full h-full bg-zinc-950 relative rounded-2xl overflow-hidden flex items-center justify-center">
                <div
                  id="youtube-player-modal-placeholder"
                  className="w-full h-full rounded-2xl bg-zinc-950 youtube-player-modal-placeholder overflow-hidden object-cover"
                />
                {/* Click Overlay to toggle play/pause */}
                <div
                  className="absolute inset-0 z-[62] cursor-pointer"
                  onClick={handleTogglePlay}
                />
              </div>

              {/* Top Header Overlay Bar with Controls */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between z-[110] pointer-events-none"
              >
                <div className="flex items-center gap-2.5 bg-black/70 backdrop-blur-xl py-1.5 px-3.5 rounded-full border border-white/10 shadow-lg select-none max-w-[60%]">
                  <Tv className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                  <span className="text-xs font-bold tracking-wide text-white truncate">
                    {trackTitle || "Playing Video"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-xl border border-white/10 text-zinc-300 hover:text-white transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                    title={isFullscreen ? "Exit Widescreen" : "Widescreen"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={closeVideo}
                    className="p-2 rounded-full bg-black/70 hover:bg-red-600/80 backdrop-blur-xl border border-white/10 text-zinc-300 hover:text-white transition-all duration-200 shadow-lg hover:scale-105 active:scale-95"
                    title="Close Video Box"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
