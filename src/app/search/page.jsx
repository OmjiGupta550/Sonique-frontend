"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchSaavnSongs } from "../../lib/saavn";
import { TrackRow } from "../../components/track/TrackRow";
import { useUIStore } from "../../store/useUIStore";
import { Search, Mic } from "lucide-react";
import { trackGenericAction } from "../../lib/recommendations";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q") || "";

  const [inputVal, setInputVal] = useState(queryParam);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { accentColor } = useUIStore();

  const [recentSearches, setRecentSearches] = useState([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(
        localStorage.getItem("sonique_recent_searches") || "[]",
      );
      setRecentSearches(stored);
    }
  }, []);

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [
      cleanTerm,
      ...recentSearches.filter((s) => s !== cleanTerm),
    ].slice(0, 10);
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("sonique_recent_searches", JSON.stringify(updated));
    }
  };

  const removeRecentSearch = (term) => {
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("sonique_recent_searches", JSON.stringify(updated));
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sonique_recent_searches");
    }
  };

  const handleRecentTap = (term) => {
    setInputVal(term);
    router.replace(`/search?q=${encodeURIComponent(term)}`);
  };

  const startVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputVal(transcript);
      router.replace(`/search?q=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const performSearch = async (query) => {
    setLoading(true);
    try {
      // Fetch audio songs AND video results in parallel so the Video tab
      // actually has content (filter=songs alone almost never returns videos).
      const [audioRes, videoRes] = await Promise.all([
        searchSaavnSongs(query, 50),
        searchSaavnSongs(query, 50, "videos"),
      ]);
      const merged = [
        ...audioRes,
        ...videoRes.map((v) => ({ ...v, hasVideo: true, itemType: "video" })),
      ];
      // Deduplicate by id in case the same video shows up in both lists
      const seen = new Set();
      const tracksRes = merged.filter((t) => {
        if (!t.id || seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });
      setTracks(tracksRes);
      trackGenericAction("search_query", { query });
      saveRecentSearch(query);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sync input value & run search when URL queryParam updates
  useEffect(() => {
    setInputVal(queryParam);
    if (queryParam.trim()) {
      performSearch(queryParam);
    } else {
      setTracks([]);
    }
  }, [queryParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = inputVal.trim();
    if (!query) {
      setTracks([]);
      router.replace("/search");
      return;
    }
    router.replace(`/search?q=${encodeURIComponent(query)}`);
  };

  const convertToPlayerTrack = (t) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    coverUrl: t.coverUrl,
    duration: t.duration,
    sourceUrl: t.sourceUrl,
    itemType: t.itemType,
    hasVideo: t.hasVideo,
    isVideo: t.isVideo,
  });

  const audioTracks = tracks.filter((t) => !t.hasVideo);
  const videoTracks = tracks.filter((t) => t.hasVideo);

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* Sticky Tabs Bar */}
      {queryParam.trim() && (
        <div className="sticky -top-6 md:-top-8 z-30 bg-zinc-950/80 backdrop-blur-md pt-4 pb-3 -mx-6 md:-mx-8 px-6 md:px-8 mb-4 border-b border-white/5">
          <div className="flex gap-2 text-sm font-semibold max-w-2xl mx-auto">
            {["all", "audio", "video"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg border capitalize transition
                  ${
                    activeTab === tab
                      ? "text-zinc-950 border-white font-bold"
                      : "text-zinc-400 border-transparent hover:text-white"
                  }`}
                style={{
                  backgroundColor:
                    activeTab === tab ? accentColor : "transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {!queryParam.trim() ? (
        <div className="space-y-8 max-w-2xl mx-auto px-1">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Recent Searches
                </h3>
                <button
                  onClick={clearAllRecent}
                  className="text-xs font-semibold text-zinc-500 hover:text-white transition"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800/60 border border-white/5 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-300 cursor-pointer transition"
                    onClick={() => handleRecentTap(term)}
                  >
                    <span>{term}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className="text-zinc-500 hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        <>

          {loading ? (
            <div className="flex justify-center py-20">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: `${accentColor} transparent transparent transparent`,
                }}
              />
            </div>
          ) : (
            <div className="space-y-8">
              {/* AUDIO RESULTS */}
              {(activeTab === "all" || activeTab === "audio") &&
                audioTracks.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                      Audio Tracks
                    </h3>
                    <div className="flex flex-col gap-2">
                      {audioTracks.map((t, idx) => (
                        <TrackRow
                          key={t.id}
                          track={convertToPlayerTrack(t)}
                          index={idx}
                        />
                      ))}
                    </div>
                  </section>
                )}

              {/* VIDEO RESULTS */}
              {(activeTab === "all" || activeTab === "video") &&
                videoTracks.length > 0 && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                      Video Tracks
                    </h3>
                    <div className="flex flex-col gap-2">
                      {videoTracks.map((t, idx) => (
                        <TrackRow
                          key={t.id}
                          track={convertToPlayerTrack(t)}
                          index={idx}
                        />
                      ))}
                    </div>
                  </section>
                )}

              {/* NO RESULTS FOR TAB */}
              {((activeTab === "audio" && audioTracks.length === 0) ||
                (activeTab === "video" && videoTracks.length === 0) ||
                (activeTab === "all" &&
                  audioTracks.length === 0 &&
                  videoTracks.length === 0)) && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <p className="text-sm italic">
                    No matching results found for &quot;{queryParam}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium">Loading Search...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
