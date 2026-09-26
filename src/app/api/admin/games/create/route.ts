import { NextRequest, NextResponse } from "next/server";
import { GameRepository } from "@/lib/db";
import { GameType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, category, thumbnail, type, configJson } = body;

    if (!title || !slug || !type) {
      return NextResponse.json(
        { error: "Title, slug, and game type are required" },
        { status: 400 }
      );
    }

    // Verify valid GameType
    const validTypes = [
      GameType.DYNAMIC_TRIVIA,
      GameType.DYNAMIC_WORD,
      GameType.DYNAMIC_GRID,
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid dynamic game type" }, { status: 400 });
    }

    const newGame = await GameRepository.createDynamicGame({
      title,
      slug: slug.toLowerCase().trim().replace(/\s+/g, "-"),
      category: category || "Custom",
      thumbnail: thumbnail || "🎮",
      type,
      configJson,
    });

    return NextResponse.json({ success: true, game: newGame });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create dynamic game" },
      { status: 500 }
    );
  }
}
