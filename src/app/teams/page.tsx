import { getStandings } from "@/lib/api/nhl";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Équipes NHL — HockeyHub",
};

const DIVISION_ORDER = ["Atlantique", "Métropolitaine", "Centrale", "Pacifique"];
const DIVISION_MAP: Record<string, string> = {
  Atlantic: "Atlantique",
  Metropolitan: "Métropolitaine",
  Central: "Centrale",
  Pacific: "Pacifique",
};

export default async function TeamsPage() {
  let standings;
  try {
    standings = await getStandings();
  } catch {
    return (
      <div className="rounded-xl border border-destructive/50 bg-card p-8 text-center text-muted-foreground">
        Impossible de charger les équipes. Réessaie plus tard.
      </div>
    );
  }

  // Group by division
  const byDivision: Record<string, typeof standings.standings> = {};
  for (const team of standings.standings) {
    const div = DIVISION_MAP[team.divisionName] || team.divisionName;
    if (!byDivision[div]) byDivision[div] = [];
    byDivision[div].push(team);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-600/20">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Équipes NHL</h1>
          <p className="text-sm text-muted-foreground">32 équipes · Classements saison 2024-25</p>
        </div>
      </div>

      {DIVISION_ORDER.map((div) => {
        const teams = byDivision[div] || [];
        if (!teams.length) return null;
        return (
          <div key={div} className="space-y-3">
            <h2 className="text-lg font-bold text-muted-foreground border-b border-border pb-2">
              Division {div}
            </h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Équipe</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">PJ</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">V</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">D</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">DP</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground font-bold text-foreground">PTS</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">VR</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">BM</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">BA</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">DIFF</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">10D</th>
                      <th className="text-center px-3 py-3 font-medium text-muted-foreground">STREAK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, idx) => {
                      const abbrev = team.teamAbbrev?.default;
                      const diff = team.goalDifferential;
                      return (
                        <tr
                          key={abbrev}
                          className={`border-b border-border/50 hover:bg-secondary/30 transition-colors ${idx < 3 ? "bg-emerald-950/10" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/teams/${abbrev}`}
                              className="flex items-center gap-3 hover:text-blue-400 transition-colors group"
                            >
                              {team.teamLogo && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={team.teamLogo}
                                  alt={abbrev}
                                  className="w-8 h-8 object-contain"
                                />
                              )}
                              <div>
                                <div className="font-semibold group-hover:text-blue-400 transition-colors">
                                  {team.teamName?.default}
                                </div>
                                <div className="text-xs text-muted-foreground">{abbrev}</div>
                              </div>
                              {idx < 3 && (
                                <span className="ml-auto text-xs text-emerald-400 font-medium">Playoffs ✓</span>
                              )}
                            </Link>
                          </td>
                          <td className="px-3 py-3 text-center text-muted-foreground">{team.gamesPlayed}</td>
                          <td className="px-3 py-3 text-center">{team.wins}</td>
                          <td className="px-3 py-3 text-center">{team.losses}</td>
                          <td className="px-3 py-3 text-center">{team.otLosses}</td>
                          <td className="px-3 py-3 text-center font-bold text-blue-400">{team.points}</td>
                          <td className="px-3 py-3 text-center text-muted-foreground">{team.regulationWins}</td>
                          <td className="px-3 py-3 text-center">{team.goalsFor}</td>
                          <td className="px-3 py-3 text-center">{team.goalsAgainst}</td>
                          <td className={`px-3 py-3 text-center ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </td>
                          <td className="px-3 py-3 text-center text-muted-foreground text-xs">{team.l10Record}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-xs font-bold ${team.streakCode === "W" ? "text-green-400" : "text-red-400"}`}>
                              {team.streakCode}{team.streakCount}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
