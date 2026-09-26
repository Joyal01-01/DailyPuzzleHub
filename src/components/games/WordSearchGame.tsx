"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Check } from "lucide-react";

export default function WordSearchGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [isWon, setIsWon] = useState(false);

  const WORD_BANK = [
    ["PLANET", "SATURN", "METEOR", "STAR", "COMET", "MOON"],
    ["TIGER", "FALCON", "DOLPHIN", "EAGLE", "PANDA", "WOLF"],
    ["EMERALD", "RUBY", "SAPPHIRE", "DIAMOND", "PEARL", "OPAL"],
  ];

  useEffect(() => {
    const rng = createSeededRng(`wordsearch_${dateStr}`);
    const bankIdx = Math.floor(rng() * WORD_BANK.length);
    const words = WORD_BANK[bankIdx];
    setTargetWords(words);
    setFoundWords([]);
    setSelectedCells([]);
    setIsWon(false);

    // Build 8x8 grid filled with letters
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const g: string[][] = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => letters[Math.floor(rng() * letters.length)])
    );

    // Place words horizontally or vertically deterministically
    words.forEach((w, wIdx) => {
      const isHorizontal = wIdx % 2 === 0;
      const r = (wIdx * 2) % 8;
      const c = 0;
      for (let i = 0; i < w.length && i < 8; i++) {
        if (isHorizontal) {
          g[r][i] = w[i];
        } else {
          g[i][(wIdx * 2 + 1) % 8] = w[i];
        }
      }
    });

    setGrid(g);
  }, [dateStr]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon) return;
    const exists = selectedCells.some(([cr, cc]) => cr === r && cc === c);
    let nextCells: [number, number][];

    if (exists) {
      nextCells = selectedCells.filter(([cr, cc]) => !(cr === r && cc === c));
    } else {
      if (soundEnabled) soundFx.playPop();
      nextCells = [...selectedCells, [r, c]];
    }

    setSelectedCells(nextCells);

    // Check if selected cells form any of the target words
    const formedWord = nextCells.map(([cr, cc]) => grid[cr][cc]).join("");
    const reversed = formedWord.split("").reverse().join("");

    for (const w of targetWords) {
      if (!foundWords.includes(w) && (formedWord === w || reversed === w)) {
        if (soundEnabled) soundFx.playSuccess();
        const nextFound = [...foundWords, w];
        setFoundWords(nextFound);
        setSelectedCells([]);
        if (nextFound.length === targetWords.length) {
          setIsWon(true);
        }
        break;
      }
    }
  };

  return (
    <GameContainer
      slug="word-search"
      title="Daily Word Search"
      category="Word"
      instructions={[
        "Find the 6 hidden words inside the 8x8 letter grid.",
        "Click letters sequentially to highlight and verify words.",
        "Words are placed horizontally and vertically.",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? 500 : 0}
      onRestart={() => {
        setFoundWords([]);
        setSelectedCells([]);
        setIsWon(false);
      }}
    >
      <div className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-2xl justify-center select-none">
        {/* 8x8 Grid */}
        <div className="grid grid-cols-8 gap-1 rounded-2xl border-2 border-slate-700 bg-slate-950 p-2 shadow-2xl">
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const isSelected = selectedCells.some(([cr, cc]) => cr === r && cc === c);

              let bg = "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800";
              if (isSelected) {
                bg = "bg-indigo-600 text-white border-indigo-400 scale-95 ring-2 ring-indigo-300";
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg border text-sm sm:text-base font-extrabold shadow transition active:scale-95 ${bg}`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>

        {/* Target Words List */}
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
            Words to Find ({foundWords.length}/{targetWords.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {targetWords.map((word) => {
              const isFound = foundWords.includes(word);
              return (
                <div
                  key={word}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    isFound
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 line-through opacity-70"
                      : "border-slate-800 bg-slate-900 text-white"
                  }`}
                >
                  <span>{word}</span>
                  {isFound && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setSelectedCells([])}
            className="mt-3 rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
