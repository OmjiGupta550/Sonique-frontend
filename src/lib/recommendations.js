import { useUIStore } from "../store/useUIStore";
import { API_BASE } from "./config";

export async function trackPlay(track) {
  const userId = useUIStore.getState().profile?.id || "guest";
  try {
    await fetch(`${API_BASE}/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, track }),
    });
  } catch (err) {
    console.error("Failed to log play action:", err);
  }
}

export async function trackSkip(trackId, completionRate) {
  const userId = useUIStore.getState().profile?.id || "guest";
  try {
    await fetch(`${API_BASE}/skip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, trackId, completionRate }),
    });
  } catch (err) {
    console.error("Failed to log skip action:", err);
  }
}

export async function trackLike(track, isLike) {
  const userId = useUIStore.getState().profile?.id || "guest";
  const endpoint = isLike === 1 ? "like" : "dislike";
  try {
    await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, track }),
    });
    // Trigger real-time refresh custom event
    window.dispatchEvent(new Event("sonique_recs_refresh"));
  } catch (err) {
    console.error(`Failed to log like/dislike action:`, err);
  }
}

export async function trackPlaylistAdd(playlistName, track) {
  const userId = useUIStore.getState().profile?.id || "guest";
  try {
    await fetch(`${API_BASE}/playlist/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, playlistName, track }),
    });
    window.dispatchEvent(new Event("sonique_recs_refresh"));
  } catch (err) {
    console.error("Failed to log playlist add action:", err);
  }
}

export async function trackGenericAction(actionType, metaData = {}) {
  const userId = useUIStore.getState().profile?.id || "guest";
  try {
    await fetch(`${API_BASE}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, actionType, metaData }),
    });
    // Refresh recommendations dynamically
    window.dispatchEvent(new Event("sonique_recs_refresh"));
  } catch (err) {
    console.error(`Failed to log generic action ${actionType}:`, err);
  }
}

export async function getHomeShelves() {
  const userId = useUIStore.getState().profile?.id || "guest";
  try {
    const res = await fetch(`${API_BASE}/home?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      return data.shelves;
    }
  } catch (err) {
    console.error("Failed to fetch home shelves:", err);
  }
  return null;
}

export async function fetchTrendingVideos() {
  try {
    const res = await fetch(`${API_BASE}/videos/trending`);
    if (res.ok) {
      const data = await res.json();
      return data.videos || [];
    }
  } catch (err) {
    console.error("Failed to fetch trending videos:", err);
  }
  return [];
}
