"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString, shuffleWithRng } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

interface Card {
  id: number;
  emoji: string;
}

export default function MemoryMatchGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const EMOJIS = ["🚀", "⭐", "💎", "🦁", "🎨", "⚡", "🍀", "🍕"];

  useEffect(() => {
    const rng = createSeededRng(`memory_${dateStr}`);
    const pairs = [...EMOJIS, ...EMOJIS].map((emoji, idx) => ({ id: idx, emoji }));
    const shuffled = shuffleWithRng(pairs, rng);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsWon(false);
  }, [dateStr]);

  const handleCardClick = (id: number) => {
    if (flipped.includes(id) || matched.includes(id) || flipped.length >= 2 || isWon) {
      return;
    }

    if (soundEnabled) soundFx.playPop();
    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const cardA = cards.find((c) => c.id === firstId);
      const cardB = cards.find((c) => c.id === secondId);

      if (cardA && cardB && cardA.emoji === cardB.emoji) {
        if (soundEnabled) soundFx.playSuccess();
        const nextMatched = [...matched, firstId, secondId];
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.length === cards.length) {
          setIsWon(true);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 800);
      }
    }
  };

  return (
    <GameContainer
      slug="memory-match"
      title="Daily Memory Match"
      category="Memory"
      instructions={[
        "Flip cards to reveal hidden emoji symbols.",
        "Match all 8 pairs in the fewest moves possible.",
        "The board layout resets daily with the UTC seed.",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? Math.max(150, 700 - moves * 20) : 0}
      onRestart={() => {
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center select-none">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Moves Made: <strong className="text-white text-sm">{moves}</strong>
        </div>

        {/* 4x4 Cards Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 rounded-2xl border-2 border-slate-700 bg-slate-950 p-3 shadow-2xl">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            const isMatched = matched.includes(card.id);

            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border text-2xl sm:text-3xl transition-all duration-300 shadow active:scale-95 ${
                  isFlipped
                    ? isMatched
                      ? "border-emerald-500 bg-emerald-950/40 opacity-80"
                      : "border-indigo-400 bg-indigo-600 text-white animate-flip"
                    : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-transparent"
                }`}
              >
                {isFlipped ? card.emoji : "❓"}
              </button>
            );
          })}
        </div>
      </div>
    </GameContainer>
  );
}
