import { NextResponse } from "next/server";
import { GameRepository } from "@/lib/db";

export async function GET() {
  try {
    const games = await GameRepository.getAllGames();
    return NextResponse.json({ games });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load games" }, { status: 500 });
  }
}
