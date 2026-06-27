# 🏒 HockeyHub

Application web complète pour les fans de hockey NHL — stats, contrats, masse salariale, line builder et mock trades.

## Fonctionnalités

- **Base de données joueurs** — Stats de base et avancées de tous les joueurs NHL (API NHL officieuse)
- **Équipes & Classements** — Roster complet, stats par ligne, classements
- **Contrats & Cap** — Vue d'ensemble de la masse salariale de chaque équipe
- **Line Builder** — Refais l'alignement de ton équipe avec calcul cap en temps réel
  - Joueurs d'autres ligues (AHL, KHL, SHL...) avec estimation de contrat
- **Mock Trade Builder** — Simule des trades entre 2-3 équipes, validation cap auto

## Stack technique

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **State:** Zustand (persisté en localStorage)
- **Data fetching:** TanStack Query
- **Base de données:** Supabase (PostgreSQL)
- **Déploiement:** Vercel

## Installation

```bash
# 1. Clone le repo
git clone <repo-url>
cd hockey-hub

# 2. Installe les dépendances
npm install

# 3. Configure l'environnement
cp .env.local.example .env.local
# Remplis NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Initialise la base de données Supabase
# Va sur supabase.com → SQL Editor → colle le contenu de supabase/migrations/001_initial_schema.sql

# 5. Lance en développement
npm run dev
```

L'app sera disponible sur http://localhost:3000

## Sources de données

- **Stats joueurs/équipes:** [NHL API](https://api-web.nhle.com/v1/) (gratuite, non officielle)
- **Contrats:** Données manuelles (intégration PuckPedia en développement)
- **Stats avancées:** À intégrer via Natural Stat Trick / MoneyPuck

## Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── players/            # DB joueurs + profils
│   ├── teams/              # Équipes + classements
│   ├── contracts/          # Vue masse salariale
│   ├── line-builder/       # Constructeur d'alignement
│   ├── trade-builder/      # Simulateur de trades
│   └── api/                # Routes API
├── components/
│   ├── players/            # Composants joueurs
│   ├── teams/              # Composants équipes
│   ├── lineup/             # Line builder
│   ├── trade/              # Trade builder
│   └── ui/                 # Composants UI partagés
├── lib/
│   ├── api/nhl.ts          # Client NHL API
│   └── utils.ts            # Utilitaires
├── store/
│   ├── lineup.ts           # Store Zustand lineup
│   └── trade.ts            # Store Zustand trades
├── types/
│   └── hockey.ts           # Types TypeScript
└── supabase/
    └── migrations/         # Schema SQL
```

## Roadmap

- [ ] Intégration contrats complets (PuckPedia scraper)
- [ ] Stats avancées (Corsi, xG, HDCF) via Natural Stat Trick
- [ ] Partage public de trades/lineups via URL
- [ ] Comparateur de joueurs
- [ ] Historique de trades NHL
- [ ] Draft simulator
- [ ] Authentification utilisateur
- [ ] Mode mobile optimisé
