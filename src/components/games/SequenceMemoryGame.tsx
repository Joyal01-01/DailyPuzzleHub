"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { createSeededRng, getUtcDateString } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { Play } from "lucide-react";

export default function SequenceMemoryGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [dailySequence, setDailySequence] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [userStep, setUserStep] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const TONES = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5

  const initGame = () => {
    const rng = createSeededRng(`simon_${dateStr}`);
    const seq: number[] = [];
    for (let i = 0; i < 7; i++) {
      seq.push(Math.floor(rng() * 4));
    }
    setDailySequence(seq);
    setCurrentRound(1);
    setUserStep(0);
    setIsWon(false);
    setIsGameOver(false);
    playRoundSequence(seq, 1);
  };

  useEffect(() => {
    initGame();
  }, [dateStr]);

  const playRoundSequence = (seq: number[], round: number) => {
    setIsPlayingSeq(true);
    setUserStep(0);

    for (let i = 0; i < round; i++) {
      setTimeout(() => {
        const btn = seq[i];
        setActiveButton(btn);
        if (soundEnabled) soundFx.playTone(TONES[btn], 0.25);
        setTimeout(() => setActiveButton(null), 280);
      }, (i + 1) * 600);
    }

    setTimeout(() => {
      setIsPlayingSeq(false);
    }, (round + 1) * 600);
  };

  const handleButtonClick = (btnIdx: number) => {
    if (isPlayingSeq || isWon || isGameOver) return;

    setActiveButton(btnIdx);
    if (soundEnabled) soundFx.playTone(TONES[btnIdx], 0.2);
    setTimeout(() => setActiveButton(null), 200);

    if (btnIdx === dailySequence[userStep]) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Round complete?
      if (nextStep === currentRound) {
        if (currentRound >= 6) {
          setIsWon(true);
        } else {
          const nextRound = currentRound + 1;
          setCurrentRound(nextRound);
          setTimeout(() => {
            playRoundSequence(dailySequence, nextRound);
          }, 800);
        }
      }
    } else {
      if (soundEnabled) soundFx.playError();
      setIsGameOver(true);
    }
  };

  const BUTTON_CONFIGS = [
    { color: "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-300", active: "bg-emerald-300 ring-4 ring-emerald-200" },
    { color: "bg-rose-500 hover:bg-rose-400 active:bg-rose-300", active: "bg-rose-300 ring-4 ring-rose-200" },
    { color: "bg-amber-500 hover:bg-amber-400 active:bg-amber-300", active: "bg-amber-300 ring-4 ring-amber-200" },
    { color: "bg-blue-500 hover:bg-blue-400 active:bg-blue-300", active: "bg-blue-300 ring-4 ring-blue-200" },
  ];

  return (
    <GameContainer
      slug="sequence-memory"
      title="Daily Sequence Memory"
      category="Memory"
      instructions={[
        "Watch and listen carefully to the flashing color sequence.",
        "Repeat the exact sequence by pressing the colored pads.",
        "Survive all 6 rounds to achieve today's win!",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={isWon ? 500 : 0}
      onRevive={() => {
        setIsGameOver(false);
        playRoundSequence(dailySequence, currentRound);
      }}
      onRestart={initGame}
    >
      <div className="flex flex-col items-center select-none">
        <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
          Round: <strong className="text-indigo-400 text-sm">{currentRound} / 6</strong>
        </div>

        {/* 2x2 Simon Button Pads */}
        <div className="relative flex items-center justify-center p-4">
          <div className="grid grid-cols-2 gap-3 rounded-full border-4 border-slate-700 bg-slate-950 p-4 shadow-2xl">
            {BUTTON_CONFIGS.map((cfg, idx) => (
              <button
                key={idx}
                onClick={() => handleButtonClick(idx)}
                disabled={isPlayingSeq}
                className={`h-24 w-24 sm:h-28 sm:w-28 rounded-2xl transition-all duration-150 shadow-lg ${
                  activeButton === idx ? cfg.active : cfg.color
                }`}
              />
            ))}
          </div>

          {isPlayingSeq && (
            <div className="absolute rounded-xl bg-slate-900/90 border border-slate-700 px-3 py-1.5 text-xs font-bold text-white shadow animate-pulse">
              Observing Sequence...
            </div>
          )}
        </div>

        <button
          onClick={() => playRoundSequence(dailySequence, currentRound)}
          disabled={isPlayingSeq || isWon || isGameOver}
          className="mt-6 flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Replay Sequence</span>
        </button>
      </div>
    </GameContainer>
  );
}
