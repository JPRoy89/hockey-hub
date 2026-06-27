import Link from "next/link";
import { Users, Shield, TrendingUp, Layers, ArrowLeftRight, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    href: "/players",
    icon: Users,
    title: "Base de données joueurs",
    description:
      "Cherche n'importe quel joueur NHL — stats de base, avancées (Corsi, xG, TOI), historique de carrière et profil complet.",
    color: "from-blue-600 to-blue-800",
    badge: "32 équipes · 700+ joueurs",
  },
  {
    href: "/teams",
    icon: Shield,
    title: "Équipes & Alignements",
    description:
      "Consulte le roster complet de chaque équipe, les statistiques par ligne et la performance défensive.",
    color: "from-emerald-600 to-emerald-800",
    badge: "Toutes les divisions",
  },
  {
    href: "/contracts",
    icon: TrendingUp,
    title: "Contrats & Masse salariale",
    description:
      "Détail des contrats, cap hit par joueur, espace salarial disponible, joueurs en fin de contrat. Style PuckPedia.",
    color: "from-purple-600 to-purple-800",
    badge: "Cap ceiling 2024-25: $88M",
  },
  {
    href: "/line-builder",
    icon: Layers,
    title: "Line Builder",
    description:
      "Refais l'alignement de ton équipe favorite. Drag & drop les joueurs dans tes trios, vois l'impact sur le cap en temps réel. Ajoute des joueurs d'autres ligues avec estimation de contrat.",
    color: "from-orange-600 to-orange-800",
    badge: "Calcul cap automatique",
  },
  {
    href: "/trade-builder",
    icon: ArrowLeftRight,
    title: "Mock Trade Builder",
    description:
      "Simule des trades entre équipes, vérifie la légalité cap, analyse l'impact sur chaque roster. Partage ton trade en lien public.",
    color: "from-red-600 to-red-800",
    badge: "Multi-équipes · Analyse IA",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-400 text-sm font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Saison 2024-25 · Données NHL en temps réel
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Le hub ultime du{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            hockey NHL
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Stats complètes, contrats, masse salariale, line builder drag &amp; drop
          et simulateur de trades — tout en un seul endroit.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/players"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            Explorer les joueurs
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            href="/trade-builder"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-secondary text-foreground font-semibold transition-colors"
          >
            Faire un mock trade
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {FEATURES.map(({ href, icon: Icon, title, description, color, badge }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-blue-800 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-0.5"
            >
              <div
                className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${color} mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-blue-300 transition-colors">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {badge}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick stats bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Joueurs actifs", value: "750+", sub: "NHL roster" },
          { label: "Équipes", value: "32", sub: "4 divisions" },
          { label: "Plafond salarial", value: "$88M", sub: "Saison 2024-25" },
          { label: "Stats avancées", value: "15+", sub: "Corsi, xG, HDCF..." },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{value}</div>
            <div className="text-sm font-medium text-foreground mt-1">{label}</div>
            <div className="text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
