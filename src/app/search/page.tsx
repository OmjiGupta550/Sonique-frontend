'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchSaavnSongs, SaavnTrack } from '../../lib/saavn';
import { TrackRow } from '../../components/track/TrackRow';
import { PlayerTrack } from '../../store/usePlayerStore';
import { useUIStore } from '../../store/useUIStore';
import { Search } from 'lucide-react';
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

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const tracksRes = await searchSaavnSongs(query);
      setTracks(tracksRes);
      trackGenericAction('search_query', { query });
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
      
      {/* Search Input Header - visible on all screen sizes */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl mx-auto mb-8">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="w-full bg-zinc-900/60 border border-white/5 focus:border-zinc-700/60 rounded-full py-3.5 pl-12 pr-6 text-sm text-white focus:outline-none focus:bg-zinc-900 transition duration-200 shadow-lg"
          autoFocus
        />
        <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
      </form>

      {!queryParam.trim() ? (
        // Search suggestions or guides
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4">
          <Search className="w-16 h-16 opacity-30 stroke-1" />
          <div className="text-center">
            <h3 className="text-md font-semibold text-zinc-300">Search Sonique</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
              Explore Bollywood, Hollywood, and global tracks from YouTube Music.
            </p>
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
                      <TrackRow key={t.id} track={convertToPlayerTrack(t)} index={idx} />
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
                      <TrackRow key={t.id} track={convertToPlayerTrack(t)} index={idx} />
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
