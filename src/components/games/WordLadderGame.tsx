"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { WORD_LADDER_PAIRS, VALID_GUESS_SET } from "@/lib/gameData";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { ArrowDown, Check } from "lucide-react";

export default function WordLadderGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [pair, setPair] = useState(WORD_LADDER_PAIRS[0]);
  const [ladder, setLadder] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    const rng = createSeededRng(`ladder_${dateStr}`);
    const chosen = WORD_LADDER_PAIRS[Math.floor(rng() * WORD_LADDER_PAIRS.length)];
    setPair(chosen);
    setLadder([chosen.start]);
    setCurrentInput("");
    setErrorMessage(null);
    setIsWon(false);
  }, [dateStr]);

  const countDiffs = (w1: string, w2: string) => {
    if (w1.length !== w2.length) return 999;
    let diffs = 0;
    for (let i = 0; i < w1.length; i++) {
      if (w1[i] !== w2[i]) diffs++;
    }
    return diffs;
  };

  const handleAddWord = () => {
    if (isWon) return;
    const upper = currentInput.trim().toUpperCase();

    if (upper.length !== pair.start.length) {
      setErrorMessage(`Word must be ${pair.start.length} letters long!`);
      if (soundEnabled) soundFx.playError();
      return;
    }

    const previousWord = ladder[ladder.length - 1];
    const diffs = countDiffs(previousWord, upper);

    if (diffs !== 1) {
      setErrorMessage(`Must change EXACTLY 1 letter from '${previousWord}'!`);
      if (soundEnabled) soundFx.playError();
      return;
    }

    if (ladder.includes(upper)) {
      setErrorMessage("Word already used in this ladder!");
      if (soundEnabled) soundFx.playError();
      return;
    }

    if (soundEnabled) soundFx.playSuccess();
    const nextLadder = [...ladder, upper];
    setLadder(nextLadder);
    setCurrentInput("");
    setErrorMessage(null);

    // Win check: reached destination word
    if (upper === pair.end) {
      setIsWon(true);
    }
  };

  return (
    <GameContainer
      slug="word-ladder"
      title="Daily Word Ladder"
      category="Word"
      instructions={[
        `Transform '${pair.start}' into '${pair.end}'.`,
        "Each step must be a valid word that differs by EXACTLY one letter from the previous word.",
        "Solve the ladder in as few rungs as possible!",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? Math.max(200, 700 - ladder.length * 50) : 0}
      onRestart={() => {
        setLadder([pair.start]);
        setCurrentInput("");
        setErrorMessage(null);
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center select-none w-full max-w-sm">
        {/* Error message toast */}
        {errorMessage && (
          <div className="mb-4 rounded-xl bg-rose-950/80 border border-rose-500/40 px-4 py-2 text-xs font-bold text-rose-300 animate-shake">
            {errorMessage}
          </div>
        )}

        {/* Start Word */}
        <div className="flex items-center justify-center rounded-2xl border-2 border-emerald-500 bg-emerald-950/40 px-6 py-3 text-2xl font-black tracking-widest text-emerald-300 shadow-lg">
          {pair.start}
        </div>

        {/* Intermediate ladder rungs */}
        <div className="flex flex-col items-center my-3 gap-2">
          {ladder.slice(1).map((w, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <ArrowDown className="w-4 h-4 text-slate-500 my-1" />
              <div
                className={`rounded-xl border px-5 py-2 text-lg font-bold tracking-widest ${
                  w === pair.end
                    ? "border-emerald-500 bg-emerald-600 text-white animate-tile-pop"
                    : "border-slate-700 bg-slate-800 text-white"
                }`}
              >
                {w}
              </div>
            </div>
          ))}
        </div>

        {!isWon && (
          <>
            <ArrowDown className="w-4 h-4 text-slate-500 mb-3 animate-bounce" />

            {/* Input next rung */}
            <div className="flex gap-2 w-full">
              <input
                type="text"
                maxLength={pair.start.length}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleAddWord()}
                placeholder="Next word..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-lg font-black uppercase text-white tracking-widest focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddWord}
                className="flex items-center justify-center rounded-xl bg-indigo-600 px-5 font-bold text-white shadow hover:bg-indigo-500 active:scale-95 transition"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {/* Goal Word Banner */}
        <div className="mt-6 flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Target Destination
          </span>
          <div className="flex items-center justify-center rounded-2xl border-2 border-indigo-500/50 bg-indigo-950/30 px-6 py-3 text-2xl font-black tracking-widest text-indigo-300">
            {pair.end}
          </div>
        </div>
      </div>
    </GameContainer>
  );
}
