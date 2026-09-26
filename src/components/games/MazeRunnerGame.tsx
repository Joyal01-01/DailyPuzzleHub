"use client";

import { useState, useEffect, useCallback } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Flag } from "lucide-react";

export default function MazeRunnerGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [maze, setMaze] = useState<number[][]>([]); // 1 = wall, 0 = path
  const [playerPos, setPlayerPos] = useState<[number, number]>([1, 1]);
  const [goalPos] = useState<[number, number]>([9, 9]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Generate 11x11 maze using recursive backtracking with daily seed
  const initGame = useCallback(() => {
    const rng = createSeededRng(`maze_${dateStr}`);
    const size = 11;
    const grid = Array.from({ length: size }, () => Array(size).fill(1));

    // Carve maze paths
    const carve = (r: number, c: number) => {
      grid[r][c] = 0;
      const dirs = [
        [-2, 0],
        [2, 0],
        [0, -2],
        [0, 2],
      ].sort(() => rng() - 0.5);

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr > 0 && nr < size - 1 && nc > 0 && nc < size - 1 && grid[nr][nc] === 1) {
          grid[r + dr / 2][c + dc / 2] = 0;
          carve(nr, nc);
        }
      }
    };

    carve(1, 1);
    grid[9][9] = 0; // Ensure goal is open

    setMaze(grid);
    setPlayerPos([1, 1]);
    setMoves(0);
    setIsWon(false);
  }, [dateStr]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (isWon) return;
      const [r, c] = playerPos;
      const nr = r + dr;
      const nc = c + dc;

      if (nr >= 0 && nr < 11 && nc >= 0 && nc < 11 && maze[nr][nc] === 0) {
        if (soundEnabled) soundFx.playPop();
        setPlayerPos([nr, nc]);
        setMoves((m) => m + 1);

        if (nr === goalPos[0] && nc === goalPos[1]) {
          setIsWon(true);
        }
      }
    },
    [goalPos, isWon, maze, playerPos, soundEnabled]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") movePlayer(-1, 0);
      else if (e.key === "ArrowDown" || e.key === "s") movePlayer(1, 0);
      else if (e.key === "ArrowLeft" || e.key === "a") movePlayer(0, -1);
      else if (e.key === "ArrowRight" || e.key === "d") movePlayer(0, 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [movePlayer]);

  return (
    <GameContainer
      slug="maze-runner"
      title="Daily Maze Runner"
      category="Logic"
      instructions={[
        "Navigate your explorer from the top-left start to the checkered goal flag.",
        "Use Arrow keys, WASD, or the directional touch controls.",
        "Reach the goal in the fewest moves.",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? Math.max(200, 600 - moves * 5) : 0}
      onRestart={initGame}
    >
      <div className="flex flex-col items-center select-none">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Moves Made: <strong className="text-white text-sm">{moves}</strong>
        </div>

        {/* 11x11 Maze Grid */}
        <div className="grid grid-cols-11 gap-0.5 rounded-2xl border-2 border-slate-700 bg-slate-950 p-2 shadow-2xl">
          {maze.map((row, r) =>
            row.map((val, c) => {
              const isPlayer = playerPos[0] === r && playerPos[1] === c;
              const isGoal = goalPos[0] === r && goalPos[1] === c;
              const isWall = val === 1;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-sm transition ${
                    isWall
                      ? "bg-slate-800"
                      : isPlayer
                      ? "bg-indigo-600 text-white font-extrabold shadow-lg shadow-indigo-500/50 scale-105 z-10"
                      : isGoal
                      ? "bg-emerald-600 text-white animate-pulse"
                      : "bg-slate-900/60"
                  }`}
                >
                  {isPlayer ? "🏃" : isGoal ? "🏁" : ""}
                </div>
              );
            })
          )}
        </div>

        {/* Direction buttons for touch */}
        <div className="mt-6 grid grid-cols-3 gap-2 w-44">
          <div />
          <button
            onClick={() => movePlayer(-1, 0)}
            className="flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            onClick={() => movePlayer(0, -1)}
            className="flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => movePlayer(1, 0)}
            className="flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => movePlayer(0, 1)}
            className="flex h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
