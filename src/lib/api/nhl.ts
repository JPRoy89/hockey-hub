/**
 * NHL API Client
 * Uses the unofficial NHL API (api-web.nhle.com) which is public and free.
 * Documentation: https://gitlab.com/dword4/nhlapi
 */

import {
  NHLStandings,
  NHLSkaterLeaders,
  TeamRoster,
  PlayerProfile,
  Team,
  NHL_API_BASE,
  NHL_STATS_API,
  PlayerStats,
} from "@/types/hockey";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class ApiCache {
  private cache = new Map<string, { data: unknown; timestamp: number }>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

const cache = new ApiCache();

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get<T>(url);
  if (cached) return cached;

  const res = await fetch(url, {
    next: { revalidate: 300 }, // Next.js cache for 5 min
  });

  if (!res.ok) {
    throw new Error(`NHL API error: ${res.status} ${res.statusText} — ${url}`);
  }

  const data = await res.json();
  cache.set(url, data);
  return data as T;
}

// ============================================================
// Standings
// ============================================================

export async function getStandings(): Promise<NHLStandings> {
  return fetchWithCache(`${NHL_API_BASE}/standings/now`);
}

// ============================================================
// Teams
// ============================================================

export async function getAllTeams(): Promise<Team[]> {
  const data = await fetchWithCache<{ data: Team[] }>(
    `${NHL_STATS_API}/franchise`
  );
  return data.data;
}

export async function getTeamRoster(teamAbbrev: string): Promise<TeamRoster> {
  return fetchWithCache(`${NHL_API_BASE}/roster/${teamAbbrev}/current`);
}

export async function getTeamStats(teamAbbrev: string) {
  return fetchWithCache(
    `${NHL_API_BASE}/club-stats/${teamAbbrev}/now`
  );
}

export async function getTeamSchedule(teamAbbrev: string) {
  return fetchWithCache(
    `${NHL_API_BASE}/club-schedule-season/${teamAbbrev}/now`
  );
}

export async function getTeamSeasonStats(teamAbbrev: string, season: string) {
  return fetchWithCache(
    `${NHL_API_BASE}/club-stats/${teamAbbrev}/${season}/2`
  );
}

// ============================================================
// Players
// ============================================================

export async function getPlayerProfile(playerId: number): Promise<PlayerProfile> {
  return fetchWithCache(`${NHL_API_BASE}/player/${playerId}/landing`);
}

export async function getPlayerGameLog(playerId: number, season: string) {
  return fetchWithCache(
    `${NHL_API_BASE}/player/${playerId}/game-log/${season}/2`
  );
}

export async function getSkaterLeaders(
  category: "points" | "goals" | "assists" | "plusMinus" | "pim" = "points",
  limit = 25
): Promise<NHLSkaterLeaders> {
  return fetchWithCache(
    `${NHL_API_BASE}/skater-stats-leaders/current?categories=${category}&limit=${limit}`
  );
}

export async function getGoalieLeaders(
  category: "wins" | "gaa" | "savePctg" | "shutouts" = "wins",
  limit = 10
) {
  return fetchWithCache(
    `${NHL_API_BASE}/goalie-stats-leaders/current?categories=${category}&limit=${limit}`
  );
}

// ============================================================
// Stats with Filters (NHL Stats API)
// ============================================================

export interface SkaterStatsQuery {
  season?: string;
  limit?: number;
  start?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  factCayenneExp?: string; // e.g. "gamesPlayed>=1"
  cayenneExp?: string; // e.g. "teamAbbrevs=MTL and seasonId=20242025"
}

export async function getSkaterStats(query: SkaterStatsQuery = {}) {
  const {
    season = "20242025",
    limit = 100,
    start = 0,
    sort = "points",
    direction = "DESC",
    factCayenneExp = "gamesPlayed>=1",
    cayenneExp,
  } = query;

  const params = new URLSearchParams({
    limit: String(limit),
    start: String(start),
    sort: JSON.stringify([{ property: sort, direction }]),
    factCayenneExp,
    cayenneExp: cayenneExp || `seasonId=${season} and gameTypeId=2`,
  });

  return fetchWithCache<{ data: PlayerStats[]; total: number }>(
    `${NHL_STATS_API}/skater/summary?${params}`
  );
}

export async function getGoalieStatsAll(season = "20242025") {
  const params = new URLSearchParams({
    limit: "50",
    sort: JSON.stringify([{ property: "wins", direction: "DESC" }]),
    cayenneExp: `seasonId=${season} and gameTypeId=2`,
  });

  return fetchWithCache(
    `${NHL_STATS_API}/goalie/summary?${params}`
  );
}

