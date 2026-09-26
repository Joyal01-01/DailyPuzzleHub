"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useStore } from "@/store/useStore";
import { soundFx } from "@/lib/sound";
import { requestAdBreak } from "@/lib/adsense";
import {
  ArrowLeft,
  BookOpen,
  Trophy,
  Share2,
  RefreshCw,
  PlayCircle,
  Timer,
  Sparkles,
  ShieldAlert,
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

  // Handle Win & Confetti with refined gold palette
  useEffect(() => {
    if (isWon && !hasRecorded) {
      setHasRecorded(true);
      if (soundEnabled) soundFx.playSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#D4AF37", "#F3E5AB", "#10B981", "#E5CA68", "#FFFFFF"],
        });
      } catch {}

      recordGameCompletion(slug, score, seconds * 1000, false);

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
      `DailyPuzzleHub 🏛️ — ${title}\n` +
      `Chronicle: ${new Date().toISOString().split("T")[0]}\n` +
      `Mastery: ${score} XP | Duration: ${formatTime(seconds)}\n` +
      `Explore: https://dailypuzzlehub.com/games/${slug}`;

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Top Breadcrumb & Controls */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-obsidian-850 px-3.5 py-1.5 text-xs font-serif uppercase tracking-widest text-slate-300 hover:border-gold-500/40 hover:text-gold-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Salon</span>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
                {title}
              </h1>
              <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-2.5 py-0.5 font-serif text-[11px] font-bold tracking-widest uppercase text-gold-300">
                {category}
              </span>
            </div>
            <div className="text-[11px] tracking-wider uppercase text-slate-400 font-sans mt-0.5">
              Daily Master Edition • Seed {new Date().toISOString().split("T")[0]}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-obsidian-900/90 px-3.5 py-1.5 text-xs font-mono text-slate-300 shadow-inner">
            <Timer className="w-3.5 h-3.5 text-gold-400" />
            <span>{formatTime(seconds)}</span>
          </div>

          {/* Rules Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-obsidian-850 px-3.5 py-1.5 text-xs font-serif uppercase tracking-wider text-slate-300 hover:border-gold-500/30 hover:text-gold-300 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">Codex</span>
          </button>
        </div>
      </div>

      {/* Rules Codex Overlay */}
      {showHelp && (
        <div className="mb-8 rounded-2xl border border-gold-500/25 bg-gradient-to-br from-obsidian-900/95 via-obsidian-850/95 to-slate-900/95 p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <h3 className="font-serif text-base font-bold text-gold-300 flex items-center gap-2 tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-gold-400" />
              The Codex • Rules of Engagement
            </h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition font-serif"
            >
              Dismiss
            </button>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
            {instructions.map((line, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-gold-500 font-bold select-none">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Game Stage */}
      <div className="relative flex min-h-[480px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-b from-obsidian-900/70 via-obsidian-850/50 to-obsidian-900/70 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
        {children}
      </div>

      {/* Luxury Victory / Defeat Modal */}
      {(isWon || isGameOver) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4">
          <div className="w-full max-w-md rounded-3xl border border-gold-500/30 bg-gradient-to-b from-obsidian-850 via-obsidian-900 to-obsidian-950 p-8 text-center text-white shadow-2xl animate-tile-pop gold-glow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-gold-500/40 bg-gold-500/10 text-gold-400 shadow-lg">
              {isWon ? (
                <Trophy className="w-8 h-8 text-gold-400 animate-pulse" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-rose-400" />
              )}
            </div>

            <div className="text-[10px] font-serif uppercase tracking-widest text-gold-400/80 mb-1">
              {isWon ? "Mastery Achieved" : "Trial Concluded"}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide text-white">
              {isWon ? "Triumph Recorded" : "The Riddle Stands"}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              {isWon
                ? "Your intellect has solved today's daily cipher. Your achievement has been etched into the chronicles."
                : "The daily challenge has proven elusive on this attempt. Revive your trial with a brief pause, or meditate on the outcome."}
            </p>

            <div className="my-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-obsidian-950/80 p-4">
              <div>
                <div className="text-[10px] font-serif uppercase tracking-widest text-slate-400">
                  XP Acquired
                </div>
                <div className="text-xl sm:text-2xl font-serif font-black text-gold-400 mt-0.5">
                  +{score} XP
                </div>
              </div>
              <div>
                <div className="text-[10px] font-serif uppercase tracking-widest text-slate-400">
                  Elapsed Time
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-slate-200 mt-0.5">
                  {formatTime(seconds)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {isWon ? (
                <>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 px-6 py-3 font-serif text-xs uppercase tracking-widest font-black text-obsidian-950 shadow-xl hover:from-gold-400 hover:to-amber-500 transition active:scale-98"
                  >
                    <Share2 className="w-4 h-4 text-obsidian-950" />
                    <span>{copied ? "Proclamation Copied" : "Share Chronicle"}</span>
                  </button>
                  <Link
                    href="/"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-obsidian-800 px-4 py-2.5 font-serif text-xs uppercase tracking-wider text-slate-300 hover:bg-obsidian-700 transition"
                  >
                    Explore Next Riddle
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
                      className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 px-6 py-3 font-serif text-xs uppercase tracking-widest font-black text-obsidian-950 shadow-xl hover:from-amber-400 hover:to-gold-400 transition"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Revive Trial & Protect Streak
                    </button>
                  )}
                  {onRestart && (
                    <button
                      onClick={onRestart}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-obsidian-800 px-4 py-2.5 font-serif text-xs uppercase tracking-wider text-slate-300 hover:bg-obsidian-700 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Attempt Again
                    </button>
                  )}
                  <Link
                    href="/"
                    className="font-serif text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-300 transition py-1"
                  >
                    Return to Salon
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
