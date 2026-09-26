import { API_BASE } from "./config";

export async function sendAIChat(message, currentSong = null) {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, current_song: currentSong }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "AI service returned an error.");
    }
    return data;
  } catch (error) {
    console.error("sendAIChat error:", error);
    throw error;
  }
}

export async function generateAIPlaylist(prompt, currentSong = null) {
  try {
    const res = await fetch(`${API_BASE}/ai/playlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, current_song: currentSong }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to generate AI playlist.");
    }
    return data;
  } catch (error) {
    console.error("generateAIPlaylist error:", error);
    throw error;
  }
}

export async function searchAINatural(query) {
  try {
    const res = await fetch(`${API_BASE}/ai/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to perform natural language search.");
    }
    return data;
  } catch (error) {
    console.error("searchAINatural error:", error);
    throw error;
  }
}

export async function recommendAIMood(mood) {
  try {
    const res = await fetch(`${API_BASE}/ai/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to get mood recommendations.");
    }
    return data;
  } catch (error) {
    console.error("recommendAIMood error:", error);
    throw error;
  }
}

export async function findAISimilar(currentSong, count = 5) {
  try {
    const res = await fetch(`${API_BASE}/ai/similar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_song: currentSong, count }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to find similar songs.");
    }
    return data;
  } catch (error) {
    console.error("findAISimilar error:", error);
    throw error;
  }
}

export async function modifyAIPlaylist(instruction, tracks = []) {
  try {
    const res = await fetch(`${API_BASE}/ai/playlist/modify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction, tracks }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to modify AI playlist.");
    }
    return data;
  } catch (error) {
    console.error("modifyAIPlaylist error:", error);
    throw error;
  }
}

export async function clearAIChatHistory() {
  try {
    const res = await fetch(`${API_BASE}/ai/chat/history`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (error) {
    console.error("clearAIChatHistory error:", error);
  }
}
