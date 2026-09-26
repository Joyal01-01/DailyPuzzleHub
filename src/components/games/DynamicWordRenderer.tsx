"use client";

import { useState } from "react";
import GameContainer from "./GameContainer";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

interface DynamicWordProps {
  game: {
    slug: string;
    title: string;
    category: string;
    configJson?: {
      targetWord: string;
      hint: string;
      maxGuesses?: number;
    };
  };
}

export default function DynamicWordRenderer({ game }: DynamicWordProps) {
  const { soundEnabled } = useStore();
  const target = (game.configJson?.targetWord || "SMART").toUpperCase();
  const hint = game.configJson?.hint || "Custom CMS word puzzle";
  const [currentGuess, setCurrentGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentGuess.length !== target.length || isWon || isGameOver) return;
    const upper = currentGuess.toUpperCase();
    const nextGuesses = [...guesses, upper];
    setGuesses(nextGuesses);
    setCurrentGuess("");

    if (upper === target) {
      if (soundEnabled) soundFx.playSuccess();
      setIsWon(true);
    } else {
      if (soundEnabled) soundFx.playError();
      if (nextGuesses.length >= (game.configJson?.maxGuesses || 6)) {
        setIsGameOver(true);
      }
    }
  };

  return (
    <GameContainer
      slug={game.slug}
      title={game.title}
      category={game.category}
      instructions={[`Guess the ${target.length}-letter word based on the admin clue.`]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={500}
    >
      <div className="flex flex-col items-center w-full max-w-sm select-none">
        <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3 text-center text-xs text-indigo-300">
          <strong>Admin Clue:</strong> {hint}
        </div>

        <div className="flex flex-col gap-2 mb-6">
          {guesses.map((g, idx) => (
            <div key={idx} className="flex gap-2">
              {g.split("").map((ch, ci) => (
                <div
                  key={ci}
                  className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-xl text-white ${
                    ch === target[ci]
                      ? "bg-emerald-600 border border-emerald-400"
                      : target.includes(ch)
                      ? "bg-amber-600 border border-amber-400"
                      : "bg-slate-800 border border-slate-700 text-slate-400"
                  }`}
                >
                  {ch}
                </div>
              ))}
            </div>
          ))}
        </div>

        {!isWon && !isGameOver && (
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <input
              type="text"
              maxLength={target.length}
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
              placeholder={`Enter ${target.length} letters...`}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center font-bold tracking-widest text-white uppercase focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 font-bold text-white hover:bg-indigo-500 transition"
            >
              Guess
            </button>
          </form>
        )}
      </div>
    </GameContainer>
  );
}
