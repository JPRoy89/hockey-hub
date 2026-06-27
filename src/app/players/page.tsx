'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Filter, TrendingUp, Users } from 'lucide-react';

interface Player {
  playerId: number;
  firstName: { default: string };
  lastName: { default: string };
  teamAbbrev: { default: string };
  position: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  penaltyMinutes: number;
  ppPoints: number;
  shots: number;
  shootingPctg: number;
  avgToi: string;
}

type SortKey = 'points' | 'goals' | 'assists' | 'gamesPlayed' | 'plusMinus' | 'shots' | 'shootingPctg';

const POSITIONS = ['All', 'C', 'L', 'R', 'D'];

const posColor: Record<string, string> = {
  C: '#3b82f6', L: '#06b6d4', R: '#8b5cf6', D: '#f59e0b', G: '#10b981',
};

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const PER_PAGE = 50;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const url = 'https://api.nhle.com/stats/rest/en/skater/summary?' +
          'isAggregate=false&isGame=false' +
          '&sort=%5B%7B%22property%22%3A%22points%22%2C%22direction%22%3A%22DESC%22%7D%5D' +
          '&start=0&limit=500' +
          '&cayenneExp=seasonId%3D20242025%20and%20gameTypeId%3D2';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`NHL API ${res.status}`);
        const data = await res.json();
        const mapped: Player[] = (data.data || []).map((p: Record<string, unknown>) => ({
          playerId: p.playerId as number,
          firstName: { default: (p.skaterFullName as string)?.split(' ').slice(0, -1).join(' ') || '' },
          lastName: { default: (p.skaterFullName as string)?.split(' ').slice(-1)[0] || '' },
          teamAbbrev: { default: p.teamAbbrevs as string || '' },
          position: p.positionCode as string || '',
          gamesPlayed: (p.gamesPlayed as number) || 0,
          goals: (p.goals as number) || 0,
          assists: (p.assists as number) || 0,
          points: (p.points as number) || 0,
          plusMinus: (p.plusMinus as number) || 0,
          penaltyMinutes: (p.penaltyMinutes as number) || 0,
          ppPoints: (p.ppPoints as number) || 0,
          shots: (p.shots as number) || 0,
          shootingPctg: Math.round(((p.shootingPct as number) || 0) * 100) / 100,
          avgToi: p.timeOnIcePerGame as string || '0:00',
        }));
        setPlayers(mapped);
      } catch {
        setError('Impossible de charger les données NHL. Réessayez plus tard.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let data = players;
    if (position !== 'All') data = data.filter(p => p.position === position);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        `${p.firstName.default} ${p.lastName.default}`.toLowerCase().includes(q) ||
        p.teamAbbrev.default.toLowerCase().includes(q)
      );
    }
    return [...data].sort((a, b) => {
      const va = a[sortKey] as number;
      const vb = b[sortKey] as number;
      return sortDir === 'desc' ? vb - va : va - vb;
    });
  }, [players, search, position, sortKey, sortDir]);

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronUp size={12} color="#4b5563" />;
    return sortDir === 'desc' ? <ChevronDown size={12} color="#3b82f6" /> : <ChevronUp size={12} color="#3b82f6" />;
  };

  const ColHeader = ({ label, k, align = 'right' }: { label: string; k: SortKey; align?: string }) => (
    <th onClick={() => toggleSort(k)} style={{ textAlign: align as 'left' | 'right', cursor: 'pointer', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {label}<SortIcon k={k} />
      </div>
    </th>
  );
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#3b82f6" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Joueurs NHL</h1>
              <p style={{ fontSize: '0.8rem', color: '#4b5563' }}>Saison 2024-25 · {loading ? '...' : `${filtered.length} joueurs`}</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: 220 }}>
            <Search size={15} color="#4b5563" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input-dark" style={{ paddingLeft: 36 }} placeholder="Rechercher un joueur ou équipe..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Filter size={14} color="#4b5563" />
            {POSITIONS.map(pos => (
              <button key={pos} onClick={() => { setPosition(pos); setPage(0); }} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: position === pos ? (posColor[pos] || '#3b82f6') : 'rgba(255,255,255,0.05)', color: position === pos ? 'white' : '#94a3b8', transition: 'all 0.15s' }}>{pos}</button>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60 }}>
              <div className="spinner" /><span style={{ color: '#64748b', fontSize: '0.9rem' }}>Chargement des données NHL...</span>
            </div>
          ) : error ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#ef4444' }}>
              <TrendingUp size={32} style={{ marginBottom: 12, opacity: 0.4 }} /><p>{error}</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr>
                    <th style={{ width: 40, textAlign: 'center' }}>#</th>
                    <ColHeader label="Joueur" k="points" align="left" />
                    <th style={{ textAlign: 'center' }}>POS</th>
                    <th>ÉQUIPE</th>
                    <ColHeader label="PJ" k="gamesPlayed" />
                    <ColHeader label="B" k="goals" />
                    <ColHeader label="A" k="assists" />
                    <ColHeader label="PTS" k="points" />
                    <ColHeader label="+/-" k="plusMinus" />
                    <ColHeader label="TIR" k="shots" />
                    <ColHeader label="%" k="shootingPctg" />
                  </tr></thead>
                  <tbody>
                    {paginated.map((p, i) => {
                      const rank = page * PER_PAGE + i + 1;
                      const name = `${p.firstName.default} ${p.lastName.default}`;
                      const pos = p.position || '?';
                      const col = posColor[pos] || '#94a3b8';
                      return (
                        <tr key={p.playerId}>
                          <td style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.8rem' }}>{rank}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${col}20`, border: `1px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: col, flexShrink: 0 }}>
                                {name.split(' ').map(n => n[0]).join('').slice(0,2)}
                              </div>
                              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{name}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}><span style={{ padding: '2px 7px', borderRadius: 5, background: `${col}18`, color: col, fontSize: '0.72rem', fontWeight: 700 }}>{pos}</span></td>
                          <td><span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.85rem' }}>{p.teamAbbrev.default}</span></td>
                          <td style={{ textAlign: 'right', color: '#94a3b8' }}>{p.gamesPlayed}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#e2e8f0' }}>{p.goals}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#e2e8f0' }}>{p.assists}</td>
                          <td style={{ textAlign: 'right' }}><span style={{ fontWeight: 800, fontSize: '0.95rem', color: p.points >= 60 ? '#3b82f6' : p.points >= 30 ? '#06b6d4' : '#e2e8f0' }}>{p.points}</span></td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: p.plusMinus > 0 ? '#10b981' : p.plusMinus < 0 ? '#ef4444' : '#94a3b8' }}>{p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}</td>
                          <td style={{ textAlign: 'right', color: '#94a3b8' }}>{p.shots}</td>
                          <td style={{ textAlign: 'right', color: '#94a3b8' }}>{p.shootingPctg ? `${p.shootingPctg.toFixed(1)}%` : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} sur {filtered.length}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost" style={{ padding: '4px 12px', fontSize: '0.8rem', opacity: page === 0 ? 0.4 : 1 }}>← Préc</button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p2 = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                      return <button key={p2} onClick={() => setPage(p2)} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8rem', background: page === p2 ? '#3b82f6' : 'rgba(255,255,255,0.05)', color: page === p2 ? 'white' : '#94a3b8', fontWeight: page === p2 ? 700 : 400 }}>{p2 + 1}</button>;
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="btn-ghost" style={{ padding: '4px 12px', fontSize: '0.8rem', opacity: page === totalPages - 1 ? 0.4 : 1 }}>Suiv →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}