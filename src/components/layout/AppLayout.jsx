"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "../sidebar/Sidebar";
import { Header } from "./Header";
import { MiniPlayer } from "../player/MiniPlayer";
import { FullscreenPlayer } from "../player/FullscreenPlayer";
import { QueueDrawer } from "../player/QueueDrawer";
import { CreatePlaylistModal } from "../ui/Modals";
import { VideoPlayerModal } from "../video/VideoPlayerModal";
import { useUIStore } from "../../store/useUIStore";
import { usePlayerStore } from "../../store/usePlayerStore";
import { useKeyboard } from "../../hooks/useKeyboard";
import { supabase } from "../../lib/supabase";
import { Home, Search, Library } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export function AppLayout({ children }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  const {
    loadUserData,
    setProfile,
    isLoadingData,
    accentColor,
    activeVideoId,
    playVideo,
  } = useUIStore();
  const {
    initAudio,
    showFullscreenPlayer,
    setShowFullscreenPlayer,
    togglePlay,
    isPlaying,
    queue,
    shuffledQueue,
    isShuffle,
    currentIndex,
  } = usePlayerStore();

  const activeQueue = isShuffle ? shuffledQueue : queue;
  const currentTrack = activeQueue[currentIndex];
  const hasTrack = Boolean(currentTrack);

  // Initialize keyboard shortcuts
  useKeyboard();

  // Listen to Auth changes & initial load
  useEffect(() => {
    // Set profile if authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        loadUserData();
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData, setProfile]);

  // Register or Unregister PWA Service Worker depending on environment
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const hostname = window.location.hostname;
      const isDev =
        process.env.NODE_ENV === "development" ||
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.startsWith("172.") ||
        hostname.endsWith(".local");
      if (isDev) {
        // Unregister service worker in development to prevent caching Next.js dev bundles
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
            console.log("Dev Mode: Service Worker Unregistered successfully.");
          }
        });
        // Clear caches in development to delete stale Turbopack dev chunks
        if ("caches" in window) {
          caches.keys().then((names) => {
            for (let name of names) {
              caches.delete(name);
            }
            console.log("Dev Mode: Cache Storage Cleared successfully.");
          });
        }
      } else {
        // Register in production
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) =>
            console.log("Service Worker Registered. Scope:", reg.scope),
          )
          .catch((err) =>
            console.error("Service Worker registration failed:", err),
          );
      }
    }
  }, []);

  // Anchor-based YouTube Player Iframe positioning engine
  useEffect(() => {
    if (typeof window === "undefined") return;

    let active = true;
    let lastRect = { top: -9999, left: -9999, width: 0, height: 0, activeVid: null, opacity: "0" };

    const syncPlayerPosition = () => {
      if (!active) return;

      const container = document.getElementById(
        "hidden-youtube-player-container",
      );
      if (!container) {
        requestAnimationFrame(syncPlayerPosition);
        return;
      }

      const activeVid = useUIStore.getState().activeVideoId;
      const isFullscreenOpen = usePlayerStore.getState().showFullscreenPlayer;
      const playerState = usePlayerStore.getState();
      const currentQueue = playerState.isShuffle ? playerState.shuffledQueue : playerState.queue;
      const currentPlayingTrack = currentQueue[playerState.currentIndex];
      const hasPlayingTrack = Boolean(currentPlayingTrack);

      let placeholder = null;

      if (activeVid) {
        placeholder =
          document.getElementById("youtube-player-modal-placeholder") ||
          document.getElementById("youtube-player-placeholder");
        if (!placeholder && isFullscreenOpen) {
          placeholder = document.getElementById("fullscreen-youtube-player-placeholder");
        }
      } else if (isFullscreenOpen) {
        placeholder = document.getElementById("fullscreen-youtube-player-placeholder");
      } else if (hasPlayingTrack && !isLandingPage) {
        const desktopP = document.getElementById("mini-youtube-player-placeholder-desktop");
        const mobileP = document.getElementById("mini-youtube-player-placeholder-mobile");
        if (desktopP && desktopP.offsetWidth > 0) {
          placeholder = desktopP;
        } else if (mobileP && mobileP.offsetWidth > 0) {
          placeholder = mobileP;
        } else {
          placeholder = desktopP || mobileP || document.getElementById("mini-youtube-player-placeholder");
        }
      }

      if (placeholder && placeholder.offsetWidth > 0 && placeholder.offsetHeight > 0) {
        const rect = placeholder.getBoundingClientRect();

        // Only update inline styles when position, size, or modal state actually changes
        if (
          Math.abs(rect.top - lastRect.top) > 0.5 ||
          Math.abs(rect.left - lastRect.left) > 0.5 ||
          Math.abs(rect.width - lastRect.width) > 0.5 ||
          Math.abs(rect.height - lastRect.height) > 0.5 ||
          activeVid !== lastRect.activeVid ||
          isFullscreenOpen !== lastRect.isFullscreenOpen ||
          lastRect.opacity !== "1"
        ) {
          lastRect = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            activeVid,
            isFullscreenOpen,
            opacity: "1",
          };

          // Determine if target is moving continuously across frames to avoid CSS transition fight
          const isContinuousMove =
            Math.abs(rect.top - lastRect.top) < 25 &&
            Math.abs(rect.left - lastRect.left) < 25 &&
            (Math.abs(rect.top - lastRect.top) > 0.2 ||
              Math.abs(rect.left - lastRect.left) > 0.2);

          container.style.transition = isContinuousMove
            ? "none"
            : "top 0.25s cubic-bezier(0.16, 1, 0.3, 1), left 0.25s cubic-bezier(0.16, 1, 0.3, 1), width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, border-radius 0.25s ease";
          container.style.willChange =
            "top, left, width, height, transform, border-radius";
          container.style.width = `${rect.width}px`;
          container.style.height = `${rect.height}px`;
          container.style.top = `${rect.top}px`;
          container.style.left = `${rect.left}px`;
          container.style.bottom = "";
          container.style.right = "";
          container.style.opacity = "1";
          container.style.pointerEvents = "none";
          // When VideoModal or FullscreenPlayer is open, set zIndex to 62 so iframe renders over modal backdrop (z-58/z-60)
          container.style.zIndex = (activeVid || isFullscreenOpen) ? "62" : "51";

          const style = window.getComputedStyle(placeholder);
          container.style.borderRadius = style.borderRadius || "8px";
        }

        // Bypass browser cross-origin minimum size (200x200px) rendering constraint by scaling the iframe inside the container viewport
        const iframe =
          container.querySelector("iframe") || container.firstElementChild;
        if (iframe) {
          if (rect.width < 320 || rect.height < 180) {
            // Precise 16:9 scale matrix to fit any small slot without distortion, letterboxing, or black borders
            const baseW = 320;
            const baseH = 180;
            const scale = Math.max(rect.width / baseW, rect.height / baseH);
            const scaledW = baseW * scale;
            const scaledH = baseH * scale;
            const offsetLeft = (rect.width - scaledW) / 2;
            const offsetTop = (rect.height - scaledH) / 2;

            iframe.style.setProperty("width", `${baseW}px`, "important");
            iframe.style.setProperty("height", `${baseH}px`, "important");
            iframe.style.setProperty("max-width", "none", "important");
            iframe.style.setProperty("max-height", "none", "important");
            iframe.style.setProperty("transform", `scale(${scale})`, "important");
            iframe.style.setProperty("transform-origin", "top left", "important");
            iframe.style.setProperty("margin-top", `${offsetTop}px`, "important");
            iframe.style.setProperty("margin-left", `${offsetLeft}px`, "important");
            iframe.style.setProperty("display", "block", "important");
            iframe.style.setProperty("position", "absolute", "important");
            iframe.style.setProperty("top", "0", "important");
            iframe.style.setProperty("left", "0", "important");
            iframe.style.setProperty("pointer-events", "none", "important");
          } else {
            // Responsive 16:9 dynamic iframe sizing without distortion or cropping
            iframe.style.setProperty("width", "100%", "important");
            iframe.style.setProperty("height", "100%", "important");
            iframe.style.setProperty("max-width", "100%", "important");
            iframe.style.setProperty("max-height", "100%", "important");
            iframe.style.setProperty("transform", "none", "important");
            iframe.style.setProperty("margin-top", "0px", "important");
            iframe.style.setProperty("margin-left", "0px", "important");
            iframe.style.setProperty("display", "block", "important");
            iframe.style.setProperty("position", "absolute", "important");
            iframe.style.setProperty("top", "0px", "important");
            iframe.style.setProperty("left", "0px", "important");
            iframe.style.setProperty("object-fit", "cover", "important");
            iframe.style.setProperty("pointer-events", "none", "important");
          }
        }
      } else {
        // Place off-screen and hide
        container.style.width = "200px";
        container.style.height = "200px";
        container.style.top = "-1000px";
        container.style.left = "-1000px";
        container.style.bottom = "";
        container.style.right = "";
        container.style.opacity = "0";
        container.style.pointerEvents = "none";
        container.style.zIndex = "-9999";
        container.style.borderRadius = "8px";

        const iframe =
          container.querySelector("iframe") || container.firstElementChild;
        if (iframe) {
          iframe.style.setProperty("width", "100%", "important");
          iframe.style.setProperty("height", "100%", "important");
          iframe.style.setProperty("max-width", "none", "important");
          iframe.style.setProperty("max-height", "none", "important");
          iframe.style.setProperty("transform", "none", "important");
          iframe.style.setProperty("margin-top", "0px", "important");
          iframe.style.setProperty("margin-left", "0px", "important");
          iframe.style.setProperty("display", "block", "important");
          iframe.style.setProperty("position", "absolute", "important");
          iframe.style.setProperty("top", "0", "important");
          iframe.style.setProperty("left", "0", "important");
        }
      }

      requestAnimationFrame(syncPlayerPosition);
    };

    requestAnimationFrame(syncPlayerPosition);

    return () => {
      active = false;
    };
  }, [activeVideoId, showFullscreenPlayer]);

  // Trigger global document click to initialize HTMLAudioElement on first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      initAudio();
      document.removeEventListener("click", handleFirstClick);
    };
    document.addEventListener("click", handleFirstClick);
    return () => document.removeEventListener("click", handleFirstClick);
  }, [initAudio]);

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans antialiased">
      {isLandingPage ? (
        <div className="min-h-screen w-screen bg-[#050505] text-zinc-100 overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
          {children}
        </div>
      ) : (
        <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 font-sans antialiased text-zinc-200">
          {/* Background radial highlight */}
          <div
            className="absolute top-0 right-0 w-[40vw] h-[40vw] opacity-10 rounded-full blur-[100px] pointer-events-none select-none transition-all duration-1000"
            style={{
              background: `radial-gradient(circle, ${accentColor} 0%, rgba(9, 9, 11, 0) 70%)`,
            }}
          />

          {/* Spotify-style Sidebar */}
          <Sidebar />

          {/* Main Container */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative pb-44 md:pb-20">
            <Suspense fallback={<div className="h-16 border-b border-white/5" />}>
              <Header />
            </Suspense>

            {/* Scrollable Body Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 scrollbar-thin scrollbar-thumb-zinc-800">
              {children}
            </main>
          </div>

          {/* Player Components */}
          <MiniPlayer />
          <FullscreenPlayer />
          <QueueDrawer />

          {/* Mobile Bottom Navigation Bar */}
          <Suspense fallback={null}>
            <MobileNavBar pathname={pathname} accentColor={accentColor} />
          </Suspense>

          {/* Modals Container */}
          <CreatePlaylistModal />
          <VideoPlayerModal />
        </div>
      )}

      {/* Persistent YouTube Player Container - Dynamically docked to placeholders via syncPlayerPosition */}
      <div
        id="hidden-youtube-player-container"
        className="fixed overflow-hidden bg-black select-none pointer-events-none"
        style={{
          position: "fixed",
          width: "200px",
          height: "200px",
          top: "-1000px",
          left: "-1000px",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -9999,
          borderRadius: "8px",
        }}
      >
        <div
          id="hidden-youtube-player-iframe"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}

function MobileNavBar({ pathname, accentColor }) {
  return (
    <nav className="fixed bottom-3 left-4 right-4 h-16 bg-zinc-950/70 border border-white/10 backdrop-blur-xl rounded-2xl z-50 flex items-center justify-around md:hidden select-none px-4 shadow-2xl shadow-black/80">
      {[
        {
          label: "Home",
          href: "/app",
          icon: Home,
          active: pathname === "/app",
        },
        {
          label: "Search",
          href: "/search",
          icon: Search,
          active: pathname === "/search",
        },
        {
          label: "Library",
          href: "/library?tab=likes",
          icon: Library,
          active: pathname === "/library",
        },
      ].map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-200
              ${item.active ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            style={{ color: item.active ? accentColor : undefined }}
          >
            <Icon className="w-5.5 h-5.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
