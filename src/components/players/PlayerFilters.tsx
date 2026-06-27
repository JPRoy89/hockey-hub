"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, Filter, X } from "lucide-react";

const NHL_TEAMS = [
  "ANA","BOS","BUF","CGY","CAR","CHI","COL","CBJ","DAL","DET","EDM","FLA",
  "LAK","MIN","MTL","NSH","NJD","NYI","NYR","OTT","PHI","PIT","SJS","SEA",
  "STL","TBL","TOR","UTA","VAN","VGK","WSH","WPG",
];

const POSITIONS = [
  { value: "all", label: "Toutes positions" },
  { value: "C", label: "Centre (C)" },
  { value: "LW", label: "Ailier gauche (AG)" },
  { value: "RW", label: "Ailier droit (AD)" },
  { value: "D", label: "Défenseur (D)" },
  { value: "G", label: "Gardien (G)" },
];

const SEASONS = [
  { value: "20242025", label: "2024-25" },
  { value: "20232024", label: "2023-24" },
  { value: "20222023", label: "2022-23" },
  { value: "20212022", label: "2021-22" },
  { value: "20202021", label: "2020-21" },
];

interface PlayerFiltersProps {
  initialFilters: {
    q: string;
    team: string;
    position: string;
    season: string;
  };
}

export function PlayerFilters({ initialFilters }: PlayerFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialFilters.q);
  const [team, setTeam] = useState(initialFilters.team);
  const [position, setPosition] = useState(initialFilters.position);
  const [season, setSeason] = useState(initialFilters.season);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (team) params.set("team", team);
    if (position && position !== "all") params.set("position", position);
    if (season) params.set("season", season);
    router.push(`${pathname}?${params.toString()}`);
  }, [q, team, position, season, router, pathname]);

  const resetFilters = () => {
    setQ("");
    setTeam("");
    setPosition("all");
    setSeason("20242025");
    router.push(pathname);
  };

  const hasActiveFilters = q || team || position !== "all" || season !== "20242025";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtres</span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3" />
            Réinitialiser
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nom du joueur..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-input text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Team */}
        <select
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Toutes les équipes</option>
          {NHL_TEAMS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Position */}
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {POSITIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Season */}
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {SEASONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={applyFilters}
        className="w-full sm:w-auto px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
      >
        Appliquer les filtres
      </button>
    </div>
  );
}
