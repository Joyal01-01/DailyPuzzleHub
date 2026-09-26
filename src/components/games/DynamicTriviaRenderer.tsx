"use client";

import { useState } from "react";
import GameContainer from "./GameContainer";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface DynamicTriviaProps {
  game: {
    slug: string;
    title: string;
    category: string;
    configJson?: {
      questions: {
        question: string;
        options: string[];
        correct: number;
        explanation?: string;
      }[];
    };
  };
}

export default function DynamicTriviaRenderer({ game }: DynamicTriviaProps) {
  const { soundEnabled } = useStore();
  const questions = game.configJson?.questions || [
    {
      question: "Sample Dynamic Question?",
      options: ["A", "B", "C", "D"],
      correct: 0,
      explanation: "Default question created by CMS template.",
    },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const handleSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    const isCorrect = idx === questions[currentIdx].correct;
    if (isCorrect) {
      if (soundEnabled) soundFx.playSuccess();
      setScore((s) => s + 100);
    } else {
      if (soundEnabled) soundFx.playError();
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
    } else {
      setIsWon(true);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <GameContainer
      slug={game.slug}
      title={game.title}
      category={game.category}
      instructions={["Answer all admin-crafted custom trivia questions to conquer this challenge!"]}
      isWon={isWon}
      isGameOver={false}
      score={score}
    >
      <div className="flex flex-col items-center select-none w-full max-w-xl">
        <div className="mb-4 text-xs font-bold text-slate-400">
          Question {currentIdx + 1} of {questions.length} • {score} XP
        </div>

        <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center text-xl font-bold text-white shadow-xl">
          {currentQ.question}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left font-semibold transition ${
                selectedOption !== null
                  ? idx === currentQ.correct
                    ? "border-emerald-500 bg-emerald-950/80 text-emerald-200"
                    : selectedOption === idx
                    ? "border-rose-500 bg-rose-950/80 text-rose-200"
                    : "border-slate-800 bg-slate-900 text-slate-500"
                  : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              <span>{opt}</span>
              {selectedOption !== null && idx === currentQ.correct && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </button>
          ))}
        </div>

        {selectedOption !== null && (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition"
          >
            <span>{currentIdx + 1 === questions.length ? "Finish Quiz" : "Next"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </GameContainer>
  );
}
