"use client";

import { useState, useEffect, useCallback } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

export default function Game2048() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [board, setBoard] = useState<number[][]>(
    Array.from({ length: 4 }, () => Array(4).fill(0))
  );
  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const spawnTile = (grid: number[][], rng: () => number) => {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return grid;
    const [r, c] = emptyCells[Math.floor(rng() * emptyCells.length)];
    grid[r][c] = rng() > 0.85 ? 4 : 2;
    return grid;
  };

  const initGame = useCallback(() => {
    const rng = createSeededRng(`2048_${dateStr}`);
    let grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    grid = spawnTile(grid, rng);
    grid = spawnTile(grid, rng);
    setBoard(grid);
    setScore(0);
    setIsWon(false);
    setIsGameOver(false);
  }, [dateStr]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const slideRow = (row: number[]) => {
    let arr = row.filter((val) => val !== 0);
    let gainedScore = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        gainedScore += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((val) => val !== 0);
    while (arr.length < 4) {
      arr.push(0);
    }
    return { row: arr, gainedScore };
  };

  const move = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      if (isGameOver) return;
      let newBoard = board.map((row) => [...row]);
      let totalGained = 0;
      let changed = false;

      if (dir === "left") {
        for (let r = 0; r < 4; r++) {
          const { row, gainedScore } = slideRow(newBoard[r]);
          totalGained += gainedScore;
          if (row.some((val, idx) => val !== newBoard[r][idx])) changed = true;
          newBoard[r] = row;
        }
      } else if (dir === "right") {
        for (let r = 0; r < 4; r++) {
          const reversed = [...newBoard[r]].reverse();
          const { row, gainedScore } = slideRow(reversed);
          const finalRow = row.reverse();
          totalGained += gainedScore;
          if (finalRow.some((val, idx) => val !== newBoard[r][idx])) changed = true;
          newBoard[r] = finalRow;
        }
      } else if (dir === "up") {
        for (let c = 0; c < 4; c++) {
          const col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
          const { row, gainedScore } = slideRow(col);
          totalGained += gainedScore;
          for (let r = 0; r < 4; r++) {
            if (newBoard[r][c] !== row[r]) changed = true;
            newBoard[r][c] = row[r];
          }
        }
      } else if (dir === "down") {
        for (let c = 0; c < 4; c++) {
          const col = [newBoard[3][c], newBoard[2][c], newBoard[1][c], newBoard[0][c]];
          const { row, gainedScore } = slideRow(col);
          totalGained += gainedScore;
          for (let r = 0; r < 4; r++) {
            if (newBoard[3 - r][c] !== row[r]) changed = true;
            newBoard[3 - r][c] = row[r];
          }
        }
      }

      if (changed) {
        if (soundEnabled) soundFx.playPop();
        newBoard = spawnTile(newBoard, Math.random);
        setBoard(newBoard);
        setScore((s) => s + totalGained);

        // Win check
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (newBoard[r][c] === 2048) setIsWon(true);
          }
        }
      }
    },
    [board, isGameOver, soundEnabled]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move("left");
      else if (e.key === "ArrowRight") move("right");
      else if (e.key === "ArrowUp") move("up");
      else if (e.key === "ArrowDown") move("down");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  const tileColors: Record<number, string> = {
    2: "bg-slate-800 text-slate-200 border-slate-700",
    4: "bg-slate-700 text-slate-100 border-slate-600",
    8: "bg-amber-600 text-white border-amber-500",
    16: "bg-orange-600 text-white border-orange-500",
    32: "bg-rose-600 text-white border-rose-500",
    64: "bg-red-600 text-white border-red-500",
    128: "bg-yellow-500 text-slate-900 border-yellow-400 font-extrabold shadow-lg shadow-yellow-500/20",
    256: "bg-yellow-400 text-slate-900 border-yellow-300 font-extrabold shadow-lg shadow-yellow-400/30",
    512: "bg-emerald-500 text-white border-emerald-400 font-extrabold shadow-lg shadow-emerald-500/30",
    1024: "bg-indigo-600 text-white border-indigo-400 font-extrabold shadow-xl shadow-indigo-500/40",
    2048: "bg-purple-600 text-white border-purple-400 font-black shadow-2xl shadow-purple-500/50",
  };

  return (
    <GameContainer
      slug="2048"
      title="Daily 2048"
      category="Math"
      instructions={[
        "Slide tiles using Arrow Keys or on-screen directional buttons.",
        "When two tiles with the same number touch, they merge into one!",
        "Aim for 2048 or achieve the highest daily high score.",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={score}
      onRestart={initGame}
    >
      <div className="flex flex-col items-center select-none">
        <div className="mb-4 flex items-center justify-between w-full max-w-xs px-2">
          <div className="text-xs uppercase font-bold text-slate-400">Current Score</div>
          <div className="text-2xl font-black text-indigo-400">{score}</div>
        </div>

        {/* 4x4 Grid */}
        <div className="grid grid-cols-4 gap-2 rounded-2xl border-2 border-slate-700 bg-slate-950 p-2.5 shadow-2xl">
          {board.map((row, r) =>
            row.map((val, c) => {
              const style =
                val > 0
                  ? tileColors[val] || "bg-purple-700 text-white"
                  : "bg-slate-900/60 border-slate-800 text-transparent";

              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border text-xl sm:text-2xl font-extrabold transition-all duration-100 ${style}`}
                >
                  {val > 0 ? val : ""}
                </div>
              );
            })
          )}
        </div>

        {/* Direction Controls for Touch/Mobile */}
        <div className="mt-6 grid grid-cols-3 gap-2 w-48">
          <div />
          <button
            onClick={() => move("up")}
            className="flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            onClick={() => move("left")}
            className="flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => move("down")}
            className="flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => move("right")}
            className="flex h-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 active:scale-95 shadow"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
