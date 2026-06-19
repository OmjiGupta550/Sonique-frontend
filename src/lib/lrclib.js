// LRCLIB API helper
// Fetches lyrics and parses LRC format for real-time synchronization.

export async function fetchLyrics(trackName, artistName, duration) {
  try {
    let url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(trackName)}`;
    if (duration) {
      url += `&duration=${Math.round(duration)}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
      // If direct match failed, try searching
      return await searchAndFetchLyrics(trackName, artistName);
    }
    const data = await res.json();
    return processLyricsResponse(data);
  } catch (error) {
    console.error("Error fetching lyrics from LRCLIB:", error);
    // Try searching as fallback
    return await searchAndFetchLyrics(trackName, artistName);
  }
}

async function searchAndFetchLyrics(trackName, artistName) {
  try {
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${trackName} ${artistName}`)}`;
    const res = await fetch(searchUrl);
    if (!res.ok) return null;
    const results = await res.json();
    if (results && results.length > 0) {
      // Pick the best match (first result)
      return processLyricsResponse(results[0]);
    }
  } catch (error) {
    console.error("Error searching lyrics on LRCLIB:", error);
  }
  return null;
}

function processLyricsResponse(data) {
  const syncedLyrics = data.syncedLyrics || "";
  const plainLyrics = data.plainLyrics || "";
  const isInstrumental = data.instrumental || false;

  let parsedLines = [];

  if (isInstrumental) {
    parsedLines = [{ time: 0, text: "🎵 Instrumental 🎵" }];
  } else if (syncedLyrics) {
    parsedLines = parseLrc(syncedLyrics);
  } else if (plainLyrics) {
    // If we only have plain lyrics, we distribute them evenly across the song
    // or just display them as lines. For simplicity, we can create a single
    // block or assign incremental times.
    const lines = plainLyrics.split("\n");
    parsedLines = lines
      .map((line, index) => ({
        time: index * 4, // dummy timing
        text: line.trim(),
      }))
      .filter((l) => l.text.length > 0);
  }

  return {
    plainLyrics,
    syncedLyrics,
    isInstrumental,
    parsedLines,
  };
}

// Parses LRC (Liner Record Code) synchronization strings
// Format: [mm:ss.xx] Lyric text
function parseLrc(lrcText) {
  const lines = lrcText.split("\n");
  const result = [];
  const timeRegex = /^\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = timeRegex.exec(trimmed);

    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millisecondsVal = match[3] ? match[3] : "0";
      const text = match[4] ? match[4].trim() : "";

      // Normalize milliseconds (could be 2 or 3 digits)
      let ms = parseFloat(`0.${millisecondsVal}`);
      const time = minutes * 60 + seconds + ms;

      result.push({ time, text });
    }
  }

  // Sort by time just in case
  return result.sort((a, b) => a.time - b.time);
}
