"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useUIStore } from "../../store/useUIStore";
import { usePlayerStore } from "../../store/usePlayerStore";
import { TrackRow } from "../../components/track/TrackRow";
import { SyncYTMusicButton } from "../../components/ui/SyncYTMusicButton";
import { Heart, History, User, Palette, Users, Radio, CheckCircle2, Play, ListMusic, Disc } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LibraryPageContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(urlTab || "likes");
  const {
    likedTracks,
    playlists,
    profile,
    accentColor,
    setAccentColor,
    logout,
    loadLocalLikes,
    loadLocalPlaylists,
    isYTSynced,
    ytLikedTracks,
    ytPlaylists,
    ytHistory,
    ytSubscriptions,
    checkYTStatus,
    loadYTLibraryData,
  } = useUIStore();

  const { playPlaylist } = usePlayerStore();
  const [historyTracks, setHistoryTracks] = useState([]);
  const [downloadedTracks, setDownloadedTracks] = useState([]);

  // Sync tab state with URL parameter if updated
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  // Load localStorage history
  const loadHistory = () => {
    if (typeof window !== "undefined") {
      const historyList = JSON.parse(
        localStorage.getItem("sonique_history") || "[]",
      );
      setHistoryTracks(historyList);
    }
  };

  // Load downloads metadata list
  const loadDownloads = () => {
    if (typeof window !== "undefined") {
      const dlList = JSON.parse(
        localStorage.getItem("sonique_downloads") || "[]",
      );
      setDownloadedTracks(dlList);
    }
  };

  useEffect(() => {
    if (!profile) {
      loadLocalLikes();
      loadLocalPlaylists();
    }
    loadHistory();
    loadDownloads();
    checkYTStatus();

    // Listen for storage change events
    window.addEventListener("sonique_history_changed", loadHistory);
    window.addEventListener("sonique_likes_changed", loadHistory);
    window.addEventListener("sonique_playlists_changed", loadLocalPlaylists);
    return () => {
      window.removeEventListener("sonique_history_changed", loadHistory);
      window.removeEventListener("sonique_likes_changed", loadHistory);
      window.removeEventListener("sonique_playlists_changed", loadLocalPlaylists);
    };
  }, [profile, loadLocalLikes, loadLocalPlaylists, checkYTStatus]);

  const convertLikeToPlayerTrack = (like) => ({
    id: like.track_id || like.id,
    title: like.title,
    artist: like.artist,
    coverUrl: like.cover_url || like.coverUrl || null,
    duration: like.duration,
    sourceUrl: like.source_url || like.sourceUrl,
    itemType: like.itemType,
    hasVideo: like.hasVideo,
    isVideo: like.isVideo,
  });

  const handlePlayAllLikes = () => {
    const list = likedTracks.map(convertLikeToPlayerTrack);
    playPlaylist(list, 0);
  };

  const handlePlayAllYTLikes = () => {
    if (ytLikedTracks.length > 0) {
      playPlaylist(ytLikedTracks, 0);
    }
  };

  const colors = [
    "#8B5CF6", // Violet
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#EF4444", // Red
  ];

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Your Library
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your personal playlists, likes, and YouTube Music account.
          </p>
        </div>
        <SyncYTMusicButton onSyncSuccess={() => loadYTLibraryData()} isSynced={isYTSynced} />
      </div>

      {/* Navigation Subtabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2 text-sm font-semibold overflow-x-auto scrollbar-none">
        {[
          { id: "likes", label: "Liked Songs", icon: Heart },
          { id: "playlists", label: "Playlists", icon: Disc },
          ...(isYTSynced
            ? [
                { id: "yt_likes", label: "YT Liked Songs", icon: Heart },
                { id: "yt_playlists", label: "YT Playlists", icon: Disc },
                { id: "yt_subs", label: "Subscribed Artists", icon: Users },
                { id: "yt_history", label: "YT History", icon: History },
              ]
            : []),
          { id: "history", label: "Local History", icon: History },
          { id: "profile", label: "Profile", icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg transition shrink-0 flex items-center gap-1.5 border
                ${
                  activeTab === tab.id
                    ? "text-zinc-950 border-white"
                    : "text-zinc-400 border-transparent hover:text-white hover:bg-white/5"
                }`}
              style={{
                backgroundColor:
                  activeTab === tab.id ? accentColor : "transparent",
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {/* TAB: LIKES */}
        {activeTab === "likes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                {likedTracks.length} Saved Songs
              </p>
              {likedTracks.length > 0 && (
                <button
                  onClick={handlePlayAllLikes}
                  className="text-xs font-bold py-1.5 px-4 rounded-full text-zinc-950"
                  style={{ backgroundColor: accentColor }}
                >
                  Play All
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {likedTracks.map((like, idx) => {
                const track = convertLikeToPlayerTrack(like);
                return (
                  <div key={like.id || like.track_id || `like-${idx}`} className="flex items-center gap-3">
                    <div className="flex-1">
                      <TrackRow track={track} index={idx} />
                    </div>
                  </div>
                );
              })}

              {likedTracks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center gap-2">
                  <Heart className="w-12 h-12 stroke-1 opacity-40 text-rose-500" />
                  <h4 className="text-zinc-300 font-semibold">
                    No Liked Songs
                  </h4>
                  <p className="text-xs max-w-xs">
                    Tracks you tap the heart on will show up here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: YT LIKED SONGS */}
        {activeTab === "yt_likes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                {ytLikedTracks.length} YouTube Music Liked Songs
              </p>
              {ytLikedTracks.length > 0 && (
                <button
                  onClick={handlePlayAllYTLikes}
                  className="text-xs font-bold py-1.5 px-4 rounded-full text-zinc-950 hover:scale-105 transition"
                  style={{ backgroundColor: accentColor }}
                >
                  Play All YT Likes
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {ytLikedTracks.map((track, idx) => (
                <TrackRow key={`${track.id}-${idx}`} track={track} index={idx} />
              ))}

              {ytLikedTracks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center gap-2">
                  <Heart className="w-12 h-12 stroke-1 opacity-40 text-rose-500" />
                  <h4 className="text-zinc-300 font-semibold">No YT Music Liked Songs Found</h4>
                  <p className="text-xs max-w-xs">
                    Ensure your YouTube Music account is synced using the button above.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PLAYLISTS */}
        {activeTab === "playlists" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {playlists.map((pl, idx) => (
                <Link
                  key={pl.id || `pl-${idx}`}
                  href={`/playlist/${pl.id}`}
                  className="group bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-800/40 p-4 rounded-xl flex flex-col gap-3 transition cursor-pointer"
                >
                  <div className="aspect-square w-full rounded bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                    <ListMusic className="w-12 h-12 text-zinc-600" />
                    <div
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-zinc-950 transition-all duration-300 shadow-xl opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Play className="w-4 h-4 fill-zinc-950 text-zinc-950 translate-x-0.5" />
                    </div>
                  </div>
                  <div className="overflow-hidden w-full text-left">
                    <p className="font-semibold text-sm truncate text-white">
                      {pl.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {pl.description || "Custom playlist"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {playlists.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center gap-2">
                <ListMusic className="w-12 h-12 stroke-1 opacity-40 text-indigo-400" />
                <h4 className="text-zinc-300 font-semibold">
                  No Created Playlists
                </h4>
                <p className="text-xs max-w-xs">
                  Create custom playlists via the sidebar to organize your favorite hits.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB: YT PLAYLISTS */}
        {activeTab === "yt_playlists" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {ytPlaylists.map((pl, idx) => (
                <div
                  key={pl.id || `ytpl-${idx}`}
                  onClick={() => playPlaylist([{ id: pl.id, videoId: pl.id, title: pl.title, itemType: 'playlist' }], 0)}
                  className="group bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-800/40 p-4 rounded-xl flex flex-col gap-3 cursor-pointer transition"
                >
                  <div className="aspect-square w-full rounded bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                    {pl.coverUrl ? (
                      <img src={pl.coverUrl} alt={pl.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <ListMusic className="w-12 h-12 text-zinc-600" />
                    )}
                    <div
                      className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-zinc-950 transition-all duration-300 shadow-xl opacity-0 scale-90 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Play className="w-4 h-4 fill-zinc-950 text-zinc-950 translate-x-0.5" />
                    </div>
                  </div>
                  <div className="overflow-hidden w-full text-left">
                    <p className="font-semibold text-sm truncate text-white">
                      {pl.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      {pl.count ? `${pl.count} items` : "YT Playlist"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {ytPlaylists.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center gap-2">
                <ListMusic className="w-12 h-12 stroke-1 opacity-40 text-purple-400" />
                <h4 className="text-zinc-300 font-semibold">No YouTube Music Playlists</h4>
              </div>
            )}
          </div>
        )}

        {/* TAB: SUBSCRIBED ARTISTS */}
        {activeTab === "yt_subs" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {ytSubscriptions.map((artist, idx) => (
              <Link
                key={artist.id || artist.browseId || `sub-${idx}`}
                href={`/artist/${artist.id}`}
                className="bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-800/40 p-4 rounded-2xl flex flex-col items-center text-center gap-3 transition"
              >
                {artist.avatarUrl ? (
                  <img src={artist.avatarUrl} alt={artist.name} className="w-24 h-24 rounded-full object-cover shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-lg">
                    {artist.name[0]}
                  </div>
                )}
                <div className="overflow-hidden w-full">
                  <p className="font-semibold text-sm truncate text-white">
                    {artist.name}
                  </p>
                  {artist.subscribers && (
                    <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                      {artist.subscribers}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* TAB: YT HISTORY */}
        {activeTab === "yt_history" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {ytHistory.map((track, idx) => (
                <TrackRow key={`${track.id}-${idx}`} track={track} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* TAB: HISTORY (LOCAL) */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {historyTracks.map((track, idx) => (
                <TrackRow
                  key={`${track.id}-${idx}`}
                  track={track}
                  index={idx}
                />
              ))}

              {historyTracks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center gap-2">
                  <History className="w-12 h-12 stroke-1 opacity-40 text-blue-400" />
                  <h4 className="text-zinc-300 font-semibold">History Empty</h4>
                  <p className="text-xs max-w-xs">
                    Your played music items will populate here as you browse.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PROFILE & SYSTEM ACCENT COLORS */}
        {activeTab === "profile" && (
          <div className="max-w-xl mx-auto space-y-6">
            {profile ? (
              <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-zinc-950"
                  style={{ backgroundColor: accentColor }}
                >
                  {profile.email[0].toUpperCase()}
                </div>
                <div className="text-center sm:text-left flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    {profile.display_name || "Sonique User"}
                  </h3>
                  <p className="text-xs text-zinc-400">{profile.email}</p>
                  <p className="text-[10px] text-zinc-500">
                    Joined Sonique:{" "}
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold py-1.5 px-4 rounded-lg text-red-400 transition"
                >
                  Log Out
                </button>
              </section>
            ) : (
              <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl text-center space-y-4">
                <User className="w-12 h-12 mx-auto stroke-1 text-zinc-400" />
                <div>
                  <h3 className="font-bold text-white">Not Signed In</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Sign in with Supabase auth to sync playlists and likes across devices.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-block text-xs font-semibold px-6 py-2 rounded-full text-zinc-950 hover:scale-105 active:scale-95 transition"
                  style={{ backgroundColor: accentColor }}
                >
                  Sign In Now
                </Link>
              </section>
            )}

            {/* Customization Accent Settings */}
            <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">
                  Customize Accent Theme
                </h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose a custom theme color accent. Keep in mind that active tracks automatically colorize the screen dynamically based on their artwork!
              </p>

              <div className="flex gap-3">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccentColor(c)}
                    className="w-8 h-8 rounded-full border-2 transition duration-200 hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: accentColor === c ? "white" : "transparent",
                    }}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium">Loading Library...</p>
        </div>
      }
    >
      <LibraryPageContent />
    </Suspense>
  );
}
