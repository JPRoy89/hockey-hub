"use client";

import { useState } from "react";
import { useTradeStore } from "@/store/trade";
import { TradeAsset, CAP_CEILING } from "@/types/hockey";
import { formatCapHitShort, formatCapHit, cn } from "@/lib/utils";
import {
  Plus,
  X,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle,
  Search,
  ChevronDown,
} from "lucide-react";

const NHL_TEAMS = [
  { abbrev: "ANA", name: "Anaheim Ducks" },
  { abbrev: "BOS", name: "Boston Bruins" },
  { abbrev: "BUF", name: "Buffalo Sabres" },
  { abbrev: "CGY", name: "Calgary Flames" },
  { abbrev: "CAR", name: "Carolina Hurricanes" },
  { abbrev: "CHI", name: "Chicago Blackhawks" },
  { abbrev: "COL", name: "Colorado Avalanche" },
  { abbrev: "CBJ", name: "Columbus Blue Jackets" },
  { abbrev: "DAL", name: "Dallas Stars" },
  { abbrev: "DET", name: "Detroit Red Wings" },
  { abbrev: "EDM", name: "Edmonton Oilers" },
  { abbrev: "FLA", name: "Florida Panthers" },
  { abbrev: "LAK", name: "Los Angeles Kings" },
  { abbrev: "MIN", name: "Minnesota Wild" },
  { abbrev: "MTL", name: "Montréal Canadiens" },
  { abbrev: "NSH", name: "Nashville Predators" },
  { abbrev: "NJD", name: "New Jersey Devils" },
  { abbrev: "NYI", name: "NY Islanders" },
  { abbrev: "NYR", name: "NY Rangers" },
  { abbrev: "OTT", name: "Ottawa Senators" },
  { abbrev: "PHI", name: "Philadelphia Flyers" },
  { abbrev: "PIT", name: "Pittsburgh Penguins" },
  { abbrev: "SJS", name: "San Jose Sharks" },
  { abbrev: "SEA", name: "Seattle Kraken" },
  { abbrev: "STL", name: "St. Louis Blues" },
  { abbrev: "TBL", name: "Tampa Bay Lightning" },
  { abbrev: "TOR", name: "Toronto Maple Leafs" },
  { abbrev: "UTA", name: "Utah Hockey Club" },
  { abbrev: "VAN", name: "Vancouver Canucks" },
  { abbrev: "VGK", name: "Vegas Golden Knights" },
  { abbrev: "WSH", name: "Washington Capitals" },
  { abbrev: "WPG", name: "Winnipeg Jets" },
];

const PICK_YEARS = [2025, 2026, 2027, 2028];
const ROUNDS = [1, 2, 3, 4, 5, 6, 7];

interface AddAssetFormState {
  type: "player" | "pick" | "cash";
  playerName: string;
  playerPosition: string;
  playerCapHit: string;
  pickYear: number;
  pickRound: number;
  cash: string;
}

