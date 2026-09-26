"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  X,
  Send,
  Trash2,
  Music,
  Loader2,
  Bot,
  User,
  Zap,
  PlayCircle,
  Sparkles
} from "lucide-react";
import { useAIStore } from "../../store/useAIStore";
import { usePlayerStore } from "../../store/usePlayerStore";
import { AIPlaylistView } from "./AIPlaylistView";

export function AIAssistantModal() {
  const { isOpen, setIsOpen, messages, loading, sendMessage, clearHistory } =
    useAIStore();
  const { queue, currentIndex, isPlaying, playTrack } = usePlayerStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const currentTrack = queue[currentIndex] || null;

  const quickPrompts = [
    "Create a study playlist",
    "Relaxing Hindi songs",
    "Similar to playing song",
    "Surprise workout mix",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim(), currentTrack);
    setInput("");
  };

  const handlePromptClick = (promptText) => {
    sendMessage(promptText, currentTrack);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-16 right-0 h-[calc(100vh-9rem)] w-full sm:w-80 md:w-96 bg-zinc-950/95 border-l border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col z-40 select-none overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-900/60 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
              <BrainCircuit className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Ask Sonique AI
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 uppercase">
                  Gemini
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={clearHistory}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Song Context Banner */}
        {currentTrack && (
          <div className="flex items-center justify-between px-4 py-2 bg-indigo-950/40 border-b border-indigo-500/20 text-[11px] text-zinc-300 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Music className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="text-zinc-400">Context:</span>
              <span className="font-semibold text-indigo-200 truncate">
                {currentTrack.title}
              </span>
            </div>
            <button
              onClick={() => sendMessage("Give me songs similar to this playing track", currentTrack)}
              className="text-indigo-400 hover:text-indigo-300 underline font-medium shrink-0 ml-1 text-[10px]"
            >
              Ask Similar
            </button>
          </div>
        )}

        {/* Messages Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role !== "user" && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="space-y-2 max-w-[88%]">
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                      : msg.isError
                      ? "bg-red-950/50 border border-red-500/30 text-red-200 rounded-tl-none"
                      : "bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Embedded Playlist View */}
                {msg.playlist && (
                  <div className="mt-2">
                    <AIPlaylistView playlist={msg.playlist} />
                  </div>
                )}

                {/* Embedded Tracks List */}
                {!msg.playlist && msg.tracks && msg.tracks.length > 0 && (
                  <div className="bg-zinc-900/80 border border-white/10 rounded-xl p-2.5 space-y-1.5 mt-1.5">
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                      Recommended Real Songs ({msg.tracks.length})
                    </p>
                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                      {msg.tracks.map((t, tIdx) => (
                        <div
                          key={t.videoId || t.id || tIdx}
                          onClick={() => playTrack(t, msg.tracks)}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={t.coverUrl || t.thumbnail || "/default-cover.jpg"}
                              alt={t.title}
                              className="w-7 h-7 rounded object-cover bg-zinc-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate group-hover:text-indigo-300">
                                {t.title}
                              </p>
                              <p className="text-[10px] text-zinc-400 truncate">
                                {t.artist}
                              </p>
                            </div>
                          </div>
                          <PlayCircle className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot className="w-3.5 h-3.5 animate-bounce" />
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 text-xs flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-white/5 bg-zinc-900/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <Zap className="w-3 h-3 text-indigo-400 shrink-0" />
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(prompt)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-indigo-600/30 text-zinc-300 hover:text-white border border-white/5 hover:border-indigo-500/40 transition shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-white/10 bg-zinc-900/90 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI (e.g., '1 hr coding playlist')..."
            className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl transition shadow-md shadow-indigo-600/30 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
