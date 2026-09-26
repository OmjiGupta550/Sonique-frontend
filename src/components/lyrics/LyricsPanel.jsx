"use client";

import React, { useEffect, useRef } from "react";
import { usePlayerStore } from "../../store/usePlayerStore";
import { useUIStore } from "../../store/useUIStore";
import { Music2, CheckCircle2, FileText, Captions, RotateCcw } from "lucide-react";

export function LyricsPanel() {
  const {
    queue,
    shuffledQueue,
    isShuffle,
    lyrics,
    currentIndex,
    currentLyricIndex,
    seek,
    isLyricsLoading,
    lyricsSynced,
    lyricsProvider,
    isInstrumental,
    lyricsOffset,
    lyricsTrackId,
    adjustLyricsOffset,
    setLyricsOffset,
    fetchLyricsForCurrent,
  } = usePlayerStore();

  const { accentColor } = useUIStore();
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  const activePlaylist = isShuffle ? shuffledQueue : queue;
  const currentTrack = activePlaylist[currentIndex];
  const trackId = currentTrack?.id || currentTrack?.videoId;

  useEffect(() => {
    if (
      trackId &&
      lyricsTrackId !== trackId &&
      !isLyricsLoading
    ) {
      fetchLyricsForCurrent();
    }
  }, [trackId, lyricsTrackId, isLyricsLoading, fetchLyricsForCurrent]);

  useEffect(() => {
    if (activeLineRef.current && lyricsSynced) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLyricIndex, lyricsSynced]);

  // Loading State
  if (isLyricsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3 select-none">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: `${accentColor} transparent transparent transparent`,
          }}
        />
        <p className="text-sm font-medium text-zinc-400">Searching synced lyrics providers...</p>
      </div>
    );
  }

  // Instrumental State
  if (isInstrumental) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-center p-6 gap-3 select-none animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
          <Music2 className="w-8 h-8 text-violet-400" />
        </div>
        <div className="space-y-1 max-w-xs">
          <h3 className="text-lg font-bold text-white tracking-tight">Instrumental Track</h3>
          <p className="text-xs text-zinc-400">
            This song is an instrumental recording without vocals.
          </p>
        </div>
      </div>
    );
  }

  // Empty / Unavailable State (Robust, no jitter, clear message)
  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-center p-6 gap-4 select-none animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
          <FileText className="w-8 h-8 text-zinc-500" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
            No Lyrics Available
          </h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Couldn&apos;t find synchronized or plain lyrics for &ldquo;{currentTrack?.title || "this track"}&rdquo;.
          </p>
          {currentTrack?.artist && (
            <p className="text-xs text-zinc-500">
              by {currentTrack.artist}
            </p>
          )}
        </div>
        <button
          onClick={() => fetchLyricsForCurrent()}
          className="mt-2 text-xs font-semibold px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Search</span>
        </button>
      </div>
    );
  }

  const isTranscript = lyricsProvider && lyricsProvider.toLowerCase().includes("transcript");

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Top Provider Badge & Sync Tuning Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] text-zinc-400 font-semibold border-b border-white/5 bg-zinc-950/40 select-none shrink-0">
        <div className="flex items-center gap-1.5">
          {isTranscript ? (
            <Captions className="w-3.5 h-3.5 text-amber-400" />
          ) : lyricsSynced ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
          )}
          <span>
            {isTranscript
              ? "Captions/Transcript"
              : lyricsSynced
              ? "Synced Lyrics"
              : "Plain Text"}
          </span>
        </div>

        {/* Sync Offset Calibration Controls */}
        {lyricsSynced && (
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-zinc-300">
            <button
              onClick={() => adjustLyricsOffset(-0.5)}
              className="px-1 hover:text-white transition font-mono hover:bg-white/10 rounded"
              title="Shift lyrics 0.5s earlier"
            >
              -0.5s
            </button>
            <span
              onClick={() => setLyricsOffset(0.0)}
              className="cursor-pointer font-mono text-violet-400 hover:underline px-0.5"
              title="Reset offset"
            >
              {lyricsOffset > 0 ? `+${lyricsOffset.toFixed(1)}s` : `${lyricsOffset.toFixed(1)}s`}
            </span>
            <button
              onClick={() => adjustLyricsOffset(0.5)}
              className="px-1 hover:text-white transition font-mono hover:bg-white/10 rounded"
              title="Shift lyrics 0.5s later"
            >
              +0.5s
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {lyricsProvider && (
            <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-zinc-300">
              {lyricsProvider}
            </span>
          )}
        </div>
      </div>

      {/* Lyrics Scrollable Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scroll-smooth flex flex-col gap-6 py-[15vh] mask-gradient px-4"
      >
        {lyrics.map((line, idx) => {
          const isActive = lyricsSynced && idx === currentLyricIndex;
          const isPast = lyricsSynced && idx < currentLyricIndex;

          return (
            <div
              key={idx}
              ref={isActive ? activeLineRef : null}
              onClick={() => {
                const targetTime = line.start !== undefined ? line.start : line.time;
                if (targetTime !== undefined) seek(targetTime);
              }}
              className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-lg text-left select-none origin-left
                ${
                  isActive
                    ? "text-white text-xl md:text-2xl font-bold scale-[1.03] bg-white/5 shadow-sm"
                    : isPast
                    ? "text-zinc-400 text-md md:text-lg font-medium hover:text-white"
                    : "text-zinc-500 text-md md:text-lg font-medium hover:text-white"
                }`}
              style={{
                textShadow: isActive ? `0 0 12px ${accentColor}30` : "none",
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
