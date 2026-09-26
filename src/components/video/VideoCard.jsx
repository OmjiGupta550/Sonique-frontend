"use client";

import React from "react";
import { useUIStore } from "../../store/useUIStore";
import { usePlayerStore } from "../../store/usePlayerStore";
import { Play, Pause, Eye, Clock } from "lucide-react";
import { API_BASE } from "../../lib/config";

export function VideoCard({ video }) {
  const { accentColor } = useUIStore();
  const { queue, currentIndex, isPlaying, togglePlay } = usePlayerStore();

  const isCurrent = queue[currentIndex]?.id === video.id;

  const formatDuration = (secs) => {
    if (!secs) return "3:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handlePlayCard = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
      return;
    }
    const playerTrack = {
      id: video.id,
      title: video.title,
      artist: video.artist,
      coverUrl: video.coverUrl,
      duration: video.duration,
      sourceUrl: `${API_BASE}/stream/${video.id}?redirect=true`,
      hasVideo: true,
    };
    usePlayerStore.getState().playTrack(playerTrack);
  };



  return (
    <div
      onClick={handlePlayCard}
      className="group relative bg-zinc-900/40 hover:bg-zinc-800/40 p-3 rounded-xl border border-white/5 transition-all duration-300 cursor-pointer flex flex-col gap-2.5 shadow-md select-none hover:-translate-y-1 hover:shadow-xl hover:border-white/10 w-64 sm:w-72 md:w-80 shrink-0"
    >
      {/* 16:9 Video Cover */}
      <div className="relative aspect-video w-full rounded-lg bg-zinc-850 overflow-hidden shadow-inner border border-white/5">
        {/* Ambient Blurred Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-110"
          style={{ backgroundImage: `url(${video.coverUrl})` }}
        />



        {/* Views Badge */}
        {video.views && (
          <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-bold text-zinc-300 flex items-center gap-1 z-20 shadow-md">
            <Eye className="w-3 h-3 text-zinc-400" />
            <span>{video.views}</span>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-200 flex items-center gap-0.5 z-20 shadow-md">
          <Clock className="w-3 h-3 text-zinc-400" />
          <span>{formatDuration(video.duration)}</span>
        </div>

        {/* Video Thumbnail */}
        <img
          src={video.coverUrl}
          alt={video.title}
          className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            if (video.id && video.id.length === 11) {
              e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
            } else {
              e.currentTarget.src = "/placeholder.png";
            }
          }}
        />

        {/* Hover Play Button (Spotify Style) */}
        <button
          onClick={handlePlayCard}
          className={`absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center text-zinc-950 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 z-20
            ${
              isCurrent
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
            }`}
          style={{ backgroundColor: accentColor }}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-zinc-950 text-zinc-950" />
          ) : (
            <Play className="w-5 h-5 fill-zinc-950 text-zinc-950 translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Metadata */}
      <div className="flex flex-col text-left overflow-hidden px-1">
        <h4 className="text-sm font-bold text-white truncate leading-tight group-hover:text-violet-400 transition">
          {video.title}
        </h4>
        <p className="text-xs text-zinc-400 truncate mt-1">{video.artist}</p>
      </div>
    </div>
  );
}
