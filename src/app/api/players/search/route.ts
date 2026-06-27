import { NextRequest, NextResponse } from "next/server";
import { NHL_API_BASE } from "@/types/hockey";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";

  if (!q || q.length < 2) {
    return NextResponse.json({ players: [] });
  }

  try {
    const res = await fetch(
      `${NHL_API_BASE}/search/player?q=${encodeURIComponent(q)}&culture=en-us&limit=20`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      throw new Error(`NHL search failed: ${res.status}`);
    }

    const data = await res.json();

    // Normalize the response
    const players = (data.players || data || []).map((p: Record<string, unknown>) => ({
      playerId: p.playerId,
      name: `${(p.firstName as { default: string })?.default || ""} ${(p.lastName as { default: string })?.default || ""}`.trim(),
      teamAbbrev: p.teamAbbrev,
      position: p.positionCode,
      points: 0,
      gamesPlayed: 0,
    }));

    return NextResponse.json({ players });
  } catch (error) {
    console.error("Player search error:", error);
    return NextResponse.json({ players: [], error: "Search unavailable" }, { status: 200 });
  }
}
