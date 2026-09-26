import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { trackLike, trackGenericAction } from "../lib/recommendations";
import { API_BASE } from "../lib/config";

export const useUIStore = create((set, get) => ({
  profile: null,
  likedTracks: [],
  playlists: [],
  ytLikedTracks: [],
  ytPlaylists: [],
  ytHistory: [],
  ytSubscriptions: [],
  isYTSynced: false,
  accentColor: "#8B5CF6", // Violet-500 default
  isAccentDark: true,
  isLoadingData: false,
  showCreatePlaylistModal: false,
  offlineMode: false,
  activeVideoId: null,

  setProfile: (profile) => set({ profile }),

  loadLocalLikes: () => {
    if (typeof window === "undefined") return;
    try {
      const likes = JSON.parse(localStorage.getItem("sonique_likes") || "[]");
      set({ likedTracks: Array.isArray(likes) ? likes : [] });
    } catch (error) {
      console.error("Error loading local likes:", error);
      set({ likedTracks: [] });
    }
  },

  loadLocalPlaylists: () => {
    if (typeof window === "undefined") return;
    try {
      const localPlaylists = JSON.parse(
        localStorage.getItem("sonique_playlists") || "[]"
      );
      set({ playlists: Array.isArray(localPlaylists) ? localPlaylists : [] });
    } catch (error) {
      console.error("Error loading local playlists:", error);
      set({ playlists: [] });
    }
  },

  loadUserData: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      get().loadLocalLikes();
      get().loadLocalPlaylists();
      set({ profile: null });
      return;
    }

    set({ isLoadingData: true });

    try {
      // Get profile
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // Self-healing: If user exists in Auth but has no row in public.profiles table
      if (!profile) {
        console.log(
          "Profile row not found for logged in user. Creating on the fly...",
        );
        const newProfile = {
          id: user.id,
          email: user.email,
          display_name:
            user.user_metadata?.full_name || user.email.split("@")[0],
          avatar_url: user.user_metadata?.avatar_url || null,
        };
        const { data: insertedProfile, error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (!insertError && insertedProfile) {
          profile = insertedProfile;
        } else {
          console.error("Failed to auto-create profile row:", insertError);
        }
      }

      // Get likes
      const { data: likes } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Get playlists
      const { data: playlists } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Get preferences
      let { data: prefs } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Self-healing: If preferences row doesn't exist
      if (!prefs && profile) {
        console.log("Preferences row not found. Creating on the fly...");
        const newPrefs = {
          user_id: user.id,
          accent_color: "#8B5CF6",
        };
        const { data: insertedPrefs, error: prefsError } = await supabase
          .from("preferences")
          .insert(newPrefs)
          .select()
          .single();

        if (!prefsError && insertedPrefs) {
          prefs = insertedPrefs;
        }
      }

      set({
        profile: profile || {
          id: user.id,
          email: user.email,
          display_name:
            user.user_metadata?.full_name || user.email.split("@")[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
        },
        likedTracks: likes || [],
        playlists: playlists || [],
        accentColor: prefs?.accent_color || "#8B5CF6",
        isLoadingData: false,
      });
    } catch (err) {
      console.error("Error loading user data:", err);
      set({ isLoadingData: false });
    }
  },

  toggleLike: async (track) => {
    const { profile, likedTracks } = get();
    if (!profile) {
      // Fallback to local storage likes if not logged in
      if (typeof window !== "undefined") {
        const localLikes = JSON.parse(
          localStorage.getItem("sonique_likes") || "[]",
        );
        const exists = localLikes.some((t) => t.id === track.id);
        let updated;
        if (exists) {
          updated = localLikes.filter((t) => t.id !== track.id);
          // Log dislike/unlike
          trackLike(track, -1);
        } else {
          updated = [
            {
              ...track,
              track_id: track.id,
              created_at: new Date().toISOString(),
            },
            ...localLikes,
          ];
          // Log like
          trackLike(track, 1);
        }
        localStorage.setItem("sonique_likes", JSON.stringify(updated));
        // Mock Like items structure
        set({ likedTracks: updated });
        window.dispatchEvent(new Event("sonique_likes_changed"));
      }
      return;
    }

    const exists = likedTracks.some((t) => t.track_id === track.id);

    try {
      if (exists) {
        await supabase
          .from("likes")
          .delete()
          .eq("user_id", profile.id)
          .eq("track_id", track.id);

        set({
          likedTracks: likedTracks.filter((t) => t.track_id !== track.id),
        });
        // Log dislike/unlike
        trackLike(track, -1);
      } else {
        const newLike = {
          user_id: profile.id,
          track_id: track.id,
          title: track.title,
          artist: track.artist,
          cover_url: track.coverUrl || "",
          duration: track.duration || 0,
        };

        const { data, error } = await supabase
          .from("likes")
          .insert(newLike)
          .select()
          .single();

        if (data) {
          set({ likedTracks: [data, ...likedTracks] });
          // Log like
          trackLike(track, 1);
        }
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  },

  isLiked: (trackId) => {
    return get().likedTracks.some(
      (t) => t.track_id === trackId || t.id === trackId,
    );
  },

  createPlaylist: async (name, description = "") => {
    const { profile, playlists } = get();
    const newPlaylistObj = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      description: description.trim(),
      created_at: new Date().toISOString(),
    };

    if (profile) {
      try {
        const { data, error } = await supabase
          .from("playlists")
          .insert({
            user_id: profile.id,
            name: name.trim(),
            description: description.trim(),
          })
          .select()
          .single();

        if (!error && data) {
          const updated = [data, ...playlists];
          set({ playlists: updated });
          if (typeof window !== "undefined") {
            localStorage.setItem("sonique_playlists", JSON.stringify(updated));
          }
          trackGenericAction("playlist_create", {
            playlist_id: data.id,
            name: data.name,
          });
          return data;
        }
      } catch (err) {
        console.error("Supabase playlist creation error:", err);
      }
    }

    // Local Storage / Guest / Offline fallback
    const updated = [newPlaylistObj, ...playlists];
    set({ playlists: updated });
    if (typeof window !== "undefined") {
      localStorage.setItem("sonique_playlists", JSON.stringify(updated));
      window.dispatchEvent(new Event("sonique_playlists_changed"));
    }
    trackGenericAction("playlist_create", {
      playlist_id: newPlaylistObj.id,
      name: newPlaylistObj.name,
    });
    return newPlaylistObj;
  },

  addTrackToPlaylist: async (playlist, track) => {
    const { profile } = get();
    const trackId = track.id || track.videoId;
    const trackObj = {
      id: trackId,
      track_id: trackId,
      videoId: trackId,
      title: track.title || "Unknown Track",
      artist: track.artist || "Unknown Artist",
      cover_url: track.coverUrl || track.thumbnail || "",
      coverUrl: track.coverUrl || track.thumbnail || "",
      duration: track.duration || 180,
      source_url: track.sourceUrl || track.source_url || "",
      created_at: new Date().toISOString(),
    };

    let addedLocally = false;

    // Always store in localStorage key for playlist
    if (typeof window !== "undefined") {
      const storageKey = `sonique_playlist_tracks_${playlist.id}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!existing.some((t) => (t.id || t.track_id) === trackId)) {
        const updated = [trackObj, ...existing];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        addedLocally = true;
      } else {
        addedLocally = true; // Track already in playlist
      }
      window.dispatchEvent(new Event("sonique_playlist_tracks_changed"));
    }

    if (profile && !String(playlist.id).startsWith("local_")) {
      try {
        await supabase.from("playlist_tracks").insert({
          playlist_id: playlist.id,
          track_id: trackObj.id,
          title: trackObj.title,
          artist: trackObj.artist,
          cover_url: trackObj.cover_url,
          duration: trackObj.duration,
          source_url: trackObj.source_url,
        });
      } catch (err) {
        console.error("Supabase addTrackToPlaylist error:", err);
      }
    }

    trackPlaylistAdd(playlist.name, track);
    return addedLocally;
  },

  deletePlaylist: async (playlistId) => {
    const { profile, playlists } = get();
    const updated = playlists.filter((p) => String(p.id) !== String(playlistId));
    set({ playlists: updated });

    if (typeof window !== "undefined") {
      localStorage.setItem("sonique_playlists", JSON.stringify(updated));
      localStorage.removeItem(`sonique_playlist_tracks_${playlistId}`);
      window.dispatchEvent(new Event("sonique_playlists_changed"));
    }

    if (profile && !String(playlistId).startsWith("local_")) {
      try {
        await supabase
          .from("playlists")
          .delete()
          .eq("id", playlistId)
          .eq("user_id", profile.id);
      } catch (err) {
        console.error("Error deleting playlist from Supabase:", err);
      }
    }
  },

  setAccentColor: (color) => {
    // Determine if color is dark or light to adjust UI contrast (simple helper)
    // Accept hex color and set
    set({ accentColor: color });
    // Save to preferences if logged in
    const { profile } = get();
    if (profile) {
      supabase
        .from("preferences")
        .update({ accent_color: color })
        .eq("user_id", profile.id)
        .then(({ error }) => {
          if (error) console.error(error);
        });
    }
  },

  setShowCreatePlaylistModal: (show) => set({ showCreatePlaylistModal: show }),
  setOfflineMode: (offline) => set({ offlineMode: offline }),
  playVideo: (videoId) => set({ activeVideoId: videoId }),
  closeVideo: () => set({ activeVideoId: null }),

  checkYTStatus: async () => {
    const { profile } = get();
    const userId = profile?.id || "default";
    try {
      const res = await fetch(`${API_BASE}/ytmusic/status?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.status === "success" && data.connected) {
        set({ isYTSynced: true });
        await get().loadYTLibraryData();
        return true;
      }

      // Self-healing: If backend session restarted, restore from localStorage saved auth
      if (typeof window !== "undefined") {
        const savedAuth =
          localStorage.getItem(`sonique_yt_auth_${userId}`) ||
          localStorage.getItem("sonique_yt_auth_default") ||
          localStorage.getItem("sonique_yt_auth_guest") ||
          localStorage.getItem("sonique_yt_auth");

        if (savedAuth) {
          const syncRes = await fetch(`${API_BASE}/ytmusic/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, headers: savedAuth }),
          });
          const syncData = await syncRes.json();
          if (syncRes.ok && syncData.connected) {
            set({ isYTSynced: true });
            await get().loadYTLibraryData();
            localStorage.removeItem("sonique_home_shelves");
            window.dispatchEvent(new CustomEvent("sonique_recs_refresh"));
            return true;
          } else {
            localStorage.removeItem(`sonique_yt_auth_${userId}`);
            localStorage.removeItem("sonique_yt_auth_default");
            localStorage.removeItem("sonique_yt_auth_guest");
            localStorage.removeItem("sonique_yt_auth");
            set({ isYTSynced: false });
          }
        }
      }
    } catch (e) {
      console.error("checkYTStatus error:", e);
    }
    return false;
  },

  loadYTLibraryData: async () => {
    const { profile } = get();
    const userId = profile?.id || "default";
    try {
      const [resLiked, resPlaylists, resHistory, resSubs] = await Promise.all([
        fetch(`${API_BASE}/ytmusic/liked-songs?userId=${encodeURIComponent(userId)}`),
        fetch(`${API_BASE}/ytmusic/library-playlists?userId=${encodeURIComponent(userId)}`),
        fetch(`${API_BASE}/ytmusic/history?userId=${encodeURIComponent(userId)}`),
        fetch(`${API_BASE}/ytmusic/subscriptions?userId=${encodeURIComponent(userId)}`),
      ]);

      const [dataLiked, dataPlaylists, dataHistory, dataSubs] = await Promise.all([
        resLiked.ok ? resLiked.json() : { tracks: [] },
        resPlaylists.ok ? resPlaylists.json() : { playlists: [] },
        resHistory.ok ? resHistory.json() : { tracks: [] },
        resSubs.ok ? resSubs.json() : { artists: [] },
      ]);

      const hasInvalidAuth = dataLiked.connected === false || dataHistory.connected === false;

      set({
        isYTSynced: !hasInvalidAuth,
        ytLikedTracks: dataLiked.tracks || [],
        ytPlaylists: dataPlaylists.playlists || [],
        ytHistory: dataHistory.tracks || [],
        ytSubscriptions: dataSubs.artists || [],
      });
    } catch (e) {
      console.error("loadYTLibraryData error:", e);
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({
      profile: null,
      likedTracks: [],
      playlists: [],
      ytLikedTracks: [],
      ytPlaylists: [],
      ytHistory: [],
      ytSubscriptions: [],
      isYTSynced: false,
    });
  },
}));
