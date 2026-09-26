"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { CONNECTIONS_PUZZLES, ConnectionsGroup } from "@/lib/gameData";
import { createSeededRng, getUtcDateString, shuffleWithRng } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Shuffle, Check, Sparkles } from "lucide-react";

export default function ConnectionsGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [groups, setGroups] = useState<ConnectionsGroup[]>([]);
  const [unsolvedWords, setUnsolvedWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<ConnectionsGroup[]>([]);
  const [mistakesLeft, setMistakesLeft] = useState(4);
  const [message, setMessage] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const rng = createSeededRng(`connections_${dateStr}`);
    const puzzleIdx = Math.floor(rng() * CONNECTIONS_PUZZLES.length);
    const chosenPuzzle = CONNECTIONS_PUZZLES[puzzleIdx];
    setGroups(chosenPuzzle);

    const allWords = chosenPuzzle.flatMap((g) => g.words);
    setUnsolvedWords(shuffleWithRng(allWords, rng));
    setSelectedWords([]);
    setSolvedGroups([]);
    setMistakesLeft(4);
    setIsWon(false);
    setIsGameOver(false);
  }, [dateStr]);

  const toggleSelect = (word: string) => {
    if (isWon || isGameOver) return;
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else if (selectedWords.length < 4) {
      if (soundEnabled) soundFx.playPop();
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleShuffle = () => {
    setUnsolvedWords([...unsolvedWords].sort(() => Math.random() - 0.5));
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 4 || isWon || isGameOver) return;

    // Check if the 4 words match any remaining group
    const matchedGroup = groups.find((g) => {
      const matchCount = g.words.filter((w) => selectedWords.includes(w)).length;
      return matchCount === 4;
    });

    if (matchedGroup) {
      if (soundEnabled) soundFx.playSuccess();
      const nextSolved = [...solvedGroups, matchedGroup];
      setSolvedGroups(nextSolved);
      setUnsolvedWords(unsolvedWords.filter((w) => !matchedGroup.words.includes(w)));
      setSelectedWords([]);

      if (nextSolved.length === 4) {
        setIsWon(true);
      }
    } else {
      // Check for "One away..."
      let oneAway = false;
      for (const g of groups) {
        const matches = g.words.filter((w) => selectedWords.includes(w)).length;
        if (matches === 3) {
          oneAway = true;
          break;
        }
      }

      if (soundEnabled) soundFx.playError();
      const nextMistakes = mistakesLeft - 1;
      setMistakesLeft(nextMistakes);

      if (oneAway) {
        setMessage("One away...");
        setTimeout(() => setMessage(null), 1800);
      } else {
        setMessage("Incorrect group");
        setTimeout(() => setMessage(null), 1800);
      }

      if (nextMistakes <= 0) {
        setIsGameOver(true);
      }
    }
  };

  const groupColors = {
    yellow: "bg-amber-500/20 border-amber-500/40 text-amber-300",
    green: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    blue: "bg-blue-500/20 border-blue-500/40 text-blue-300",
    purple: "bg-purple-500/20 border-purple-500/40 text-purple-300",
  };

  return (
    <GameContainer
      slug="connections"
      title="Daily Connections"
      category="Word"
      instructions={[
        "Find groups of four items that share something in common.",
        "Select four items and press 'Submit' to check your guess.",
        "Yellow is the most direct category; Purple is the trickiest!",
        "You can make up to 4 mistakes.",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={isWon ? 500 : 0}
      onRevive={() => {
        setMistakesLeft(2);
        setIsGameOver(false);
      }}
      onRestart={() => {
        const allWords = groups.flatMap((g) => g.words);
        setUnsolvedWords(allWords.sort(() => Math.random() - 0.5));
        setSelectedWords([]);
        setSolvedGroups([]);
        setMistakesLeft(4);
        setIsGameOver(false);
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center w-full max-w-lg">
        {/* Banner Notification */}
        {message && (
          <div className="mb-4 rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-bold text-white shadow-lg animate-bounce">
            {message}
          </div>
        )}

        {/* Solved Categories */}
        <div className="flex flex-col gap-2 w-full mb-3">
          {solvedGroups.map((g, idx) => (
            <div
              key={idx}
              className={`rounded-xl border p-3 text-center transition-all animate-tile-pop ${
                groupColors[g.color]
              }`}
            >
              <div className="font-extrabold uppercase text-xs tracking-wider mb-1">
                {g.category}
              </div>
              <div className="text-sm font-semibold text-white">
                {g.words.join(", ")}
              </div>
            </div>
          ))}
        </div>

        {/* Unsolved Words Grid (4x4) */}
        {unsolvedWords.length > 0 && (
          <div className="grid grid-cols-4 gap-2 w-full mb-6">
            {unsolvedWords.map((word) => {
              const isSelected = selectedWords.includes(word);
              return (
                <button
                  key={word}
                  onClick={() => toggleSelect(word)}
                  className={`flex h-16 sm:h-20 items-center justify-center rounded-xl p-2 text-center text-xs sm:text-sm font-extrabold uppercase tracking-tight transition active:scale-95 shadow ${
                    isSelected
                      ? "bg-slate-200 text-slate-900 border-2 border-white scale-95"
                      : "bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        )}

        {/* Mistakes indicator */}
        <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <span>Mistakes remaining:</span>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full ${
                  i < mistakesLeft ? "bg-indigo-400" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Shuffle</span>
          </button>
          <button
            onClick={() => setSelectedWords([])}
            disabled={selectedWords.length === 0}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
          >
            Deselect All
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length !== 4}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            <Check className="w-4 h-4" />
            <span>Submit</span>
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
