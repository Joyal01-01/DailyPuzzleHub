import { NextRequest, NextResponse } from "next/server";
import { GameRepository } from "@/lib/db";
import { getSessionFromHeader } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const session = getSessionFromHeader(authHeader);

    // Check admin role (or allow demo role toggle via header / body)
    const body = await req.json();
    const { isActive, adminOverride } = body;

    if (session && session.role !== Role.ADMIN && !adminOverride) {
      return NextResponse.json({ error: "Unauthorized: Admin role required" }, { status: 403 });
    }

    const updated = await GameRepository.toggleGameActive(params.slug, isActive);
    return NextResponse.json({ success: true, game: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle game status" }, { status: 500 });
  }
}
