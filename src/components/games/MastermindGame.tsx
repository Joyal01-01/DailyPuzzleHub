"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Check, Delete } from "lucide-react";

export default function MastermindGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [feedback, setFeedback] = useState<{ black: number; white: number }[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

  const initGame = () => {
    const rng = createSeededRng(`mastermind_${dateStr}`);
    const code: string[] = [];
    for (let i = 0; i < 4; i++) {
      code.push(COLORS[Math.floor(rng() * COLORS.length)]);
    }
    setSecretCode(code);
    setGuesses([]);
    setFeedback([]);
    setCurrentGuess([]);
    setIsWon(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, [dateStr]);

  const addColor = (col: string) => {
    if (currentGuess.length < 4 && !isWon && !isGameOver) {
      if (soundEnabled) soundFx.playPop();
      setCurrentGuess([...currentGuess, col]);
    }
  };

  const removeColor = () => {
    if (currentGuess.length > 0) {
      if (soundEnabled) soundFx.playPop();
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const submitGuess = () => {
    if (currentGuess.length !== 4 || isWon || isGameOver) return;

    let black = 0;
    let white = 0;

    const secretCopy = [...secretCode];
    const guessCopy = [...currentGuess];

    // Check exact matches (black pegs)
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        black++;
        secretCopy[i] = "";
        guessCopy[i] = "-";
      }
    }

    // Check color matches in wrong spot (white pegs)
    for (let i = 0; i < 4; i++) {
      if (guessCopy[i] !== "-") {
        const foundIdx = secretCopy.indexOf(guessCopy[i]);
        if (foundIdx !== -1) {
          white++;
          secretCopy[foundIdx] = "";
        }
      }
    }

    const nextGuesses = [...guesses, currentGuess];
    const nextFeedback = [...feedback, { black, white }];

    setGuesses(nextGuesses);
    setFeedback(nextFeedback);
    setCurrentGuess([]);

    if (black === 4) {
      setIsWon(true);
    } else if (nextGuesses.length >= 8) {
      setIsGameOver(true);
    } else {
      if (soundEnabled) soundFx.playPop();
    }
  };

  return (
    <GameContainer
      slug="mastermind"
      title="Daily Mastermind"
      category="Logic"
      instructions={[
        "Deduce the secret 4-color pattern in 8 turns or fewer.",
        "Black peg (⚫): Correct color in the exact position.",
        "White peg (⚪): Correct color in the wrong position.",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={isWon ? Math.max(150, 700 - guesses.length * 70) : 0}
      onRevive={() => setIsGameOver(false)}
      onRestart={initGame}
    >
      <div className="flex flex-col items-center select-none w-full max-w-sm">
        {/* Previous Guesses Board */}
        <div className="flex flex-col gap-2 w-full mb-6">
          {Array.from({ length: 8 }).map((_, rowIdx) => {
            const rowGuess = guesses[rowIdx];
            const isCurrent = rowIdx === guesses.length;
            const fb = feedback[rowIdx];

            return (
              <div
                key={rowIdx}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-sm"
              >
                {/* 4 Peg Slots */}
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const color = rowGuess
                      ? rowGuess[slotIdx]
                      : isCurrent
                      ? currentGuess[slotIdx]
                      : null;

                    return (
                      <div
                        key={slotIdx}
                        style={{ backgroundColor: color || undefined }}
                        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 transition ${
                          color
                            ? "border-white/50 shadow-md"
                            : "border-dashed border-slate-700 bg-slate-900/60"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Feedback Pegs (2x2) */}
                <div className="grid grid-cols-2 gap-1 w-10 h-10 p-1 rounded-lg bg-slate-900 border border-slate-800 items-center justify-items-center">
                  {fb ? (
                    <>
                      {Array.from({ length: fb.black }).map((_, i) => (
                        <div key={`b-${i}`} className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm" />
                      ))}
                      {Array.from({ length: fb.white }).map((_, i) => (
                        <div key={`w-${i}`} className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
                      ))}
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Color Palette Selector */}
        <div className="flex items-center gap-2 mb-4">
          {COLORS.map((col) => (
            <button
              key={col}
              onClick={() => addColor(col)}
              style={{ backgroundColor: col }}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border-2 border-white/40 shadow-lg hover:scale-110 active:scale-95 transition"
            />
          ))}
        </div>

        {/* Submit & Backspace */}
        <div className="flex gap-3">
          <button
            onClick={removeColor}
            disabled={currentGuess.length === 0}
            className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
          >
            <Delete className="w-4 h-4" />
            <span>Undo</span>
          </button>
          <button
            onClick={submitGuess}
            disabled={currentGuess.length !== 4}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            <Check className="w-4 h-4" />
            <span>Submit Code</span>
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
