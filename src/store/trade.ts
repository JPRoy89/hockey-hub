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

export const useTradeStore = create(() => ({}));
