"use client";

import { useState, useEffect } from "react";
import { useLineupStore } from "@/store/lineup";
import { LinePlayer, CAP_CEILING, CAP_FLOOR, TEAM_COLORS } from "@/types/hockey";
import { formatCapHit, formatCapHitShort, cn, getPositionColor } from "@/lib/utils";
import { X, Plus, Save, RotateCcw, Search, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { estimateNHLContractValue } from "@/lib/utils";

const NHL_TEAMS = [
  "ANA","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL","DET","EDM","FLA",
  "LAK","MIN","MTL","NSH","NJD","NYI","NYR","OTT","PHI","PIT","SJS","SEA",
  "STL","TBL","TOR","UTA","VAN","VGK","WSH","WPG",
];

const OTHER_LEAGUES = ["AHL", "KHL", "SHL", "LIIGA", "NLA", "DEL", "NCAA", "ECHL"];

interface PlayerSearchResult {
  playerId: number;
  name: string;
  teamAbbrev: string;
  position: string;
  points: number;
  gamesPlayed: number;
}

export function LineBuilderClient() {
  const {
    lineup,
    setTeam,
    setLineupName,
    placePlayer,
    removePlayer,
    resetLineup,
    saveLineup,
    savedLineups,
  } = useLineupStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlayerSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    type: "forward" | "defense" | "goalie";
    lineIndex: number;
    position: string;
  } | null>(null);

  // Other league player form
  const [showOtherLeague, setShowOtherLeague] = useState(false);
  const [otherLeague, setOtherLeague] = useState({ name: "", team: "", position: "C", league: "AHL", ppg: "0.7", age: "25" });

  const capPct = (lineup.totalCapHit / CAP_CEILING) * 100;
  const teamColors = TEAM_COLORS[lineup.teamAbbrev];

  // Search players
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.players || []);
        }
      } catch {}
      setSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addPlayerToSlot = (player: LinePlayer) => {
    if (!selectedSlot) return;
    placePlayer(selectedSlot, player);
    setSelectedSlot(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const addOtherLeaguePlayer = () => {
    if (!selectedSlot || !otherLeague.name) return;
    const estimate = estimateNHLContractValue({
      league: otherLeague.league,
      pointsPerGame: parseFloat(otherLeague.ppg),
      age: parseInt(otherLeague.age),
      position: otherLeague.position,
    });
    const player: LinePlayer = {
      id: Date.now(),
      name: otherLeague.name,
      position: otherLeague.position as LinePlayer["position"],
      capHit: estimate.aav,
      teamAbbrev: `${otherLeague.league}`,
      isFromOtherLeague: true,
      estimatedCapHit: estimate.aav,
    };
    addPlayerToSlot(player);
    setShowOtherLeague(false);
    setOtherLeague({ name: "", team: "", position: "C", league: "AHL", ppg: "0.7", age: "25" });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Left: Lineup canvas */}
      <div className="xl:col-span-3 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={lineup.teamAbbrev}
            onChange={(e) => setTeam(e.target.value)}
            className="px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {NHL_TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="text"
            value={lineup.name}
            onChange={(e) => setLineupName(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Nom de l'alignement..."
          />
          <button
            onClick={saveLineup}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
          <button
            onClick={resetLineup}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Cap bar */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lineup.isCapCompliant ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm font-medium">Masse salariale</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg">
                {formatCapHitShort(lineup.totalCapHit)}
              </span>
              <span className="text-muted-foreground text-sm"> / {formatCapHitShort(CAP_CEILING)}</span>
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className={cn(
                "h-3 rounded-full transition-all duration-500",
                capPct > 100 ? "bg-red-500" : capPct > 90 ? "bg-yellow-500" : "bg-green-500"
              )}
              style={{ width: `${Math.min(capPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Plancher: {formatCapHitShort(CAP_FLOOR)}</span>
            <span className={lineup.capSpace >= 0 ? "text-green-400" : "text-red-400"}>
              {lineup.capSpace >= 0 ? "Espace: " : "Dépassement: "}
              {formatCapHitShort(Math.abs(lineup.capSpace))}
            </span>
            <span>Plafond: {formatCapHitShort(CAP_CEILING)}</span>
          </div>
        </div>

        {/* Forwards */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block" />
            Attaquants
          </h2>
          {lineup.forwardLines.map((line, lineIdx) => (
            <div key={line.id} className="rounded-xl border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground mb-2 font-medium">Trio {line.lineNumber}</div>
              <div className="grid grid-cols-3 gap-2">
                {(["lw", "center", "rw"] as const).map((pos) => (
                  <PlayerSlot
                    key={pos}
                    player={line[pos]}
                    label={pos === "lw" ? "AG" : pos === "center" ? "C" : "AD"}
                    isSelected={
                      selectedSlot?.type === "forward" &&
                      selectedSlot?.lineIndex === lineIdx &&
                      selectedSlot?.position === pos
                    }
                    onSelect={() =>
                      setSelectedSlot({ type: "forward", lineIndex: lineIdx, position: pos })
                    }
                    onRemove={() =>
                      removePlayer({ type: "forward", lineIndex: lineIdx, position: pos })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Defense */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-orange-600 inline-block" />
            Défenseurs
          </h2>
          {lineup.defensePairs.map((pair, pairIdx) => (
            <div key={pair.id} className="rounded-xl border border-border bg-card p-3">
              <div className="text-xs text-muted-foreground mb-2 font-medium">Paire {pair.pairNumber}</div>
              <div className="grid grid-cols-2 gap-2">
                {(["ld", "rd"] as const).map((pos) => (
                  <PlayerSlot
                    key={pos}
                    player={pair[pos]}
                    label={pos === "ld" ? "DG" : "DD"}
                    isSelected={
                      selectedSlot?.type === "defense" &&
                      selectedSlot?.lineIndex === pairIdx &&
                      selectedSlot?.position === pos
                    }
                    onSelect={() =>
                      setSelectedSlot({ type: "defense", lineIndex: pairIdx, position: pos })
                    }
                    onRemove={() =>
                      removePlayer({ type: "defense", lineIndex: pairIdx, position: pos })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Goalies */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-purple-600 inline-block" />
            Gardiens
          </h2>
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="grid grid-cols-2 gap-2">
              {(["starter", "backup"] as const).map((pos) => (
                <PlayerSlot
                  key={pos}
                  player={lineup.goalies[pos]}
                  label={pos === "starter" ? "Partant" : "Substitut"}
                  isSelected={
                    selectedSlot?.type === "goalie" &&
                    selectedSlot?.position === pos
                  }
                  onSelect={() =>
                    setSelectedSlot({ type: "goalie", lineIndex: 0, position: pos })
                  }
                  onRemove={() =>
                    removePlayer({ type: "goalie", lineIndex: 0, position: pos })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Player search panel */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-4 sticky top-20">
          <h3 className="font-bold flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" />
            {selectedSlot ? "Choisir un joueur" : "Rechercher"}
          </h3>

          {selectedSlot && (
            <div className="text-xs bg-blue-600/10 border border-blue-600/20 text-blue-400 rounded-lg px-3 py-2">
              Placement: <strong>{selectedSlot.type === "forward" ? `Trio ${selectedSlot.lineIndex + 1}` : selectedSlot.type === "defense" ? `Paire ${selectedSlot.lineIndex + 1}` : "Gardiens"}</strong> · {selectedSlot.position.toUpperCase()}
              <button
                onClick={() => setSelectedSlot(null)}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Nom du joueur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {/* Search results */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {searching && (
              <p className="text-xs text-muted-foreground text-center py-2">Recherche...</p>
            )}
            {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
              <p className="text-xs text-muted-foreground text-center py-2">Aucun résultat</p>
            )}
            {searchResults.map((p) => (
              <button
                key={p.playerId}
                onClick={() => {
                  if (selectedSlot) {
                    addPlayerToSlot({
                      id: p.playerId,
                      name: p.name,
                      position: p.position as LinePlayer["position"],
                      capHit: 0, // Will be filled from contracts DB
                      teamAbbrev: p.teamAbbrev,
                    });
                  }
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors",
                  !selectedSlot && "cursor-default"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{p.teamAbbrev}</span>
                  </div>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getPositionColor(p.position)}`}>
                    {p.position}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {p.points} pts en {p.gamesPlayed} parties
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <button
              onClick={() => setShowOtherLeague(!showOtherLeague)}
              className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Joueur d&apos;une autre ligue
            </button>

            {showOtherLeague && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  placeholder="Nom complet..."
                  value={otherLeague.name}
                  onChange={(e) => setOtherLeague({ ...otherLeague, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded bg-secondary border border-input text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={otherLeague.league}
                    onChange={(e) => setOtherLeague({ ...otherLeague, league: e.target.value })}
                    className="px-2 py-1.5 rounded bg-secondary border border-input text-xs"
                  >
                    {OTHER_LEAGUES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select
                    value={otherLeague.position}
                    onChange={(e) => setOtherLeague({ ...otherLeague, position: e.target.value })}
                    className="px-2 py-1.5 rounded bg-secondary border border-input text-xs"
                  >
                    {["C","LW","RW","D","G"].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Pts/match</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={otherLeague.ppg}
                      onChange={(e) => setOtherLeague({ ...otherLeague, ppg: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-secondary border border-input text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Âge</label>
                    <input
                      type="number"
                      min="18"
                      max="45"
                      value={otherLeague.age}
                      onChange={(e) => setOtherLeague({ ...otherLeague, age: e.target.value })}
                      className="w-full px-2 py-1.5 rounded bg-secondary border border-input text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
                {otherLeague.name && (
                  <div className="text-xs text-muted-foreground bg-secondary rounded px-2 py-1.5">
                    Estimation:{" "}
                    <strong className="text-blue-400">
                      {formatCapHit(estimateNHLContractValue({
                        league: otherLeague.league,
                        pointsPerGame: parseFloat(otherLeague.ppg) || 0,
                        age: parseInt(otherLeague.age) || 25,
                        position: otherLeague.position,
                      }).aav)} / saison
                    </strong>
                  </div>
                )}
                <button
                  onClick={addOtherLeaguePlayer}
                  disabled={!selectedSlot || !otherLeague.name}
                  className="w-full px-3 py-2 rounded-lg bg-orange-600/80 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-medium transition-colors"
                >
                  {selectedSlot ? "Ajouter au lineup" : "Sélectionne d'abord un slot"}
                </button>
              </div>
            )}
          </div>

          {/* Saved lineups */}
          {savedLineups.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Alignements sauvegardés</p>
              <div className="space-y-1">
                {savedLineups.slice(-3).map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-xs">
                    <span className="truncate text-muted-foreground">{l.name}</span>
                    <span className="text-blue-400">{l.teamAbbrev}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerSlot({
  player,
  label,
  isSelected,
  onSelect,
  onRemove,
}: {
  player: LinePlayer | null;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "relative rounded-lg border p-2.5 cursor-pointer transition-all min-h-[64px]",
        isSelected
          ? "border-blue-500 bg-blue-600/10 ring-1 ring-blue-500"
          : player
          ? "border-border bg-secondary/30 hover:border-blue-800"
          : "border-dashed border-border hover:border-blue-600/50 hover:bg-secondary/20"
      )}
      onClick={!player ? onSelect : undefined}
    >
      <div className="absolute top-1.5 left-2 text-[10px] font-bold text-muted-foreground">
        {label}
      </div>

      {player ? (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{player.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {player.isFromOtherLeague
                  ? <span className="text-orange-400">~{formatCapHit(player.capHit)}</span>
                  : player.capHit > 0
                  ? formatCapHit(player.capHit)
                  : <span className="text-muted-foreground">No contract</span>
                }
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-muted-foreground hover:text-red-400 transition-colors ml-1 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {player.isFromOtherLeague && (
            <div className="text-[9px] text-orange-400 font-medium mt-0.5">{player.teamAbbrev}</div>
          )}
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-center">
          <Plus className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
