"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString, shuffleWithRng } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Shuffle, ArrowDown, RefreshCw } from "lucide-react";

export default function AnagramGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [targetWord, setTargetWord] = useState("JOURNEY");
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [hint, setHint] = useState("");

  const SEVEN_LETTER_WORDS = [
    { word: "JOURNEY", hint: "An act of traveling from one place to another" },
    { word: "CRYSTAL", hint: "A clear, transparent mineral or glass structure" },
    { word: "HARMONY", hint: "Pleasing arrangement of parts; musical accord" },
    { word: "FEATHER", hint: "Light, plumage outgrowth on a bird's skin" },
    { word: "MYSTERY", hint: "Something that is difficult or impossible to explain" },
    { word: "DYNAMIC", hint: "Characterized by constant change, activity, or progress" },
    { word: "HORIZON", hint: "The line at which the earth's surface and sky appear to meet" },
  ];

  useEffect(() => {
    const rng = createSeededRng(`anagram_${dateStr}`);
    const chosen = SEVEN_LETTER_WORDS[Math.floor(rng() * SEVEN_LETTER_WORDS.length)];
    setTargetWord(chosen.word);
    setHint(chosen.hint);

    const letters = chosen.word.split("");
    setScrambled(shuffleWithRng(letters, rng));
    setCurrentGuess([]);
    setIsWon(false);
  }, [dateStr]);

  const selectTile = (letter: string, index: number) => {
    if (isWon) return;
    if (soundEnabled) soundFx.playPop();

    // Remove letter from scrambled and push to guess
    const newScrambled = [...scrambled];
    newScrambled.splice(index, 1);
    setScrambled(newScrambled);

    const nextGuess = [...currentGuess, letter];
    setCurrentGuess(nextGuess);

    // If filled all letters, check win
    if (nextGuess.length === targetWord.length) {
      if (nextGuess.join("") === targetWord) {
        setIsWon(true);
      } else {
        if (soundEnabled) soundFx.playError();
      }
    }
  };

  const removeGuessTile = (letter: string, index: number) => {
    if (isWon) return;
    if (soundEnabled) soundFx.playPop();

    const nextGuess = [...currentGuess];
    nextGuess.splice(index, 1);
    setCurrentGuess(nextGuess);

    setScrambled([...scrambled, letter]);
  };

  const handleShuffle = () => {
    setScrambled([...scrambled].sort(() => Math.random() - 0.5));
  };

  return (
    <GameContainer
      slug="anagrams"
      title="Daily Anagram Scramble"
      category="Word"
      instructions={[
        "Unscramble the 7 letters to form the secret target word.",
        "Click the available letters to place them into your guess slots.",
        "Click letters in the guess slots to return them.",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? 500 : 0}
      onRestart={() => {
        setScrambled(targetWord.split("").sort(() => Math.random() - 0.5));
        setCurrentGuess([]);
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center w-full max-w-md select-none">
        {/* Clue/Hint */}
        <div className="mb-6 rounded-xl border border-indigo-500/30 bg-indigo-950/30 px-4 py-2 text-center text-xs text-indigo-300">
          <strong>Daily Clue:</strong> {hint}
        </div>

        {/* Current Guess Slot */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: targetWord.length }).map((_, idx) => {
            const letter = currentGuess[idx];
            return (
              <button
                key={idx}
                onClick={() => letter && removeGuessTile(letter, idx)}
                className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border-2 text-xl font-black shadow-md transition ${
                  letter
                    ? "border-indigo-400 bg-indigo-600 text-white hover:bg-indigo-500 animate-tile-pop"
                    : "border-dashed border-slate-700 bg-slate-900/60 text-transparent"
                }`}
              >
                {letter || ""}
              </button>
            );
          })}
        </div>

        <ArrowDown className="w-5 h-5 text-slate-500 mb-6 animate-bounce" />

        {/* Available Scrambled Letter Bank */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[56px]">
          {scrambled.map((letter, idx) => (
            <button
              key={idx}
              onClick={() => selectTile(letter, idx)}
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-xl font-black text-white shadow-lg hover:bg-slate-700 active:scale-95 transition"
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle Remaining</span>
          </button>
          <button
            onClick={() => {
              setScrambled([...scrambled, ...currentGuess]);
              setCurrentGuess([]);
            }}
            disabled={currentGuess.length === 0}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
