'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Plus, X, ChevronDown, DollarSign, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface RosterPlayer {
  id: number;
  firstName: { default: string };
  lastName: { default: string };
  sweaterNumber: number;
  positionCode: string;
  salary?: number;
}

interface TradeTeam {
  abbrev: string;
  roster: RosterPlayer[];
  loading: boolean;
  outgoing: RosterPlayer[];
}

const NHL_TEAMS = [
  'ANA','BOS','BUF','CAR','CBJ','CGY','CHI','COL','DAL','DET',
  'EDM','FLA','LAK','MIN','MTL','NJD','NSH','NYI','NYR','OTT',
  'PHI','PIT','SEA','SJS','STL','TBL','TOR','UTA','VAN','VGK','WPG','WSH',
];

const CAP_CEILING = 88_000_000;
const AVG_SALARY = 3_200_000;

const posColor: Record<string, string> = {
  C: '#3b82f6', L: '#06b6d4', LW: '#06b6d4',
  R: '#8b5cf6', RW: '#8b5cf6', D: '#f59e0b',
};

function capFmt(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

function TeamPanel({
  team, index, onTeamChange, onTogglePlayer,
}: {
  team: TradeTeam;
  index: number;
  onTeamChange: (abbrev: string) => void;
  onTogglePlayer: (p: RosterPlayer) => void;
}) {
  const outSalary = team.outgoing.length * AVG_SALARY;
  const inSalary = 0; // simplified

  const forwards = team.roster.filter(p => !['D'].includes(p.positionCode));
  const defensemen = team.roster.filter(p => p.positionCode === 'D');

  const colors = ['#3b82f6', '#06b6d4', '#f59e0b'];
  const col = colors[index % colors.length];

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `1px solid ${col}25`,
      borderRadius: 14, overflow: 'hidden', flex: 1, minWidth: 280,
    }}>
      {/* Team header */}
      <div style={{
        background: `${col}10`,
        borderBottom: `1px solid ${col}20`,
        padding: '14px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${col}20`, border: `1px solid ${col}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: col,
          }}>
            {team.abbrev}
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            <select
              value={team.abbrev}
              onChange={e => onTeamChange(e.target.value)}
              style={{
                appearance: 'none', width: '100%',
                background: 'transparent',
                border: 'none', color: '#e2e8f0',
                fontSize: '1rem', fontWeight: 800,
                cursor: 'pointer', outline: 'none',
                paddingRight: 20,
              }}
            >
              {NHL_TEAMS.map(t => (
                <option key={t} value={t} style={{ background: '#0d1221' }}>{t}</option>
              ))}
            </select>
            <ChevronDown size={12} color="#64748b" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Outgoing summary */}
        {team.outgoing.length > 0 && (
          <div style={{
            marginTop: 10, padding: '6px 10px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            fontSize: '0.75rem', color: '#f87171',
          }}>
            ↗ {team.outgoing.length} joueur{team.outgoing.length > 1 ? 's' : ''} envoyé{team.outgoing.length > 1 ? 's' : ''} · {capFmt(outSalary)}
          </div>
        )}
      </div>

      {/* Roster */}
      <div style={{ padding: 12, maxHeight: 400, overflowY: 'auto' }}>
        {team.loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 }}>
            <div className="spinner" />
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Chargement...</span>
          </div>
        ) : (
          <>
            {forwards.length > 0 && (
              <>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 6, paddingLeft: 4 }}>ATT</div>
                {forwards.map(p => {
                  const selected = team.outgoing.some(o => o.id === p.id);
                  const name = `${p.firstName.default} ${p.lastName.default}`;
                  const pCol = posColor[p.positionCode] || '#94a3b8';
                  return (
                    <div
                      key={p.id}
                      onClick={() => onTogglePlayer(p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 8px', borderRadius: 7,
                        border: `1px solid ${selected ? 'rgba(239,68,68,0.4)' : 'transparent'}`,
                        background: selected ? 'rgba(239,68,68,0.08)' : 'transparent',
                        cursor: 'pointer', marginBottom: 3,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={e => {
                        if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      }}
                    >
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, padding: '1px 4px', borderRadius: 4,
                        background: `${pCol}20`, color: pCol, flexShrink: 0,
                      }}>{p.positionCode}</span>
                      <span style={{ fontSize: '0.82rem', color: selected ? '#f87171' : '#e2e8f0', fontWeight: selected ? 700 : 500, flex: 1 }}>
                        {name}
                      </span>
                      {selected ? <X size={12} color="#ef4444" /> : <Plus size={12} color="#4b5563" />}
                    </div>
                  );
                })}
              </>
            )}

            {defensemen.length > 0 && (
              <>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', marginBottom: 6, marginTop: 10, paddingLeft: 4 }}>DÉF</div>
                {defensemen.map(p => {
                  const selected = team.outgoing.some(o => o.id === p.id);
                  const name = `${p.firstName.default} ${p.lastName.default}`;
                  return (
                    <div
                      key={p.id}
                      onClick={() => onTogglePlayer(p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 8px', borderRadius: 7,
                        border: `1px solid ${selected ? 'rgba(239,68,68,0.4)' : 'transparent'}`,
                        background: selected ? 'rgba(239,68,68,0.08)' : 'transparent',
                        cursor: 'pointer', marginBottom: 3,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={e => {
                        if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      }}
                    >
                      <span style={{
                        fontSize: '0.6rem', fontWeight: 700, padding: '1px 4px', borderRadius: 4,
                        background: 'rgba(245,158,11,0.2)', color: '#f59e0b', flexShrink: 0,
                      }}>D</span>
                      <span style={{ fontSize: '0.82rem', color: selected ? '#f87171' : '#e2e8f0', fontWeight: selected ? 700 : 500, flex: 1 }}>
                        {name}
                      </span>
                      {selected ? <X size={12} color="#ef4444" /> : <Plus size={12} color="#4b5563" />}
                    </div>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const DEFAULT_TEAMS = ['MTL', 'TOR', 'BOS'];

export function TradeBuilderClient() {
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState<TradeTeam[]>(
    DEFAULT_TEAMS.slice(0, 3).map(a => ({ abbrev: a, roster: [], loading: false, outgoing: [] }))
  );

  const fetchRoster = useCallback(async (abbrev: string, index: number) => {
    setTeams(prev => {
      const next = [...prev];
      next[index] = { ...next[index], loading: true, roster: [] };
      return next;
    });
    try {
      const res = await fetch(`https://api-web.nhle.com/v1/roster/${abbrev}/20242025`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const roster: RosterPlayer[] = [
        ...(data.forwards || []),
        ...(data.defensemen || []),
      ];
      setTeams(prev => {
        const next = [...prev];
        next[index] = { ...next[index], roster, loading: false, outgoing: [] };
        return next;
      });
    } catch {
      setTeams(prev => {
        const next = [...prev];
        next[index] = { ...next[index], loading: false };
        return next;
      });
    }
  }, []);

  useEffect(() => {
    teams.slice(0, numTeams).forEach((t, i) => {
      if (t.roster.length === 0 && !t.loading) fetchRoster(t.abbrev, i);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numTeams]);

  function changeTeam(index: number, abbrev: string) {
    setTeams(prev => {
      const next = [...prev];
      next[index] = { ...next[index], abbrev, roster: [], outgoing: [] };
      return next;
    });
    fetchRoster(abbrev, index);
  }

  function togglePlayer(teamIndex: number, player: RosterPlayer) {
    setTeams(prev => {
      const next = [...prev];
      const team = { ...next[teamIndex] };
      const isOut = team.outgoing.some(p => p.id === player.id);
      team.outgoing = isOut
        ? team.outgoing.filter(p => p.id !== player.id)
        : [...team.outgoing, player];
      next[teamIndex] = team;
      return next;
    });
  }

  // Validation
  const activeTeams = teams.slice(0, numTeams);
  const totalOut = activeTeams.reduce((sum, t) => sum + t.outgoing.length * AVG_SALARY, 0);
  const isBalanced = activeTeams.every(t => {
    const out = t.outgoing.length * AVG_SALARY;
    const incoming = activeTeams.filter((_, i) => i !== activeTeams.indexOf(t))
      .reduce((s, other) => s + other.outgoing.length * AVG_SALARY / (numTeams - 1), 0);
    const diff = Math.abs(out - incoming);
    return diff < 3_000_000;
  });

  const hasPlayers = activeTeams.some(t => t.outgoing.length > 0);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ArrowLeftRight size={20} color="#f59e0b" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
                Mock Trade Builder
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#4b5563' }}>Clique sur les joueurs pour les sélectionner</p>
            </div>
          </div>

          {/* Teams toggle */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[2, 3].map(n => (
              <button
                key={n}
                onClick={() => setNumTeams(n)}
                style={{
                  padding: '6px 16px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  background: numTeams === n ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                  color: numTeams === n ? 'black' : '#94a3b8',
                  transition: 'all 0.15s',
                }}
              >
                {n} équipes
              </button>
            ))}
          </div>
        </div>

        {/* Trade summary bar */}
        {hasPlayers && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 20px',
            marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          }}>
            <DollarSign size={16} color="#10b981" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {activeTeams.map((t, i) => (
                  t.outgoing.length > 0 && (
                    <div key={i} style={{ fontSize: '0.82rem' }}>
                      <span style={{ color: '#94a3b8' }}>{t.abbrev} envoie: </span>
                      <span style={{ color: '#e2e8f0', fontWeight: 700 }}>
                        {t.outgoing.map(p => p.lastName.default).join(', ')}
                      </span>
                      <span style={{ color: '#f87171', marginLeft: 6 }}>
                        ({capFmt(t.outgoing.length * AVG_SALARY)})
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8,
              background: isBalanced ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${isBalanced ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
              color: isBalanced ? '#10b981' : '#f59e0b',
              fontSize: '0.8rem', fontWeight: 700,
            }}>
              {isBalanced ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {isBalanced ? 'Trade équilibré' : 'Trade déséquilibré'}
            </div>
            <button
              onClick={() => setTeams(prev => prev.map(t => ({ ...t, outgoing: [] })))}
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#f87171', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>
        )}

        {/* Team panels */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {activeTeams.map((team, i) => (
            <TeamPanel
              key={i}
              team={team}
              index={i}
              onTeamChange={abbrev => changeTeam(i, abbrev)}
              onTogglePlayer={p => togglePlayer(i, p)}
            />
          ))}

          {/* Arrow between */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            paddingTop: 80, color: '#4b5563',
            alignSelf: 'stretch',
          }}>
            <ArrowLeftRight size={24} />
          </div>
        </div>

        {/* Cap warning */}
        <div style={{
          marginTop: 20, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)',
          fontSize: '0.78rem', color: '#4b5563',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={14} color="#3b82f6" />
          Salaires estimés à {capFmt(AVG_SALARY)}/joueur (moyenne NHL). Cap plafond 2024-25: {capFmt(CAP_CEILING)}.
        </div>
      </div>
    </div>
  );
}
