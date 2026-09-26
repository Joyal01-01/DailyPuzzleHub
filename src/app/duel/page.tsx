"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import io, { Socket } from "socket.io-client";
import {
  Swords,
  Users,
  Trophy,
  Zap,
  ArrowRight,
  Shield,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/sound";

let socket: Socket | null = null;

export default function DuelPage() {
  const { user, soundEnabled } = useStore();
  const [inQueue, setInQueue] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<{ name: string; avatar: string } | null>(null);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [targetWord] = useState("LIGHT");
  const [guessInput, setGuessInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Socket.io connection to custom server
    try {
      socket = io(window.location.origin, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });

      socket.on("connect", () => {
        console.log("[Socket.io] Connected with id:", socket?.id);
      });

      socket.on("match-found", (data: any) => {
        setInQueue(false);
        setMatchId(data.matchId);
        setOpponent(data.opponent);
        setPlayerProgress(0);
        setOpponentProgress(0);
        setWinner(null);
      });

      socket.on("opponent-progress", (data: any) => {
        setOpponentProgress(data.progress);
      });

      socket.on("match-ended", (data: any) => {
        setWinner(data.winnerName);
        if (data.winnerId === socket?.id) {
          if (soundEnabled) soundFx.playSuccess();
          try {
            confetti({ particleCount: 150, spread: 80 });
          } catch {}
        } else {
          if (soundEnabled) soundFx.playError();
        }
      });
    } catch (err) {
      console.log("[Socket.io] Init error:", err);
    }

    return () => {
      socket?.disconnect();
    };
  }, [soundEnabled]);

  const joinMatchmaking = () => {
    setInQueue(true);
    setWinner(null);

    if (socket?.connected) {
      socket.emit("join-matchmaking", {
        userName: user.name,
        userAvatar: user.avatar,
      });
    } else {
      // Offline/Local fast fallback simulator for instant demoing!
      setTimeout(() => {
        setInQueue(false);
        setMatchId(`sim-${Date.now()}`);
        setOpponent({
          name: "Rival Puzzler",
          avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rival",
        });

        // Simulate opponent steady progress
        const oppInterval = setInterval(() => {
          setOpponentProgress((prev) => {
            if (prev >= 100) {
              clearInterval(oppInterval);
              return 100;
            }
            return prev + 20;
          });
        }, 1800);
      }, 2000);
    }
  };

  const handleKeyPress = (char: string) => {
    if (winner || !matchId) return;

    if (char === "ENTER") {
      if (guessInput.toUpperCase() === targetWord) {
        setPlayerProgress(100);
        setWinner(user.name);
        if (soundEnabled) soundFx.playSuccess();
        try {
          confetti({ particleCount: 150, spread: 80 });
        } catch {}

        if (socket?.connected) {
          socket.emit("player-won", { matchId, winnerName: user.name });
        }
      } else {
        if (soundEnabled) soundFx.playError();
        const nextProg = Math.min(80, playerProgress + 20);
        setPlayerProgress(nextProg);
        socket?.emit("progress-update", { matchId, progress: nextProg });
      }
      setGuessInput("");
    } else if (char === "DEL") {
      setGuessInput((prev) => prev.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(char) && guessInput.length < 5) {
      setGuessInput((prev) => prev + char.toUpperCase());
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 mb-2">
          <Swords className="w-3.5 h-3.5" />
          <span>Real-Time Socket.io Battle Arena</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          1v1 Live Puzzle Duels
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Race head-to-head against another real player in a live speed sprint. First to solve wins the XP bounty!
        </p>
      </div>

      {!matchId ? (
        <div className="mx-auto max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Swords className={`w-10 h-10 ${inQueue ? "animate-spin" : ""}`} />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            {inQueue ? "Searching for Opponent..." : "Ready for Battle?"}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {inQueue
              ? "Connecting via Socket.io websocket lobby. Pair matching in progress..."
              : "Compete in a 5-letter speed race. Average match duration: 45 seconds."}
          </p>

          <button
            onClick={joinMatchmaking}
            disabled={inQueue}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 font-bold text-white shadow-xl hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 transition"
          >
            {inQueue ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Finding Match...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Find 1v1 Match</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Player Progress */}
            <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-indigo-300 text-sm">YOU ({user.name})</span>
                <span className="font-bold text-white text-xs">{playerProgress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${playerProgress}%` }}
                />
              </div>
            </div>

            {/* Opponent Progress */}
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-rose-300 text-sm">
                  OPPONENT ({opponent?.name || "Rival"})
                </span>
                <span className="font-bold text-white text-xs">{opponentProgress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${opponentProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Duel Puzzle Shell */}
          <div className="flex flex-col items-center select-none">
            <div className="mb-4 text-xs font-bold text-slate-400">
              Clue: <strong className="text-white">Illumination; radiant energy</strong>
            </div>

            {/* Word Slots */}
            <div className="flex gap-2 mb-6">
              {Array.from({ length: 5 }).map((_, idx) => {
                const char = guessInput[idx] || "";
                return (
                  <div
                    key={idx}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-slate-700 bg-slate-950 text-2xl font-black text-white shadow"
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {/* Virtual Numpad */}
            <div className="flex flex-col gap-1.5 w-full max-w-sm mb-6">
              {["QWERTYUIOP", "ASDFGHJKL"].map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1">
                  {row.split("").map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKeyPress(k)}
                      className="h-10 w-8 sm:w-9 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                    >
                      {k}
                    </button>
                  ))}
                </div>
              ))}
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => handleKeyPress("ENTER")}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  ENTER
                </button>
                {"ZXCVBNM".split("").map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKeyPress(k)}
                    className="h-10 w-8 sm:w-9 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
                  >
                    {k}
                  </button>
                ))}
                <button
                  onClick={() => handleKeyPress("DEL")}
                  className="px-3 py-2 rounded-lg bg-slate-700 text-xs font-bold text-white hover:bg-slate-600"
                >
                  DEL
                </button>
              </div>
            </div>

            {winner && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/60 p-6 text-center shadow-xl animate-tile-pop">
                <h3 className="text-2xl font-black text-white mb-1">
                  {winner === user.name ? "🏆 Victory! You Won!" : "💥 Match Concluded"}
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Winner: <strong>{winner}</strong>
                </p>
                <button
                  onClick={() => setMatchId(null)}
                  className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition"
                >
                  Play Another Duel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
