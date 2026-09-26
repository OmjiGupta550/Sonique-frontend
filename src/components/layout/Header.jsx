"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Sun, Moon, User, LogOut, Mic } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";
import Link from "next/link";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const { profile, logout, accentColor } = useUIStore();

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [themeMode, setThemeMode] = useState("dark");

  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const applyTheme = (theme) => {
    if (typeof window === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.body.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.body.classList.remove("light");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sonique_theme") || "dark";
      setThemeMode(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    applyTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("sonique_theme", nextTheme);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
      setSearchQuery(transcript);
      router.push(`/search?q=${encodeURIComponent(transcript)}`);
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

  return (
    <header className="h-16 bg-zinc-950/20 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-40 select-none gap-4">
      {/* Left Action Buttons: Theme Toggle */}
      <div className="flex items-center gap-2 hidden md:flex shrink-0">
        {/* Light / Dark Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 transition shadow-md"
          title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {themeMode === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 hover:-rotate-12 transition-transform" />
          )}
        </button>
      </div>

      {/* Mobile Logo */}
      <Link
        href="/app"
        className="flex md:hidden items-center gap-2 hover:opacity-85 transition select-none shrink-0"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-sm"
          style={{ backgroundColor: accentColor }}
        >
          S
        </div>
        <span className="text-base font-bold tracking-tight text-white hidden xs:inline">
          Sonique
        </span>
      </Link>

      {/* Primary Top Search Input */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-xl relative mx-2 sm:mx-6"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            if (pathname === "/search") {
              if (val.trim()) {
                router.replace(`/search?q=${encodeURIComponent(val.trim())}`);
              } else {
                router.replace("/search");
              }
            }
          }}
          placeholder={
            isListening ? "Listening..." : "Search songs, artists, albums..."
          }
          className={`w-full bg-zinc-900/80 border border-white/10 focus:border-zinc-500 rounded-full py-2 pl-10 pr-10 text-sm text-white focus:outline-none focus:bg-zinc-900 transition duration-200 shadow-md ${
            isListening ? "placeholder-red-400 border-red-500/50" : ""
          }`}
        />

        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />

        <button
          type="button"
          onClick={startVoiceSearch}
          className={`absolute right-3 top-2 p-1 rounded-full transition duration-200 ${
            isListening
              ? "bg-red-500/20 text-red-500 animate-pulse"
              : "text-zinc-400 hover:text-white"
          }`}
          title="Voice Search"
        >
          <Mic className="w-4 h-4" />
        </button>
      </form>

      {/* Right User Auth Menu */}
      <div className="relative shrink-0 flex items-center gap-2">
        {/* Mobile Theme icon */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full bg-zinc-900/80 text-zinc-300 border border-white/10"
            title="Toggle Theme"
          >
            {themeMode === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>

        {profile ? (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-full bg-zinc-900/60 hover:bg-zinc-900 transition"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-zinc-950"
                style={{ backgroundColor: accentColor }}
              >
                {profile.email[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-zinc-200 px-1 max-w-[95px] md:max-w-none truncate hidden sm:inline">
              {profile.display_name || profile.email.split("@")[0]}
            </span>
          </button>
        ) : (
          <Link
            href="/login"
            className="text-xs font-semibold bg-white text-zinc-950 px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition"
          >
            Log In
          </Link>
        )}

        {/* Dropdown Menu */}
        {showDropdown && profile && (
          <div className="absolute right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-1.5 w-48 z-50">
            <Link
              href="/library?tab=profile"
              onClick={() => setShowDropdown(false)}
              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
            <button
              onClick={() => {
                setShowDropdown(false);
                logout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
