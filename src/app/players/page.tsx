import { Suspense } from "react";
import { PlayersTable } from "@/components/players/PlayersTable";
import { PlayerFilters } from "@/components/players/PlayerFilters";
import { Users } from "lucide-react";

export const metadata = {
  title: "Joueurs NHL — HockeyHub",
  description: "Base de données complète de tous les joueurs NHL avec stats de base et avancées.",
};

export default function PlayersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const {
    q = "",
    team = "",
    position = "all",
    season = "20242025",
    sort = "points",
    page = "1",
  } = searchParams;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-600/20">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Base de données joueurs</h1>
          <p className="text-sm text-muted-foreground">
            Statistiques NHL · Saison {season.slice(0, 4)}-{season.slice(6)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <PlayerFilters
        initialFilters={{ q, team, position, season }}
      />

      {/* Table */}
      <Suspense
        fallback={
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground animate-pulse">
            Chargement des joueurs...
          </div>
        }
      >
        <PlayersTable
          filters={{ q, team, position, season, sort }}
          page={parseInt(page)}
        />
      </Suspense>
    </div>
  );
}
