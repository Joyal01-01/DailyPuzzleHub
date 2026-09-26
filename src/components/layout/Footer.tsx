import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white">DailyPuzzleHub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise-grade suite of 20 daily deterministic word, logic, and memory micro-games. Fresh seed resets daily at 00:00 UTC.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Core Categories
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/?category=Word" className="hover:text-white transition">Word Games (Wordle, Anagrams, Crossword)</Link></li>
              <li><Link href="/?category=Logic" className="hover:text-white transition">Logic Puzzles (Sudoku, Minesweeper, Nonogram)</Link></li>
              <li><Link href="/?category=Memory" className="hover:text-white transition">Memory & Focus (Sequence, Cards, Simon)</Link></li>
              <li><Link href="/?category=Math" className="hover:text-white transition">Math & Strategy (2048, Kakuro, Lights Out)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform & Features
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/duel" className="hover:text-white transition">1v1 Real-Time Multiplayer Duels</Link></li>
              <li><Link href="/leaderboard" className="hover:text-white transition">Global & Daily Leaderboards (Redis)</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Admin CMS & Dynamic Game Engine</Link></li>
              <li><span className="text-slate-500">Google AdSense H5 Games SDK (pub-5643499410858608)</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Fair Play & Sync
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              All daily puzzles use a deterministic PRNG based on the UTC calendar date, ensuring fair competition worldwide without server bias.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>Built with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>for puzzle enthusiasts</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>© {new Date().getFullYear()} DailyPuzzleHub. All rights reserved.</div>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Prisma ORM</span>
            <span>•</span>
            <span>Socket.io Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
