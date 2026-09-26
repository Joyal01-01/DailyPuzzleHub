"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import AdSenseBanner from "@/components/ads/AdSenseBanner";
import {
  Sparkles,
  Swords,
  Flame,
  CheckCircle2,
  Lock,
  ArrowRight,
  Search,
  Trophy,
  Zap,
} from "lucide-react";

interface GameItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  thumbnail: string;
  type: string;
  isActive: boolean;
}

export default function HomePage() {
  const { user, completedGames } = useStore();
  const [games, setGames] = useState<GameItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        if (data.games) setGames(data.games);
      })
      .catch((err) => console.error("Failed to load games:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ["All", "Word", "Logic", "Memory", "Math", "Classic", "Custom"];

  const filteredGames = games.filter((game) => {
    const matchesCat =
      selectedCategory === "All" ||
      game.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === "Custom" && game.type !== "BUILTIN");
    const matchesQuery =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const completedCount = Object.keys(completedGames).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Hero Daily Hub Banner */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Today's Daily Seed Is Live</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              DailyPuzzle<span className="text-indigo-400">Hub</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl">
              20 free daily word, logic, and memory micro-games. Fresh seed resets daily at 00:00 UTC worldwide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Daily Streak Card */}
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-300">
              <Flame className="w-8 h-8 fill-amber-500 text-amber-500 animate-bounce" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Current Streak</div>
                <div className="text-2xl font-black">{user.currentStreak} Days</div>
              </div>
            </div>

            {/* Daily Completion Progress */}
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-indigo-300">
              <Zap className="w-8 h-8 fill-indigo-400 text-indigo-400" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/80">Puzzles Solved</div>
                <div className="text-2xl font-black">{completedCount} / {games.length || 20}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1v1 Live Duels Callout Banner */}
      <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 p-5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Swords className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                1v1 Live Multiplayer Duels
              </h3>
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950 uppercase tracking-wider">
                Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Challenge friends or random rivals in head-to-head live puzzle races powered by Socket.io!
            </p>
          </div>
        </div>

        <Link
          href="/duel"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-amber-600 hover:to-orange-700 transition"
        >
          <span>Enter Battle Arena</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search 20 games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Games Grid (All 20 Games) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl border border-slate-800 bg-slate-900/50 animate-pulse"
              />
            ))
          : filteredGames.map((game) => {
              const isCompleted = !!completedGames[game.slug];
              const isLocked = !game.isActive;

              return (
                <div
                  key={game.slug}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 shadow-md ${
                    isLocked
                      ? "border-slate-800 bg-slate-950/40 opacity-50"
                      : isCompleted
                      ? "border-emerald-500/30 bg-slate-900/80 hover:border-emerald-500/60"
                      : "border-slate-800 bg-slate-900 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl shadow group-hover:scale-105 transition">
                        {game.thumbnail || "🧩"}
                      </div>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Solved</span>
                        </span>
                      ) : isLocked ? (
                        <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                          <Lock className="w-3 h-3" />
                          <span>Inactive</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/20">
                          +500 XP
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-white text-base group-hover:text-indigo-300 transition">
                      {game.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span>{game.category}</span>
                      <span>•</span>
                      <span>UTC Daily</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    {isLocked ? (
                      <button
                        disabled
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                      >
                        Temporarily Disabled
                      </button>
                    ) : (
                      <Link
                        href={`/games/${game.slug}`}
                        className={`flex items-center justify-center gap-1.5 w-full rounded-xl py-2.5 text-xs font-bold transition shadow ${
                          isCompleted
                            ? "border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                        }`}
                      >
                        <span>{isCompleted ? "Replay Puzzle" : "Play Daily"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Google AdSense Placement */}
      <AdSenseBanner />
    </div>
  );
}
