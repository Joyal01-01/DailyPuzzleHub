"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Lightbulb } from "lucide-react";

export default function LightsOutGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Initialize 4x4 grid by pressing 6 random buttons from an all-off board (guarantees solvability!)
  const initGame = () => {
    const rng = createSeededRng(`lights_${dateStr}`);
    const g = Array.from({ length: 4 }, () => Array(4).fill(false));

    const toggle = (board: boolean[][], r: number, c: number) => {
      const dirs = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
          board[nr][nc] = !board[nr][nc];
        }
      });
    };

    for (let i = 0; i < 6; i++) {
      const r = Math.floor(rng() * 4);
      const c = Math.floor(rng() * 4);
      toggle(g, r, c);
    }

    setGrid(g);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, [dateStr]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;
    if (soundEnabled) soundFx.playPop();

    const newGrid = grid.map((row) => [...row]);
    const dirs = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

    dirs.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
        newGrid[nr][nc] = !newGrid[nr][nc];
      }
    });

    setGrid(newGrid);
    setMoves((m) => m + 1);

    // Check if all lights are off
    const allOff = newGrid.every((row) => row.every((val) => !val));
    if (allOff) setIsWon(true);
  };

  return (
    <GameContainer
      slug="lights-out"
      title="Daily Lights Out"
      category="Logic"
      instructions={[
        "Turn off every illuminated bulb on the 4x4 grid.",
        "Clicking any bulb toggles its state and the state of its four adjacent neighbors.",
        "Solve the pattern in as few moves as possible!",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? Math.max(150, 600 - moves * 15) : 0}
      onRestart={initGame}
    >
      <div className="flex flex-col items-center select-none">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Moves Made: <strong className="text-white text-sm">{moves}</strong>
        </div>

        {/* 4x4 Lights Grid */}
        <div className="grid grid-cols-4 gap-2.5 rounded-2xl border-2 border-slate-700 bg-slate-950 p-3 shadow-2xl">
          {grid.map((row, r) =>
            row.map((isOn, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 transition-all duration-200 shadow-md active:scale-95 ${
                  isOn
                    ? "border-amber-400 bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/50 scale-102"
                    : "border-slate-800 bg-slate-900 text-slate-600 hover:border-slate-700"
                }`}
              >
                <Lightbulb className={`w-8 h-8 ${isOn ? "fill-slate-950" : ""}`} />
              </button>
            ))
          )}
        </div>
      </div>
    </GameContainer>
  );
}
