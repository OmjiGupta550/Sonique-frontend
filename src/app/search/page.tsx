'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchSaavnSongs, SaavnTrack } from '../../lib/saavn';
import { TrackRow } from '../../components/track/TrackRow';
import { PlayerTrack } from '../../store/usePlayerStore';
import { useUIStore } from '../../store/useUIStore';
import { Search, Mic } from 'lucide-react';
import { trackGenericAction } from '../../lib/recommendations';

type TabType = 'all' | 'audio' | 'video';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(queryParam);
  const [tracks, setTracks] = useState<SaavnTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { accentColor } = useUIStore();

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('sonique_recent_searches') || '[]');
      setRecentSearches(stored);
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter((s) => s !== cleanTerm)].slice(0, 10);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sonique_recent_searches', JSON.stringify(updated));
    }
  };

  const removeRecentSearch = (term: string) => {
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sonique_recent_searches', JSON.stringify(updated));
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sonique_recent_searches');
    }
  };

  const handleRecentTap = (term: string) => {
    setInputVal(term);
    router.replace(`/search?q=${encodeURIComponent(term)}`);
  };

  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputVal(transcript);
      router.replace(`/search?q=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const tracksRes = await searchSaavnSongs(query);
      setTracks(tracksRes);
      trackGenericAction('search_query', { query });
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputVal.trim();
    if (!query) {
      setTracks([]);
      router.replace('/search');
      return;
    }
    router.replace(`/search?q=${encodeURIComponent(query)}`);
  };

  const convertToPlayerTrack = (t: SaavnTrack): PlayerTrack => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    coverUrl: t.coverUrl,
    duration: t.duration,
    sourceUrl: t.sourceUrl,
    hasVideo: t.hasVideo
  });

  const audioTracks = tracks.filter((t) => !t.hasVideo);
  const videoTracks = tracks.filter((t) => t.hasVideo);

  return (
    <div className="space-y-6 pb-8 select-none">
      
      {/* Sticky Search Input Header */}
      <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md pt-2 pb-2 -mt-4 mb-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl mx-auto">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={isListening ? "Listening..." : "Search songs, artists, albums..."}
            className={`w-full bg-zinc-900/60 border border-white/5 focus:border-zinc-700/60 rounded-full py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none focus:bg-zinc-900 transition duration-200 shadow-lg ${isListening ? 'placeholder-red-400 border-red-500/30' : ''}`}
            autoFocus
          />
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`absolute right-4 top-3 p-1 rounded-full transition duration-200 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-zinc-400 hover:text-white'}`}
            title="Voice Search"
          >
            <Mic className="w-5 h-5" />
          </button>
        </form>
      </div>

      {!queryParam.trim() ? (
        <div className="space-y-8 max-w-2xl mx-auto px-1">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Recent Searches</h3>
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
                      onClick={(e) => { e.stopPropagation(); removeRecentSearch(term); }}
                      className="text-zinc-500 hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-3 hidden md:block">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Trending Searches</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Aashiqui 2 Hits', tag: 'Aashiqui 2' },
                { name: 'Lofi Chill Vibes', tag: 'Lofi Chill' },
                { name: 'Rockstar OST', tag: 'Rockstar' },
                { name: 'Trending Mashups', tag: 'Mashup 2026' },
                { name: 'Brahmastra Album', tag: 'Brahmastra' },
                { name: 'Arijit Singh Radio', tag: 'Arijit Singh' }
              ].map((item, i) => (
                <div 
                  key={i}
                  onClick={() => handleRecentTap(item.tag)}
                  className="bg-gradient-to-br from-zinc-900/60 to-zinc-950/40 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-white/10 transition cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">{item.name}</span>
                  <span className="text-[10px] text-zinc-500 font-bold group-hover:translate-x-0.5 transition">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      ) : (
        <>
          {/* Result Tabs */}
          <div className="flex gap-2 border-b border-white/5 pb-2 text-sm font-semibold">
            {(['all', 'audio', 'video'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg border capitalize transition
                  ${activeTab === tab 
                    ? 'text-zinc-950 border-white' 
                    : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                style={{ backgroundColor: activeTab === tab ? accentColor : 'transparent' }}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div 
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${accentColor} transparent transparent transparent` }}
              />
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* AUDIO RESULTS */}
              {(activeTab === 'all' || activeTab === 'audio') && audioTracks.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Audio Tracks</h3>
                  <div className="flex flex-col gap-2">
                    {audioTracks.map((t, idx) => (
                      <TrackRow key={`${t.id}-${idx}`} track={convertToPlayerTrack(t)} index={idx} />
                    ))}
                  </div>
                </section>
              )}

              {/* VIDEO RESULTS */}
              {(activeTab === 'all' || activeTab === 'video') && videoTracks.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Video Tracks</h3>
                  <div className="flex flex-col gap-2">
                    {videoTracks.map((t, idx) => (
                      <TrackRow key={`${t.id}-${idx}`} track={convertToPlayerTrack(t)} index={idx} />
                    ))}
                  </div>
                </section>
              )}

              {/* NO RESULTS FOR TAB */}
              {((activeTab === 'audio' && audioTracks.length === 0) ||
                (activeTab === 'video' && videoTracks.length === 0) ||
                (activeTab === 'all' && audioTracks.length === 0 && videoTracks.length === 0)) && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                  <p className="text-sm italic">No matching results found for "{queryParam}"</p>
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium">Loading Search...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
