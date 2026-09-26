"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

export default function SlidingTileGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  // Generate solvable puzzle by performing random legal slides from solved state
  const initGame = () => {
    const rng = createSeededRng(`sliding_${dateStr}`);
    let state = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let emptyIdx = 8;

    // 40 random legal moves
    for (let step = 0; step < 40; step++) {
      const row = Math.floor(emptyIdx / 3);
      const col = emptyIdx % 3;
      const neighbors: number[] = [];

      if (row > 0) neighbors.push(emptyIdx - 3);
      if (row < 2) neighbors.push(emptyIdx + 3);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < 2) neighbors.push(emptyIdx + 1);

      const target = neighbors[Math.floor(rng() * neighbors.length)];
      [state[emptyIdx], state[target]] = [state[target], state[emptyIdx]];
      emptyIdx = target;
    }

    setTiles(state);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, [dateStr]);

  const handleTileClick = (idx: number) => {
    if (isWon) return;
    const emptyIdx = tiles.indexOf(0);
    const r1 = Math.floor(idx / 3);
    const c1 = idx % 3;
    const r2 = Math.floor(emptyIdx / 3);
    const c2 = emptyIdx % 3;

    // Must be orthogonally adjacent
    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!isAdjacent) return;

    if (soundEnabled) soundFx.playPop();
    const nextTiles = [...tiles];
    [nextTiles[idx], nextTiles[emptyIdx]] = [nextTiles[emptyIdx], nextTiles[idx]];
    setTiles(nextTiles);
    setMoves((m) => m + 1);

    // Win check
    if (nextTiles.every((val, i) => (i === 8 ? val === 0 : val === i + 1))) {
      setIsWon(true);
    }
  };

  return (
    <GameContainer
      slug="sliding-tile"
      title="Daily Sliding Tile"
      category="Logic"
      instructions={[
        "Slide tiles into the empty space to arrange numbers 1 through 8 in order.",
        "Click any tile orthogonally adjacent to the empty spot.",
        "Solve in as few moves as possible.",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? Math.max(150, 600 - moves * 10) : 0}
      onRestart={initGame}
    >
      <div className="flex flex-col items-center select-none">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Moves Made: <strong className="text-white text-sm">{moves}</strong>
        </div>

        {/* 3x3 Sliding Grid */}
        <div className="grid grid-cols-3 gap-2.5 rounded-2xl border-2 border-slate-700 bg-slate-950 p-3 shadow-2xl">
          {tiles.map((val, idx) => {
            const isEmpty = val === 0;

            return (
              <button
                key={idx}
                onClick={() => !isEmpty && handleTileClick(idx)}
                className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-xl border text-2xl sm:text-3xl font-black transition-all shadow ${
                  isEmpty
                    ? "border-dashed border-slate-800 bg-slate-900/30 text-transparent cursor-default"
                    : "border-indigo-500/40 bg-gradient-to-tr from-slate-800 to-slate-700 text-white hover:border-indigo-400 active:scale-95"
                }`}
              >
                {!isEmpty && val}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
}
