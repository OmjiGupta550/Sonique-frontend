"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { fetchSaavnPlaylist } from "../../../lib/saavn";
import { useUIStore } from "../../../store/useUIStore";
import { usePlayerStore } from "../../../store/usePlayerStore";
import { TrackRow } from "../../../components/track/TrackRow";
import { Disc, Play, Trash2, Calendar, Music } from "lucide-react";
import { API_BASE } from "../../../lib/config";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id;

  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCurated, setIsCurated] = useState(false);

  const { profile, deletePlaylist, accentColor } = useUIStore();
  const { playPlaylist } = usePlayerStore();

  const loadPlaylistDetails = async () => {
    try {
      const isSaavn = /^\d+$/.test(playlistId);
      const isYTPlaylist = playlistId.startsWith("RDCLAK") || playlistId.startsWith("PL") || playlistId.startsWith("VL");
      setIsCurated(isSaavn || isYTPlaylist);

      if (isSaavn) {
        // Load curated JioSaavn Playlist
        const details = await fetchSaavnPlaylist(playlistId);
        if (!details) {
          router.push("/library");
          return;
        }

        setPlaylist({
          name: details.name,
          description: details.description,
          coverUrl: details.coverUrl,
        });
        setTracks(
          details.tracks.map((t) => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            coverUrl: t.coverUrl,
            duration: t.duration,
            sourceUrl: t.sourceUrl,
            itemType: t.itemType,
            hasVideo: t.hasVideo,
            isVideo: t.isVideo,
          })),
        );
      } else if (isYTPlaylist) {
        // Load YouTube Music Playlist
        const res = await fetch(`${API_BASE}/playlist/${playlistId}`);
        if (res.ok) {
          const details = await res.json();
          setPlaylist({
            name: details.title || "YouTube Music Playlist",
            description: details.description || "Curated playlist from YouTube Music",
            coverUrl: details.thumbnails?.[details.thumbnails.length - 1]?.url || "/placeholder.png",
          });
          const mappedTracks = (details.tracks || []).map((t) => {
            const artists = (t.artists || []).map((a) => a.name).filter(Boolean).join(", ");
            const cover = t.thumbnails?.[t.thumbnails.length - 1]?.url || (t.videoId ? `https://i.ytimg.com/vi/${t.videoId}/hqdefault.jpg` : "/placeholder.png");
            return {
              id: t.videoId || t.id,
              title: t.title || "Unknown Track",
              artist: artists || t.author || "Various Artists",
              coverUrl: cover,
              duration: t.duration_seconds || 180,
              sourceUrl: `${API_BASE}/stream/${t.videoId || t.id}?redirect=true`,
            };
          });
          setTracks(mappedTracks);
        } else {
          router.push("/library");
          return;
        }
      } else {
        // Load custom User Playlist (Check Local Storage + Store + Supabase)
        let pl = null;
        let list = [];

        if (typeof window !== "undefined") {
          const localPlaylists = JSON.parse(
            localStorage.getItem("sonique_playlists") || "[]"
          );
          pl = localPlaylists.find((p) => String(p.id) === String(playlistId));
          const storageKey = `sonique_playlist_tracks_${playlistId}`;
          list = JSON.parse(localStorage.getItem(storageKey) || "[]");
        }

        if (!pl) {
          const storePlaylists = useUIStore.getState().playlists;
          pl = storePlaylists.find((p) => String(p.id) === String(playlistId));
        }

        if (!pl && profile) {
          try {
            const { data: dbPl } = await supabase
              .from("playlists")
              .select("*")
              .eq("id", playlistId)
              .maybeSingle();
            if (dbPl) pl = dbPl;

            if (list.length === 0) {
              const { data: dbTracks } = await supabase
                .from("playlist_tracks")
                .select("*")
                .eq("playlist_id", playlistId)
                .order("created_at", { ascending: true });
              if (dbTracks) list = dbTracks;
            }
          } catch (e) {
            console.error("Error fetching Supabase playlist details:", e);
          }
        }

        if (!pl && list.length === 0) {
          router.push("/library?tab=playlists");
          return;
        }

        setPlaylist({
          name: pl?.name || "My Playlist",
          description: pl?.description || "User created compilation",
          coverUrl: pl?.cover_url || pl?.coverUrl || (list[0]?.coverUrl || list[0]?.cover_url) || null,
          created_at: pl?.created_at || new Date().toISOString(),
        });

        setTracks(
          (list || []).map((pt) => ({
            id: pt.track_id || pt.id || pt.videoId,
            title: pt.title || "Unknown Track",
            artist: pt.artist || "Unknown Artist",
            coverUrl: pt.cover_url || pt.coverUrl || null,
            duration: pt.duration || 180,
            sourceUrl: pt.source_url || pt.sourceUrl,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId) {
      loadPlaylistDetails();
    }
  }, [playlistId]);

  const handlePlayPlaylist = () => {
    playPlaylist(tracks, 0);
  };

  const handleRemoveTrack = async (trackId) => {
    if (isCurated) return;
    const updated = tracks.filter((t) => (t.id || t.track_id) !== trackId);
    setTracks(updated);

    if (typeof window !== "undefined") {
      const storageKey = `sonique_playlist_tracks_${playlistId}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      window.dispatchEvent(new Event("sonique_playlist_tracks_changed"));
    }

    if (profile && !String(playlistId).startsWith("local_")) {
      try {
        await supabase
          .from("playlist_tracks")
          .delete()
          .eq("playlist_id", playlistId)
          .eq("track_id", trackId);
      } catch (e) {
        console.error("Supabase remove track error:", e);
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (isCurated) return;
    if (confirm("Are you sure you want to delete this playlist?")) {
      await deletePlaylist(playlistId);
      router.push("/library?tab=playlists");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: `${accentColor} transparent transparent transparent`,
          }}
        />
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 border-b border-white/5 pb-6">
        {/* Cover */}
        <div className="w-40 h-40 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center shadow-xl">
          {playlist.coverUrl ? (
            <img
              src={playlist.coverUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Disc className="w-16 h-16 text-zinc-700 animate-spin-slow" />
          )}
        </div>

        {/* Text Metadata */}
        <div className="text-center sm:text-left flex-1 space-y-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            {isCurated ? "Curated Playlist" : "Custom Playlist"}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {playlist.name}
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            {playlist.description || "Curated music compilation."}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-500 mt-2 font-medium">
            {!isCurated && playlist.created_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Created {new Date(playlist.created_at).toLocaleDateString()}
                </span>
              </span>
            )}
            <span>{tracks.length} Songs</span>
          </div>
        </div>

        {/* Playlist Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {tracks.length > 0 && (
            <button
              onClick={handlePlayPlaylist}
              className="flex items-center gap-2 font-bold py-2.5 px-6 rounded-full text-zinc-950 transition hover:scale-105 active:scale-95 shadow-md"
              style={{ backgroundColor: accentColor }}
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>Play</span>
            </button>
          )}

          {!isCurated && profile && (
            <button
              onClick={handleDeletePlaylist}
              className="p-2.5 border border-white/10 rounded-full hover:bg-red-950/20 text-zinc-400 hover:text-red-400 transition"
              title="Delete Playlist"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          {tracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              playlistId={isCurated ? undefined : playlistId}
              onRemoveFromPlaylist={isCurated ? undefined : handleRemoveTrack}
            />
          ))}

          {tracks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center gap-2">
              <Music className="w-12 h-12 stroke-1 opacity-40 text-zinc-600" />
              <h4 className="text-zinc-300 font-semibold">Playlist is Empty</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
