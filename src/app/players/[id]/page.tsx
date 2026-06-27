import { getPlayerProfile, getPlayerHeadshotUrl, formatCapHit, formatSeason } from "@/lib/api/nhl";
import { formatHeight, calculateAge, getPositionColor } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Trophy, Target, Clock, TrendingUp, Shield } from "lucide-react";
import { notFound } from "next/navigation";

export default async function PlayerPage({
  params,
}: {
  params: { id: string };
}) {
  let player;
  try {
    player = await getPlayerProfile(parseInt(params.id));
  } catch {
    notFound();
  }

  if (!player) notFound();

  const name = `${player.firstName?.default} ${player.lastName?.default}`;
  const age = player.birthDate ? calculateAge(player.birthDate) : "—";
  const height = player.heightInInches ? formatHeight(player.heightInInches) : "—";
  const isGoalie = player.positionCode === "G";

  // Current season stats
  const currentStats = player.featuredStats?.regularSeason?.subSeason;
  const careerStats = player.careerTotals?.regularSeason;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/players"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux joueurs
      </Link>

      {/* Hero card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-600 to-cyan-500" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Headshot */}
            <div className="relative flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPlayerHeadshotUrl(parseInt(params.id))}
                alt={name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover bg-secondary"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-player.svg";
                }}
              />
              {player.sweaterNumber && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-card">
                  #{player.sweaterNumber}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${getPositionColor(player.positionCode)}`}>
                  {player.positionCode}
                </span>
                {player.currentTeamAbbrev && (
                  <Link href={`/teams/${player.currentTeamAbbrev}`}>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground">
                      {player.currentTeamAbbrev}
                    </span>
                  </Link>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{name}</h1>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {[
                  { label: "Âge", value: `${age} ans` },
                  { label: "Grandeur", value: height },
                  { label: "Poids", value: player.weightInPounds ? `${player.weightInPounds} lb` : "—" },
                  { label: "Lance", value: player.shootsCatches || "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="font-semibold mt-0.5">{value}</div>
                  </div>
                ))}
              </div>

              {player.birthDate && (
                <p className="text-sm text-muted-foreground mt-3">
                  Né le {new Date(player.birthDate).toLocaleDateString("fr-CA", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                  {player.birthCity?.default && `, ${player.birthCity.default}`}
                  {player.birthCountry && `, ${player.birthCountry}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      {currentStats && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Saison en cours
          </h2>

          {!isGoalie ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: "PJ", value: currentStats.gamesPlayed },
                { label: "Buts", value: currentStats.goals, highlight: true },
                { label: "Aides", value: currentStats.assists, highlight: true },
                { label: "PTS", value: currentStats.points, highlight: true, primary: true },
                { label: "+/-", value: currentStats.plusMinus, signed: true },
                { label: "PUN", value: currentStats.pim },
                { label: "PP", value: currentStats.powerPlayPoints },
                { label: "%T", value: currentStats.shootingPctg ? `${(currentStats.shootingPctg * 100).toFixed(1)}%` : "—" },
              ].map(({ label, value, highlight, primary, signed }) => (
                <div
                  key={label}
                  className={`rounded-xl border p-4 text-center ${
                    primary
                      ? "border-blue-600/50 bg-blue-600/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className={`text-2xl font-bold ${primary ? "text-blue-400" : highlight ? "text-foreground" : "text-muted-foreground"}`}>
                    {signed && typeof value === "number" && value > 0 ? `+${value}` : value ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: "PJ", value: currentStats.gamesPlayed },
                { label: "V", value: currentStats.wins },
                { label: "D", value: currentStats.losses },
                { label: "MPB", value: currentStats.goalsAgainstAvg?.toFixed(2), primary: true },
                { label: "%ARR", value: currentStats.savePctg?.toFixed(3), primary: true },
                { label: "BL", value: currentStats.shutouts },
              ].map(({ label, value, primary }) => (
                <div
                  key={label}
                  className={`rounded-xl border p-4 text-center ${primary ? "border-blue-600/50 bg-blue-600/10" : "border-border bg-card"}`}
                >
                  <div className={`text-2xl font-bold ${primary ? "text-blue-400" : "text-foreground"}`}>
                    {value ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Career totals */}
      {careerStats && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Totaux de carrière (saison régulière)
          </h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 text-center">
              {!isGoalie ? (
                <>
                  {[
                    { label: "Parties", value: careerStats.gamesPlayed },
                    { label: "Buts", value: careerStats.goals },
                    { label: "Aides", value: careerStats.assists },
                    { label: "Points", value: careerStats.points, bold: true },
                    { label: "+/-", value: careerStats.plusMinus, signed: true },
                    { label: "PUN", value: careerStats.pim },
                  ].map(({ label, value, bold, signed }) => (
                    <div key={label}>
                      <div className={`text-xl font-bold ${bold ? "text-blue-400" : ""}`}>
                        {signed && typeof value === "number" && value > 0 ? `+${value}` : value ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: "Parties", value: careerStats.gamesPlayed },
                    { label: "Victoires", value: careerStats.wins },
                    { label: "Défaites", value: careerStats.losses },
                    { label: "MPB moy.", value: careerStats.goalsAgainstAvg?.toFixed(2) },
                    { label: "%Arr. moy.", value: careerStats.savePctg?.toFixed(3) },
                    { label: "Blanchiss.", value: careerStats.shutouts },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xl font-bold">{value ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Draft info */}
      {player.draftDetails && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Repêchage
          </h3>
          <p className="text-sm">
            {player.draftDetails.year} · Ronde {player.draftDetails.round} ·
            Choix {player.draftDetails.pickInRound} ({player.draftDetails.overallPick}e au total) ·{" "}
            <Link href={`/teams/${player.draftDetails.teamAbbrev}`} className="text-blue-400 hover:underline">
              {player.draftDetails.teamAbbrev}
            </Link>
          </p>
        </div>
      )}

      {/* Add to trade/lineup buttons */}
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/line-builder?add=${params.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600/20 border border-orange-600/30 text-orange-400 hover:bg-orange-600/30 transition-colors text-sm font-medium"
        >
          Ajouter au Line Builder
        </Link>
        <Link
          href={`/trade-builder?add=${params.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 border border-red-600/30 text-red-400 hover:bg-red-600/30 transition-colors text-sm font-medium"
        >
          Inclure dans un trade
        </Link>
      </div>
    </div>
  );
}
