"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

export default function TowerOfHanoiGame() {
  const { soundEnabled } = useStore();
  const [pegs, setPegs] = useState<number[][]>([[4, 3, 2, 1], [], []]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initGame = () => {
    setPegs([[4, 3, 2, 1], [], []]);
    setSelectedPeg(null);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handlePegClick = (pegIdx: number) => {
    if (isWon) return;

    if (selectedPeg === null) {
      if (pegs[pegIdx].length === 0) return;
      if (soundEnabled) soundFx.playPop();
      setSelectedPeg(pegIdx);
    } else {
      if (selectedPeg === pegIdx) {
        setSelectedPeg(null);
        return;
      }

      const source = [...pegs[selectedPeg]];
      const target = [...pegs[pegIdx]];
      const movingDisk = source[source.length - 1];
      const targetTop = target[target.length - 1];

      // Legal move: movingDisk must be smaller than targetTop
      if (targetTop === undefined || movingDisk < targetTop) {
        if (soundEnabled) soundFx.playPop();
        source.pop();
        target.push(movingDisk);

        const nextPegs = pegs.map((p, idx) =>
          idx === selectedPeg ? source : idx === pegIdx ? target : p
        );
        setPegs(nextPegs);
        setSelectedPeg(null);
        setMoves((m) => m + 1);

        // Win check: Peg 2 has all 4 disks
        if (nextPegs[2].length === 4) {
          setIsWon(true);
        }
      } else {
        if (soundEnabled) soundFx.playError();
        setSelectedPeg(null);
      }
    }
  };

  const diskColors: Record<number, string> = {
    1: "w-16 bg-amber-500 border-amber-400",
    2: "w-24 bg-emerald-500 border-emerald-400",
    3: "w-32 bg-blue-500 border-blue-400",
    4: "w-40 bg-purple-600 border-purple-500",
  };

  return (
    <GameContainer
      slug="tower-of-hanoi"
      title="Daily Tower of Hanoi"
      category="Logic"
      instructions={[
        "Move the entire stack of 4 rings from the left peg to the right peg.",
        "You can only move one top ring at a time.",
        "No larger ring may ever be placed on top of a smaller ring.",
        "The mathematical minimum moves for 4 rings is 15!",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? Math.max(200, 700 - moves * 15) : 0}
      onRestart={initGame}
    >
      <div className="flex flex-col items-center select-none w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between w-full px-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          <div>Minimum Moves: <strong className="text-indigo-400">15</strong></div>
          <div>Moves Made: <strong className="text-white text-sm">{moves}</strong></div>
        </div>

        {/* 3 Hanoi Pegs */}
        <div className="grid grid-cols-3 gap-4 w-full h-64 items-end rounded-2xl border-2 border-slate-700 bg-slate-950 p-4 shadow-2xl">
          {[0, 1, 2].map((pegIdx) => {
            const isSelected = selectedPeg === pegIdx;
            const disks = pegs[pegIdx];

            return (
              <button
                key={pegIdx}
                onClick={() => handlePegClick(pegIdx)}
                className={`relative flex flex-col-reverse items-center h-full w-full rounded-xl transition border ${
                  isSelected
                    ? "border-indigo-400 bg-indigo-950/40 ring-2 ring-indigo-400"
                    : "border-transparent hover:bg-slate-900/60"
                }`}
              >
                {/* Vertical Rod */}
                <div className="absolute bottom-0 w-2.5 h-44 rounded-t-full bg-slate-700 -z-0" />

                {/* Disks stacked */}
                <div className="flex flex-col-reverse items-center gap-1.5 w-full z-10 pb-1">
                  {disks.map((d) => (
                    <div
                      key={d}
                      className={`h-7 rounded-lg border-2 shadow-md flex items-center justify-center text-xs font-black text-white transition-all ${diskColors[d]}`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Base label */}
                <span className="absolute -bottom-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Peg {pegIdx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
}
