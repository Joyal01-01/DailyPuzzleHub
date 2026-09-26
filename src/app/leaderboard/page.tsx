"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Flame, Zap, Globe, RefreshCw } from "lucide-react";

interface LeaderEntry {
  rank: number;
  username: string;
  score: number;
  country: string;
  streak: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaders = () => {
    setIsLoading(true);
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.leaderboard) setLeaders(data.leaderboard);
      })
      .catch((err) => console.error("Leaderboard fetch error:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400 mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>Redis Real-Time Rankings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Global Daily Hall of Fame
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Top puzzle solvers worldwide ranked by cumulative daily XP and active streaks.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {leaders.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 items-end max-w-2xl mx-auto">
          {/* Rank 2 */}
          <div className="flex flex-col items-center rounded-2xl border border-slate-700 bg-slate-900/60 p-4 shadow-xl text-center">
            <div className="h-12 w-12 rounded-full border-2 border-slate-400 bg-slate-800 flex items-center justify-center text-xl mb-2">
              🥈
            </div>
            <div className="font-bold text-white text-xs sm:text-sm truncate w-full">
              {leaders[1].username}
            </div>
            <div className="text-indigo-400 font-extrabold text-xs mt-1">
              {leaders[1].score.toLocaleString()} XP
            </div>
            <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-500" />
              <span>{leaders[1].streak}d</span>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="flex flex-col items-center rounded-3xl border-2 border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-slate-900 p-5 shadow-2xl text-center -translate-y-2">
            <div className="h-14 w-14 rounded-full border-2 border-yellow-400 bg-yellow-400/20 flex items-center justify-center text-2xl mb-2 animate-bounce">
              👑
            </div>
            <div className="font-extrabold text-white text-sm sm:text-base truncate w-full">
              {leaders[0].username}
            </div>
            <div className="text-yellow-400 font-black text-sm mt-1">
              {leaders[0].score.toLocaleString()} XP
            </div>
            <div className="text-xs text-amber-400 mt-1 flex items-center gap-1 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{leaders[0].streak}d Streak</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center rounded-2xl border border-amber-800/40 bg-slate-900/60 p-4 shadow-xl text-center">
            <div className="h-12 w-12 rounded-full border-2 border-amber-600 bg-slate-800 flex items-center justify-center text-xl mb-2">
              🥉
            </div>
            <div className="font-bold text-white text-xs sm:text-sm truncate w-full">
              {leaders[2].username}
            </div>
            <div className="text-indigo-400 font-extrabold text-xs mt-1">
              {leaders[2].score.toLocaleString()} XP
            </div>
            <div className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-500" />
              <span>{leaders[2].streak}d</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Top 10 Global Players
          </span>
          <button
            onClick={fetchLeaders}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800 text-xs text-slate-200">
          {leaders.map((player) => (
            <div
              key={player.rank}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-black text-slate-400 text-sm">
                  #{player.rank}
                </span>
                <span className="font-bold text-white text-sm">
                  {player.username}
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-700">
                  {player.country}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{player.streak}d</span>
                </div>
                <div className="w-24 text-right font-black text-indigo-400 text-sm">
                  {player.score.toLocaleString()} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
