"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Role, GameType } from "@prisma/client";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  Eye,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Users,
  Gamepad2,
  RefreshCw,
} from "lucide-react";

export default function AdminPage() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState<"cms" | "metrics" | "builder">("cms");
  const [games, setGames] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic game builder form state
  const [builderType, setBuilderType] = useState<GameType>(GameType.DYNAMIC_TRIVIA);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("Custom");
  const [newThumbnail, setNewThumbnail] = useState("🎮");
  const [triviaQuestions, setTriviaQuestions] = useState([
    {
      question: "What is the capital of Nepal?",
      options: ["Pokhara", "Kathmandu", "Lalitpur", "Biratnagar"],
      correct: 1,
      explanation: "Kathmandu is the capital and largest city of Nepal.",
    },
  ]);
  const [customWord, setCustomWord] = useState("PEACE");
  const [customWordHint, setCustomWordHint] = useState("Freedom from disturbance; tranquility");
  const [gridJson, setGridJson] = useState(
    JSON.stringify(
      {
        rows: 3,
        cols: 3,
        initialGrid: [
          [1, 0, 1],
          [0, 1, 0],
          [1, 0, 1],
        ],
        goalGrid: [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
        rule: "toggle",
        instructions: "Toggle tiles to clear the grid!",
      },
      null,
      2
    )
  );

  const [builderSuccess, setBuilderSuccess] = useState<string | null>(null);

  // Fetch games & metrics
  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/games").then((res) => res.json()),
      fetch("/api/admin/metrics").then((res) => res.json()),
    ])
      .then(([gamesData, metricsData]) => {
        if (gamesData.games) setGames(gamesData.games);
        if (metricsData.metrics) setMetrics(metricsData.metrics);
      })
      .catch((err) => console.error("Admin fetch error:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check RBAC
  if (user.role !== Role.ADMIN) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Access Denied: Admin Only</h2>
        <p className="mt-2 text-sm text-slate-400">
          Your current session role is <strong>{user.role}</strong>. Please switch to the <strong>ADMIN</strong> role using the top-bar role selector.
        </p>
      </div>
    );
  }

  const toggleGame = async (slug: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/games/${slug}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive, adminOverride: true }),
      });
      if (res.ok) {
        setGames((prev) =>
          prev.map((g) => (g.slug === slug ? { ...g, isActive: !currentActive } : g))
        );
      }
    } catch (e) {
      console.error("Toggle error:", e);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuilderSuccess(null);

    let configJson: any = {};
    if (builderType === GameType.DYNAMIC_TRIVIA) {
      configJson = { questions: triviaQuestions };
    } else if (builderType === GameType.DYNAMIC_WORD) {
      configJson = { targetWord: customWord, hint: customWordHint, maxGuesses: 6 };
    } else if (builderType === GameType.DYNAMIC_GRID) {
      try {
        configJson = JSON.parse(gridJson);
      } catch {
        alert("Invalid JSON format for Grid payload!");
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/games/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          slug: newSlug,
          category: newCategory,
          thumbnail: newThumbnail,
          type: builderType,
          configJson,
        }),
      });

      const data = await res.json();
      if (res.ok && data.game) {
        setBuilderSuccess(`Game '${newTitle}' published successfully!`);
        setNewTitle("");
        setNewSlug("");
        loadData();
      } else {
        alert(data.error || "Failed to create game");
      }
    } catch (err) {
      console.error("Creation error:", err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Admin CMS & Game Builder
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Authenticated as <strong>{user.name}</strong> • Role-Based Access Control Active
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("cms")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "cms"
                ? "bg-indigo-600 text-white shadow-lg"
                : "border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Game CMS ({games.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "metrics"
                ? "bg-indigo-600 text-white shadow-lg"
                : "border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Metrics & AdSense</span>
          </button>
          <button
            onClick={() => setActiveTab("builder")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "builder"
                ? "bg-purple-600 text-white shadow-lg"
                : "border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Dynamic Builder</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Game Management CMS */}
      {activeTab === "cms" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Live Game Activation Controls
            </h3>
            <button
              onClick={loadData}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh List</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-md">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Game</th>
                  <th className="px-4 py-3.5">Slug</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Live Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {games.map((g) => (
                  <tr key={g.slug} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-bold flex items-center gap-2">
                      <span className="text-lg">{g.thumbnail}</span>
                      <span>{g.title}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{g.slug}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                        {g.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{g.type}</td>
                    <td className="px-4 py-3">
                      {g.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          Active (Live)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/games/${g.slug}`}
                          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 transition"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => toggleGame(g.slug, g.isActive)}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            g.isActive
                              ? "bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30"
                              : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30"
                          }`}
                        >
                          {g.isActive ? (
                            <>
                              <ToggleRight className="w-3.5 h-3.5" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Metrics, User Retention & AdSense Reports */}
      {activeTab === "metrics" && metrics && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-bold">Daily Active Users</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {metrics.dailyActiveUsers.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>+14.2% vs last week</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-bold">Avg. Retention (D1/D7)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {metrics.retentionD1} / {metrics.retentionD7}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Industry benchmark: 40% / 15%
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase font-bold">Puzzles Played Today</span>
                <Gamepad2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {metrics.totalPuzzlesPlayedToday.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-indigo-400 font-semibold">
                {metrics.overallCompletionRate} Completion Rate
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-lg">
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <span className="text-xs uppercase font-bold">Est. Daily AdSense Rev</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300">
                ${metrics.adSenseMetrics.estimatedDailyRevenueUsd}
              </div>
              <div className="mt-1 text-[11px] text-emerald-400 font-semibold">
                Client: {metrics.adSenseMetrics.publisherId}
              </div>
            </div>
          </div>

          {/* AdSense H5 SDK Performance Details */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Google AdSense H5 Games SDK Performance Report
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-slate-400 uppercase font-bold mb-1">Total Ad Impressions</div>
                <div className="text-xl font-bold text-white">
                  {metrics.adSenseMetrics.dailyImpressions.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-slate-400 uppercase font-bold mb-1">Rewarded Video Views</div>
                <div className="text-xl font-bold text-amber-400">
                  {metrics.adSenseMetrics.rewardedVideoViews.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <div className="text-slate-400 uppercase font-bold mb-1">Streak Revive Rate</div>
                <div className="text-xl font-bold text-emerald-400">
                  {metrics.adSenseMetrics.rewardedReviveRate}
                </div>
              </div>
            </div>
          </div>

          {/* Completion By Game */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">
              Top Games Completion Breakdown
            </h3>
            <div className="space-y-3">
              {metrics.completionByGame.map((g: any) => (
                <div key={g.slug} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{g.title}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">{g.completions.toLocaleString()} plays</span>
                    <span className="font-bold text-indigo-400 w-12 text-right">{g.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dynamic Custom Game Creator */}
      {activeTab === "builder" && (
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-md max-w-3xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white">
              Dynamic JSON-Driven Game Creator
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Publish new custom games directly to the platform without redeploying code!
            </p>
          </div>

          {builderSuccess && (
            <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300">
              {builderSuccess}
            </div>
          )}

          <form onSubmit={handleCreateGame} className="space-y-6 text-xs">
            {/* Game Type Picker */}
            <div>
              <label className="block font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Select Game Engine Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setBuilderType(GameType.DYNAMIC_TRIVIA)}
                  className={`rounded-xl border p-3 text-left font-bold transition ${
                    builderType === GameType.DYNAMIC_TRIVIA
                      ? "border-purple-500 bg-purple-950/40 text-purple-200 ring-2 ring-purple-400"
                      : "border-slate-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  <div>🧠 Custom Trivia/Quiz</div>
                  <div className="text-[10px] font-normal text-slate-500 mt-1">
                    Multiple-choice questions with answer keys
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderType(GameType.DYNAMIC_WORD)}
                  className={`rounded-xl border p-3 text-left font-bold transition ${
                    builderType === GameType.DYNAMIC_WORD
                      ? "border-purple-500 bg-purple-950/40 text-purple-200 ring-2 ring-purple-400"
                      : "border-slate-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  <div>🔤 Custom Word Challenge</div>
                  <div className="text-[10px] font-normal text-slate-500 mt-1">
                    Target word, clues, & guess attempts
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderType(GameType.DYNAMIC_GRID)}
                  className={`rounded-xl border p-3 text-left font-bold transition ${
                    builderType === GameType.DYNAMIC_GRID
                      ? "border-purple-500 bg-purple-950/40 text-purple-200 ring-2 ring-purple-400"
                      : "border-slate-800 bg-slate-950 text-slate-400"
                  }`}
                >
                  <div>🧩 N×M Grid Puzzle Engine</div>
                  <div className="text-[10px] font-normal text-slate-500 mt-1">
                    Custom matrix, goal states & rules
                  </div>
                </button>
              </div>
            </div>

            {/* General Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Himalayan Trivia"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Unique Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. himalayan-trivia"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="Trivia / Word / Logic"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Emoji Thumbnail</label>
                <input
                  type="text"
                  placeholder="🎮"
                  value={newThumbnail}
                  onChange={(e) => setNewThumbnail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Sub-Editor based on builderType */}
            {builderType === GameType.DYNAMIC_TRIVIA && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
                <div className="font-bold text-purple-400 uppercase tracking-wider">
                  Trivia Question Configuration
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Question 1 Text</label>
                  <input
                    type="text"
                    value={triviaQuestions[0].question}
                    onChange={(e) => {
                      const updated = [...triviaQuestions];
                      updated[0].question = e.target.value;
                      setTriviaQuestions(updated);
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {triviaQuestions[0].options.map((opt, oIdx) => (
                    <div key={oIdx}>
                      <label className="block text-slate-500 mb-1">Option {oIdx + 1}</label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...triviaQuestions];
                          updated[0].options[oIdx] = e.target.value;
                          setTriviaQuestions(updated);
                        }}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Correct Option Index (0-3)</label>
                  <input
                    type="number"
                    min={0}
                    max={3}
                    value={triviaQuestions[0].correct}
                    onChange={(e) => {
                      const updated = [...triviaQuestions];
                      updated[0].correct = parseInt(e.target.value, 10);
                      setTriviaQuestions(updated);
                    }}
                    className="w-24 rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                  />
                </div>
              </div>
            )}

            {builderType === GameType.DYNAMIC_WORD && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-4">
                <div className="font-bold text-purple-400 uppercase tracking-wider">
                  Word Puzzle Configuration
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Secret Target Word</label>
                  <input
                    type="text"
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white font-bold tracking-widest uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Daily Clue / Hint</label>
                  <input
                    type="text"
                    value={customWordHint}
                    onChange={(e) => setCustomWordHint(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-white"
                  />
                </div>
              </div>
            )}

            {builderType === GameType.DYNAMIC_GRID && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="font-bold text-purple-400 uppercase tracking-wider">
                  N×M Grid JSON Definition
                </div>
                <textarea
                  rows={8}
                  value={gridJson}
                  onChange={(e) => setGridJson(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-xs text-indigo-300 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 font-bold text-white shadow-xl hover:from-purple-700 hover:to-indigo-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Dynamic Game Live</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
