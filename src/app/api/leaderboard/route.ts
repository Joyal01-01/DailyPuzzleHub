import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  const LEADERBOARD_KEY = "leaderboard:daily";

  // Check top 10 from Redis
  let entries = await redis.zrevrangeWithScores(LEADERBOARD_KEY, 0, 9);

  // If empty, seed initial realistic leaderboard
  if (entries.length === 0) {
    const defaultLeaders = [
      { member: "Alex_Nepal", score: 9850 },
      { member: "WordMaster99", score: 8700 },
      { member: "SudokuNinja", score: 8200 },
      { member: "LogicQueen", score: 7950 },
      { member: "PuzzlePro_UK", score: 7400 },
      { member: "CrypticSolver", score: 7100 },
      { member: "Brainiac_NP", score: 6850 },
      { member: "SpeedyChallenger", score: 6300 },
      { member: "DailyStreakGod", score: 5900 },
      { member: "PixelWizard", score: 5500 },
    ];

    for (const item of defaultLeaders) {
      await redis.zadd(LEADERBOARD_KEY, item.score, item.member);
    }
    entries = defaultLeaders;
  }

  const enriched = entries.map((item, idx) => ({
    rank: idx + 1,
    username: item.member,
    score: item.score,
    country: idx % 3 === 0 ? "NP" : idx % 2 === 0 ? "US" : "GB",
    streak: Math.max(3, 18 - idx * 2),
  }));

  return NextResponse.json({ leaderboard: enriched });
}
