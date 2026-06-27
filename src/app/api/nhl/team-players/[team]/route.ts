import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function estimateSalary(points: number, pos: string): number {
  const d = pos === 'D' ? 0.85 : 1.0;
  if (points >= 80) return Math.round(9_500_000 * d);
  if (points >= 60) return Math.round(8_000_000 * d);
  if (points >= 40) return Math.round(5_500_000 * d);
  if (points >= 20) return Math.round(3_200_000 * d);
  if (points >= 10) return Math.round(1_800_000 * d);
  return Math.round(850_000 * d);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ team: string }> }
) {
  const { team } = await params;
  const abbrev = team.toUpperCase();

  try {
    const [rosterRes, statsRes] = await Promise.all([
      fetch(`https://api-web.nhle.com/v1/roster/${abbrev}/20242025`, {
        headers: { 'User-Agent': 'Mozilla/5.0 HockeyHub/1.0' },
        next: { revalidate: 3600 },
      }),
      fetch(
        'https://api.nhle.com/stats/rest/en/skater/summary' +
          '?isAggregate=false&isGame=false' +
          '&sort=%5B%7B%22property%22%3A%22points%22%2C%22direction%22%3A%22DESC%22%7D%5D' +
          `&start=0&limit=50` +
          `&cayenneExp=seasonId%3D20242025%20and%20gameTypeId%3D2%20and%20teamAbbrevs%3D%27${abbrev}%27`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 HockeyHub/1.0' },
          next: { revalidate: 1800 },
        }
      ),
    ]);

    const roster = await rosterRes.json();
    const statsData = await statsRes.json();

    const statsMap: Record<number, Record<string, unknown>> = {};
    for (const p of statsData.data || []) {
      statsMap[(p as Record<string, unknown>).playerId as number] = p as Record<string, unknown>;
    }

    const enrich = (players: Record<string, unknown>[]) =>
      players.map((p) => {
        const s = statsMap[p.id as number] || null;
        const pts = s ? ((s.points as number) || 0) : 0;
        const pos = p.positionCode as string;
        return { ...p, stats: s, estimatedSalary: estimateSalary(pts, pos) };
      });

    return NextResponse.json({
      forwards: enrich((roster.forwards || []) as Record<string, unknown>[]),
      defensemen: enrich((roster.defensemen || []) as Record<string, unknown>[]),
      goalies: enrich((roster.goalies || []) as Record<string, unknown>[]),
    });
  } catch (e) {
    return NextResponse.json(
      { error: String(e), forwards: [], defensemen: [], goalies: [] },
      { status: 500 }
    );
  }
}