export async function getTeamSkaterStats(teamAbbrev: string, season = "20242025") {
  const params = new URLSearchParams({
    limit: "50",
    sort: JSON.stringify([{ property: "points", direction: "DESC" }]),
    cayenneExp: `seasonId=${season} and gameTypeId=2 and teamAbbrevs="${teamAbbrev}"`,
    factCayenneExp: "gamesPlayed>=1",
  });

  return fetchWithCache<{ data: PlayerStats[]; total: number }>(
    `${NHL_STATS_API}/skater/summary?${params}`
  );
}

// ============================================================
// Search
// ============================================================

export async function searchPlayers(query: string) {
  if (!query || query.length < 2) return { players: [] };
  return fetchWithCache(
    `${NHL_API_BASE}/search/player?q=${encodeURIComponent(query)}&culture=en-us&limit=20`
  );
}

// ============================================================
// Utility
// ============================================================

export function getPlayerHeadshotUrl(playerId: number): string {
  return `https://assets.nhle.com/mugs/nhl/20242025/${playerId}.png`;
}

export function getTeamLogoUrl(teamAbbrev: string): string {
  return `https://assets.nhle.com/logos/nhl/svg/${teamAbbrev}_light.svg`;
}

export function formatSeason(season: string): string {
  // "20242025" -> "2024-25"
  return `${season.slice(0, 4)}-${season.slice(6)}`;
}

export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // NHL season runs Oct-Jun; if past June, we're in next season
  if (month >= 10) {
    return `${year}${year + 1}`;
  }
  return `${year - 1}${year}`;
}

export function formatCapHit(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatTOI(avgTimeOnIce: string): string {
  // "18:45" -> "18:45"
  return avgTimeOnIce || "0:00";
}

// Team abbreviation to NHL team ID mapping
export const TEAM_IDS: Record<string, number> = {
  ANA: 24, ARI: 53, BOS: 6, BUF: 7, CGY: 20, CAR: 12, CHI: 16,
  COL: 21, CBJ: 29, DAL: 25, DET: 17, EDM: 22, FLA: 13, LAK: 26,
  MIN: 30, MTL: 8, NSH: 18, NJD: 1, NYI: 2, NYR: 3, OTT: 9,
  PHI: 4, PIT: 5, SJS: 28, SEA: 55, STL: 19, TBL: 14, TOR: 10,
  VAN: 23, VGK: 54, WSH: 15, WPG: 52, UTA: 59,
};

// NHL Team colors for UI
export const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  ANA: { primary: "#F47A38", secondary: "#B9975B" },
  BOS: { primary: "#FFB81C", secondary: "#000000" },
  BUF: { primary: "#003087", secondary: "#FCB514" },
  CGY: { primary: "#C8102E", secondary: "#F1BE48" },
  CAR: { primary: "#CC0000", secondary: "#000000" },
  CHI: { primary: "#CF0A2C", secondary: "#000000" },
  COL: { primary: "#6F263D", secondary: "#236192" },
  CBJ: { primary: "#002654", secondary: "#CE1126" },
  DAL: { primary: "#006847", secondary: "#8F8F8C" },
  DET: { primary: "#CE1126", secondary: "#FFFFFF" },
  EDM: { primary: "#FF4C00", secondary: "#003831" },
  FLA: { primary: "#041E42", secondary: "#C8102E" },
  LAK: { primary: "#111111", secondary: "#A2AAAD" },
  MIN: { primary: "#154734", secondary: "#A6192E" },
  MTL: { primary: "#AF1E2D", secondary: "#192168" },
  NSH: { primary: "#FFB81C", secondary: "#041E42" },
  NJD: { primary: "#CE1126", secondary: "#000000" },
  NYI: { primary: "#00539B", secondary: "#F47D30" },
  NYR: { primary: "#0038A8", secondary: "#CE1126" },
  OTT: { primary: "#C52032", secondary: "#C69214" },
  PHI: { primary: "#F74902", secondary: "#000000" },
  PIT: { primary: "#FCB514", secondary: "#000000" },
  SJS: { primary: "#006D75", secondary: "#EA7200" },
  SEA: { primary: "#001628", secondary: "#99D9D9" },
  STL: { primary: "#002F87", secondary: "#FCB514" },
  TBL: { primary: "#002868", secondary: "#FFFFFF" },
  TOR: { primary: "#003E7E", secondary: "#FFFFFF" },
  UTA: { primary: "#6CAEDF", secondary: "#FFFFFF" },
  VAN: { primary: "#00205B", secondary: "#00843D" },
  VGK: { primary: "#B4975A", secondary: "#333F42" },
  WSH: { primary: "#041E42", secondary: "#C8102E" },
  WPG: { primary: "#041E42", secondary: "#004C97" },
  ARI: { primary: "#8C2633", secondary: "#E2D6B5" },
};
