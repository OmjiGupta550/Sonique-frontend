import { create } from "zustand";
import {
  sendAIChat,
  generateAIPlaylist,
  modifyAIPlaylist,
  clearAIChatHistory,
  findAISimilar,
  recommendAIMood,
} from "../lib/ai";

import { usePlayerStore } from "./usePlayerStore";

export const useAIStore = create((set, get) => ({
  isOpen: false,
  messages: [
    {
      role: "assistant",
      content:
        "Hi! I'm Ask Sonique AI. Ask me to create a playlist, find relaxing songs, or discover music similar to what you're playing!",
      timestamp: new Date().toISOString(),
    },
  ],
  loading: false,
  error: null,
  activePlaylist: null,

  setIsOpen: (isOpen) => {
    if (isOpen) {
      usePlayerStore.getState().setShowQueueList?.(false);
    }
    set({ isOpen });
  },
  toggleOpen: () => {
    const nextState = !get().isOpen;
    if (nextState) {
      usePlayerStore.getState().setShowQueueList?.(false);
    }
    set({ isOpen: nextState });
  },

  sendMessage: async (text, currentSong = null) => {
    if (!text || !text.trim()) return;

    const userMsg = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      loading: true,
      error: null,
    }));

    try {
      const data = await sendAIChat(text.trim(), currentSong);

      const aiMsg = {
        role: "assistant",
        content: data.response || "Here are your tracks:",
        timestamp: new Date().toISOString(),
        playlist: data.playlist || null,
        tracks: data.tracks || [],
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        loading: false,
        activePlaylist: data.playlist || state.activePlaylist,
      }));
    } catch (err) {
      const errorMsg =
        err.message || "AI is currently unavailable. Please try again later.";
      set((state) => ({
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `⚠️ ${errorMsg}`,
            isError: true,
            timestamp: new Date().toISOString(),
          },
        ],
        loading: false,
        error: errorMsg,
      }));
    }
  },

  generatePlaylist: async (prompt, currentSong = null) => {
    if (!prompt) return;

    set({ loading: true, error: null });
    try {
      const data = await generateAIPlaylist(prompt, currentSong);
      if (data.playlist) {
        set({
          activePlaylist: data.playlist,
          loading: false,
        });
      }
      return data.playlist;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  modifyActivePlaylist: async (instruction) => {
    const currentPl = get().activePlaylist;
    if (!currentPl || !currentPl.tracks || !instruction) return;

    set({ loading: true, error: null });
    try {
      const data = await modifyAIPlaylist(instruction, currentPl.tracks);
      const updatedTracks = data.tracks || currentPl.tracks;

      const updatedPl = {
        ...currentPl,
        trackCount: updatedTracks.length,
        tracks: updatedTracks,
      };

      set((state) => ({
        activePlaylist: updatedPl,
        loading: false,
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: `Updated playlist based on: "${instruction}"`,
            playlist: updatedPl,
            tracks: updatedTracks,
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  clearHistory: async () => {
    try {
      await clearAIChatHistory();
    } catch (e) {
      console.error(e);
    }
    set({
      messages: [
        {
          role: "assistant",
          content: "Conversation history cleared. How can I help you next?",
          timestamp: new Date().toISOString(),
        },
      ],
      activePlaylist: null,
      error: null,
    });
  },
}));
