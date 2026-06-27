import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ team: string }> }
) {
  const { team } = await params;
  const abbrev = team.toUpperCase();

  try {
    const res = await fetch(
      `https://api-web.nhle.com/v1/prospects/${abbrev}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 HockeyHub/1.0' },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return NextResponse.json({ prospects: [], available: false });
    const data = await res.json();
    return NextResponse.json({ data, available: true });
  } catch {
    return NextResponse.json({ prospects: [], available: false });
  }
}
