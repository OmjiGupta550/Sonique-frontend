"use client";

import React from "react";
import { usePlayerStore } from "../../store/usePlayerStore";
import { useUIStore } from "../../store/useUIStore";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2,
  Heart,
  ListMusic,
  Tv,
} from "lucide-react";
import { Slider } from "../ui/Slider";

export function MiniPlayer() {
  const {
    queue,
    shuffledQueue,
    isShuffle,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    togglePlay,
    playTrack,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    showFullscreenPlayer,
    setShowFullscreenPlayer,
    setShowQueueList,
    showQueueList,
    isVideoMode,
    setVideoMode,
  } = usePlayerStore();

  const {
    toggleLike,
    isLiked,
    accentColor,
    playVideo,
    closeVideo,
    activeVideoId,
  } = useUIStore();
  const [showRemaining, setShowRemaining] = React.useState(false);

  const activeQueue = isShuffle ? shuffledQueue : queue;
  const track = activeQueue[currentIndex];

  if (!track) return null;

  const formatTime = (secs) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const getCoverSrc = (t) => {
    const fallback = "/placeholder.png";
    if (
      t.coverUrl &&
      t.coverUrl.trim() !== "" &&
      t.coverUrl !== "null" &&
      t.coverUrl !== "undefined"
    ) {
      return t.coverUrl;
    }
    if (t.id && t.id.length === 11) {
      return `https://i.ytimg.com/vi/${t.id}/maxresdefault.jpg`;
    }
    return fallback;
  };

  const coverSrc = getCoverSrc(track);

  const remainingTime = Math.max(0, duration - currentTime);

  return (
    <div className="fixed bottom-[84px] md:bottom-0 left-0 right-0 h-16 md:h-20 bg-transparent md:bg-zinc-950/90 md:border-t md:border-white/5 md:backdrop-blur-2xl z-50 select-none">
      {/* Desktop Layout (md:flex) */}
      <div className="hidden md:flex items-center justify-between px-4 h-full">
        {/* Left - Artwork Cover or Widescreen Video Corner Preview */}
        <div className="flex items-center gap-3 w-[30%] min-w-[120px] sm:min-w-[180px]">
          {isVideoMode && !showFullscreenPlayer && !activeVideoId ? (
            /* Widescreen YouTube Video Corner Preview */
            <div className="w-24 h-14 rounded-lg bg-zinc-950 overflow-hidden shrink-0 relative border border-white/10 shadow-md group cursor-pointer">
              <div
                id="youtube-player-placeholder"
                className="w-full h-full bg-transparent"
              />

              {/* Corner maximize hover overlay */}
              <div
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullscreenPlayer(true);
                }}
                title="Fullscreen Video"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
              {/* Click Overlay to toggle play/pause */}
              <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay}
              />
            </div>
          ) : (
            /* Standard Square Album Art Cover image */
            <div
              className="w-14 h-14 rounded-lg overflow-hidden border border-white/5 shadow-md cursor-pointer shrink-0 relative group"
              onClick={() => setShowFullscreenPlayer(true)}
            >
              <img
                src={coverSrc}
                alt={track.title}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  if (
                    e.currentTarget.src !==
                      `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg` &&
                    track.id &&
                    track.id.length === 11
                  ) {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;
                  } else {
                    e.currentTarget.src = "/placeholder.png";
                  }
                }}
              />

              {/* Hover overlay play/pause indicator */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white translate-x-0.5" />
                )}
              </div>
            </div>
          )}

          <div className="overflow-hidden">
            <h4
              className="text-sm font-semibold text-white truncate cursor-pointer hover:underline"
              onClick={() => setShowFullscreenPlayer(true)}
            >
              {track.title}
            </h4>
            <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
          </div>

          <button
            onClick={() => toggleLike(track)}
            className="ml-2 text-zinc-400 hover:text-white transition shrink-0"
          >
            <Heart
              className={`w-5 h-5 ${isLiked(track.id) ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>

        {/* Center Controls */}
        <div className="flex flex-col items-center justify-center gap-1.5 w-[40%] max-w-[600px] flex-1">
          {/* Playback Buttons Row */}
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={toggleShuffle}
              className={`hidden sm:block transition ${isShuffle ? "text-white" : "text-zinc-500 hover:text-white"}`}
              style={{ color: isShuffle ? accentColor : undefined }}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previous}
              className="text-zinc-400 hover:text-white transition"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-zinc-400 hover:fill-white" />
            </button>

            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-950 transition hover:scale-105 active:scale-95 shadow-md shrink-0"
              style={{ backgroundColor: accentColor }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4.5 h-4.5 fill-zinc-950" />
              ) : (
                <Play className="w-4.5 h-4.5 fill-zinc-950 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={next}
              className="text-zinc-400 hover:text-white transition"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-zinc-400 hover:fill-white" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`hidden sm:block relative transition ${repeatMode !== "none" ? "text-white" : "text-zinc-500 hover:text-white"}`}
              style={{ color: repeatMode !== "none" ? accentColor : undefined }}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === "one" && (
                <span
                  className="absolute -top-1 -right-1 text-[8px] font-bold rounded-full w-2.5 h-2.5 flex items-center justify-center text-zinc-950"
                  style={{ backgroundColor: accentColor }}
                >
                  1
                </span>
              )}
            </button>
          </div>

          {/* Progress Bar Row */}
          <div className="flex items-center gap-2.5 w-full text-zinc-400 select-none">
            <span className="w-10 text-right text-[11px] font-medium text-zinc-400/80">
              {formatTime(currentTime)}
            </span>

            <div
              className="flex-1 py-2 cursor-pointer relative group flex items-center"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - rect.left) / rect.width) * duration);
              }}
            >
              <div className="w-full h-1 bg-zinc-800 rounded-full group-hover:h-1.5 transition-all duration-150 relative overflow-visible">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: accentColor,
                  }}
                />

                <div
                  className="absolute w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150 -translate-x-1.5 top-1/2 -translate-y-1/2"
                  style={{ left: `${progress}%` }}
                />
              </div>
            </div>

            <span
              className="w-10 text-left text-[11px] font-medium text-zinc-400/80 cursor-pointer hover:text-white transition"
              onClick={() => setShowRemaining(!showRemaining)}
            >
              {showRemaining
                ? `-${formatTime(remainingTime)}`
                : formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 w-[30%] min-w-[100px] sm:min-w-[180px] justify-end">
          <button
            onClick={() => setShowQueueList(!showQueueList)}
            className={`transition shrink-0 ${showQueueList ? "text-white" : "text-zinc-500 hover:text-white"}`}
            style={{ color: showQueueList ? accentColor : undefined }}
            title="Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 w-28 shrink-0">
            <button
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <Slider
              value={isMuted ? 0 : volume}
              max={1}
              onChange={(v) => setVolume(v)}
              accentColor={accentColor}
            />
          </div>

          {track.hasVideo && (
            <button
              onClick={() => {
                if (isVideoMode) {
                  setVideoMode(false);
                  closeVideo();
                } else {
                  setVideoMode(true);
                  playVideo(track.id);
                }
              }}
              className={`transition shrink-0 mr-1 p-1 rounded-full ${
                isVideoMode
                  ? "text-red-400 bg-red-500/10 border border-red-500/20 shadow-inner animate-pulse hover:scale-105"
                  : "text-zinc-400 hover:text-red-400"
              }`}
              title={isVideoMode ? "Watch Audio Only" : "Watch Video"}
            >
              <Tv className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => setShowFullscreenPlayer(true)}
            className="text-zinc-400 hover:text-white transition shrink-0"
            title="Open Lyrics & Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Layout (md:hidden) - Floating Pill */}
      <div
        className="flex md:hidden items-center justify-between px-4 h-full mx-4 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-lg backdrop-blur-xl w-[calc(100vw-2rem)] relative overflow-hidden cursor-pointer"
        onClick={() => setShowFullscreenPlayer(true)}
      >
        {/* Progress bar overlay at the very bottom of the floating card */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-800/50">
          <div
            className="h-full transition-all duration-100"
            style={{ width: `${progress}%`, backgroundColor: accentColor }}
          />
        </div>

        {/* Left section: Artwork + Title & Artist */}
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          {isVideoMode && !showFullscreenPlayer && !activeVideoId ? (
            <div className="w-12 h-8 rounded bg-zinc-950 overflow-hidden shrink-0 border border-white/10 relative">
              <div
                id="youtube-player-placeholder"
                className="w-full h-full bg-transparent"
              />
              {/* Overlay inside video placeholder to capture maximize clicks */}
              <div className="absolute inset-0 z-10" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-zinc-950 overflow-hidden border border-white/10 shrink-0 relative shadow-sm">
              <img
                src={coverSrc}
                alt={track.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  if (
                    e.currentTarget.src !==
                      `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg` &&
                    track.id &&
                    track.id.length === 11
                  ) {
                    e.currentTarget.src = `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;
                  } else {
                    e.currentTarget.src = "/placeholder.png";
                  }
                }}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-white truncate">
              {track.title}
            </h4>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Right section: Like, Play/Pause, Next */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(track);
            }}
            className="p-2 text-zinc-400 active:scale-90 transition shrink-0"
            title="Like"
          >
            <Heart
              className={`w-5 h-5 ${isLiked(track.id) ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-zinc-950 active:scale-95 transition shrink-0 shadow"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4.5 h-4.5 fill-zinc-950 text-zinc-950" />
            ) : (
              <Play className="w-4.5 h-4.5 fill-zinc-950 text-zinc-950 translate-x-0.5" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="p-2 text-zinc-400 active:scale-90 transition shrink-0"
            title="Next Track"
          >
            <SkipForward className="w-5 h-5 fill-zinc-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
