import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toFixed(decimals);
}

export function formatCapHit(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatCapHitShort(value: number): string {
  return `$${(value / 1_000_000).toFixed(2)}M`;
}

export function capPercentage(capHit: number, ceiling: number): number {
  return (capHit / ceiling) * 100;
}

export function formatHeight(heightInInches: number): string {
  const feet = Math.floor(heightInInches / 12);
  const inches = heightInInches % 12;
  return `${feet}'${inches}"`;
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatSeason(season: string): string {
  if (!season || season.length !== 8) return season;
  return `${season.slice(0, 4)}-${season.slice(6)}`;
}

export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 10) return `${year}${year + 1}`;
  return `${year - 1}${year}`;
}

export function playerFullName(player: {
  firstName: { default: string };
  lastName: { default: string };
}): string {
  return `${player.firstName.default} ${player.lastName.default}`;
}

export function getPositionColor(position: string): string {
  switch (position) {
    case "C": return "text-blue-400 bg-blue-950";
    case "LW": return "text-green-400 bg-green-950";
    case "RW": return "text-emerald-400 bg-emerald-950";
    case "D": return "text-orange-400 bg-orange-950";
    case "G": return "text-yellow-400 bg-yellow-950";
    default: return "text-gray-400 bg-gray-800";
  }
}

export function getCapSpaceColor(space: number): string {
  if (space > 5_000_000) return "text-green-400";
  if (space > 0) return "text-yellow-400";
  return "text-red-400";
}

// Estimate contract value for players from other leagues
// Based on league conversion factors and position
export function estimateNHLContractValue(params: {
  league: string;
  pointsPerGame: number;
  age: number;
  position: string;
  years?: number;
}): { aav: number; term: number; contractType: string } {
  const { league, pointsPerGame, age, position } = params;

  // League adjustment factors (how they translate to NHL)
  const leagueFactors: Record<string, number> = {
    AHL: 0.6,
    KHL: 0.75,
    SHL: 0.65,
    LIIGA: 0.60,
    NLA: 0.58,
    DEL: 0.55,
    ECHL: 0.35,
    NCAA: 0.5,
  };

  const factor = leagueFactors[league] || 0.6;
  const adjustedPPG = pointsPerGame * factor;

  // Base cap hit by position and projected NHL production
  let baseCapHit = 750_000; // League minimum

  if (position === "G") {
    // Goalies priced differently
    baseCapHit = 2_000_000 + adjustedPPG * 500_000;
  } else if (adjustedPPG >= 1.0) {
    baseCapHit = 7_000_000 + (adjustedPPG - 1.0) * 3_000_000;
  } else if (adjustedPPG >= 0.7) {
    baseCapHit = 4_000_000 + (adjustedPPG - 0.7) * 10_000_000;
  } else if (adjustedPPG >= 0.5) {
    baseCapHit = 2_000_000 + (adjustedPPG - 0.5) * 10_000_000;
  } else if (adjustedPPG >= 0.3) {
    baseCapHit = 1_000_000 + (adjustedPPG - 0.3) * 5_000_000;
  }

  // Age adjustment
  let ageFactor = 1.0;
  if (age < 22) ageFactor = 0.7; // ELC territory
  else if (age < 25) ageFactor = 0.85;
  else if (age < 28) ageFactor = 1.0; // Prime
  else if (age < 31) ageFactor = 0.95;
  else if (age < 34) ageFactor = 0.85;
  else ageFactor = 0.7;

  const aav = Math.max(775_000, Math.round(baseCapHit * ageFactor / 25_000) * 25_000);

  // Contract term
  let term = 2;
  if (age < 23) {
    term = 3; // ELC
    return { aav: Math.min(aav, 950_000), term: 3, contractType: "ELC" };
  } else if (aav > 6_000_000) {
    term = 6;
  } else if (aav > 3_000_000) {
    term = 4;
  } else {
    term = 2;
  }

  const contractType = age >= 27 ? "UFA" : "RFA";
  return { aav, term, contractType };
}
