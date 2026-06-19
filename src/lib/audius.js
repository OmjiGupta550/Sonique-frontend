// Audius API helper
// Fetches healthy API nodes and provides functions to query music metadata and streams.

let healthyNode = null;

async function getAudiusNode() {
  if (healthyNode) return healthyNode;

  try {
    const res = await fetch("https://api.audius.co");
    const data = await res.json();
    const nodes = data.data || [];
    if (nodes.length > 0) {
      // Pick a random node for load balancing
      const randomIndex = Math.floor(Math.random() * nodes.length);
      healthyNode = nodes[randomIndex];
      return healthyNode;
    }
  } catch (error) {
    console.error("Error fetching Audius nodes:", error);
  }

  // Fallback node if API is down or failed
  return "https://audius-metadata-5.figment.io";
}

export async function fetchTrendingTracks() {
  try {
    const node = await getAudiusNode();
    const res = await fetch(`${node}/v1/tracks/trending?app_name=sonique_app`);
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching trending tracks:", error);
    return [];
  }
}

export async function fetchNewReleases() {
  // Audius doesn't have a direct "new releases" endpoint, we can search for latest tracks
  // or fetch trending and shuffle/slice them, or use search with an empty string or standard search query.
  // Let's search with empty query or get popular electronic/pop tracks
  try {
    const node = await getAudiusNode();
    const res = await fetch(
      `${node}/v1/tracks/search?query=lofi&app_name=sonique_app`,
    );
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching new releases:", error);
    return [];
  }
}

export async function fetchRecommendations() {
  // Let's get recommended tracks (we can query another popular genre like Chill or Synthwave)
  try {
    const node = await getAudiusNode();
    const res = await fetch(
      `${node}/v1/tracks/search?query=synthwave&app_name=sonique_app`,
    );
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}

export async function searchTracks(query) {
  if (!query) return [];
  try {
    const node = await getAudiusNode();
    const res = await fetch(
      `${node}/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=sonique_app`,
    );
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
}

export async function searchArtists(query) {
  if (!query) return [];
  try {
    const node = await getAudiusNode();
    const res = await fetch(
      `${node}/v1/users/search?query=${encodeURIComponent(query)}&app_name=sonique_app`,
    );
    const data = await res.json();
    // Filter users to get those with track counts (artists)
    const users = data.data || [];
    return users;
  } catch (error) {
    console.error("Error searching artists:", error);
    return [];
  }
}

export async function searchPlaylists(query) {
  if (!query) return [];
  try {
    const node = await getAudiusNode();
    const res = await fetch(
      `${node}/v1/playlists/search?query=${encodeURIComponent(query)}&app_name=sonique_app`,
    );
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error searching playlists:", error);
    return [];
  }
}

export async function fetchArtistDetails(artistId) {
  try {
    const node = await getAudiusNode();
    const res = await fetch(
      `${node}/v1/users/${artistId}?app_name=sonique_app`,
    );
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error("Error fetching artist details:", error);
    return null;
  }
}

export async function fetchArtistTracks(artistId) {
  try {
    const node = await getAudiusNode();
    const res = await fetch(
      `${node}/v1/users/${artistId}/tracks?app_name=sonique_app`,
    );
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching artist tracks:", error);
    return [];
  }
}

export async function fetchTrackDetails(trackId) {
  try {
    const node = await getAudiusNode();
    const res = await fetch(
      `${node}/v1/tracks/${trackId}?app_name=sonique_app`,
    );
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error("Error fetching track details:", error);
    return null;
  }
}

export async function getStreamUrl(trackId) {
  const node = await getAudiusNode();
  // Return the direct streaming endpoint.
  // Note: Audius streaming URLs redirect to the actual file location.
  // Standard HTMLAudioElement handles redirects seamlessly.
  return `${node}/v1/tracks/${trackId}/stream?app_name=sonique_app`;
}
