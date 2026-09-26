"use client";

import React, { useState, useEffect } from "react";
import { Zap, CheckCircle2, AlertCircle, RefreshCw, Key, LogOut } from "lucide-react";
import { API_BASE } from "../../lib/config";
import { useUIStore } from "../../store/useUIStore";

export function SyncYTMusicButton({ onSyncSuccess, isSynced = false }) {
  const { profile, accentColor, isYTSynced, checkYTStatus } = useUIStore();
  const userId = profile?.id || "default";

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("idle"); // idle | success | error
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCookie, setManualCookie] = useState("");
  const [localSynced, setLocalSynced] = useState(isSynced || isYTSynced);

  const handleRestoreSync = async (savedAuth) => {
    try {
      const res = await fetch(`${API_BASE}/ytmusic/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, headers: savedAuth }),
      });
      const data = await res.json();
      if (res.ok && data.connected) {
        setLocalSynced(true);
        setStatusType("success");
        useUIStore.setState({ isYTSynced: true });
        localStorage.removeItem("sonique_home_shelves");
        window.dispatchEvent(new CustomEvent("sonique_recs_refresh"));
        if (onSyncSuccess) onSyncSuccess();
      }
    } catch (err) {
      console.error("Auto restore YT Music sync error:", err);
    }
  };

  // Auto restore YT Music sync session on mount
  useEffect(() => {
    checkYTStatus();
    if (typeof window === "undefined") return;
    const savedAuth =
      localStorage.getItem(`sonique_yt_auth_${userId}`) ||
      localStorage.getItem("sonique_yt_auth_default") ||
      localStorage.getItem("sonique_yt_auth_guest") ||
      localStorage.getItem("sonique_yt_auth");
    if (savedAuth && !localSynced && !isYTSynced) {
      handleRestoreSync(savedAuth);
    }
  }, [userId]);

  const synced = isSynced || isYTSynced || localSynced || statusType === "success";

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/ytmusic/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      localStorage.removeItem(`sonique_yt_auth_${userId}`);
      localStorage.removeItem("sonique_yt_auth_default");
      localStorage.removeItem("sonique_yt_auth_guest");
      localStorage.removeItem("sonique_yt_auth");
      localStorage.removeItem("sonique_home_shelves");
      sessionStorage.removeItem("sonique_yt_personal_feed");
      setLocalSynced(false);
      useUIStore.setState({ isYTSynced: false });
      setStatusType("idle");
      setStatusMsg("");
      window.dispatchEvent(new CustomEvent("sonique_recs_refresh"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (synced) {
    return (
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>YouTube Music Account Synced</span>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="ml-1 text-zinc-400 hover:text-rose-400 transition"
          title="Disconnect YT Music"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Real-time check if input has recognizable cookies or headers
  const hasValidFormat = (input) => {
    if (!input) return false;
    const str = input.toLowerCase();
    return (
      str.includes("sapisid=") ||
      str.includes("__secure-3papisid=") ||
      str.includes("visitor_info1_live=") ||
      str.includes("cookie:") ||
      str.includes("authorization:")
    );
  };

  const handleManualSyncSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = manualCookie.trim();
    if (!trimmedInput) return;

    setLoading(true);
    setStatusMsg("Connecting to YouTube Music...");
    setStatusType("idle");

    try {
      const res = await fetch(`${API_BASE}/ytmusic/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, headers: trimmedInput }),
      });

      const data = await res.json();
      if (res.ok && data.connected) {
        setStatusType("success");
        setStatusMsg("YouTube Music account linked!");
        setLocalSynced(true);
        useUIStore.setState({ isYTSynced: true });
        localStorage.setItem(`sonique_yt_auth_${userId}`, trimmedInput);
        localStorage.setItem("sonique_yt_auth_default", trimmedInput);
        localStorage.setItem("sonique_yt_auth", trimmedInput);
        localStorage.removeItem("sonique_home_shelves");
        setShowManualModal(false);
        sessionStorage.removeItem("sonique_yt_personal_feed");
        window.dispatchEvent(new CustomEvent("sonique_recs_refresh"));
        if (onSyncSuccess) onSyncSuccess();
      } else {
        setStatusType("error");
        setStatusMsg(data.message || "Failed to link YT Music session.");
        alert(data.message || "Failed to link YT Music session. Please check your cookies/headers.");
      }
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatusMsg("Error connecting to YouTube Music.");
      alert("Error connecting to YouTube Music. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowManualModal(true)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs text-white transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{
            backgroundColor: accentColor || "#8B5CF6",
            boxShadow: `0 0 15px ${accentColor || "#8B5CF6"}40`,
          }}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
          )}
          <span>{loading ? "Connecting..." : "Link YouTube Music Account"}</span>
        </button>
      </div>

      {statusMsg && (
        <div
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-md border ${
            statusType === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : statusType === "error"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-zinc-800/50 border-white/10 text-zinc-300"
          }`}
        >
          {statusType === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : statusType === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
          )}
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Manual Input Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-2xl text-white space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" /> Link YouTube Music Account
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                100% Personal Feed
              </span>
            </div>

            <div className="text-xs text-zinc-300 bg-zinc-950/60 border border-white/5 p-3 rounded-xl space-y-2 leading-relaxed">
              <p className="font-semibold text-zinc-200">How to get your session headers:</p>
              <ol className="list-decimal list-inside space-y-1 text-zinc-400">
                <li>Open <a href="https://music.youtube.com" target="_blank" rel="noreferrer" className="text-purple-400 underline">music.youtube.com</a> in your browser and sign in.</li>
                <li>Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 font-mono text-[10px]">F12</kbd> &rarr; select the <b>Network</b> tab.</li>
                <li>Click any request (e.g. <code>browse</code> or <code>player</code>).</li>
                <li>Right-click the request &rarr; <b>Copy</b> &rarr; <b>Copy request headers</b> (or paste your raw <code>Cookie</code> string).</li>
              </ol>
            </div>

            <form onSubmit={handleManualSyncSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <textarea
                  value={manualCookie}
                  onChange={(e) => setManualCookie(e.target.value)}
                  placeholder="Paste copied Request Headers, raw Cookie string, or cURL command here..."
                  rows={6}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-purple-500 font-mono resize-none placeholder:text-zinc-600"
                />
                {manualCookie.trim() && (
                  <div className="text-[11px] flex items-center gap-1.5">
                    {hasValidFormat(manualCookie) ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid credentials detected
                      </span>
                    ) : (
                      <span className="text-amber-400 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Credentials should include cookies or request headers
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !manualCookie.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{loading ? "Verifying..." : "Link & View Feed"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
