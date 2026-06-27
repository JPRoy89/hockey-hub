import { create } from "zustand";
import { MockTrade, TradeSide, TradeAsset, CAP_CEILING, CAP_FLOOR } from "@/types/hockey";

interface TradeStore {
  trade: MockTrade;
  history: MockTrade[];

  // Actions
  initTrade: (teams: { abbrev: string; name: string; capSpace: number }[]) => void;
  addAsset: (teamAbbrev: string, asset: TradeAsset, direction: "sends" | "receives") => void;
  removeAsset: (teamAbbrev: string, assetIndex: number, direction: "sends" | "receives") => void;
  analyzeTrade: () => void;
  resetTrade: () => void;
  saveTrade: () => void;
}

function buildEmptySide(
  teamAbbrev: string,
  teamName: string,
  capSpace: number
): TradeSide {
  return {
    teamAbbrev,
    teamName,
    sends: [],
    receives: [],
    capSpaceBefore: capSpace,
    capSpaceAfter: capSpace,
    capChange: 0,
    isCapCompliant: true,
  };
}

function analyzeTradeLogic(sides: TradeSide[]): MockTrade["analysis"] {
  const issues: string[] = [];
  const warnings: string[] = [];
  const capImpact: Record<string, number> = {};
  let isLegal = true;

  for (const side of sides) {
    const outgoingCap = side.sends.filter((a) => a.type === "player" && a.player).reduce((sum, a) => sum + (a.player.capHit || 0), 0);
    const incomingCap = side.receives.filter((a) => a.type === "player" && a.player).reduce((sum, a) => sum + (a.player.capHit || 0), 0);
    const capChange = incomingCap - outgoingCap;
    const newCapUsage = CAP_CEILING - side.capSpaceBefore + capChange;
    capImpact[side.teamAbbrev] = capChange;
    if (newCapUsage > CAP_CEILING) { issues.push(`${side.teamAbbrev} au-dessus du plafond`); isLegal = false; }
    if (newCapUsage < CAP_FLOOR) warnings.push(`${side.teamAbbrev} en dessous du plancher`);
    if (side.sends.length === 0 && side.receives.length > 0) warnings.push(`${side.teamAbbrev} ne retourne rien`);
  }
  return { isLegal, issues, warnings, capImpact };
}

const defaultTrade = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), teams: [], analysis: { isLegal: true, issues: [], warnings: [], capImpact: {} } };

export const useTradeStore = create((set, get) => ({
  trade: defaultTrade, history: [],
  initTrade: (teams) => set({ trade: { id: crypto.randomUUID(), createdAt: new Date().toISOString(), teams: teams.map((t) => ({ teamAbbrev: t.abbrev, teamName: t.name, sends: [], receives: [], capSpaceBefore: t.capSpace, capSpaceAfter: t.capSpace, capChange: 0, isCapCompliant: true })), analysis: { isLegal: true, issues: [], warnings: [], capImpact: {} } } }),
  addAsset: (teamAbbrev, asset, direction) => { set((s) => ({ trade: { ...s.trade, teams: s.trade.teams.map((side) => side.teamAbbrev !== teamAbbrev ? side : { ...side, [direction]: [...side[direction], asset] }) } })); get().analyzeTrade(); },
  removeAsset: (teamAbbrev, idx, direction) => { set((s) => ({ trade: { ...s.trade, teams: s.trade.teams.map((side) => { if (side.teamAbbrev !== teamAbbrev) return side; const updated = [...side[direction]]; updated.splice(idx, 1); return { ...side, [direction]: updated }; }) } })); get().analyzeTrade(); },
  analyzeTrade: () => set((s) => { const analysis = analyzeTradeLogic(s.trade.teams); const teams = s.trade.teams.map((side) => { const out = side.sends.filter((a) => a.type === "player" && a.player).reduce((x, a) => x + (a.player.capHit || 0), 0); const inc = side.receives.filter((a) => a.type === "player" && a.player).reduce((x, a) => x + (a.player.capHit || 0), 0); const capChange = inc - out; return { ...side, capChange, capSpaceAfter: side.capSpaceBefore - capChange, isCapCompliant: side.capSpaceBefore - capChange >= 0 }; }); return { trade: { ...s.trade, teams, analysis } }; }),
  resetTrade: () => set({ trade: { ...defaultTrade, id: crypto.randomUUID(), createdAt: new Date().toISOString(), teams: [] } }),
  saveTrade: () => set((s) => ({ history: [...s.history, s.trade] })),
}));
