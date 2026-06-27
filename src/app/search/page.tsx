"use client";

import { useState, useEffect } from "react";
import { Search, Users, Shield } from "lucide-react";
import Link from "next/link";
import { getPositionColor } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ playerId: number; name: string; teamAbbrev: string; position: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.players || []);
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-600/20">
          <Search className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold">Recherche</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          placeholder="Nom de joueur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading && <p className="text-center text-muted-foreground">Recherche...</p>}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{results.length} résultats</p>
          {results.map((p) => (
            <Link
              key={p.playerId}
              href={`/players/${p.playerId}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-blue-800 hover:bg-secondary/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://assets.nhle.com/mugs/nhl/20242025/${p.playerId}.png`}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold group-hover:text-blue-400 transition-colors">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.teamAbbrev}</div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${getPositionColor(p.position)}`}>
                {p.position}
              </span>
            </Link>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Aucun joueur trouvé pour "{query}"</p>
      )}

      {!query && (
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Link href="/players" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-medium">Tous les joueurs</span>
          </Link>
          <Link href="/teams" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">Toutes les équipes</span>
          </Link>
        </div>
      )}
    </div>
  );
}
