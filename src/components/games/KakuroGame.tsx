"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

interface KakuroCell {
  r: number;
  c: number;
  isBlock: boolean;
  downSum?: number;
  acrossSum?: number;
  value?: number;
  solution?: number;
}

export default function KakuroGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [grid, setGrid] = useState<KakuroCell[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [isWon, setIsWon] = useState(false);

  // Daily 4x4 Kakuro puzzle template
  useEffect(() => {
    createSeededRng(`kakuro_${dateStr}`);

    const board: KakuroCell[][] = [
      [
        { r: 0, c: 0, isBlock: true },
        { r: 0, c: 1, isBlock: true, downSum: 4 },
        { r: 0, c: 2, isBlock: true, downSum: 16 },
        { r: 0, c: 3, isBlock: true },
      ],
      [
        { r: 1, c: 0, isBlock: true, acrossSum: 3 },
        { r: 1, c: 1, isBlock: false, value: 0, solution: 1 },
        { r: 1, c: 2, isBlock: false, value: 0, solution: 2 },
        { r: 1, c: 3, isBlock: true, downSum: 11 },
      ],
      [
        { r: 2, c: 0, isBlock: true, acrossSum: 17 },
        { r: 2, c: 1, isBlock: false, value: 0, solution: 3 },
        { r: 2, c: 2, isBlock: false, value: 0, solution: 9 },
        { r: 2, c: 3, isBlock: false, value: 0, solution: 5 },
      ],
      [
        { r: 3, c: 0, isBlock: true },
        { r: 3, c: 1, isBlock: true },
        { r: 3, c: 2, isBlock: true, acrossSum: 11 },
        { r: 3, c: 3, isBlock: false, value: 0, solution: 6 },
      ],
    ];

    setGrid(board);
    setSelected([1, 1]);
    setIsWon(false);
  }, [dateStr]);

  const handleInputNumber = (num: number) => {
    if (!selected || isWon) return;
    const [r, c] = selected;
    if (grid[r][c].isBlock) return;

    if (soundEnabled) soundFx.playPop();

    const nextGrid = grid.map((row, ri) =>
      ri === r
        ? row.map((cell, ci) => (ci === c ? { ...cell, value: num } : cell))
        : row
    );
    setGrid(nextGrid);

    // Win check: all non-block cells match solution
    let solved = true;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const cell = nextGrid[i][j];
        if (!cell.isBlock && cell.value !== cell.solution) {
          solved = false;
        }
      }
    }
    if (solved) setIsWon(true);
  };

  return (
    <GameContainer
      slug="kakuro"
      title="Daily Kakuro"
      category="Math"
      instructions={[
        "Fill each playable square with digits from 1 to 9.",
        "The clue on each diagonal indicates the sum of the digits in that run.",
        "Digits within a single consecutive sum run cannot be repeated.",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? 500 : 0}
      onRestart={() => {
        setGrid((g) =>
          g.map((row) =>
            row.map((cell) => (!cell.isBlock ? { ...cell, value: 0 } : cell))
          )
        );
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center select-none">
        {/* 4x4 Kakuro Grid */}
        <div className="grid grid-cols-4 gap-1.5 rounded-2xl border-2 border-slate-700 bg-slate-950 p-2.5 shadow-2xl">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selected?.[0] === r && selected?.[1] === c;

              if (cell.isBlock) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-[10px] sm:text-xs font-bold text-slate-400 overflow-hidden"
                  >
                    {/* Diagonal line */}
                    {(cell.downSum || cell.acrossSum) && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-700 to-transparent w-full h-[1px] top-1/2 -rotate-45" />
                    )}
                    {cell.downSum && (
                      <span className="absolute bottom-1 left-1.5 text-indigo-400">
                        {cell.downSum}
                      </span>
                    )}
                    {cell.acrossSum && (
                      <span className="absolute top-1 right-1.5 text-amber-400">
                        {cell.acrossSum}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelected([r, c])}
                  className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl border-2 text-xl font-black shadow transition active:scale-95 ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-600/30 text-white ring-2 ring-indigo-300"
                      : "border-slate-700 bg-slate-800 text-indigo-200 hover:bg-slate-750"
                  }`}
                >
                  {cell.value && cell.value > 0 ? cell.value : ""}
                </button>
              );
            })
          )}
        </div>

        {/* Numpad */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleInputNumber(num)}
              className="h-11 w-11 rounded-xl border border-slate-700 bg-slate-800 text-base font-extrabold text-white hover:bg-indigo-600 transition active:scale-95 shadow"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleInputNumber(0)}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
