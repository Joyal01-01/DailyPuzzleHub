"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { Role } from "@prisma/client";
import {
  Flame,
  Zap,
  Trophy,
  Shield,
  Volume2,
  VolumeX,
  Swords,
  Clock,
  Sparkles,
  UserCheck,
} from "lucide-react";

export default function Navbar() {
  const { user, switchRole, soundEnabled, toggleSound } = useStore();
  const [timeLeft, setTimeLeft] = useState("");

  // UTC countdown to midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnightUtc = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() + 1,
          0,
          0,
          0
        )
      );
      const diff = midnightUtc.getTime() - now.getTime();
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
          s
        ).padStart(2, "0")}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white sm:text-lg">
                DailyPuzzle<span className="text-indigo-400">Hub</span>
              </span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                PRO 2.0
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>Next UTC puzzle: <strong className="text-slate-200">{timeLeft || "--:--:--"}</strong></span>
            </div>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            href="/"
            className="hover:text-white transition py-1"
          >
            All 20 Games
          </Link>
          <Link
            href="/duel"
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition py-1"
          >
            <Swords className="w-4 h-4 animate-bounce" />
            <span>1v1 Live Duels</span>
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-500/30">
              LIVE
            </span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 hover:text-white transition py-1"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Leaderboard</span>
          </Link>
          {user.role === Role.ADMIN && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition py-1"
            >
              <Shield className="w-4 h-4" />
              <span>Admin CMS</span>
            </Link>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 shadow-sm">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{user.currentStreak}d Streak</span>
          </div>

          {/* XP Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
            <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
            <span>{user.totalXp.toLocaleString()} XP</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Sound FX" : "Enable Sound FX"}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Role Switcher Demo Dropdown (USER <-> ADMIN) */}
          <div className="relative group">
            <button
              onClick={() =>
                switchRole(user.role === Role.ADMIN ? Role.USER : Role.ADMIN)
              }
              title={`Active role: ${user.role}. Click to switch role.`}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition shadow-sm ${
                user.role === Role.ADMIN
                  ? "border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{user.role}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
