import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Lineup,
  ForwardLine,
  DefensePair,
  GoalieSlot,
  LinePlayer,
  CAP_CEILING,
} from "@/types/hockey";

function createEmptyForwardLines(): ForwardLine[] {
  return [1, 2, 3, 4].map((n) => ({
    id: `line-${n}`,
    lineNumber: n as 1 | 2 | 3 | 4,
    lw: null,
    center: null,
    rw: null,
  }));
}

function createEmptyDefensePairs(): DefensePair[] {
  return [1, 2, 3].map((n) => ({
    id: `pair-${n}`,
    pairNumber: n as 1 | 2 | 3,
    ld: null,
    rd: null,
  }));
}

function calculateTotalCapHit(
  lines: ForwardLine[],
  pairs: DefensePair[],
  goalies: GoalieSlot
): number {
  let total = 0;

  for (const line of lines) {
    if (line.lw) total += line.lw.capHit;
    if (line.center) total += line.center.capHit;
    if (line.rw) total += line.rw.capHit;
  }

  for (const pair of pairs) {
    if (pair.ld) total += pair.ld.capHit;
    if (pair.rd) total += pair.rd.capHit;
  }

  if (goalies.starter) total += goalies.starter.capHit;
  if (goalies.backup) total += goalies.backup.capHit;

  return total;
}

interface LineupStore {
  lineup: Lineup;
  savedLineups: Lineup[];

  // Actions
  setTeam: (teamAbbrev: string) => void;
  setLineupName: (name: string) => void;
  placePlayer: (
    slot: { type: "forward" | "defense" | "goalie"; lineIndex: number; position: string },
    player: LinePlayer
  ) => void;
  removePlayer: (
    slot: { type: "forward" | "defense" | "goalie"; lineIndex: number; position: string }
  ) => void;
  swapPlayers: (
    slotA: { type: string; lineIndex: number; position: string },
    slotB: { type: string; lineIndex: number; position: string }
  ) => void;
  resetLineup: () => void;
  saveLineup: () => void;
  loadLineup: (id: string) => void;
  deleteLineup: (id: string) => void;
}

const defaultLineup: Lineup = {
  id: "default",
  teamAbbrev: "MTL",
  name: "Mon alignement",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  forwardLines: createEmptyForwardLines(),
  defensePairs: createEmptyDefensePairs(),
  goalies: { starter: null, backup: null },
  totalCapHit: 0,
  capSpace: CAP_CEILING,
  isCapCompliant: true,
};

export const useLineupStore = create<LineupStore>()(
  persist(
    (set, get) => ({
      lineup: defaultLineup,
      savedLineups: [],

      setTeam: (teamAbbrev) =>
        set((state) => ({
          lineup: { ...state.lineup, teamAbbrev, updatedAt: new Date().toISOString() },
        })),

      setLineupName: (name) =>
        set((state) => ({
          lineup: { ...state.lineup, name, updatedAt: new Date().toISOString() },
        })),

      placePlayer: (slot, player) => {
        set((state) => {
          const lineup = { ...state.lineup };

          if (slot.type === "forward") {
            const lines = [...lineup.forwardLines];
            const line = { ...lines[slot.lineIndex] };
            const pos = slot.position as "lw" | "center" | "rw";
            line[pos] = player;
            lines[slot.lineIndex] = line;
            lineup.forwardLines = lines;
          } else if (slot.type === "defense") {
            const pairs = [...lineup.defensePairs];
            const pair = { ...pairs[slot.lineIndex] };
            const pos = slot.position as "ld" | "rd";
            pair[pos] = player;
            pairs[slot.lineIndex] = pair;
            lineup.defensePairs = pairs;
          } else if (slot.type === "goalie") {
            const pos = slot.position as "starter" | "backup";
            lineup.goalies = { ...lineup.goalies, [pos]: player };
          }

          const totalCapHit = calculateTotalCapHit(
            lineup.forwardLines,
            lineup.defensePairs,
            lineup.goalies
          );
          lineup.totalCapHit = totalCapHit;
          lineup.capSpace = CAP_CEILING - totalCapHit;
          lineup.isCapCompliant =
            totalCapHit <= CAP_CEILING && totalCapHit >= 0;
          lineup.updatedAt = new Date().toISOString();

          return { lineup };
        });
      },

      removePlayer: (slot) => {
        set((state) => {
          const lineup = { ...state.lineup };

          if (slot.type === "forward") {
            const lines = [...lineup.forwardLines];
            const line = { ...lines[slot.lineIndex] };
            const pos = slot.position as "lw" | "center" | "rw";
            line[pos] = null;
            lines[slot.lineIndex] = line;
            lineup.forwardLines = lines;
          } else if (slot.type === "defense") {
            const pairs = [...lineup.defensePairs];
            const pair = { ...pairs[slot.lineIndex] };
            const pos = slot.position as "ld" | "rd";
            pair[pos] = null;
            pairs[slot.lineIndex] = pair;
            lineup.defensePairs = pairs;
          } else if (slot.type === "goalie") {
            const pos = slot.position as "starter" | "backup";
            lineup.goalies = { ...lineup.goalies, [pos]: null };
          }

          const totalCapHit = calculateTotalCapHit(
            lineup.forwardLines,
            lineup.defensePairs,
            lineup.goalies
          );
          lineup.totalCapHit = totalCapHit;
          lineup.capSpace = CAP_CEILING - totalCapHit;
          lineup.isCapCompliant = totalCapHit <= CAP_CEILING;
          lineup.updatedAt = new Date().toISOString();

          return { lineup };
        });
      },

      swapPlayers: (slotA, slotB) => {
        // TODO: implement cross-line swap
      },

      resetLineup: () => {
        set((state) => ({
          lineup: {
            ...defaultLineup,
            teamAbbrev: state.lineup.teamAbbrev,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      saveLineup: () => {
        set((state) => {
          const saved = state.lineup;
          const existing = state.savedLineups.findIndex((l) => l.id === saved.id);
          if (existing >= 0) {
            const updated = [...state.savedLineups];
            updated[existing] = saved;
            return { savedLineups: updated };
          }
          return { savedLineups: [...state.savedLineups, saved] };
        });
      },

      loadLineup: (id) => {
        const { savedLineups } = get();
        const found = savedLineups.find((l) => l.id === id);
        if (found) set({ lineup: found });
      },

      deleteLineup: (id) => {
        set((state) => ({
          savedLineups: state.savedLineups.filter((l) => l.id !== id),
        }));
      },
    }),
    {
      name: "hockey-hub-lineup",
    }
  )
);
