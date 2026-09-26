import { notFound } from "next/navigation";
import { GameRepository } from "@/lib/db";
import { renderGameBySlug } from "@/components/games/GameRegistry";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

interface GamePageProps {
  params: { slug: string };
}

export default async function GamePage({ params }: GamePageProps) {
  const game = await GameRepository.getGameBySlug(params.slug);

  if (!game) {
    notFound();
  }

  if (!game.isActive) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Puzzle Currently Inactive</h2>
        <p className="mt-2 text-sm text-slate-400">
          This daily game has been disabled by the site administrator for maintenance or rotation. Check back soon!
        </p>
        <Link
          href="/"
          className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Games</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderGameBySlug(game)}
    </div>
  );
}
