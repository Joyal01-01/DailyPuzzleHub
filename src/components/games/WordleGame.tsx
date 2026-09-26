"use client";

import { useState, useEffect, useCallback } from "react";
import GameContainer from "./GameContainer";
import { TARGET_WORDS, VALID_GUESS_SET } from "@/lib/gameData";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Sparkles, Delete } from "lucide-react";

export default function WordleGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [invalidShake, setInvalidShake] = useState(false);
  const [revealingRow, setRevealingRow] = useState<number | null>(null);

  // Initialize daily word deterministically
  useEffect(() => {
    const rng = createSeededRng(`wordle_${dateStr}`);
    const wordIdx = Math.floor(rng() * TARGET_WORDS.length);
    setTargetWord(TARGET_WORDS[wordIdx].toUpperCase());
  }, [dateStr]);

  const maxGuesses = 6;

  const handleKey = useCallback(
    (key: string) => {
      if (isWon || isGameOver || revealingRow !== null) return;

      if (key === "ENTER") {
        if (currentGuess.length !== 5) {
          setInvalidShake(true);
          if (soundEnabled) soundFx.playError();
          setTimeout(() => setInvalidShake(false), 500);
          return;
        }

        const upperGuess = currentGuess.toUpperCase();
        if (!VALID_GUESS_SET.has(currentGuess.toLowerCase())) {
          setInvalidShake(true);
          if (soundEnabled) soundFx.playError();
          setTimeout(() => setInvalidShake(false), 500);
          return;
        }

        if (soundEnabled) soundFx.playPop();
        const nextGuesses = [...guesses, upperGuess];
        const nextRowIdx = guesses.length;
        setRevealingRow(nextRowIdx);
        setGuesses(nextGuesses);
        setCurrentGuess("");

        // Reveal animation delay
        setTimeout(() => {
          setRevealingRow(null);
          if (upperGuess === targetWord) {
            setIsWon(true);
          } else if (nextGuesses.length >= maxGuesses) {
            setIsGameOver(true);
          }
        }, 5 * 200 + 100);
      } else if (key === "BACKSPACE" || key === "DEL") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        if (soundEnabled) soundFx.playPop();
      } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key.toUpperCase());
        if (soundEnabled) soundFx.playPop();
      }
    },
    [currentGuess, guesses, isWon, isGameOver, revealingRow, soundEnabled, targetWord]
  );

  // Handle physical keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Enter") handleKey("ENTER");
      else if (e.key === "Backspace") handleKey("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  // Revival (gives a second chance with current guesses intact)
  const handleRevive = () => {
    setIsGameOver(false);
  };

  const getLetterStatus = (guess: string, char: string, pos: number) => {
    if (targetWord[pos] === char) return "correct";
    if (targetWord.includes(char)) return "present";
    return "absent";
  };

  // Keyboard key statuses
  const keyStatuses: Record<string, string> = {};
  guesses.forEach((g) => {
    g.split("").forEach((char, idx) => {
      const status = getLetterStatus(g, char, idx);
      const existing = keyStatuses[char];
      if (status === "correct") keyStatuses[char] = "correct";
      else if (status === "present" && existing !== "correct") keyStatuses[char] = "present";
      else if (status === "absent" && !existing) keyStatuses[char] = "absent";
    });
  });

  const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
  ];

  return (
    <GameContainer
      slug="wordle"
      title="Daily Word Guess"
      category="Word"
      instructions={[
        "Deduce the secret 5-letter word in six refined attempts.",
        "Emerald tile: The letter is correct and situated in the precise position.",
        "Warm Gold tile: The letter belongs in the word, but occupies a different position.",
        "Charcoal tile: The letter does not appear anywhere in today's secret word.",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={isWon ? Math.max(150, 700 - guesses.length * 90) : 0}
      onRevive={handleRevive}
      onRestart={() => {
        setGuesses([]);
        setCurrentGuess("");
        setIsWon(false);
        setIsGameOver(false);
      }}
    >
      <div className="flex flex-col items-center select-none w-full max-w-lg">
        {/* Subtle Decorative Header Line */}
        <div className="mb-6 flex items-center gap-3 text-gold-500/40">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold-500/40" />
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span className="font-serif text-[10px] uppercase tracking-widest text-gold-400/80">
            Lexicon of the Day
          </span>
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold-500/40" />
        </div>

        {/* Wordle 5x6 Matrix */}
        <div className="grid grid-rows-6 gap-2 sm:gap-2.5 mb-8">
          {Array.from({ length: 6 }).map((_, rowIdx) => {
            const isCurrentRow = rowIdx === guesses.length;
            const guess = guesses[rowIdx] || "";

            return (
              <div
                key={rowIdx}
                className={`grid grid-cols-5 gap-2 sm:gap-2.5 ${
                  isCurrentRow && invalidShake ? "animate-shake" : ""
                }`}
              >
                {Array.from({ length: 5 }).map((_, colIdx) => {
                  let letter = "";
                  let tileStyle =
                    "border-white/10 bg-obsidian-900/60 text-slate-300 shadow-inner";

                  if (rowIdx < guesses.length) {
                    letter = guess[colIdx] || "";
                    const status = getLetterStatus(guess, letter, colIdx);
                    if (status === "correct") {
                      tileStyle =
                        "bg-gradient-to-b from-emerald-700 to-emerald-900 border-emerald-500/80 text-white shadow-lg shadow-emerald-900/40";
                    } else if (status === "present") {
                      tileStyle =
                        "bg-gradient-to-b from-amber-600 to-amber-800 border-amber-400/80 text-white shadow-lg shadow-amber-900/40";
                    } else {
                      tileStyle =
                        "bg-obsidian-800/80 border-white/5 text-slate-500";
                    }
                  } else if (isCurrentRow) {
                    letter = currentGuess[colIdx] || "";
                    if (letter) {
                      tileStyle =
                        "border-gold-500/70 bg-obsidian-850 text-gold-200 ring-1 ring-gold-500/30 scale-102 shadow-md";
                    }
                  }

                  return (
                    <div
                      key={colIdx}
                      style={{
                        animationDelay:
                          rowIdx === revealingRow ? `${colIdx * 150}ms` : "0ms",
                      }}
                      className={`flex h-13 w-13 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border text-2xl sm:text-3xl font-serif font-black tracking-wider transition-all duration-300 ${tileStyle} ${
                        rowIdx === revealingRow ? "animate-flip" : ""
                      }`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sophisticated Virtual Keyboard */}
        <div className="flex flex-col gap-1.5 sm:gap-2 w-full max-w-md">
          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((k) => {
                const status = keyStatuses[k];
                let bg =
                  "border border-white/10 bg-obsidian-850 text-slate-200 hover:border-gold-500/40 hover:bg-obsidian-800 hover:text-white";

                if (status === "correct") {
                  bg =
                    "border border-emerald-500/80 bg-emerald-800 text-white shadow-emerald-900/50";
                } else if (status === "present") {
                  bg =
                    "border border-amber-400/80 bg-amber-700 text-white shadow-amber-900/50";
                } else if (status === "absent") {
                  bg = "border-transparent bg-obsidian-950/80 text-slate-600";
                }

                const isSpecial = k === "ENTER" || k === "DEL";

                return (
                  <button
                    key={k}
                    onClick={() => handleKey(k)}
                    className={`flex items-center justify-center rounded-xl font-serif font-bold transition-all duration-150 active:scale-95 shadow-sm select-none ${
                      isSpecial
                        ? "px-3 sm:px-4 py-3 text-[11px] uppercase tracking-widest border border-gold-500/30 bg-obsidian-800 text-gold-300 hover:bg-obsidian-750"
                        : "h-11 sm:h-12 w-8 sm:w-10 text-sm tracking-wide"
                    } ${bg}`}
                  >
                    {k === "DEL" ? <Delete className="w-4 h-4 text-slate-300" /> : k}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GameContainer>
  );
}
