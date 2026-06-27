import Link from "next/link";
import { TrendingUp, AlertCircle, ExternalLink } from "lucide-react";
import { CAP_CEILING, CAP_FLOOR } from "@/types/hockey";
import { formatCapHitShort } from "@/lib/utils";

export const metadata = {
  title: "Contrats & Masse salariale — HockeyHub",
};

const TEAM_CAP_DATA = [
  { abbrev: "TOR", name: "Toronto Maple Leafs", used: 83_500_000, ltir: 2_100_000, players: 23 },
  { abbrev: "EDM", name: "Edmonton Oilers", used: 86_200_000, ltir: 0, players: 23 },
  { abbrev: "FLA", name: "Florida Panthers", used: 84_700_000, ltir: 3_200_000, players: 23 },
  { abbrev: "NYR", name: "New York Rangers", used: 82_300_000, ltir: 0, players: 23 },
  { abbrev: "BOS", name: "Boston Bruins", used: 81_100_000, ltir: 0, players: 23 },
  { abbrev: "VGK", name: "Vegas Golden Knights", used: 79_800_000, ltir: 1_500_000, players: 23 },
  { abbrev: "DAL", name: "Dallas Stars", used: 78_500_000, ltir: 0, players: 23 },
  { abbrev: "COL", name: "Colorado Avalanche", used: 77_200_000, ltir: 2_800_000, players: 23 },
  { abbrev: "MTL", name: "Montréal Canadiens", used: 74_500_000, ltir: 0, players: 23 },
  { abbrev: "WPG", name: "Winnipeg Jets", used: 76_300_000, ltir: 0, players: 23 },
  { abbrev: "CAR", name: "Carolina Hurricanes", used: 75_800_000, ltir: 0, players: 23 },
  { abbrev: "TBL", name: "Tampa Bay Lightning", used: 73_200_000, ltir: 0, players: 23 },
  { abbrev: "PIT", name: "Pittsburgh Penguins", used: 72_400_000, ltir: 0, players: 23 },
  { abbrev: "MIN", name: "Minnesota Wild", used: 71_600_000, ltir: 0, players: 23 },
  { abbrev: "VAN", name: "Vancouver Canucks", used: 70_900_000, ltir: 0, players: 23 },
  { abbrev: "NSH", name: "Nashville Predators", used: 69_700_000, ltir: 0, players: 23 },
  { abbrev: "STL", name: "St. Louis Blues", used: 68_300_000, ltir: 0, players: 23 },
  { abbrev: "SEA", name: "Seattle Kraken", used: 67_500_000, ltir: 0, players: 23 },
  { abbrev: "NJD", name: "New Jersey Devils", used: 78_900_000, ltir: 4_200_000, players: 23 },
  { abbrev: "OTT", name: "Ottawa Senators", used: 66_800_000, ltir: 0, players: 23 },
  { abbrev: "BUF", name: "Buffalo Sabres", used: 65_900_000, ltir: 0, players: 23 },
  { abbrev: "CHI", name: "Chicago Blackhawks", used: 65_200_000, ltir: 0, players: 23 },
  { abbrev: "DET", name: "Detroit Red Wings", used: 71_800_000, ltir: 0, players: 23 },
  { abbrev: "PHI", name: "Philadelphia Flyers", used: 70_400_000, ltir: 0, players: 23 },
  { abbrev: "UTA", name: "Utah Hockey Club", used: 68_100_000, ltir: 0, players: 23 },
  { abbrev: "SJS", name: "San Jose Sharks", used: 66_400_000, ltir: 0, players: 23 },
  { abbrev: "CGY", name: "Calgary Flames", used: 72_700_000, ltir: 0, players: 23 },
  { abbrev: "WSH", name: "Washington Capitals", used: 74_100_000, ltir: 0, players: 23 },
  { abbrev: "LAK", name: "Los Angeles Kings", used: 73_500_000, ltir: 0, players: 23 },
  { abbrev: "NYI", name: "New York Islanders", used: 72_000_000, ltir: 0, players: 23 },
  { abbrev: "CBJ", name: "Columbus Blue Jackets", used: 67_200_000, ltir: 0, players: 23 },
  { abbrev: "ANA", name: "Anaheim Ducks", used: 65_700_000, ltir: 0, players: 23 },
];

export default function ContractsPage() {
  const sorted = [...TEAM_CAP_DATA].sort((a, b) => {
    const aSpace = CAP_CEILING - a.used + a.ltir;
    const bSpace = CAP_CEILING - b.used + b.ltir;
    return bSpace - aSpace;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-600/20">
          <TrendingUp className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Contrats & Masse salariale</h1>
          <p className="text-sm text-muted-foreground">
            Plafond 2024-25: {formatCapHitShort(CAP_CEILING)} · Plancher: {formatCapHitShort(CAP_FLOOR)}
          </p>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-600/30 bg-yellow-950/10 p-4">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <strong className="text-yellow-400">Note:</strong> Les données de contrats sont des estimations.
          Pour des données précises et à jour, consulte{" "}
          <a href="https://puckpedia.com" target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:underline inline-flex items-center gap-1">
            PuckPedia <ExternalLink className="w-3 h-3" />
          </a>
          {" "}ou{" "}
          <a href="https://capfriendly.com" target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:underline inline-flex items-center gap-1">
            CapFriendly <ExternalLink className="w-3 h-3" />
          </a>.
          L&apos;intégration complète d&apos;une base de contrats est en développement.
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Plafond salarial", value: formatCapHitShort(CAP_CEILING), color: "text-foreground" },
          { label: "Plancher salarial", value: formatCapHitShort(CAP_FLOOR), color: "text-foreground" },
          { label: "Équipes sous le plancher", value: "0", color: "text-green-400" },
          { label: "Équipes au-dessus (LTIR)", value: "3", color: "text-yellow-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Cap table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Équipe</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Cap utilisé</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">LTIR</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground font-bold text-foreground">Espace restant</th>
                <th className="px-4 py-3 w-40">
                  <span className="text-muted-foreground font-medium text-xs">% utilisé</span>
                </th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Joueurs</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((team) => {
                const effectiveCap = CAP_CEILING + team.ltir;
                const space = effectiveCap - team.used;
                const pct = (team.used / CAP_CEILING) * 100;
                const isNearCap = pct > 98;
                const isOverCap = team.used > CAP_CEILING;

                return (
                  <tr key={team.abbrev} className="border-b border-border/50 hover:bg-secondary/30 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/teams/${team.abbrev}`} className="flex items-center gap-3 hover:text-blue-400 group-hover:text-blue-400 transition-colors">
                        <span className="font-bold w-10 text-right font-mono text-xs text-muted-foreground">{team.abbrev}</span>
                        <span className="font-medium">{team.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCapHitShort(team.used)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {team.ltir > 0 ? formatCapHitShort(team.ltir) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${
                      isOverCap ? "text-red-400" : isNearCap ? "text-yellow-400" : space > 5_000_000 ? "text-green-400" : "text-foreground"
                    }`}>
                      {space >= 0 ? formatCapHitShort(space) : `-${formatCapHitShort(Math.abs(space))}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${pct > 98 ? "bg-red-500" : pct > 92 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-right mt-0.5">{pct.toFixed(1)}%</div>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{team.players}</td>
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
