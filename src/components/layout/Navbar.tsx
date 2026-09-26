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
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-obsidian-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gold-500/40 bg-gradient-to-tr from-amber-700/30 via-gold-500/20 to-amber-500/10 text-gold-300 shadow-lg shadow-gold-500/10 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
                DailyPuzzle<span className="text-gold-400">Hub</span>
              </span>
              <span className="rounded border border-gold-500/30 bg-gold-500/10 px-1.5 py-0.5 font-serif text-[10px] font-bold tracking-widest uppercase text-gold-300">
                PRO 2.0
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-sans">
              <Clock className="w-3 h-3 text-gold-400" />
              <span>Next UTC reset: <strong className="text-slate-200 font-mono">{timeLeft || "--:--:--"}</strong></span>
            </div>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-serif uppercase tracking-widest text-slate-300">
          <Link
            href="/"
            className="hover:text-gold-300 transition py-1"
          >
            Discipline Salon
          </Link>
          <Link
            href="/duel"
            className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition py-1"
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>1v1 Arena</span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
              LIVE
            </span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 hover:text-gold-300 transition py-1"
          >
            <Trophy className="w-3.5 h-3.5 text-gold-400" />
            <span>Hall of Fame</span>
          </Link>
          {user.role === Role.ADMIN && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-purple-300 hover:text-purple-200 transition py-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Curator CMS</span>
            </Link>
          )}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{user.currentStreak}d Streak</span>
          </div>

          {/* XP Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-gold-500/30 bg-gold-500/10 px-2.5 py-1 text-xs font-bold text-gold-300">
            <Zap className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            <span>{user.totalXp.toLocaleString()} XP</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute Sound FX" : "Enable Sound FX"}
            className="rounded-xl border border-white/10 bg-obsidian-850 p-2 text-slate-400 hover:text-gold-300 hover:border-gold-500/30 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-gold-400" />
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
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-[11px] font-serif uppercase tracking-wider font-bold transition shadow-sm ${
                user.role === Role.ADMIN
                  ? "border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                  : "border-white/10 bg-obsidian-850 text-slate-300 hover:bg-obsidian-800"
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
