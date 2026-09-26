"use client";

import { useState, useEffect, useCallback } from "react";
import GameContainer from "./GameContainer";
import { TARGET_WORDS, VALID_GUESS_SET } from "@/lib/gameData";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

export default function WordleGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [invalidShake, setInvalidShake] = useState(false);

  // Initialize daily word
  useEffect(() => {
    const rng = createSeededRng(`wordle_${dateStr}`);
    const wordIdx = Math.floor(rng() * TARGET_WORDS.length);
    setTargetWord(TARGET_WORDS[wordIdx].toUpperCase());
  }, [dateStr]);

  const maxGuesses = 6;

  const handleKey = useCallback(
    (key: string) => {
      if (isWon || isGameOver) return;

      if (key === "ENTER") {
        if (currentGuess.length !== 5) {
          setInvalidShake(true);
          if (soundEnabled) soundFx.playError();
          setTimeout(() => setInvalidShake(false), 400);
          return;
        }

        const upperGuess = currentGuess.toUpperCase();
        if (!VALID_GUESS_SET.has(currentGuess.toLowerCase())) {
          setInvalidShake(true);
          if (soundEnabled) soundFx.playError();
          setTimeout(() => setInvalidShake(false), 400);
          return;
        }

        if (soundEnabled) soundFx.playPop();
        const nextGuesses = [...guesses, upperGuess];
        setGuesses(nextGuesses);
        setCurrentGuess("");

        if (upperGuess === targetWord) {
          setIsWon(true);
        } else if (nextGuesses.length >= maxGuesses) {
          setIsGameOver(true);
        }
      } else if (key === "BACKSPACE" || key === "DEL") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        if (soundEnabled) soundFx.playPop();
      } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key.toUpperCase());
        if (soundEnabled) soundFx.playPop();
      }
    },
    [currentGuess, guesses, isWon, isGameOver, soundEnabled, targetWord]
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

  // Revival (adds 2 extra guesses)
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
        "Guess the secret 5-letter word in 6 attempts.",
        "Green tile: Letter is correct and in the right spot.",
        "Yellow tile: Letter is in the word but in the wrong spot.",
        "Gray tile: Letter is not in the secret word at all.",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={isWon ? Math.max(100, 700 - guesses.length * 100) : 0}
      onRevive={handleRevive}
      onRestart={() => {
        setGuesses([]);
        setCurrentGuess("");
        setIsWon(false);
        setIsGameOver(false);
      }}
    >
      <div className="flex flex-col items-center">
        {/* Wordle Grid */}
        <div className="grid grid-rows-6 gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, rowIdx) => {
            const isCurrentRow = rowIdx === guesses.length;
            const guess = guesses[rowIdx] || "";

            return (
              <div
                key={rowIdx}
                className={`grid grid-cols-5 gap-2 ${
                  isCurrentRow && invalidShake ? "animate-shake" : ""
                }`}
              >
                {Array.from({ length: 5 }).map((_, colIdx) => {
                  let letter = "";
                  let tileStyle =
                    "border-slate-700 bg-slate-900/60 text-white font-extrabold";

                  if (rowIdx < guesses.length) {
                    letter = guess[colIdx] || "";
                    const status = getLetterStatus(guess, letter, colIdx);
                    if (status === "correct") {
                      tileStyle = "bg-emerald-600 border-emerald-500 text-white animate-flip";
                    } else if (status === "present") {
                      tileStyle = "bg-amber-600 border-amber-500 text-white animate-flip";
                    } else {
                      tileStyle = "bg-slate-800 border-slate-700 text-slate-400";
                    }
                  } else if (isCurrentRow) {
                    letter = currentGuess[colIdx] || "";
                    if (letter) {
                      tileStyle =
                        "border-indigo-400 bg-slate-800 text-white scale-105 transition-transform";
                    }
                  }

                  return (
                    <div
                      key={colIdx}
                      className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border-2 text-xl sm:text-2xl transition-all shadow-md select-none ${tileStyle}`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Virtual Keyboard */}
        <div className="flex flex-col gap-1.5 w-full max-w-md">
          {keyboardRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((k) => {
                const status = keyStatuses[k];
                let bg = "bg-slate-800 hover:bg-slate-700 text-white";
                if (status === "correct") bg = "bg-emerald-600 text-white";
                else if (status === "present") bg = "bg-amber-600 text-white";
                else if (status === "absent") bg = "bg-slate-950 text-slate-500";

                const isSpecial = k === "ENTER" || k === "DEL";

                return (
                  <button
                    key={k}
                    onClick={() => handleKey(k)}
                    className={`flex items-center justify-center rounded-lg font-bold transition active:scale-95 shadow select-none ${
                      isSpecial
                        ? "px-3 sm:px-4 py-3 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200"
                        : "h-11 sm:h-12 w-8 sm:w-10 text-sm"
                    } ${bg}`}
                  >
                    {k}
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
