"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useStore } from "@/store/useStore";
import { soundFx } from "@/lib/sound";
import { requestAdBreak } from "@/lib/adsense";
import {
  ArrowLeft,
  HelpCircle,
  Trophy,
  Share2,
  RefreshCw,
  PlayCircle,
  Timer,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface GameContainerProps {
  slug: string;
  title: string;
  category: string;
  instructions: string[];
  isWon: boolean;
  isGameOver: boolean;
  score: number;
  movesOrGuesses?: number;
  onRestart?: () => void;
  onRevive?: () => void;
  shareText?: string;
  children: ReactNode;
}

export default function GameContainer({
  slug,
  title,
  category,
  instructions,
  isWon,
  isGameOver,
  score,
  movesOrGuesses,
  onRestart,
  onRevive,
  shareText,
  children,
}: GameContainerProps) {
  const { soundEnabled, recordGameCompletion, openRewardedAdModal } = useStore();
  const [showHelp, setShowHelp] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);

  // Timer
  useEffect(() => {
    if (isGameOver || isWon) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, isWon]);

  // Handle Win & Confetti
  useEffect(() => {
    if (isWon && !hasRecorded) {
      setHasRecorded(true);
      if (soundEnabled) soundFx.playSuccess();
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      recordGameCompletion(slug, score, seconds * 1000, false);

      // Trigger post-game interstitial ad break
      requestAdBreak({
        type: "next",
        name: `game_win_${slug}`,
      });
    } else if (isGameOver && !isWon && soundEnabled) {
      soundFx.playError();
    }
  }, [isWon, isGameOver, hasRecorded, slug, score, seconds, soundEnabled, recordGameCompletion]);

  const handleShare = () => {
    const text =
      shareText ||
      `DailyPuzzleHub 🧩 - ${title}\n` +
      `Date: ${new Date().toISOString().split("T")[0]}\n` +
      `Score: ${score} XP | Time: ${formatTime(seconds)}\n` +
      `Play now: https://dailypuzzlehub.com/games/${slug}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Top Breadcrumb & Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hub</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {title}
              </h1>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                {category}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Daily Challenge • UTC Seed {new Date().toISOString().split("T")[0]}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-mono text-slate-200">
            <Timer className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTime(seconds)}</span>
          </div>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>
        </div>
      </div>

      {/* Rules Dropdown / Card */}
      {showHelp && (
        <div className="mb-6 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              How to Play {title}
            </h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
            {instructions.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Game Content Box */}
      <div className="relative flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-8 backdrop-blur-sm shadow-xl">
        {children}
      </div>

      {/* Game Win / Game Over Overlay Modal */}
      {(isWon || isGameOver) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center text-white shadow-2xl animate-tile-pop">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {isWon ? (
                <Trophy className="w-8 h-8 text-yellow-400" />
              ) : (
                <HelpCircle className="w-8 h-8 text-rose-400" />
              )}
            </div>

            <h2 className="text-2xl font-bold">
              {isWon ? "Puzzle Completed!" : "Puzzle Incomplete"}
            </h2>

            <p className="mt-1 text-sm text-slate-300">
              {isWon
                ? "Outstanding work! You conquered today's daily puzzle challenge."
                : "You ran out of attempts for this seed. Watch an ad to revive or try again!"}
            </p>

            <div className="my-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <div>
                <div className="text-xs uppercase text-slate-400 font-bold">Score Earned</div>
                <div className="text-xl font-extrabold text-indigo-400">+{score} XP</div>
              </div>
              <div>
                <div className="text-xs uppercase text-slate-400 font-bold">Time Taken</div>
                <div className="text-xl font-extrabold text-slate-200">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {isWon ? (
                <>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 transition"
                  >
                    <Share2 className="w-4 h-4" />
                    {copied ? "Copied to Clipboard!" : "Share Results"}
                  </button>
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition"
                  >
                    Play Next Game
                  </Link>
                </>
              ) : (
                <>
                  {onRevive && (
                    <button
                      onClick={() =>
                        openRewardedAdModal(slug, () => {
                          if (onRevive) onRevive();
                        })
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-amber-600 hover:to-orange-700 transition"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Revive & Keep Streak (Watch Ad)
                    </button>
                  )}
                  {onRestart && (
                    <button
                      onClick={onRestart}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  )}
                  <Link
                    href="/"
                    className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                  >
                    Return to Hub
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
