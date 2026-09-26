"use client";

import { useState, useEffect, useCallback } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Flag, Bomb } from "lucide-react";

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  count: number;
}

export default function MinesweeperGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [minesCount, setMinesCount] = useState(10);

  const initGame = useCallback(() => {
    const rng = createSeededRng(`mines_${dateStr}`);
    const rows = 9;
    const cols = 9;
    const totalMines = 10;

    // Create empty grid
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      newGrid[r] = [];
      for (let c = 0; c < cols; c++) {
        newGrid[r][c] = {
          r,
          c,
          isMine: false,
          isOpen: false,
          isFlagged: false,
          count: 0,
        };
      }
    }

    // Place 10 deterministic mines
    let placed = 0;
    while (placed < totalMines) {
      const r = Math.floor(rng() * rows);
      const c = Math.floor(rng() * cols);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighboring mine counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].isMine) continue;
        let neighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].isMine) {
              neighbors++;
            }
          }
        }
        newGrid[r][c].count = neighbors;
      }
    }

    setGrid(newGrid);
    setIsWon(false);
    setIsGameOver(false);
    setMinesCount(10);
  }, [dateStr]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const revealCell = (r: number, c: number) => {
    if (isWon || isGameOver) return;
    const cell = grid[r][c];
    if (cell.isOpen || cell.isFlagged) return;

    if (flagMode) {
      toggleFlag(r, c);
      return;
    }

    if (cell.isMine) {
      if (soundEnabled) soundFx.playError();
      // Reveal all mines
      const revealed = grid.map((row) =>
        row.map((cl) => (cl.isMine ? { ...cl, isOpen: true } : cl))
      );
      setGrid(revealed);
      setIsGameOver(true);
      return;
    }

    if (soundEnabled) soundFx.playPop();

    // Flood reveal
    const newGrid = grid.map((row) => row.map((cl) => ({ ...cl })));
    const queue: [number, number][] = [[r, c]];
    newGrid[r][c].isOpen = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      if (newGrid[currR][currC].count === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (
              nr >= 0 &&
              nr < 9 &&
              nc >= 0 &&
              nc < 9 &&
              !newGrid[nr][nc].isOpen &&
              !newGrid[nr][nc].isMine
            ) {
              newGrid[nr][nc].isOpen = true;
              if (newGrid[nr][nc].count === 0) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    setGrid(newGrid);

    // Check Win
    let unrevealedNonMines = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!newGrid[row][col].isMine && !newGrid[row][col].isOpen) {
          unrevealedNonMines++;
        }
      }
    }
    if (unrevealedNonMines === 0) {
      setIsWon(true);
    }
  };

  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isWon || isGameOver) return;
    const cell = grid[r][c];
    if (cell.isOpen) return;

    if (soundEnabled) soundFx.playPop();
    const newGrid = grid.map((row) => row.map((cl) => ({ ...cl })));
    const nextFlagged = !cell.isFlagged;
    newGrid[r][c].isFlagged = nextFlagged;
    setGrid(newGrid);
    setMinesCount((prev) => (nextFlagged ? prev - 1 : prev + 1));
  };

  const numberColors: Record<number, string> = {
    1: "text-blue-400",
    2: "text-emerald-400",
    3: "text-rose-400",
    4: "text-indigo-400",
    5: "text-amber-400",
    6: "text-teal-400",
    7: "text-purple-400",
    8: "text-pink-400",
  };

  return (
    <GameContainer
      slug="minesweeper"
      title="Daily Minesweeper"
      category="Logic"
      instructions={[
        "Uncover all 71 safe tiles on the 9x9 board without detonating any of the 10 mines.",
        "Numbered tiles show how many adjacent mines surround that spot.",
        "Toggle Flag mode to mark hazards.",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={isWon ? 500 : 0}
      onRevive={() => {
        // Re-cover the detonated mine and give a safe second chance!
        const restored = grid.map((row) =>
          row.map((cl) => (cl.isMine ? { ...cl, isOpen: false, isFlagged: true } : cl))
        );
        setGrid(restored);
        setIsGameOver(false);
      }}
      onRestart={initGame}
    >
      <div className="flex flex-col items-center">
        {/* Minesweeper Header Bar */}
        <div className="mb-4 flex items-center justify-between w-full max-w-sm rounded-xl border border-slate-700 bg-slate-950 p-2.5">
          <div className="flex items-center gap-1 font-mono font-bold text-rose-400 text-sm">
            <Bomb className="w-4 h-4" />
            <span>{String(minesCount).padStart(2, "0")} Mines</span>
          </div>

          <button
            onClick={initGame}
            className="text-2xl transition hover:scale-110 active:scale-95"
          >
            {isWon ? "😎" : isGameOver ? "😵" : "😊"}
          </button>

          <button
            onClick={() => setFlagMode(!flagMode)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              flagMode
                ? "bg-rose-600 text-white"
                : "border border-slate-700 bg-slate-800 text-slate-300"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{flagMode ? "FLAG ON" : "DIG"}</span>
          </button>
        </div>

        {/* 9x9 Grid */}
        <div className="grid grid-cols-9 gap-1 rounded-xl border-2 border-slate-700 bg-slate-950 p-2 shadow-2xl select-none">
          {grid.map((row, r) =>
            row.map((cell, c) => {
              let content = null;
              let bg = "bg-slate-800 hover:bg-slate-700 border border-slate-700";

              if (cell.isOpen) {
                if (cell.isMine) {
                  bg = "bg-rose-900/80 border border-rose-600";
                  content = <Bomb className="w-4 h-4 text-white animate-pulse" />;
                } else {
                  bg = "bg-slate-900 border border-slate-800";
                  if (cell.count > 0) {
                    content = (
                      <span className={`font-extrabold ${numberColors[cell.count]}`}>
                        {cell.count}
                      </span>
                    );
                  }
                }
              } else if (cell.isFlagged) {
                content = <Flag className="w-4 h-4 text-rose-500 fill-rose-500" />;
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => toggleFlag(r, c, e)}
                  className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg text-sm sm:text-base font-bold shadow transition active:scale-95 ${bg}`}
                >
                  {content}
                </button>
              );
            })
          )}
        </div>
      </div>
    </GameContainer>
  );
}
