import { NextRequest, NextResponse } from "next/server";
import { GameRepository } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const game = await GameRepository.getGameBySlug(params.slug);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    return NextResponse.json({ game });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
  }
}
