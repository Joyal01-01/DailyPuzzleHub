"use client";

import { useState, useEffect } from "react";
import GameContainer from "./GameContainer";
import { CRYPTOGRAM_QUOTES } from "@/lib/gameData";
import { createSeededRng, getUtcDateString, shuffleWithRng } from "@/lib/prng";
import { soundFx } from "@/lib/sound";
import { useStore } from "@/store/useStore";

export default function CryptogramGame() {
  const { soundEnabled } = useStore();
  const dateStr = getUtcDateString();
  const [quoteData, setQuoteData] = useState(CRYPTOGRAM_QUOTES[0]);
  const [cipherMap, setCipherMap] = useState<Record<string, string>>({});
  const [userDecodes, setUserDecodes] = useState<Record<string, string>>({});
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    const rng = createSeededRng(`crypto_${dateStr}`);
    const q = CRYPTOGRAM_QUOTES[Math.floor(rng() * CRYPTOGRAM_QUOTES.length)];
    setQuoteData(q);

    // Create 1-to-1 letter substitution cipher
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const shuffled = shuffleWithRng(alphabet, rng);
    const cMap: Record<string, string> = {};
    alphabet.forEach((char, idx) => {
      cMap[char] = shuffled[idx];
    });

    setCipherMap(cMap);
    setUserDecodes({});
    setSelectedLetter(null);
    setIsWon(false);
  }, [dateStr]);

  const handleCharInput = (cipherChar: string, decodedVal: string) => {
    if (isWon) return;
    const upper = decodedVal.toUpperCase();
    if (!/^[A-Z]$/.test(upper) && upper !== "") return;

    if (soundEnabled) soundFx.playPop();

    const nextDecodes = { ...userDecodes };
    if (upper === "") {
      delete nextDecodes[cipherChar];
    } else {
      nextDecodes[cipherChar] = upper;
    }
    setUserDecodes(nextDecodes);

    // Check win condition
    const originalQuote = quoteData.quote.toUpperCase();
    let correct = true;
    for (const char of originalQuote) {
      if (/^[A-Z]$/.test(char)) {
        const cipher = cipherMap[char];
        if (nextDecodes[cipher] !== char) {
          correct = false;
          break;
        }
      }
    }
    if (correct) setIsWon(true);
  };

  const words = quoteData.quote.split(" ");

  return (
    <GameContainer
      slug="cryptogram"
      title="Daily Cryptogram"
      category="Word"
      instructions={[
        "Decipher the encoded famous quote using letter substitution.",
        "When you decode a letter, every matching encrypted letter updates simultaneously.",
        "Identify common short words like 'THE', 'IS', or 'TO' to break into the cipher!",
      ]}
      isWon={isWon}
      isGameOver={false}
      score={isWon ? 500 : 0}
      onRestart={() => {
        setUserDecodes({});
        setIsWon(false);
      }}
    >
      <div className="flex flex-col items-center w-full max-w-2xl select-none">
        {/* Encrypted Words Flow */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 mb-8">
          {words.map((word, wIdx) => (
            <div key={wIdx} className="flex gap-1">
              {word.split("").map((plainChar, cIdx) => {
                const isLetter = /^[A-Z]$/i.test(plainChar);
                if (!isLetter) {
                  return (
                    <div
                      key={cIdx}
                      className="flex h-12 w-6 items-end justify-center pb-2 text-xl font-bold text-slate-400"
                    >
                      {plainChar}
                    </div>
                  );
                }

                const cipherChar = cipherMap[plainChar] || plainChar;
                const userVal = userDecodes[cipherChar] || "";
                const isSelected = selectedLetter === cipherChar;

                return (
                  <div key={cIdx} className="flex flex-col items-center gap-1">
                    <input
                      type="text"
                      maxLength={1}
                      value={userVal}
                      onFocus={() => setSelectedLetter(cipherChar)}
                      onChange={(e) => handleCharInput(cipherChar, e.target.value)}
                      className={`h-10 w-9 sm:w-10 rounded-lg border text-center text-lg font-black uppercase transition focus:outline-none ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-600 text-white ring-2 ring-indigo-300"
                          : userVal
                          ? "border-indigo-500/40 bg-slate-800 text-indigo-300"
                          : "border-slate-700 bg-slate-900 text-white"
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-400">{cipherChar}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Author Quote attribution */}
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
            Author
          </div>
          <div className="text-base font-extrabold text-white">
            {isWon ? `— ${quoteData.author}` : "— ?????????"}
          </div>
        </div>
      </div>
    </GameContainer>
  );
}
