// ============================================================
// Core Hockey Types
// ============================================================

export type Position = "C" | "LW" | "RW" | "D" | "G";
export type Shoots = "L" | "R";
export type TeamAbbrev = string;
export interface Player { id: number; headshot: string; firstName: { default: string }; lastName: { default: string }; sweaterNumber?: number; positionCode: Position; shootsCatches: Shoots; heightInInches: number; weightInPounds: number; birthDate: string; birthCity?: { default: string }; birthCountry: string; currentTeamId?: number; currentTeamAbbrev?: TeamAbbrev; }
export interface PlayerStats { playerId: number; season: string; teamAbbrev: TeamAbbrev; gamesPlayed: number; goals: number; assists: number; points: number; plusMinus: number; pim: number; powerPlayGoals: number; powerPlayPoints: number; shortHandedGoals: number; shortHandedPoints: number; gameWinningGoals: number; otGoals: number; shots: number; shootingPctg: number; avgTimeOnIce: string; avgTimeOnIcePP: string; avgTimeOnIcePK: string; faceoffWinPctg?: number; corsiFor?: number; corsiAgainst?: number; corsiPctg?: number; }
export interface GoalieStats { playerId: number; season: string; teamAbbrev: TeamAbbrev; gamesPlayed: number; gamesStarted: number; wins: number; losses: number; otLosses: number; goalsAgainstAvg: number; savePctg: number; shotsAgainst: number; saves: number; goalsAgainst: number; shutouts: number; timeOnIce: number; }
export interface PlayerProfile extends Player { currentStats?: PlayerStats | GoalieStats; careerStats?: Array<PlayerStats | GoalieStats>; contract?: Contract; draftInfo?: DraftInfo; }
export interface DraftInfo { year: number; round: number; pickInRound: number; overallPick: number; teamAbbrev: TeamAbbrev; }
export interface Contract { playerId: number; playerName: string; teamAbbrev: TeamAbbrev; contractType: "ELC" | "RFA" | "UFA" | "PTO" | "AHL"; aav: number; totalValue: number; startYear: number; endYear: number; years: number; noTradeClause: boolean; noMovementClause: boolean; signingBonus?: number; performanceBonus?: number; yearlyValues: YearlyValue[]; expiryStatus: "UFA" | "RFA" | "EMLD"; playerAge: number; }
export interface YearlyValue { season: string; capHit: number; salary: number; }
export interface Team { id: number; franchiseId: number; fullName: string; abbrev: TeamAbbrev; commonName: { default: string }; placeName: { default: string }; conference: string; division: string; logo: string; darkLogo?: string; primaryColor: string; secondaryColor: string; }
export interface TeamRoster { teamId: number; teamAbbrev: TeamAbbrev; forwards: RosterPlayer[]; defensemen: RosterPlayer[]; goalies: RosterPlayer[]; }
export interface RosterPlayer { id: number; headshot: string; firstName: { default: string }; lastName: { default: string }; sweaterNumber: number; positionCode: Position; shootsCatches: Shoots; heightInInches: number; weightInPounds: number; birthDate: string; birthCountry: string; }
export interface TeamCapInfo { teamAbbrev: TeamAbbrev; teamName: string; capCeiling: number; capFloor: number; activeCapSpace: number; totalSalary: number; projectedTotalSalary: number; contracts: Contract[]; rosterSize: number; }
export interface LinePlayer { id: number; name: string; position: Position; capHit: number; headshot?: string; teamAbbrev?: string; stats?: Partial<PlayerStats>; isFromOtherLeague?: boolean; estimatedCapHit?: number; }
export interface ForwardLine { id: string; lineNumber: 1 | 2 | 3 | 4; lw: LinePlayer | null; center: LinePlayer | null; rw: LinePlayer | null; }
export interface DefensePair { id: string; pairNumber: 1 | 2 | 3; ld: LinePlayer | null; rd: LinePlayer | null; }
export interface GoalieSlot { starter: LinePlayer | null; backup: LinePlayer | null; }
export interface Lineup { id: string; teamAbbrev: TeamAbbrev; name: string; createdAt: string; updatedAt: string; forwardLines: ForwardLine[]; defensePairs: DefensePair[]; goalies: GoalieSlot; totalCapHit: number; capSpace: number; isCapCompliant: boolean; }
export interface TradeAsset { type: "player" | "pick" | "cash"; player?: LinePlayer & { contract?: Contract }; pick?: DraftPick; cash?: number; }
export interface DraftPick { id: string; year: number; round: 1 | 2 | 3 | 4 | 5 | 6 | 7; originalTeam: TeamAbbrev; currentTeam: TeamAbbrev; condition?: string; }
export interface TradeSide { teamAbbrev: TeamAbbrev; teamName: string; sends: TradeAsset[]; receives: TradeAsset[]; capSpaceBefore: number; capSpaceAfter: number; capChange: number; isCapCompliant: boolean; }
export interface MockTrade { id: string; name?: string; createdAt: string; teams: TradeSide[]; analysis: TradeAnalysis; shareUrl?: string; }
export interface TradeAnalysis { isLegal: boolean; issues: string[]; warnings: string[]; capImpact: { [teamAbbrev: string]: number }; winner?: string; notes?: string; }
export interface NHLStandings { standings: NHLTeamStanding[]; }
export interface NHLTeamStanding { teamAbbrev: { default: TeamAbbrev }; teamName: { default: string }; teamCommonName: { default: string }; conferenceName: string; divisionName: string; gamesPlayed: number; wins: number; losses: number; otLosses: number; points: number; pointPctg: number; regulationWins: number; goalsFor: number; goalsAgainst: number; goalDifferential: number; teamLogo: string; streakCode: string; streakCount: number; l10Record: string; }
export interface SearchFilters { query: string; team?: TeamAbbrev; position?: Position | "all"; minPoints?: number; maxCapHit?: number; season?: string; league?: "NHL" | "AHL" | "KHL" | "SHL"; }
export const NHL_API_BASE = "https://api-web.nhle.com/v1";
export const NHL_STATS_API = "https://api.nhle.com/stats/rest/en";
export const CAP_CEILING = 88_000_000;
export const CAP_FLOOR = 65_000_000;
export const MAX_ROSTER_SIZE = 23;
export const MAX_FORWARDS = 14;
export const MAX_DEFENSE = 9;
export const MAX_GOALIES = 3;
