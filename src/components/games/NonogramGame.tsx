"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { NONOGRAM_PUZZLES } from "@/lib/gameData";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { CheckSquare, XSquare } from "lucide-react";

export default function NonogramGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [puzzle, setPuzzle] = useState(NONOGRAM_PUZZLES[0]);
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: 5 }, () => Array(5).fill(0))
  ); // 0 = empty, 1 = filled, 2 = crossed
  const [mode, setMode] = useState<"fill" | "cross">("fill");
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    const rng = createSeededRng(`nonogram_${dateStr}`);
    const idx = Math.floor(rng() * NONOGRAM_PUZZLES.length);
    const chosen = NONOGRAM_PUZZLES[idx];
    setPuzzle(chosen);
    setGrid(Array.from({ length: 5 }, () => Array(5).fill(0)));
    setIsWon(false);
  }, [dateStr]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;
    const current = grid[r][c];
    let nextVal = 0;

    if (mode === "fill") {
      nextVal = current === 1 ? 0 : 1;
    } else {
      nextVal = current === 2 ? 0 : 2;
    }

    if (soundEnabled) soundFx.playPop();

    const newGrid = grid.map((row, ri) =>
      ri === r ? row.map((val, ci) => (ci === c ? nextVal : val)) : row
    );
    setGrid(newGrid);

    // Check win condition: all cells matching 1 must match puzzle.solution
    let solved = true;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const isFilled = newGrid[i][j] === 1;
        const targetFilled = puzzle.solution[i][j] === 1;
        if (isFilled !== targetFilled) {
          solved = false;
        }
      }
    }
    if (solved) setIsWon(true);
  };

  return (
    <GameContainer
      slug="nonogram"
      title="Daily Nonogram"
      category="Logic"
      instructions={[
        "Use the numbers above and to the left to deduce which tiles to fill.",
        "The numbers indicate consecutive runs of filled squares.",
        "Use 'Fill' mode for black squares and 'Cross' mode to mark empty cells.",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? 500 : 0}
      onRestart={() => {
        setGrid(Array.from({ length: 5 }, () => Array(5).fill(0)));
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center select-none">
        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setMode("fill")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              mode === "fill"
                ? "bg-indigo-600 text-white shadow-lg"
                : "border border-slate-700 bg-slate-800 text-slate-300"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Fill Mode (⬛)</span>
          </button>
          <button
            onClick={() => setMode("cross")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              mode === "cross"
                ? "bg-rose-600 text-white shadow-lg"
                : "border border-slate-700 bg-slate-800 text-slate-300"
            }`}
          >
            <XSquare className="w-4 h-4" />
            <span>Cross Mark (✖)</span>
          </button>
        </div>

        {/* Nonogram Grid Layout with Clues */}
        <div className="flex">
          {/* Empty top-left corner */}
          <div className="w-14 sm:w-16 h-14 sm:h-16" />

          {/* Top Column Clues */}
          <div className="grid grid-cols-5 gap-1 mb-1">
            {puzzle.colClues.map((clue, c) => (
              <div
                key={c}
                className="flex h-14 sm:h-16 w-11 sm:w-13 flex-col items-center justify-end pb-1 text-xs font-bold text-slate-300"
              >
                {clue.map((n, idx) => (
                  <span key={idx}>{n}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Left Row Clues */}
          <div className="flex flex-col gap-1 mr-1">
            {puzzle.rowClues.map((clue, r) => (
              <div
                key={r}
                className="flex h-11 sm:h-13 w-14 sm:w-16 items-center justify-end pr-2 gap-1.5 text-xs font-bold text-slate-300"
              >
                {clue.map((n, idx) => (
                  <span key={idx}>{n}</span>
                ))}
              </div>
            ))}
          </div>

          {/* 5x5 Nonogram Cells */}
          <div className="grid grid-cols-5 gap-1 rounded-xl border-2 border-slate-700 bg-slate-950 p-1 shadow-2xl">
            {grid.map((row, r) =>
              row.map((val, c) => {
                let bg = "bg-slate-900 hover:bg-slate-800 border border-slate-800";
                let text = "";

                if (val === 1) {
                  bg = "bg-indigo-500 border-indigo-400";
                } else if (val === 2) {
                  bg = "bg-slate-950 border-slate-800 text-rose-400 font-bold";
                  text = "✖";
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-lg text-lg transition active:scale-95 ${bg}`}
                  >
                    {text}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {isWon && (
          <div className="mt-4 text-xs font-bold text-emerald-400 animate-pulse">
            Revealed Art: {puzzle.name}!
          </div>
        )}
      </div>
    </GameContainer>
  );
}
