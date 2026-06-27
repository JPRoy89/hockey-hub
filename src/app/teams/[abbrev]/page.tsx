import { getTeamRoster, getTeamSkaterStats, getPlayerHeadshotUrl } from "@/lib/api/nhl";
import { getPositionColor, formatCapHit, formatHeight, calculateAge } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Users, Shield, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";
import { TEAM_COLORS } from "@/lib/api/nhl";

export default async function TeamPage({
  params,
}: {
  params: { abbrev: string };
}) {
  const abbrev = params.abbrev.toUpperCase();
  const teamColor = TEAM_COLORS[abbrev];

  let roster;
  try {
    roster = await getTeamRoster(abbrev);
  } catch {
    notFound();
  }

  let statsData;
  try {
    statsData = await getTeamSkaterStats(abbrev);
  } catch {
    statsData = { data: [] };
  }

  // Build a stats lookup map by player name
  const statsMap: Record<string, Record<string, unknown>> = {};
  for (const s of (statsData?.data || [])) {
    const st = s as Record<string, unknown>;
    statsMap[String(st.playerId)] = st;
  }

  const allPlayers = [
    ...roster.forwards,
    ...roster.defensemen,
    ...roster.goalies,
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/teams"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux équipes
      </Link>

      {/* Team Header */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div
          className="h-2"
          style={{
            background: teamColor
              ? `linear-gradient(to right, ${teamColor.primary}, ${teamColor.secondary})`
              : "linear-gradient(to right, #2563eb, #0891b2)",
          }}
        />
        <div className="p-6 flex items-center gap-6">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: teamColor?.primary || "#1e40af" }}
            >
              {abbrev}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{abbrev}</h1>
            <p className="text-muted-foreground">
              {roster.forwards.length} attaquants · {roster.defensemen.length} défenseurs ·{" "}
              {roster.goalies.length} gardiens
            </p>
            <div className="flex gap-4 mt-3">
              <Link
                href={`/line-builder?team=${abbrev}`}
                className="text-sm text-orange-400 hover:text-orange-300 font-medium"
              >
                Ouvrir dans Line Builder →
              </Link>
              <Link
                href={`/trade-builder?team=${abbrev}`}
                className="text-sm text-red-400 hover:text-red-300 font-medium"
              >
                Simuler un trade →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forwards */}
      <RosterSection
        title="Attaquants"
        icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
        players={roster.forwards}
        statsMap={statsMap}
        isGoalie={false}
      />

      {/* Defense */}
      <RosterSection
        title="Défenseurs"
        icon={<Shield className="w-5 h-5 text-orange-400" />}
        players={roster.defensemen}
        statsMap={statsMap}
        isGoalie={false}
      />

      {/* Goalies */}
      <RosterSection
        title="Gardiens"
        icon={<Users className="w-5 h-5 text-purple-400" />}
        players={roster.goalies}
        statsMap={statsMap}
        isGoalie={true}
      />
    </div>
  );
}

function RosterSection({
  title,
  icon,
  players,
  statsMap,
  isGoalie,
}: {
  title: string;
  icon: React.ReactNode;
  players: Array<Record<string, unknown>>;
  statsMap: Record<string, Record<string, unknown>>;
  isGoalie: boolean;
}) {
  if (!players.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold flex items-center gap-2">
        {icon}
        {title}
        <span className="text-sm font-normal text-muted-foreground">({players.length})</span>
      </h2>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joueur</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">POS</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">Âge</th>
                <th className="text-center px-3 py-3 font-medium text-muted-foreground">Grand.</th>
                {!isGoalie ? (
                  <>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">PJ</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">B</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">A</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">PTS</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">+/-</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">TMG</th>
                  </>
                ) : (
                  <>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">PJ</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">V</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">MPB</th>
                    <th className="text-center px-3 py-3 font-medium text-muted-foreground">%ARR</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {players.map((player) => {
                const id = player.id as number;
                const firstName = (player.firstName as { default: string })?.default || "";
                const lastName = (player.lastName as { default: string })?.default || "";
                const name = `${firstName} ${lastName}`;
                const pos = player.positionCode as string;
                const num = player.sweaterNumber as number;
                const age = player.birthDate ? calculateAge(player.birthDate as string) : "—";
                const height = player.heightInInches ? formatHeight(player.heightInInches as number) : "—";
                const stats = statsMap[String(id)];

                return (
                  <tr
                    key={id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{num}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/players/${id}`}
                        className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getPlayerHeadshotUrl(id)}
                          alt={name}
                          className="w-8 h-8 rounded-full bg-secondary object-cover flex-shrink-0"
                        />
                        <span className="font-medium group-hover:text-blue-400 transition-colors">{name}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getPositionColor(pos)}`}>
                        {pos}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{age}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{height}</td>
                    {!isGoalie ? (
                      <>
                        <td className="px-3 py-3 text-center text-muted-foreground">{stats?.gamesPlayed ?? "—"}</td>
                        <td className="px-3 py-3 text-center">{stats?.goals ?? "—"}</td>
                        <td className="px-3 py-3 text-center">{stats?.assists ?? "—"}</td>
                        <td className="px-3 py-3 text-center font-bold text-blue-400">{stats?.points ?? "—"}</td>
                        <td className={`px-3 py-3 text-center ${Number(stats?.plusMinus) > 0 ? "text-green-400" : Number(stats?.plusMinus) < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                          {stats?.plusMinus != null ? (Number(stats.plusMinus) > 0 ? `+${stats.plusMinus}` : stats.plusMinus) : "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground font-mono text-xs">
                          {stats?.timeOnIcePerGame ?? "—"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-3 py-3 text-center text-muted-foreground">{stats?.gamesPlayed ?? "—"}</td>
                        <td className="px-3 py-3 text-center">{stats?.wins ?? "—"}</td>
                        <td className="px-3 py-3 text-center text-blue-400">
                          {stats?.goalsAgainstAverage ? Number(stats.goalsAgainstAverage).toFixed(2) : "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-blue-400">
                          {stats?.savePct ? Number(stats.savePct).toFixed(3) : "—"}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
