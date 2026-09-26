"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Edit3, Eraser, CheckCircle, RefreshCw } from "lucide-react";

export default function SudokuGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [board, setBoard] = useState<number[][]>([]);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 0]);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Solved base sudoku template
  const BASE_SOLVED = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  // Generate deterministic puzzle by masking cells with daily seed
  useEffect(() => {
    const rng = createSeededRng(`sudoku_${dateStr}`);
    const newBoard = BASE_SOLVED.map((row) => [...row]);

    // Mask ~38 cells for standard medium difficulty
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (rng() > 0.45) {
          newBoard[r][c] = 0;
        }
      }
    }

    setInitialBoard(newBoard.map((row) => [...row]));
    setBoard(newBoard.map((row) => [...row]));
    setNotes({});
    setMistakes(0);
    setIsWon(false);
    setIsGameOver(false);
  }, [dateStr]);

  const handleInputNumber = (num: number) => {
    if (!selectedCell || isWon || isGameOver) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return; // Clue cell

    const key = `${r}-${c}`;
    if (isNoteMode) {
      if (soundEnabled) soundFx.playPop();
      const currentNotes = notes[key] || [];
      const updated = currentNotes.includes(num)
        ? currentNotes.filter((n) => n !== num)
        : [...currentNotes, num].sort();
      setNotes({ ...notes, [key]: updated });
      return;
    }

    if (num === BASE_SOLVED[r][c]) {
      if (soundEnabled) soundFx.playPop();
      const nextBoard = board.map((row, ri) =>
        ri === r ? row.map((cell, ci) => (ci === c ? num : cell)) : row
      );
      setBoard(nextBoard);

      // Check win
      let complete = true;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (nextBoard[i][j] !== BASE_SOLVED[i][j]) complete = false;
        }
      }
      if (complete) setIsWon(true);
    } else {
      // Mistake
      if (soundEnabled) soundFx.playError();
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 3) {
        setIsGameOver(true);
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;
    const nextBoard = board.map((row, ri) =>
      ri === r ? row.map((cell, ci) => (ci === c ? 0 : cell)) : row
    );
    setBoard(nextBoard);
    const key = `${r}-${c}`;
    const nextNotes = { ...notes };
    delete nextNotes[key];
    setNotes(nextNotes);
  };

  return (
    <GameContainer
      slug="sudoku"
      title="Daily Sudoku"
      category="Logic"
      instructions={[
        "Fill each row, column, and 3x3 box with digits 1-9 without repeating.",
        "Toggle Note Mode to jot pencil marks.",
        "You have up to 3 allowed mistakes before game over.",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={isWon ? Math.max(150, 600 - mistakes * 100) : 0}
      onRevive={() => {
        setMistakes(2);
        setIsGameOver(false);
      }}
      onRestart={() => {
        setBoard(initialBoard.map((row) => [...row]));
        setNotes({});
        setMistakes(0);
        setIsGameOver(false);
      }}
    >
      <div className="flex flex-col items-center">
        {/* Status bar */}
        <div className="mb-4 flex items-center justify-between w-full max-w-sm text-xs font-semibold text-slate-300">
          <div>Difficulty: <strong className="text-indigo-400">Daily Regular</strong></div>
          <div>Mistakes: <strong className={mistakes > 1 ? "text-rose-400" : "text-amber-400"}>{mistakes}/3</strong></div>
        </div>

        {/* 9x9 Sudoku Board */}
        <div className="grid grid-cols-9 rounded-xl border-2 border-slate-700 bg-slate-950 p-1 shadow-2xl select-none">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isInitial = initialBoard[r]?.[c] !== 0;
              const borderRight = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-r-indigo-500/50" : "border-r border-r-slate-800";
              const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-b-indigo-500/50" : "border-b border-b-slate-800";

              let bg = "bg-slate-900/60 hover:bg-slate-800/80";
              if (isSelected) bg = "bg-indigo-600/40 ring-2 ring-indigo-400";
              else if (selectedCell && (selectedCell[0] === r || selectedCell[1] === c)) bg = "bg-slate-800/40";

              const cellNotes = notes[`${r}-${c}`] || [];

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => setSelectedCell([r, c])}
                  className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center text-base sm:text-lg font-bold transition ${borderRight} ${borderBottom} ${bg} ${
                    isInitial ? "text-white font-extrabold" : "text-indigo-300"
                  }`}
                >
                  {val !== 0 ? (
                    val
                  ) : cellNotes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0.5 text-[8px] sm:text-[9px] text-slate-400 leading-none">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span key={n}>{cellNotes.includes(n) ? n : ""}</span>
                      ))}
                    </div>
                  ) : (
                    ""
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Numpad & Controls */}
        <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setIsNoteMode(!isNoteMode)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                isNoteMode
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Notes: {isNoteMode ? "ON" : "OFF"}</span>
            </button>
            <button
              onClick={handleErase}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Erase</span>
            </button>
          </div>

          <div className="grid grid-cols-9 gap-1 sm:gap-2 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleInputNumber(num)}
                className="h-11 sm:h-12 rounded-lg border border-slate-700 bg-slate-800 font-extrabold text-white text-base hover:bg-indigo-600 transition active:scale-95 shadow"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameContainer>
  );
}