function TeamPanel({
  side,
  otherTeam,
}: {
  side: ReturnType<typeof useTradeStore>["trade"]["teams"][number];
  otherTeam?: ReturnType<typeof useTradeStore>["trade"]["teams"][number];
}) {
  const { addAsset, removeAsset } = useTradeStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddAssetFormState>({
    type: "player",
    playerName: "",
    playerPosition: "C",
    playerCapHit: "",
    pickYear: 2025,
    pickRound: 1,
    cash: "1000000",
  });

  const handleAdd = () => {
    let asset: TradeAsset | null = null;

    if (form.type === "player" && form.playerName) {
      asset = {
        type: "player",
        player: {
          id: Date.now(),
          name: form.playerName,
          position: form.playerPosition as TradeAsset["player"] extends infer P ? P extends { position: infer Pos } ? Pos : never : never,
          capHit: parseFloat(form.playerCapHit) * 1_000_000 || 0,
        },
      };
    } else if (form.type === "pick") {
      asset = {
        type: "pick",
        pick: {
          id: crypto.randomUUID(),
          year: form.pickYear,
          round: form.pickRound as 1 | 2 | 3 | 4 | 5 | 6 | 7,
          originalTeam: side.teamAbbrev,
          currentTeam: side.teamAbbrev,
        },
      };
    } else if (form.type === "cash") {
      asset = {
        type: "cash",
        cash: parseFloat(form.cash) || 0,
      };
    }

    if (asset) {
      addAsset(side.teamAbbrev, asset, "sends");
      setShowForm(false);
      setForm({ type: "player", playerName: "", playerPosition: "C", playerCapHit: "", pickYear: 2025, pickRound: 1, cash: "1000000" });
    }
  };

  const capChange = side.capChange;

  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 space-y-4",
      side.isCapCompliant ? "border-border" : "border-red-600/50"
    )}>
      {/* Team header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{side.teamAbbrev}</h3>
          <p className="text-xs text-muted-foreground">{side.teamName}</p>
        </div>
        <div className={cn(
          "text-right",
          side.isCapCompliant ? "text-green-400" : "text-red-400"
        )}>
          {side.isCapCompliant ? (
            <CheckCircle className="w-5 h-5 ml-auto" />
          ) : (
            <AlertTriangle className="w-5 h-5 ml-auto" />
          )}
          <div className="text-xs mt-1">
            Espace après: {formatCapHitShort(side.capSpaceAfter)}
          </div>
        </div>
      </div>

      {/* Cap impact */}
      <div className={cn(
        "flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg",
        capChange > 0 ? "bg-red-950/30 text-red-400" : capChange < 0 ? "bg-green-950/30 text-green-400" : "bg-secondary text-muted-foreground"
      )}>
        <span>Impact cap:</span>
        <span>{capChange > 0 ? "+" : ""}{formatCapHitShort(capChange)}</span>
      </div>

      {/* Sends */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Envoie
        </p>
        <div className="space-y-1.5">
          {side.sends.length === 0 ? (
            <p className="text-xs text-muted-foreground italic px-2">Aucun actif sélectionné</p>
          ) : (
            side.sends.map((asset, idx) => (
              <AssetChip
                key={idx}
                asset={asset}
                onRemove={() => removeAsset(side.teamAbbrev, idx, "sends")}
              />
            ))
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-blue-600/50 rounded-lg px-3 py-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un actif
          </button>
        </div>
      </div>

      {/* Add asset form */}
      {showForm && (
        <div className="bg-secondary/50 rounded-lg p-3 space-y-3">
          <div className="flex gap-2">
            {(["player", "pick", "cash"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setForm({ ...form, type: t })}
                className={cn(
                  "flex-1 text-xs py-1.5 rounded font-medium transition-colors",
                  form.type === t
                    ? "bg-blue-600 text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "player" ? "Joueur" : t === "pick" ? "Choix" : "Argent"}
              </button>
            ))}
          </div>

          {form.type === "player" && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nom du joueur..."
                value={form.playerName}
                onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                className="w-full px-2 py-1.5 rounded bg-background border border-input text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.playerPosition}
                  onChange={(e) => setForm({ ...form, playerPosition: e.target.value })}
                  className="px-2 py-1.5 rounded bg-background border border-input text-xs"
                >
                  {["C", "LW", "RW", "D", "G"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Cap hit ($M)..."
                  value={form.playerCapHit}
                  onChange={(e) => setForm({ ...form, playerCapHit: e.target.value })}
                  className="w-full px-2 py-1.5 rounded bg-background border border-input text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  step="0.25"
                  min="0"
                  max="20"
                />
              </div>
            </div>
          )}

          {form.type === "pick" && (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.pickYear}
                onChange={(e) => setForm({ ...form, pickYear: parseInt(e.target.value) })}
                className="px-2 py-1.5 rounded bg-background border border-input text-xs"
              >
                {PICK_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                value={form.pickRound}
                onChange={(e) => setForm({ ...form, pickRound: parseInt(e.target.value) })}
                className="px-2 py-1.5 rounded bg-background border border-input text-xs"
              >
                {ROUNDS.map((r) => <option key={r} value={r}>Ronde {r}</option>)}
              </select>
            </div>
          )}

          {form.type === "cash" && (
            <input
              type="number"
              placeholder="Montant ($)..."
              value={form.cash}
              onChange={(e) => setForm({ ...form, cash: e.target.value })}
              className="w-full px-2 py-1.5 rounded bg-background border border-input text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              step="250000"
              min="0"
              max="3000000"
            />
          )}

          <button
            onClick={handleAdd}
            className="w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            Ajouter
          </button>
        </div>
      )}

      {/* Receives */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Reçoit
        </p>
        <div className="space-y-1.5">
          {side.receives.length === 0 ? (
            <p className="text-xs text-muted-foreground italic px-2">Rien pour l&apos;instant</p>
          ) : (
            side.receives.map((asset, idx) => (
              <AssetChip key={idx} asset={asset} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AssetChip({
  asset,
  onRemove,
}: {
  asset: TradeAsset;
  onRemove?: () => void;
}) {
  if (asset.type === "player" && asset.player) {
    return (
      <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2 group">
        <div>
          <span className="text-sm font-medium">{asset.player.name}</span>
          <span className="text-xs text-muted-foreground ml-2">{asset.player.position}</span>
          {asset.player.capHit > 0 && (
            <span className="text-xs text-blue-400 ml-2">{formatCapHit(asset.player.capHit)}</span>
          )}
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (asset.type === "pick" && asset.pick) {
    return (
      <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2 group">
        <div>
          <span className="text-sm font-medium">
            Ronde {asset.pick.round} {asset.pick.year}
          </span>
          <span className="text-xs text-muted-foreground ml-2">({asset.pick.originalTeam})</span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  if (asset.type === "cash" && asset.cash) {
    return (
      <div className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2 group">
        <div>
          <span className="text-sm font-medium">{formatCapHit(asset.cash)} argent</span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return null;
}

export function TradeBuilderClient() {
  const { trade, initTrade, analyzeTrade, resetTrade } = useTradeStore();
  const [teamSelections, setTeamSelections] = useState<string[]>(["MTL", "TOR"]);
  const [numTeams, setNumTeams] = useState(2);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleStartTrade = () => {
    const selected = teamSelections.slice(0, numTeams);
    const teams = selected.map((abbrev) => {
      const team = NHL_TEAMS.find((t) => t.abbrev === abbrev);
      return {
        abbrev,
        name: team?.name || abbrev,
        capSpace: 10_000_000, // Default - ideally fetch real cap space
      };
    });
    initTrade(teams);
    setIsInitialized(true);
  };

  if (!isInitialized || trade.teams.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 space-y-6 max-w-lg">
        <h2 className="text-lg font-bold">Configurer le trade</h2>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Nombre d&apos;équipes</label>
          <div className="flex gap-2">
            {[2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setNumTeams(n)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  numTeams === n
                    ? "bg-blue-600 text-white"
                    : "border border-border hover:bg-secondary"
                )}
              >
                {n} équipes
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: numTeams }).map((_, idx) => (
            <div key={idx}>
              <label className="text-sm text-muted-foreground">Équipe {idx + 1}</label>
              <select
                value={teamSelections[idx] || ""}
                onChange={(e) => {
                  const updated = [...teamSelections];
                  updated[idx] = e.target.value;
                  setTeamSelections(updated);
                }}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Choisir une équipe...</option>
                {NHL_TEAMS.map(({ abbrev, name }) => (
                  <option key={abbrev} value={abbrev}>{name} ({abbrev})</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button
          onClick={handleStartTrade}
          disabled={teamSelections.slice(0, numTeams).some((t) => !t)}
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Créer le trade
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trade panels */}
      <div className={cn(
        "grid gap-4",
        trade.teams.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"
      )}>
        {trade.teams.map((side, idx) => (
          <div key={side.teamAbbrev} className="relative">
            {idx < trade.teams.length - 1 && (
              <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 bg-red-600 rounded-full items-center justify-center">
                <ArrowLeftRight className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            <TeamPanel side={side} />
          </div>
        ))}
      </div>

      {/* Analysis */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          {trade.analysis.isLegal ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          )}
          Analyse du trade
          {trade.analysis.isLegal ? (
            <span className="text-green-400 text-sm font-normal">— Trade légal ✓</span>
          ) : (
            <span className="text-red-400 text-sm font-normal">— Problème cap</span>
          )}
        </h3>

        {trade.analysis.issues.length > 0 && (
          <div className="space-y-1">
            {trade.analysis.issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-red-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {issue}
              </div>
            ))}
          </div>
        )}

        {trade.analysis.warnings.length > 0 && (
          <div className="space-y-1">
            {trade.analysis.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-yellow-400">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {w}
              </div>
            ))}
          </div>
        )}

        {Object.entries(trade.analysis.capImpact).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(trade.analysis.capImpact).map(([team, impact]) => (
              <div key={team} className="text-center rounded-lg bg-secondary p-3">
                <div className="text-xs text-muted-foreground mb-1">{team}</div>
                <div className={cn(
                  "font-bold",
                  impact > 0 ? "text-red-400" : impact < 0 ? "text-green-400" : "text-muted-foreground"
                )}>
                  {impact > 0 ? "+" : ""}{formatCapHitShort(impact)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => { resetTrade(); setIsInitialized(false); }}
            className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm transition-colors"
          >
            Recommencer
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard?.writeText(url);
              alert("Lien copié! (le partage sera disponible prochainement)");
            }}
          >
            Partager le trade
          </button>
        </div>
      </div>
    </div>
  );
}
