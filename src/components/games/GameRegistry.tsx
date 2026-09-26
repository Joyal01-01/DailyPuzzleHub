"use client";

import dynamic from "next/dynamic";
import { GameType } from "@prisma/client";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

// Lazy load game components with custom elegant loading skeletons
const WordleGame = dynamic(() => import("./WordleGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Word Guess" />,
});
const SudokuGame = dynamic(() => import("./SudokuGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Sudoku" />,
});
const MinesweeperGame = dynamic(() => import("./MinesweeperGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Minesweeper" />,
});
const ConnectionsGame = dynamic(() => import("./ConnectionsGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Connections" />,
});
const CrosswordGame = dynamic(() => import("./CrosswordGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Mini Crossword" />,
});
const NonogramGame = dynamic(() => import("./NonogramGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Nonogram" />,
});
const Game2048 = dynamic(() => import("./Game2048"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily 2048" />,
});
const WordSearchGame = dynamic(() => import("./WordSearchGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Word Search" />,
});
const AnagramGame = dynamic(() => import("./AnagramGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Anagram Scramble" />,
});
const MemoryMatchGame = dynamic(() => import("./MemoryMatchGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Memory Match" />,
});
const SlidingTileGame = dynamic(() => import("./SlidingTileGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Sliding Tile" />,
});
const SequenceMemoryGame = dynamic(() => import("./SequenceMemoryGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Sequence Memory" />,
});
const CryptogramGame = dynamic(() => import("./CryptogramGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Cryptogram" />,
});
const MazeRunnerGame = dynamic(() => import("./MazeRunnerGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Maze Runner" />,
});
const KakuroGame = dynamic(() => import("./KakuroGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Kakuro" />,
});
const LightsOutGame = dynamic(() => import("./LightsOutGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Lights Out" />,
});
const TowerOfHanoiGame = dynamic(() => import("./TowerOfHanoiGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Tower of Hanoi" />,
});
const MastermindGame = dynamic(() => import("./MastermindGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Mastermind" />,
});
const WordLadderGame = dynamic(() => import("./WordLadderGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Word Ladder" />,
});
const TriviaQuizGame = dynamic(() => import("./TriviaQuizGame"), {
  ssr: false,
  loading: () => <LoadingSkeleton title="Daily Trivia Quiz" />,
});

const DynamicTriviaRenderer = dynamic(() => import("./DynamicTriviaRenderer"), { ssr: false });
const DynamicWordRenderer = dynamic(() => import("./DynamicWordRenderer"), { ssr: false });
const DynamicGridRenderer = dynamic(() => import("./DynamicGridRenderer"), { ssr: false });

function LoadingSkeleton({ title }: { title: string }) {
  return (
    <div className="mx-auto flex min-h-[460px] max-w-xl flex-col items-center justify-center p-8 text-center">
      <div className="h-12 w-12 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="font-serif text-lg font-bold text-slate-200 tracking-wide">
        Preparing {title}...
      </div>
      <p className="mt-1 text-xs text-slate-400 font-sans tracking-wide">
        Synchronizing date-seeded mathematical layout
      </p>
    </div>
  );
}

export interface GameRegistryProps {
  game: {
    id?: string;
    slug: string;
    title: string;
    category: string;
    thumbnail?: string;
    type?: GameType;
    isActive?: boolean;
    configJson?: any;
  };
}

export default function GameRegistry({ game }: GameRegistryProps) {
  if (!game || !game.slug) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-md flex-col items-center justify-center p-8 text-center">
        <p className="text-slate-400 text-sm">Game specification is missing or unavailable.</p>
        <Link
          href="/"
          className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-serif tracking-widest uppercase text-amber-300 hover:bg-amber-500/20 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Salon</span>
        </Link>
      </div>
    );
  }

  if (game.type === GameType.DYNAMIC_TRIVIA) {
    return <DynamicTriviaRenderer game={game as any} />;
  }
  if (game.type === GameType.DYNAMIC_WORD) {
    return <DynamicWordRenderer game={game as any} />;
  }
  if (game.type === GameType.DYNAMIC_GRID) {
    return <DynamicGridRenderer game={game as any} />;
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

// Export named component alias for maximum backward compatibility
export { GameRegistry as renderGameBySlug };
