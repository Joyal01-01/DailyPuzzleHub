"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { TRIVIA_QUESTIONS } from "@/lib/gameData";
import { createSeededRng, getUtcDateString, shuffleWithRng } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function TriviaQuizGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [questions, setQuestions] = useState(TRIVIA_QUESTIONS.slice(0, 5));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const rng = createSeededRng(`trivia_${dateStr}`);
    const shuffled = shuffleWithRng(TRIVIA_QUESTIONS, rng).slice(0, 5);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setShowExplanation(false);
    setIsWon(false);
    setIsGameOver(false);
  }, [dateStr]);

  const handleSelectOption = (optIdx: number) => {
    if (selectedOption !== null || isWon || isGameOver) return;
    setSelectedOption(optIdx);
    setShowExplanation(true);

    const isCorrect = optIdx === questions[currentIdx].correct;
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
      setShowExplanation(false);
    } else {
      // Completed all 5 questions
      if (score >= 300) {
        setIsWon(true);
      } else {
        setIsGameOver(true);
      }
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <GameContainer
      slug="trivia-quiz"
      title="Daily Trivia Quiz"
      category="Classic"
      instructions={[
        "Answer 5 date-seeded general knowledge questions.",
        "Score at least 3 out of 5 correct (300+ XP) to conquer today's challenge.",
        "Read explanations to boost your trivia knowledge!",
      ]}
      isWon={isWon}
      isGameOver={isGameOver}
      score={score}
      onRevive={() => {
        setIsGameOver(false);
        setIsWon(true); // Grant win on revival reward
      }}
      onRestart={() => {
        setCurrentIdx(0);
        setSelectedOption(null);
        setScore(0);
        setShowExplanation(false);
        setIsGameOver(false);
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center select-none w-full max-w-xl">
        {/* Progress header */}
        <div className="mb-6 flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-slate-400">
          <div>Question {currentIdx + 1} of {questions.length}</div>
          <div className="text-indigo-400">{score} XP Earned</div>
        </div>

        {/* Question Text */}
        <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center text-lg sm:text-xl font-bold text-white shadow-xl">
          {currentQ.question}
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQ.correct;

            let style = "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700";
            if (selectedOption !== null) {
              if (isCorrect) {
                style = "border-emerald-500 bg-emerald-950/80 text-emerald-200 font-extrabold ring-2 ring-emerald-400";
              } else if (isSelected) {
                style = "border-rose-500 bg-rose-950/80 text-rose-200 font-extrabold ring-2 ring-rose-400";
              } else {
                style = "border-slate-800 bg-slate-900/40 text-slate-500";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={selectedOption !== null}
                className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-semibold transition active:scale-98 shadow ${style}`}
              >
                <span>{opt}</span>
                {selectedOption !== null && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
                {selectedOption !== null && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next */}
        {showExplanation && (
          <div className="flex flex-col items-center w-full gap-4">
            <div className="w-full rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 text-xs text-indigo-200 leading-relaxed">
              <strong className="text-white block mb-1">Explanation:</strong>
              {currentQ.explanation}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-500 transition active:scale-95"
            >
              <span>{currentIdx + 1 === questions.length ? "Finish Quiz" : "Next Question"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
