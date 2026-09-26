"use client";

import dynamic from "next/dynamic";
import { GameType } from "@prisma/client";

// Lazy load game components for maximum performance & code-splitting
const WordleGame = dynamic(() => import("./WordleGame"), { ssr: false });
const SudokuGame = dynamic(() => import("./SudokuGame"), { ssr: false });
const MinesweeperGame = dynamic(() => import("./MinesweeperGame"), { ssr: false });
const ConnectionsGame = dynamic(() => import("./ConnectionsGame"), { ssr: false });
const CrosswordGame = dynamic(() => import("./CrosswordGame"), { ssr: false });
const NonogramGame = dynamic(() => import("./NonogramGame"), { ssr: false });
const Game2048 = dynamic(() => import("./Game2048"), { ssr: false });
const WordSearchGame = dynamic(() => import("./WordSearchGame"), { ssr: false });
const AnagramGame = dynamic(() => import("./AnagramGame"), { ssr: false });
const MemoryMatchGame = dynamic(() => import("./MemoryMatchGame"), { ssr: false });
const SlidingTileGame = dynamic(() => import("./SlidingTileGame"), { ssr: false });
const SequenceMemoryGame = dynamic(() => import("./SequenceMemoryGame"), { ssr: false });
const CryptogramGame = dynamic(() => import("./CryptogramGame"), { ssr: false });
const MazeRunnerGame = dynamic(() => import("./MazeRunnerGame"), { ssr: false });
const KakuroGame = dynamic(() => import("./KakuroGame"), { ssr: false });
const LightsOutGame = dynamic(() => import("./LightsOutGame"), { ssr: false });
const TowerOfHanoiGame = dynamic(() => import("./TowerOfHanoiGame"), { ssr: false });
const MastermindGame = dynamic(() => import("./MastermindGame"), { ssr: false });
const WordLadderGame = dynamic(() => import("./WordLadderGame"), { ssr: false });
const TriviaQuizGame = dynamic(() => import("./TriviaQuizGame"), { ssr: false });

const DynamicTriviaRenderer = dynamic(() => import("./DynamicTriviaRenderer"), { ssr: false });
const DynamicWordRenderer = dynamic(() => import("./DynamicWordRenderer"), { ssr: false });
const DynamicGridRenderer = dynamic(() => import("./DynamicGridRenderer"), { ssr: false });

export function renderGameBySlug(game: any) {
  if (game.type === GameType.DYNAMIC_TRIVIA) {
    return <DynamicTriviaRenderer game={game} />;
  }
  if (game.type === GameType.DYNAMIC_WORD) {
    return <DynamicWordRenderer game={game} />;
  }
  if (game.type === GameType.DYNAMIC_GRID) {
    return <DynamicGridRenderer game={game} />;
  }

  switch (game.slug) {
    case "wordle":
      return <WordleGame />;
    case "sudoku":
      return <SudokuGame />;
    case "minesweeper":
      return <MinesweeperGame />;
    case "connections":
      return <ConnectionsGame />;
    case "crossword":
      return <CrosswordGame />;
    case "nonogram":
      return <NonogramGame />;
    case "2048":
      return <Game2048 />;
    case "word-search":
      return <WordSearchGame />;
    case "anagrams":
      return <AnagramGame />;
    case "memory-match":
      return <MemoryMatchGame />;
    case "sliding-tile":
      return <SlidingTileGame />;
    case "sequence-memory":
      return <SequenceMemoryGame />;
    case "cryptogram":
      return <CryptogramGame />;
    case "maze-runner":
      return <MazeRunnerGame />;
    case "kakuro":
      return <KakuroGame />;
    case "lights-out":
      return <LightsOutGame />;
    case "tower-of-hanoi":
      return <TowerOfHanoiGame />;
    case "mastermind":
      return <MastermindGame />;
    case "word-ladder":
      return <WordLadderGame />;
    case "trivia-quiz":
      return <TriviaQuizGame />;
    default:
      return <WordleGame />;
  }
}
