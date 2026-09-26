"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrackCard } from "../../components/track/TrackCard";
import { usePlayerStore } from "../../store/usePlayerStore";
import { useUIStore } from "../../store/useUIStore";
import { TrackRow } from "../../components/track/TrackRow";
import { Sparkles } from "lucide-react";
import { VideoCard } from "../../components/video/VideoCard";
import { SyncYTMusicButton } from "../../components/ui/SyncYTMusicButton";
import { API_BASE } from "../../lib/config";
import { AIAssistantModal } from "../../components/ai/AIAssistantModal";
import { useAIStore } from "../../store/useAIStore";

export default function HomePage() {
  const router = useRouter();
  const { accentColor, profile, isYTSynced, checkYTStatus } = useUIStore();
  const { setIsOpen: setIsAIOpen } = useAIStore();
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic backend feed with fast caching
  const loadHomeFeed = async (forceRefresh = false) => {
    const userId = profile?.id || "default";
    try {
      const res = await fetch(
        `${API_BASE}/home-feed?userId=${userId}&refresh=${forceRefresh ? "true" : "false"}&t=${Date.now()}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.shelves) && data.shelves.length > 0) {
          setShelves(data.shelves);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "sonique_home_shelves",
              JSON.stringify(data.shelves),
            );
            localStorage.setItem(
              "sonique_home_shelves_auth",
              data.authenticated ? "true" : "false"
            );
          }
        }
      }
    } catch (e) {
      console.error("Failed to load backend home feed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Restore cached shelves instantly on mount, then sync in background
  useEffect(() => {
    let isMounted = true;

    // Instant local cache restore only if auth state matches
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("sonique_home_shelves");
      const cachedAuth = localStorage.getItem("sonique_home_shelves_auth");
      const hasSavedAuth =
        localStorage.getItem("sonique_yt_auth") ||
        localStorage.getItem("sonique_yt_auth_default") ||
        (profile?.id && localStorage.getItem(`sonique_yt_auth_${profile.id}`));

      // If user is supposed to be synced, do NOT show unauthenticated cached feed
      if (hasSavedAuth && cachedAuth === "false") {
        // Skip unauthenticated cache to prevent flashing unlinked content
      } else if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
            setShelves(parsed);
            setLoading(false);
          }
        } catch (e) {}
      }
    }

    const initAndFetch = async () => {
      // 1. Restore YT status asynchronously
      const isSynced = await checkYTStatus();

      // 2. Fetch backend feed (forceRefresh if synced to ensure fresh authenticated data)
      if (isMounted) {
        await loadHomeFeed(isSynced ? true : false);
      }
    };

    initAndFetch();

    const handleRefresh = () => {
      loadHomeFeed(true);
    };

    window.addEventListener("sonique_recs_refresh", handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("sonique_recs_refresh", handleRefresh);
    };
  }, [profile]);

  // Helper to convert backend item to PlayerTrack format
  const convertToPlayerTrack = (track) => ({
    id: track.id || track.videoId,
    title: track.title,
    artist: track.artist,
    coverUrl: track.coverUrl || track.thumbnail,
    thumbnail: track.thumbnail || track.coverUrl,
    duration: track.duration,
    sourceUrl:
      track.sourceUrl ||
      `${API_BASE}/stream/${track.id || track.videoId}?redirect=true`,
    confidence: track.confidence,
    genre: track.genre,
    itemType: track.itemType,
    hasVideo: track.hasVideo,
    isVideo: track.isVideo,
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6 md:space-y-10 pb-8 select-none">
      {/* Greeting Banner Card */}
      <section className="relative rounded-2xl bg-gradient-to-r from-zinc-900/80 to-zinc-950/40 border border-white/10 p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <div
            className="w-40 h-40 font-black text-8xl flex items-center justify-center select-none"
            style={{ color: accentColor }}
          >
            S
          </div>
        </div>
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            <span>{isYTSynced ? "YouTube Music Synced" : "Welcome to Sonique Music"}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {isYTSynced ? "Your YouTube Music Feed" : (profile ? getGreeting() : "Discover Your Perfect Song")}
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            {isYTSynced
              ? "Showing your YouTube Music listening history, liked tracks, playlists, and personalized picks."
              : (profile
                ? "Your personalized data-driven feed is active."
                : "Explore live dynamic recommendations directly driven by YouTube Music.")}
          </p>
          <div className="pt-2">
            <SyncYTMusicButton onSyncSuccess={() => loadHomeFeed(true)} isSynced={isYTSynced} />
          </div>
        </div>
      </section>

      {/* Loading Skeleton */}
      {loading && shelves.length === 0 && (
        <div className="space-y-8 animate-pulse pb-8">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="space-y-4">
              <div className="h-6 bg-zinc-900/60 rounded w-48 border border-white/5" />
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-48 aspect-square bg-zinc-900/40 rounded-xl border border-white/5 shrink-0"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render 100% Backend-Driven Shelves */}
      {shelves.map((shelf) => {
        const items =
          shelf.items ||
          shelf.tracks ||
          shelf.albums ||
          shelf.videos ||
          shelf.artists ||
          [];
        if (!items || items.length === 0) return null;

        return (
          <section
            key={`${shelf.type || "shelf"}-${shelf.title || "untitled"}`}
            className="space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg md:text-2xl font-bold tracking-tight text-white font-black uppercase">
                  {shelf.title}
                </h2>
                {shelf.isLiveChart && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              {items.map((item, idx) => {
                const itemType =
                  item.itemType ||
                  (shelf.type === "videos"
                    ? "video"
                    : shelf.type === "artists"
                    ? "artist"
                    : shelf.type === "albums"
                    ? "album"
                    : shelf.type === "playlists"
                    ? "playlist"
                    : "song");

                const isVideoItem =
                  itemType === "video" ||
                  item.isVideo ||
                  shelf.type === "videos" ||
                  (shelf.title && shelf.title.toLowerCase().includes("video"));

                if (isVideoItem) {
                  const videoData = {
                    id: item.id || item.videoId,
                    title: item.title || item.name || "Music Video",
                    artist: item.artist || item.author || "YouTube Music",
                    coverUrl:
                      item.coverUrl ||
                      item.cover ||
                      item.thumbnail ||
                      `https://i.ytimg.com/vi/${item.id || item.videoId}/hqdefault.jpg`,
                    duration: item.duration || 180,
                    views: item.views || null,
                  };
                  return <VideoCard key={item.id || `video-${idx}`} video={videoData} />;
                }

                if (itemType === "artist" || shelf.type === "artists") {
                  return (
                    <div
                      key={item.id || `artist-${idx}`}
                      onClick={() => router.push(`/artist/${item.id || item.browseId}`)}
                      className="group flex flex-col items-center gap-2.5 bg-zinc-900/20 hover:bg-zinc-800/40 p-3 md:p-4 rounded-xl border border-white/5 shadow-md transition duration-300 cursor-pointer text-center w-28 md:w-36 shrink-0"
                    >
                      <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-zinc-800 border border-white/10 overflow-hidden shadow-md group-hover:scale-105 transition duration-300">
                        {item.avatar || item.avatarUrl || item.cover || item.coverUrl ? (
                          <img
                            src={item.avatar || item.avatarUrl || item.cover || item.coverUrl}
                            alt={item.name || item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            👤
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] md:text-xs font-bold text-zinc-300 group-hover:text-white truncate w-full">
                        {item.name || item.title}
                      </span>
                    </div>
                  );
                }

                if (itemType === "album" || shelf.type === "albums") {
                  return (
                    <TrackCard
                      key={item.id || item.browseId || `album-${idx}`}
                      track={{
                        id: item.id || item.browseId,
                        title: item.name || item.title,
                        artist: item.artist || item.author || "Album",
                        coverUrl: item.cover || item.coverUrl || item.thumbnail,
                        itemType: "album",
                      }}
                    />
                  );
                }

                if (itemType === "playlist" || shelf.type === "playlists") {
                  return (
                    <TrackCard
                      key={item.id || item.playlistId || `playlist-${idx}`}
                      track={{
                        id: item.id || item.playlistId,
                        title: item.title || item.name,
                        artist: item.description || item.author || "Playlist",
                        coverUrl: item.coverUrl || item.cover || item.thumbnail,
                        itemType: "playlist",
                      }}
                    />
                  );
                }

                // Default Audio TrackCard for songs (Listen Again, Forgotten Favourites, Fresh Finds, Favourites, Quick Picks, etc.)
                return (
                  <TrackCard key={`${item.id}-${idx}`} track={convertToPlayerTrack(item)} />
                );
              })}
            </div>
          </section>
        );
      })}
      <AIAssistantModal />
    </div>
  );
}
