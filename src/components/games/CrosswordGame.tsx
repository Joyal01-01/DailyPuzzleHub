"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { CROSSWORD_PUZZLES } from "@/lib/gameData";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

export default function CrosswordGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [puzzle, setPuzzle] = useState(CROSSWORD_PUZZLES[0]);
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: 5 }, () => Array(5).fill(""))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number]>([0, 0]);
  const [direction, setDirection] = useState<"across" | "down">("across");
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    const rng = createSeededRng(`crossword_${dateStr}`);
    const idx = Math.floor(rng() * CROSSWORD_PUZZLES.length);
    setPuzzle(CROSSWORD_PUZZLES[idx]);
    setGrid(Array.from({ length: 5 }, () => Array(5).fill("")));
    setSelectedCell([0, 0]);
    setIsWon(false);
  }, [dateStr]);

  const handleCellClick = (r: number, c: number) => {
    if (selectedCell[0] === r && selectedCell[1] === c) {
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelectedCell([r, c]);
    }
  };

  const handleKeyInput = (char: string) => {
    if (isWon) return;
    const [r, c] = selectedCell;

    if (char === "BACKSPACE") {
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = "";
      setGrid(newGrid);
      if (soundEnabled) soundFx.playPop();

      // Step back
      if (direction === "across" && c > 0) setSelectedCell([r, c - 1]);
      else if (direction === "down" && r > 0) setSelectedCell([r - 1, c]);
      return;
    }

    if (/^[A-Za-z]$/.test(char)) {
      const upper = char.toUpperCase();
      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = upper;
      setGrid(newGrid);
      if (soundEnabled) soundFx.playPop();

      // Move forward
      if (direction === "across" && c < 4) setSelectedCell([r, c + 1]);
      else if (direction === "down" && r < 4) setSelectedCell([r + 1, c]);

      // Check win condition against across clues
      let solved = true;
      for (const item of puzzle.across) {
        for (let i = 0; i < item.answer.length; i++) {
          if (newGrid[item.row][item.col + i] !== item.answer[i]) {
            solved = false;
          }
        }
      }
      if (solved) setIsWon(true);
    }
  };

  // Keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") handleKeyInput("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyInput(e.key);
      else if (e.key === "ArrowRight" && selectedCell[1] < 4) setSelectedCell([selectedCell[0], selectedCell[1] + 1]);
      else if (e.key === "ArrowLeft" && selectedCell[1] > 0) setSelectedCell([selectedCell[0], selectedCell[1] - 1]);
      else if (e.key === "ArrowDown" && selectedCell[0] < 4) setSelectedCell([selectedCell[0] + 1, selectedCell[1]]);
      else if (e.key === "ArrowUp" && selectedCell[0] > 0) setSelectedCell([selectedCell[0] - 1, selectedCell[1]]);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCell, isWon, grid]);

  return (
    <GameContainer
      slug="crossword"
      title="Daily Mini Crossword"
      category="Word"
      instructions={[
        "Fill the 5x5 grid by reading the Across and Down clues.",
        "Click a selected cell to flip between Across and Down orientation.",
        "Type letters using your keyboard or click the cells.",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? 500 : 0}
      onRestart={() => {
        setGrid(Array.from({ length: 5 }, () => Array(5).fill("")));
        setIsWon(false);
      }}
    >
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 w-full max-w-2xl justify-center">
        {/* 5x5 Grid */}
        <div className="grid grid-cols-5 gap-1.5 rounded-2xl border-2 border-slate-700 bg-slate-950 p-2 shadow-2xl select-none">
          {grid.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selectedCell[0] === r && selectedCell[1] === c;
              const isInCurrentWord =
                direction === "across" ? selectedCell[0] === r : selectedCell[1] === c;

              let bg = "bg-slate-900 border-slate-700 text-white";
              if (isSelected) bg = "bg-indigo-600 border-indigo-400 text-white ring-2 ring-indigo-300";
              else if (isInCurrentWord) bg = "bg-indigo-950/60 border-indigo-700/60 text-indigo-100";

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border text-xl font-extrabold shadow transition ${bg}`}
                >
                  <span className="absolute top-1 left-1.5 text-[9px] font-bold text-slate-400">
                    {r === 0 && c === 0 ? "1" : ""}
                  </span>
                  {val}
                </button>
              );
            })
          )}
        </div>

        {/* Clues Column */}
        <div className="flex flex-col gap-4 w-full max-w-xs text-xs">
          <div>
            <h4 className="font-extrabold uppercase tracking-wider text-indigo-400 mb-2 border-b border-slate-800 pb-1">
              Across Clues
            </h4>
            <div className="space-y-1.5">
              {puzzle.across.map((item, idx) => (
                <div key={idx} className="text-slate-300">
                  <strong className="text-white mr-1.5">{item.num}.</strong>
                  {item.clue} ({item.answer.length})
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-extrabold uppercase tracking-wider text-purple-400 mb-2 border-b border-slate-800 pb-1">
              Down Clues
            </h4>
            <div className="space-y-1.5">
              {puzzle.down.map((item, idx) => (
                <div key={idx} className="text-slate-300">
                  <strong className="text-white mr-1.5">{item.num}.</strong>
                  {item.clue} ({item.answer.length})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GameContainer>
  );
}
