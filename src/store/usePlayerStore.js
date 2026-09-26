import { create } from "zustand";
import { fetchLyrics } from "../lib/lrclib";
import {
  trackPlay,
  trackSkip,
  trackGenericAction,
} from "../lib/recommendations";
import { API_BASE } from "../lib/config";
import { createYouTubeAudioElement } from "../lib/youtubePlayer";

export const usePlayerStore = create((set, get) => {
  // Safe instantiation of Audio inside browser only
  let globalAudio = null;

  return {
    queue: [],
    shuffledQueue: [],
    currentIndex: -1,
    isPlaying: false,
    isShuffle: false,
    repeatMode: "all",
    volume: 0.8,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    showFullscreenPlayer: false,
    showQueueList: false,
    lyrics: [],
    isLyricsLoading: false,
    currentLyricIndex: -1,
    lyricsSynced: false,
    lyricsProvider: null,
    lyricsMatchScore: 0,
    isInstrumental: false,
    lyricsOffset: 0.0,
    lyricsTrackId: null,
    setLyricsOffset: (offset) => set({ lyricsOffset: offset }),
    adjustLyricsOffset: (delta) =>
      set((state) => ({
        lyricsOffset: Math.round((state.lyricsOffset + delta) * 10) / 10,
      })),
    audio: null,
    isVideoMode: false,
    setVideoMode: (enabled) => set({ isVideoMode: enabled }),

    initAudio: () => {
      if (typeof window === "undefined" || get().audio) return;

      globalAudio = createYouTubeAudioElement();
      globalAudio.volume = get().volume;

      // Event Listeners
      globalAudio.addEventListener("play", () => {
        set({ isPlaying: true });
      });

      globalAudio.addEventListener("pause", () => {
        set({ isPlaying: false });
      });

      globalAudio.addEventListener("timeupdate", () => {
        if (!globalAudio) return;
        const curTime = globalAudio.currentTime;
        set({ currentTime: curTime });

        // Update active lyric line index efficiently with lyricsOffset lead/lag tuning
        const lyrics = get().lyrics;
        if (lyrics.length > 0 && get().lyricsSynced) {
          const effectiveTime = curTime + (get().lyricsOffset || 0);
          let activeIndex = -1;
          for (let i = 0; i < lyrics.length; i++) {
            const start = lyrics[i].start !== undefined ? lyrics[i].start : lyrics[i].time;
            const nextStart =
              i < lyrics.length - 1
                ? lyrics[i + 1].start !== undefined
                  ? lyrics[i + 1].start
                  : lyrics[i + 1].time
                : start + 6.0;

            if (effectiveTime >= start && (i === lyrics.length - 1 || effectiveTime < nextStart)) {
              activeIndex = i;
              break;
            }
          }
          if (activeIndex !== get().currentLyricIndex) {
            set({ currentLyricIndex: activeIndex });
          }
        }
      });

      globalAudio.addEventListener("durationchange", () => {
        if (globalAudio) {
          set({ duration: globalAudio.duration || 0 });
        }
      });

      globalAudio.addEventListener("ended", () => {
        const { repeatMode, queue, shuffledQueue, isShuffle, currentIndex } =
          get();
        const activeQueue = isShuffle ? shuffledQueue : queue;
        const currentTrack = activeQueue[currentIndex];
        if (currentTrack) {
          trackGenericAction("song_complete", {
            track_id: currentTrack.id,
            title: currentTrack.title,
          });
        }

        if (repeatMode === "one") {
          if (currentTrack) {
            trackGenericAction("song_replay", {
              track_id: currentTrack.id,
              title: currentTrack.title,
            });
          }
          if (globalAudio) {
            globalAudio.currentTime = 0;
            globalAudio.play().catch(console.error);
          }
        } else {
          get().next();
        }
      });

      set({ audio: globalAudio });
    },

    playTrack: (track, fromQueue, isVideo) => {
      const videoId = track.videoId || track.id;
      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        console.error("Cannot play track without a valid YouTube video ID", track);
        return;
      }

      get().initAudio();
      const currentAudio = get().audio;
      if (!currentAudio) return;

      // Check if we are toggling mode for the same track. IMPORTANT: compare
      // against the ACTIVE queue (shuffledQueue when shuffle is on) — comparing
      // against `queue` while shuffle is enabled reads an arbitrary track and
      // could leak the currently playing song's position into a different song.
      const activePlaylist = get().isShuffle
        ? get().shuffledQueue
        : get().queue;
      const activeTrack = activePlaylist[get().currentIndex];
      const isSameTrack =
        activeTrack !== undefined && activeTrack.id === track.id;
      // Only an explicit audio/video mode toggle of the SAME track may resume
      // its position. Every other play (fresh click, re-click of the current
      // song, next/prev, shuffle) must start from 0:00 — otherwise stale
      // positions make songs skip their beginning.
      const isModeToggle = isVideo !== undefined && isSameTrack;
      const preservedTime = isModeToggle ? get().currentTime : 0;

      // Default to poster view (isVideoMode: false) until resolve-video confirms a playable video
      const shouldPlayVideo = isVideo !== undefined ? isVideo : (track.hasVideo === true);
      set({ isVideoMode: shouldPlayVideo });

      const isSingleTrackPlay = !fromQueue || fromQueue.length <= 1;
      let newQueue = isSameTrack
        ? get().queue
        : isSingleTrackPlay
          ? [track]
          : fromQueue || get().queue;
      let trackIndex = isSameTrack
        ? get().currentIndex
        : newQueue.findIndex((t) => t.id === track.id);

      if (trackIndex === -1 && !isSameTrack) {
        newQueue = [...newQueue, track];
        trackIndex = newQueue.length - 1;
      }

      set({
        queue: newQueue,
        currentIndex: trackIndex,
        currentTime: preservedTime,
        lyrics: isSameTrack ? get().lyrics : [],
        currentLyricIndex: isSameTrack ? get().currentLyricIndex : -1,
      });

      // Update shuffle queue if enabled
      if (get().isShuffle) {
        const remaining = newQueue.filter((_, idx) => idx !== trackIndex);
        const shuffled = [track, ...remaining.sort(() => Math.random() - 0.5)];
        set({ shuffledQueue: shuffled, currentIndex: 0 });
      }

      const playerUrl = `https://www.youtube.com/watch?v=${videoId}`;
      currentAudio.src = playerUrl;
      currentAudio.load();
      // Always pin the start position explicitly: 0 for every fresh/re-play,
      // or the preserved position only for an explicit audio/video mode
      // toggle. The wrapper's internal _currentTime keeps syncing from the
      // live player while a song plays, so without this reset a re-clicked
      // (or mis-matched) track would resume mid-song via loadVideoById's
      // startSeconds.
      currentAudio.currentTime = preservedTime;
      currentAudio
        .play()
        .then(() => {
          set({ isPlaying: true });
          if (!isSameTrack) {
            get().fetchLyricsForCurrent();
          }
          // Log play action to personalized engine
          trackPlay(track);
          // Save to browser listening history (Local Cache) & Add to Supabase History asynchronously
          if (typeof window !== "undefined") {
            const hist = JSON.parse(
              localStorage.getItem("sonique_history") || "[]",
            );
            const updated = [
              track,
              ...hist.filter((h) => h.id !== track.id),
            ].slice(0, 50);
            localStorage.setItem("sonique_history", JSON.stringify(updated));
            // Dispatch custom event to update UI instantly
            window.dispatchEvent(new Event("sonique_history_changed"));
          }
        })
        .catch((err) => {
          console.error(
            "Audio playback failed, trying fallback stream...",
            err,
          );
        });

      // Fetch official YT Music album art and swap poster
      fetch(`${API_BASE}/meta/${track.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((meta) => {
          if (meta && meta.albumArt) {
            get().updateTrackCover(track.id, meta.albumArt);
          }
        })
        .catch(() => {});

      // Auto-resolve official video for the song (Tier 1: YT Music Official Video, Tier 2: YouTube Official Video fallback)
      const resolveParams = new URLSearchParams({
        title: track.title || "",
        artist: track.artist || "",
      });
      fetch(
        `${API_BASE}/resolve-video/${track.id}?${resolveParams.toString()}`,
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          const st = get();
          if (st.currentIndex < 0) return;
          const cur = st.isShuffle
            ? st.shuffledQueue[st.currentIndex]
            : st.queue[st.currentIndex];
          if (!cur || cur.id !== track.id) return; // user already switched tracks

          if (data.hasVideo === true && data.resolvedVideoId) {
            const resolvedId = data.resolvedVideoId;
            const upgraded = {
              ...cur,
              hasVideo: true,
              isVideo: true,
              videoId: resolvedId,
            };
            const patchQueue = (arr) =>
              arr.map((t, i) => (i === st.currentIndex ? upgraded : t));
            if (st.isShuffle) {
              set({ shuffledQueue: patchQueue(st.shuffledQueue) });
            }
            set({ queue: patchQueue(st.queue), isVideoMode: true });

            // Re-target player to official video if a different video ID was resolved
            if (resolvedId !== videoId) {
              const audio = get().audio;
              if (audio) {
                // The resolved video must start from 0:00 for a normal play.
                // Resuming at get().currentTime here used the elapsed time of
                // the ORIGINAL video — which by now equals the resolver's
                // network latency — so upgraded songs began mid-way. Only an
                // explicit audio/video mode toggle keeps its position.
                const resumeAt = isModeToggle ? get().currentTime : 0;
                audio.pause();
                audio.src = `https://www.youtube.com/watch?v=${resolvedId}`;
                audio.load();
                audio.currentTime = resumeAt;
                audio
                  .play()
                  .then(() => set({ isPlaying: true }))
                  .catch(() => set({ isPlaying: false }));
              }
            }
          } else {
            // No curated video found: fallback to adaptive poster thumbnail mode
            const patched = {
              ...cur,
              hasVideo: false,
              isVideo: false,
            };
            const patchQueue = (arr) =>
              arr.map((t, i) => (i === st.currentIndex ? patched : t));
            if (st.isShuffle) {
              set({ shuffledQueue: patchQueue(st.shuffledQueue) });
            }
            set({ queue: patchQueue(st.queue), isVideoMode: false });
          }
        })
        .catch(() => {});

      // Automatically create a vibe list of at least 50 matching vibe tracks in the background
      const modeChanged = get().isVideoMode !== isVideo;
      if ((!isSameTrack || modeChanged) && isSingleTrackPlay) {
        fetch(
          `${API_BASE}/vibe/${track.id}?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`,
        )
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Vibe fetch failed");
          })
          .then((data) => {
            const vibeTracks = data.tracks || [];
            if (vibeTracks.length > 0) {
              const latestStore = get();
              const activeTrack = latestStore.isShuffle
                ? latestStore.shuffledQueue[latestStore.currentIndex]
                : latestStore.queue[latestStore.currentIndex];

              // Check if we are still playing the exact same track seed
              if (activeTrack && activeTrack.id === track.id) {
                const combinedQueue = [
                  track,
                  ...vibeTracks.filter((t) => t.id !== track.id),
                ];
                // Keep each track's own backend-stamped hasVideo flag so the
                // queue drawer & fullscreen card show video <iframe> only for
                // suggestions that actually have a video, and the poster <img>
                // for audio-only art tracks.

                if (latestStore.isShuffle) {
                  const shuffledVibe = [
                    ...vibeTracks.filter((t) => t.id !== track.id),
                  ].sort(() => Math.random() - 0.5);
                  set({
                    queue: combinedQueue,
                    shuffledQueue: [track, ...shuffledVibe],
                    currentIndex: 0,
                  });
                } else {
                  set({
                    queue: combinedQueue,
                    currentIndex: 0,
                  });
                }
              }
            }
          })
          .catch((err) => {
            console.error("Failed to load matching vibe queue tracks:", err);
          });
      }
    },

    playPlaylist: (tracks, startIndex = 0) => {
      if (tracks.length === 0) return;
      get().initAudio();
      set({ queue: tracks });
      get().playTrack(tracks[startIndex], tracks);
    },

    togglePlay: () => {
      get().initAudio();
      const currentAudio = get().audio;
      if (get().currentIndex === -1) return;
      if (!currentAudio) return;

      if (get().isPlaying) {
        currentAudio.pause();
      } else {
        currentAudio.play().catch(console.error);
      }
    },

    next: () => {
      const {
        queue,
        shuffledQueue,
        isShuffle,
        currentIndex,
        repeatMode,
        audio,
      } = get();
      const currentPlaylist = isShuffle ? shuffledQueue : queue;
      if (currentPlaylist.length === 0) return;

      // Skip tracking
      const activeTrack = currentPlaylist[currentIndex];
      if (activeTrack && audio && !audio.paused && audio.duration > 0) {
        const completionRate = audio.currentTime / audio.duration;
        if (completionRate < 0.9) {
          trackSkip(activeTrack.id, completionRate);
        }
      }

      let nextIndex = currentIndex + 1;

      if (nextIndex >= currentPlaylist.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          // Playback finished, stop
          set({ isPlaying: false });
          return;
        }
      }

      // Let each next track decide its own display mode from its flags
      // (poster <img> for audio-only, video iframe for hasVideo tracks).
      get().playTrack(currentPlaylist[nextIndex], currentPlaylist);
    },

    previous: () => {
      const {
        queue,
        shuffledQueue,
        isShuffle,
        currentIndex,
        currentTime,
        audio,
      } = get();
      const currentPlaylist = isShuffle ? shuffledQueue : queue;
      if (currentPlaylist.length === 0) return;

      // If playing for more than 3 seconds, restart the song (counts as song replay!)
      if (currentTime > 3 && audio) {
        const activeTrack = currentPlaylist[currentIndex];
        if (activeTrack) {
          trackGenericAction("song_replay", {
            track_id: activeTrack.id,
            title: activeTrack.title,
          });
        }
        audio.currentTime = 0;
        set({ currentTime: 0 });
        return;
      }

      // Skip tracking
      const activeTrack = currentPlaylist[currentIndex];
      if (activeTrack && audio && !audio.paused && audio.duration > 0) {
        const completionRate = audio.currentTime / audio.duration;
        if (completionRate < 0.9) {
          trackSkip(activeTrack.id, completionRate);
        }
      }

      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = currentPlaylist.length - 1;
      }

      // Let each previous track decide its own display mode from its flags.
      get().playTrack(currentPlaylist[prevIndex], currentPlaylist);
    },

    seek: (time) => {
      const currentAudio = get().audio;
      set({ currentTime: time });
      if (currentAudio) {
        currentAudio.currentTime = time;
      }
      // Update active lyric index
      const lyrics = get().lyrics;
      if (lyrics.length > 0) {
        let activeIndex = -1;
        for (let i = 0; i < lyrics.length; i++) {
          if (time >= lyrics[i].time) {
            activeIndex = i;
          } else {
            break;
          }
        }
        if (activeIndex !== get().currentLyricIndex) {
          set({ currentLyricIndex: activeIndex });
        }
      }
    },

    setVolume: (volume) => {
      const currentAudio = get().audio;
      if (currentAudio) {
        currentAudio.volume = volume;
      }
      set({ volume, isMuted: volume === 0 });
    },

    toggleMute: () => {
      const { isMuted, volume, audio } = get();
      const nextMute = !isMuted;
      if (audio) {
        audio.muted = nextMute;
      }
      set({ isMuted: nextMute });
    },

    toggleShuffle: () => {
      const { isShuffle, queue, currentIndex } = get();
      const nextShuffle = !isShuffle;

      if (nextShuffle && currentIndex !== -1) {
        const currentTrack = queue[currentIndex];
        const remaining = queue.filter((_, idx) => idx !== currentIndex);
        const shuffled = [
          currentTrack,
          ...remaining.sort(() => Math.random() - 0.5),
        ];
        set({
          isShuffle: nextShuffle,
          shuffledQueue: shuffled,
          currentIndex: 0,
        });
      } else {
        // Turning off shuffle, find track index in normal queue
        const currentTrack = get().shuffledQueue[currentIndex];
        const originalIndex = currentTrack
          ? queue.findIndex((t) => t.id === currentTrack.id)
          : -1;
        set({
          isShuffle: nextShuffle,
          currentIndex: originalIndex,
        });
      }
    },

    toggleRepeat: () => {
      const { repeatMode } = get();
      let nextMode = "all";
      if (repeatMode === "all") nextMode = "one";
      else if (repeatMode === "one") nextMode = "none";
      else nextMode = "all";

      set({ repeatMode: nextMode });
    },

    addToQueue: (track) => {
      const { queue, shuffledQueue, isShuffle } = get();
      if (queue.some((t) => t.id === track.id)) return;

      const nextQueue = [...queue, track];
      const nextShuffled = isShuffle
        ? [...shuffledQueue, track]
        : shuffledQueue;

      set({
        queue: nextQueue,
        shuffledQueue: nextShuffled,
      });
    },

    removeFromQueue: (trackId) => {
      const { queue, shuffledQueue, currentIndex, isShuffle } = get();
      const activeTrack = isShuffle
        ? shuffledQueue[currentIndex]
        : queue[currentIndex];

      const nextQueue = queue.filter((t) => t.id !== trackId);
      const nextShuffled = shuffledQueue.filter((t) => t.id !== trackId);

      // Re-evaluate current index
      let nextIndex = -1;
      const targetList = isShuffle ? nextShuffled : nextQueue;
      if (activeTrack) {
        nextIndex = targetList.findIndex((t) => t.id === activeTrack.id);
      }

      set({
        queue: nextQueue,
        shuffledQueue: nextShuffled,
        currentIndex: nextIndex,
      });
    },

    clearQueue: () => {
      const currentAudio = get().audio;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }
      set({
        queue: [],
        shuffledQueue: [],
        currentIndex: -1,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        lyrics: [],
        currentLyricIndex: -1,
        lyricsTrackId: null,
      });
    },

    setCurrentTime: (time) => {
      set({ currentTime: time });
      // Update active lyric index
      const lyrics = get().lyrics;
      if (lyrics.length > 0) {
        let activeIndex = -1;
        for (let i = 0; i < lyrics.length; i++) {
          if (time >= lyrics[i].time) {
            activeIndex = i;
          } else {
            break;
          }
        }
        if (activeIndex !== get().currentLyricIndex) {
          set({ currentLyricIndex: activeIndex });
        }
      }
    },
    setDuration: (duration) => set({ duration }),
    setShowFullscreenPlayer: (show) => set({ showFullscreenPlayer: show }),
    setShowQueueList: (show) => set({ showQueueList: show }),

    // Swap in the official YT Music album art once metadata arrives
    updateTrackCover: (trackId, albumArt) => {
      if (!trackId || !albumArt) return;
      const { queue, shuffledQueue } = get();
      const patch = (t) => (t.id === trackId ? { ...t, coverUrl: albumArt } : t);
      set({ queue: queue.map(patch), shuffledQueue: shuffledQueue.map(patch) });
    },

    fetchLyricsForCurrent: async () => {
      const { queue, shuffledQueue, isShuffle, currentIndex } = get();
      const currentPlaylist = isShuffle ? shuffledQueue : queue;
      const track = currentPlaylist[currentIndex];

      if (!track) return;
      const trackId = track.id || track.videoId;

      set({
        isLyricsLoading: true,
        lyrics: [],
        currentLyricIndex: -1,
        lyricsSynced: false,
        lyricsProvider: null,
        lyricsMatchScore: 0,
        isInstrumental: false,
        lyricsTrackId: trackId,
      });

      try {
        const queryParams = new URLSearchParams({
          title: track.title || "",
          artist: track.artist || "",
          album: track.album || "",
          duration: track.duration || 0,
          videoId: trackId || "",
        });

        const res = await fetch(`${API_BASE}/lyrics?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          // Check if user switched to another song during fetch
          const activeTrack = (get().isShuffle ? get().shuffledQueue : get().queue)[get().currentIndex];
          if ((activeTrack?.id || activeTrack?.videoId) !== trackId) return;

          if (data.success && Array.isArray(data.lines) && data.lines.length > 0) {
            const mappedLines = data.lines.map((l) => ({
              start: l.start,
              end: l.end,
              time: l.start,
              text: l.text,
            }));
            set({
              lyrics: mappedLines,
              lyricsSynced: data.synced || false,
              lyricsProvider: data.provider || null,
              lyricsMatchScore: data.matchScore || 0,
              isInstrumental: data.isInstrumental || false,
              lyricsOffset: 0.0,
              isLyricsLoading: false,
              lyricsTrackId: trackId,
            });
            return;
          }
        }

        set({
          lyrics: [],
          lyricsSynced: false,
          lyricsProvider: null,
          lyricsMatchScore: 0,
          isInstrumental: false,
          isLyricsLoading: false,
          lyricsTrackId: trackId,
        });
      } catch (err) {
        console.error("Failed to fetch lyrics:", err);
        set({
          lyrics: [],
          lyricsSynced: false,
          lyricsProvider: null,
          lyricsMatchScore: 0,
          isInstrumental: false,
          isLyricsLoading: false,
          lyricsTrackId: trackId,
        });
      }
    },
  };
});
