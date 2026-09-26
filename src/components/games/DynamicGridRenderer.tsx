"use client";

import { useState } from "react";
import GameContainer from "./GameContainer";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

interface DynamicGridProps {
  game: {
    slug: string;
    title: string;
    category: string;
    configJson?: {
      rows: number;
      cols: number;
      initialGrid: number[][];
      goalGrid: number[][];
      rule: "toggle" | "increment" | "match";
      instructions?: string;
    };
  };
}

export default function DynamicGridRenderer({ game }: DynamicGridProps) {
  const { soundEnabled } = useStore();
  const rows = game.configJson?.rows || 3;
  const cols = game.configJson?.cols || 3;
  const initial =
    game.configJson?.initialGrid || [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1],
    ];
  const goal =
    game.configJson?.goalGrid || [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

  const [grid, setGrid] = useState<number[][]>(initial);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;
    if (soundEnabled) soundFx.playPop();

    const newGrid = grid.map((row) => [...row]);

    if (game.configJson?.rule === "increment") {
      newGrid[r][c] = (newGrid[r][c] + 1) % 4;
    } else {
      // Toggle self and orthogonal
      const dirs = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          newGrid[nr][nc] = newGrid[nr][nc] === 1 ? 0 : 1;
        }
      });
    }

    setGrid(newGrid);
    setMoves((m) => m + 1);

    // Check goal match
    let matchesGoal = true;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (newGrid[i][j] !== goal[i][j]) {
          matchesGoal = false;
        }
      }
    }

    if (matchesGoal) {
      if (soundEnabled) soundFx.playSuccess();
      setIsWon(true);
    }
  };

  return (
    <GameContainer
      slug={game.slug}
      title={game.title}
      category={game.category}
      instructions={[
        game.configJson?.instructions || "Click tiles according to dynamic rule to achieve the target goal state!",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={500}
      onRestart={() => {
        setGrid(initial);
        setMoves(0);
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center select-none">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Moves Made: <strong className="text-white text-sm">{moves}</strong>
        </div>

        <div
          className="grid gap-2 rounded-2xl border-2 border-slate-700 bg-slate-950 p-3 shadow-2xl"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((val, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border-2 text-2xl font-black transition active:scale-95 shadow ${
                  val > 0
                    ? "border-indigo-400 bg-indigo-600 text-white shadow-indigo-500/30"
                    : "border-slate-800 bg-slate-900 text-slate-600"
                }`}
              >
                {val}
              </button>
            ))
          )}
        </div>
      </div>
    </GameContainer>
  );
}
