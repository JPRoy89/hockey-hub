'use client';

import Link from 'next/link';
import { Users, Shield, DollarSign, Layers, ArrowLeftRight, ChevronRight, Disc, Zap } from 'lucide-react';

const features = [
  { href: '/players', icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', title: 'Base de données joueurs', desc: 'Stats complètes — buts, passes, points, Corsi, xG, TOI pour tous les joueurs NHL.', tag: '700+ joueurs' },
  { href: '/teams', icon: Shield, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', title: 'Équipes & Alignements', desc: "Roster complet de chaque équipe, classements par division et statistiques d'équipe.", tag: '32 équipes' },
  { href: '/contracts', icon: DollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.08)', title: 'Contrats & Cap Space', desc: 'Masse salariale, espace cap, contrats détaillés et projections.', tag: 'Saison 2024-25' },
  { href: '/line-builder', icon: Layers, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', title: 'Line Builder', desc: 'Construis tes trios et paires de défenseurs par drag & drop avec calcul cap en temps réel.', tag: 'Drag & Drop' },
  { href: '/trade-builder', icon: ArrowLeftRight, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', title: 'Mock Trade Builder', desc: 'Simule des échanges entre 2-3 équipes avec validation automatique du cap salarial.', tag: '2-3 équipes' },
];
const stats = [
  { value: '700+', label: 'Joueurs NHL' }, { value: '32', label: 'Équipes' },
  { value: '$88M', label: 'Cap plafond' }, { value: 'Live', label: 'Données NHL' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <section style={{ position: 'relative', overflow: 'hidden', padding: '72px 24px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Saison 2024-25 · Données NHL en temps réel</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
            <span style={{ color: '#e2e8f0' }}>Le hub ultime</span><br />
            <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>du hockey NHL</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 36px' }}>
            Stats avancées, contrats, masse salariale, line builder drag&amp;drop et simulateur de trades.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/players" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: '#3b82f6', color: 'white', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
              <Users size={18} />Explorer les joueurs<ChevronRight size={16} />
            </Link>
            <Link href="/trade-builder" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(59,130,246,0.2)', color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
              <ArrowLeftRight size={18} />Faire un mock trade
            </Link>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 32px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <Zap size={18} color="#3b82f6" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>Fonctionnalités</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {features.map(({ href, icon: Icon, color, bg, title, desc, tag }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, height: '100%', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={color} strokeWidth={2} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: bg, color: color }}>{tag}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16, color: color, fontSize: '0.8rem', fontWeight: 600 }}>
                  Accéder <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Disc size={16} color="#3b82f6" />
          <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>HockeyHub · Données fournies par l&apos;API NHL officielle</span>
        </div>
      </footer>
    </div>
  );
}