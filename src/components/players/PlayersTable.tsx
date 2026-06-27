import { getSkaterStats } from "@/lib/api/nhl";
import { getPositionColor, formatCapHit } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getPlayerHeadshotUrl } from "@/lib/api/nhl";

interface PlayersTableProps {
  filters: {
    q: string;
    team: string;
    position: string;
    season: string;
    sort: string;
  };
  page: number;
}

const PAGE_SIZE = 50;

export async function PlayersTable({ filters, page }: PlayersTableProps) {
  const { q, team, position, season, sort } = filters;
  const start = (page - 1) * PAGE_SIZE;

  // Build cayenneExp
  const conditions: string[] = [`seasonId=${season} and gameTypeId=2`];
  if (team) conditions.push(`teamAbbrevs="${team}"`);
  if (position && position !== "all") conditions.push(`positionCode="${position}"`);

  let data;
  try {
    data = await getSkaterStats({
      season,
      limit: PAGE_SIZE,
      start,
      sort: sort || "points",
      direction: "DESC",
      cayenneExp: conditions.join(" and "),
    });
  } catch {
    return (
      <div className="rounded-xl border border-destructive/50 bg-card p-8 text-center text-muted-foreground">
        <p className="text-destructive font-medium">Impossible de charger les données</p>
        <p className="text-sm mt-1">L&apos;API NHL est temporairement indisponible. Réessaie dans quelques instants.</p>
      </div>
    );
  }

  const players = data?.data || [];
  const total = data?.total || 0;

  // Filter by name client-side (API doesn't support name search on stats endpoint)
  const filtered = q
    ? players.filter((p: Record<string, string>) =>
        `${p.skaterFullName || ""}`.toLowerCase().includes(q.toLowerCase())
      )
    : players;

  if (filtered.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
        Aucun joueur trouvé avec ces filtres.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>{total} joueurs trouvés</span>
        <span>Page {page} · {PAGE_SIZE} par page</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joueur</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">POS</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">EQ</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">PJ</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">B</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">A</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground font-bold text-foreground">PTS</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">+/-</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">BPM</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">PPA</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">PK</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">%T</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">TMG</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player: Record<string, unknown>, idx: number) => {
                const rank = start + idx + 1;
                const playerId = player.playerId as number;
                const name = player.skaterFullName as string || "Inconnu";
                const pos = player.positionCode as string;
                const teamAbbrev = player.teamAbbrevs as string;
                const gp = player.gamesPlayed as number;
                const goals = player.goals as number;
                const assists = player.assists as number;
                const points = player.points as number;
                const plusMinus = player.plusMinus as number;
                const shots = player.shots as number;
                const shootPct = player.shootingPctg as number;
                const ppPoints = player.ppPoints as number;
                const shPoints = player.shPoints as number;
                const toi = player.timeOnIcePerGame as string;
                const pim = player.penaltyMinutes as number;

                return (
                  <tr
                    key={playerId}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {rank}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/players/${playerId}`}
                        className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getPlayerHeadshotUrl(playerId)}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        <span className="font-medium group-hover:text-blue-400 transition-colors">
                          {name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getPositionColor(pos)}`}>
                        {pos}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Link href={`/teams/${teamAbbrev}`} className="text-xs font-medium text-muted-foreground hover:text-foreground">
                        {teamAbbrev}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{gp}</td>
                    <td className="px-3 py-3 text-center">{goals}</td>
                    <td className="px-3 py-3 text-center">{assists}</td>
                    <td className="px-3 py-3 text-center font-bold text-blue-400">{points}</td>
                    <td className={`px-3 py-3 text-center ${plusMinus > 0 ? "text-green-400" : plusMinus < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                      {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
                    </td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{pim}</td>
                    <td className="px-3 py-3 text-center text-purple-400">{ppPoints}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{shPoints || 0}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground">
                      {shootPct ? `${(shootPct * 100).toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-3 py-3 text-center text-muted-foreground font-mono text-xs">
                      {toi || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {start + 1}–{Math.min(start + filtered.length, total)} sur {total}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`?page=${page - 1}`}
              className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm transition-colors"
            >
              ← Précédent
            </Link>
          )}
          {start + PAGE_SIZE < total && (
            <Link
              href={`?page=${page + 1}`}
              className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm transition-colors"
            >
              Suivant →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
