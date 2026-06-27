import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const url =
      'https://api.nhle.com/stats/rest/en/skater/summary' +
      '?isAggregate=false&isGame=false' +
      '&sort=%5B%7B%22property%22%3A%22points%22%2C%22direction%22%3A%22DESC%22%7D%5D' +
      '&start=0&limit=700' +
      '&cayenneExp=seasonId%3D20242025%20and%20gameTypeId%3D2';
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 HockeyHub/1.0' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error(`NHL API ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e), data: [], total: 0 }, { status: 500 });
  }
}
