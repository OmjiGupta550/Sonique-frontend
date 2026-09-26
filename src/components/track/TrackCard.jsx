"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePlayerStore } from "../../store/usePlayerStore";
import { useUIStore } from "../../store/useUIStore";
import { Play, Pause, Sparkles } from "lucide-react";

export function TrackCard({ track }) {
  const router = useRouter();
  const { queue, currentIndex, isPlaying, playTrack, togglePlay } =
    usePlayerStore();
  const { accentColor } = useUIStore();

  const isPlaylist =
    track.itemType === "playlist" ||
    (track.id &&
      (track.id.startsWith("RDCLAK") ||
        track.id.startsWith("PL") ||
        track.id.startsWith("VL")));
  const isAlbum =
    track.itemType === "album" ||
    (track.id && track.id.startsWith("MPREb"));

  const isCurrent = queue[currentIndex]?.id === track.id;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isPlaylist) {
      router.push(`/playlist/${track.id}`);
      return;
    }
    if (isAlbum) {
      router.push(`/album/${track.id}`);
      return;
    }
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };



  const getCoverSrc = (t) => {
    const fallback = "/placeholder.png";
    const src = t.coverUrl || t.thumbnail || t.cover;
    if (
      src &&
      typeof src === "string" &&
      src.trim() !== "" &&
      src !== "null" &&
      src !== "undefined"
    ) {
      return src;
    }
    if (t.id && t.id.length === 11) {
      return `https://i.ytimg.com/vi/${t.id}/hqdefault.jpg`;
    }
    return fallback;
  };

  const coverSrc = getCoverSrc(track);

  // Detect if artwork is 16:9 widescreen (YouTube video thumbnail)
  const isWidescreen =
    track.itemType === "video" ||
    track.isVideo ||
    (coverSrc &&
      (coverSrc.includes("ytimg.com") ||
        coverSrc.includes("hqdefault") ||
        coverSrc.includes("maxresdefault") ||
        coverSrc.includes("mqdefault")));

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative bg-zinc-900/40 hover:bg-zinc-800/40 p-3 md:p-4 rounded-xl border border-white/5 transition-all duration-300 cursor-pointer flex flex-col gap-2 md:gap-3 shadow-md select-none hover:-translate-y-1 hover:shadow-xl hover:border-white/10 shrink-0
        ${isWidescreen ? "w-56 sm:w-64 md:w-72" : "w-36 md:w-48"}`}
    >
      {/* Artwork Box */}
      <div
        className={`relative w-full rounded-lg bg-zinc-850 overflow-hidden shadow-inner border border-white/5 ${
          isWidescreen ? "aspect-video" : "aspect-square"
        }`}
      >
        {/* Ambient Blurred Background to prevent any edge clipping or black bars */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-110"
          style={{ backgroundImage: `url(${coverSrc})` }}
        />

        {track.confidence !== undefined && (
          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[10px] font-bold text-emerald-400 flex items-center gap-1 z-20 shadow-lg">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{Math.round(track.confidence)}% match</span>
          </div>
        )}



        <img
          src={coverSrc}
          alt={track.title}
          className="relative z-10 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

        {/* Hover Play Button */}
        <button
          onClick={handlePlayClick}
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
      <div className="flex flex-col overflow-hidden px-0.5">
        <h4
          className={`text-sm font-semibold truncate leading-tight transition duration-150 ${
            isCurrent ? "text-white" : "text-zinc-200"
          }`}
          style={{ color: isCurrent ? accentColor : undefined }}
        >
          {track.title}
        </h4>
        <p className="text-xs text-zinc-400 truncate mt-1">{track.artist}</p>
      </div>
    </div>
  );
}
