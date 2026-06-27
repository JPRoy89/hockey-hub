'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, Plus, X, ChevronDown, DollarSign, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface PlayerStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
}

interface RosterPlayer {
  id: number;
  firstName: { default: string };
  lastName: { default: string };
  sweaterNumber: number;
  positionCode: string;
  stats: PlayerStats | null;
  estimatedSalary: number;
}

interface TradeTeam {
  abbrev: string;
  forwards: RosterPlayer[];
  defensemen: RosterPlayer[];
  loading: boolean;
  outgoing: RosterPlayer[];
}

const NHL_TEAMS = [
  'ANA','BOS','BUF','CAR','CBJ','CGY','CHI','COL','DAL','DET',
  'EDM','FLA','LAK','MIN','MTL','NJD','NSH','NYI','NYR','OTT',
  'PHI','PIT','SEA','SJS','STL','TBL','TOR','UTA','VAN','VGK','WPG','WSH',
];

const CAP_CEILING = 88_000_000;

const posColor: Record<string, string> = {
  C: '#3b82f6', L: '#06b6d4', LW: '#06b6d4',
  R: '#8b5cf6', RW: '#8b5cf6', D: '#f59e0b',
};

function capFmt(n: number) {
  return `$${(n / 1_000_000).toFixed(2)}M`;
}

function PlayerRow({ player, selected, onToggle }: { player: RosterPlayer; selected: boolean; onToggle: () => void }) {
  const pos = player.positionCode || '?';
  const pCol = posColor[pos] || '#94a3b8';
  const name = `${player.firstName.default} ${player.lastName.default}`;
  const s = player.stats;

  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 8px', borderRadius: 7,
        border: `1px solid ${selected ? 'rgba(239,68,68,0.4)' : 'transparent'}`,
        background: selected ? 'rgba(239,68,68,0.08)' : 'transparent',
        cursor: 'pointer', marginBottom: 3,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <span style={{
        fontSize: '0.6rem', fontWeight: 700, padding: '1px 4px', borderRadius: 4,
        background: `${pCol}20`, color: pCol, flexShrink: 0,
      }}>{pos}</span>
      <span style={{ fontSize: '0.8rem', color: selected ? '#f87171' : '#e2e8f0', fontWeight: selected ? 700 : 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      {s && (
        <div style={{ display: 'flex', gap: 6, fontSize: '0.68rem', color: '#64748b', flexShrink: 0, alignItems: 'center' }}>
          <span style={{ color: s.points >= 50 ? '#3b82f6' : s.points >= 20 ? '#06b6d4' : '#64748b', fontWeight: 700 }}>{s.points}P</span>
          <span>{s.goals}B</span>
          <span style={{ color: '#4b5563' }}>{capFmt(player.estimatedSalary)}</span>
        </div>
      )}
      {!s && (
        <span style={{ fontSize: '0.65rem', color: '#4b5563' }}>{capFmt(player.estimatedSalary)}</span>
      )}
      <div style={{ flexShrink: 0 }}>
        {selected ? <X size={12} color="#ef4444" /> : <Plus size={12} color="#4b5563" />}
      </div>
    </div>
  );
}

function TeamPanel({ team, index, onTeamChange, onTogglePlayer }: {
  team: TradeTeam;
  index: number;
  onTeamChange: (abbrev: string) => void;
  onTogglePlayer: (p: RosterPlayer) => void;
}) {
  const outSalary = team.outgoing.reduce((s, p) => s + p.estimatedSalary, 0);
  const colors = ['#3b82f6', '#06b6d4', '#f59e0b'];
  const col = colors[index % colors.length];

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: `1px solid ${col}25`,
      borderRadius: 14, overflow: 'hidden', flex: 1, minWidth: 280,
    }}>
      {/* Team header */}
      <div style={{ background: `${col}10`, borderBottom: `1px solid ${col}20`, padding: '14px 16px' }}>
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
                appearance: 'none', width: '100%%',
                background: 'transparent', border: 'none', color: '#e2e8f0',
                fontSize: '1rem', fontWeight: 800, cursor: 'pointer', outline: 'none', paddingRight: 20,
              }}
            >
              {NHL_TEAMS.map(t => (
                <option key={t} value={t} style={{ background: '#0d1221' }}>{t}</option>
              ))}
            </select>
            <ChevronDown size={12} color="#64748b" style={{ position: 'absolute', right: 0, top: '50%%', transform: 'translateY(-50%%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {team.outgoing.length > 0 && (
          <div style={{
            marginTop: 10, padding: '8px 10px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
          }}>
            <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, marginBottom: 4 }}>
              Envoy�)s ({team.outgoing.length}) · {capFmt(outSalary)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {team.outgoing.map(p => (
                <span key={p.id} style={{
                  fontSize: '0.68rem', padding: '2px 6px', borderRadius: 4,
                  background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
                }}>
                  {p.lastName.default} ({capFmt(p.estimatedSalary)})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Roster */}
      <div style={{ padding: 12, maxHeight: 440, overflowY: 'auto' }}>
        {team.loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 }}>
            <div className="spinner" />
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Chargement...</span>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div style={{ display: 'flex', gap: 8, padding: '0 8px 6px', fontSize: '0.6rem', color: '#374151', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 6 }}>
              <span style={{ flex: 1 }}>JOUEUR</span>
              <span>PTS</span>
              <span>B</span>
              <span style={{ minWidth: 48 }}>SALAIRE</span>
            </div>

            {team.forwards.length > 0 && (
              <>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 4, paddingLeft: 4 }}>
                  ATT ({team.forwards.length})
                </div>
                {team.forwards.map(p => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    selected={team.outgoing.some(o => o.id === p.id)}
                    onToggle={() => onTogglePlayer(p)}
                  />
                ))}
              </>
            )}

            {team.defensemen.length > 0 && (
              <>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.1em', marginBottom: 4, marginTop: 10, paddingLeft: 4 }}>
                  DEF ({team.defensemen.length})
                </div>
                {team.defensemen.map(p => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    selected={team.outgoing.some(o => o.id === p.id)}
                    onToggle={() => onTogglePlayer(p)}
                  />
                ))}
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
    DEFAULT_TEAMS.slice(0, 3).map(a => ({ abbrev: a, forwards: [], defensemen: [], loading: false, outgoing: [] }))
  );

  const fetchRoster = useCallback(async (abbrev: string, index: number) => {
    setTeams(prev => {
      const next = [...prev];
      next[index] = { ...next[index], loading: true, forwards: [], defensemen: [] };
      return next;
    });
    try {
      const res = await fetch(`/api/nhl/team-players/${abbrev}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setTeams(prev => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          forwards: data.forwards || [],
          defensemen: data.defensemen || [],
          loading: false,
          outgoing: [],
        };
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
      if (t.forwards.length === 0 && !t.loading) fetchRoster(t.abbrev, i);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numTeams]);

  function changeTeam(index: number, abbrev: string) {
    setTeams(prev => {
      const next = [...prev];
      next[index] = { ...next[index], abbrev, forwards: [], defensemen: [], outgoing: [] };
      return next;
    });
    fetchRoster(abbrev, index);
  }

  function togglePlayer(teamIndex: number, player: RosterPlayer) {
    setTeams(prev => {
      const next = [...prev];
      const team = { ...next[teamIndex] };
      const isOut = team.outgoing.some(p => p.id === player.id);
      team.outgoing = isOut ? team.outgoing.filter(p => p.id !== player.id) : [...team.outgoing, player];
      next[teamIndex] = team;
      return next;
    });
  }

  const activeTeams = teams.slice(0, numTeams);
  const hasPlayers = activeTeams.some(t => t.outgoing.length > 0);

  // Cap balance validation per team
  const teamSalaries = activeTeams.map(t => ({
    abbrev: t.abbrev,
    out: t.outgoing.reduce((s, p) => s + p.estimatedSalary, 0),
  }));
  const totalOut = teamSalaries.reduce((s, t) => s + t.out, 0);
  const isBalanced = activeTeams.every((_, i) => {
    const myOut = teamSalaries[i].out;
    const incoming = totalOut - myOut;
    const perTeam = numTeams > 1 ? incoming / (numTeams - 1) : 0;
    return Math.abs(myOut - perTeam) < 2_500_000 || myOut === 0;
  });

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ArrowLeftRight size={20} color="#f59e0b" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Mock Trade Builder</h1>
              <p style={{ fontSize: '0.8rem', color: '#4b5563' }}>Clique sur les joueurs pour les selectionner</p>
            </div>
          </div>
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
                {n} equipes
              </button>
            ))}
          </div>
        </div>

        {/* Trade summary */}
        {hasPlayers && (
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
              <DollarSign size={16} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>Resumé du trade</span>
              <div style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 8,
                background: isBalanced ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${isBalanced ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                color: isBalanced ? '#10b981' : '#f59e0b',
                fontSize: '0.8rem', fontWeight: 700,
              }}>
                {isBalanced ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {isBalanced ? 'Trade equilibre' : 'Trade desequilibre'}
              </div>
              <button
                onClick={() => setTeams(prev => prev.map(t => ({ ...t, outgoing: [] })))}
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#f87171', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>

            {/* Trade details table */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {activeTeams.map((t, i) => {
                const others = activeTeams.filter((_, j) => j !== i);
                const incoming = others.flatMap(o => o.outgoing);
                const outSal = t.outgoing.reduce((s, p) => s + p.estimatedSalary, 0);
                const inSal = incoming.reduce((s, p) => s + p.estimatedSalary, 0);
                const delta = inSal - outSal;
                const colors = ['#3b82f6', '#06b6d4', '#f59e0b'];
                const col = colors[i % colors.length];
                return (
                  <div key={i} style={{
                    flex: 1, minWidth: 220, padding: '10px 12px', borderRadius: 10,
                    background: 'var(--bg-elevated)', border: `1px solid ${col}20`,
                  }}>
                    <div style={{ fontWeight: 800, color: col, fontSize: '0.85rem', marginBottom: 6 }}>{t.abbrev}</div>
                    {t.outgoing.length > 0 ? (
                      <>
                        <div style={{ fontSize: '0.7rem', color: '#ef4444', marginBottom: 2 }}>Envoie:</div>
                        {t.outgoing.map(p => (
                          <div key={p.id} style={{ fontSize: '0.78rem', color: '#fca5a5', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                            <span>{p.firstName.default} {p.lastName.default}</span>
                            <span style={{ color: '#64748b' }}>
                              {p.stats ? `${p.stats.points}P · ` : ''}{capFmt(p.estimatedSalary)}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : <div style={{ fontSize: '0.75rem', color: '#374151', fontStyle: 'italic' }}>Rien</div>}
                    {incoming.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: 8, marginBottom: 2 }}>Recoit:</div>
                        {incoming.map(p => (
                          <div key={p.id} style={{ fontSize: '0.78rem', color: '#86efac', display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                            <span>{p.firstName.default} {p.lastName.default}</span>
                            <span style={{ color: '#64748b' }}>
                              {p.stats ? `${p.stats.points}P · ` : ''}{capFmt(p.estimatedSalary)}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    <div style={{
                      marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      <span style={{ color: '#64748b' }}>Impact cap</span>
                      <span style={{ color: delta >= 0 ? '#10b981' : '#ef4444' }}>
                        {delta >= 0 ? '+' : ''}{capFmt(delta)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, color: '#4b5563', alignSelf: 'stretch' }}>
            <ArrowLeftRight size={24} />
          </div>
        </div>

        <div style={{
          marginTop: 20, padding: '12px 16px', borderRadius: 10,
          background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)',
          fontSize: '0.78rem', color: '#4b5563',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={14} color="#3b82f6" />
          Salaires estimes selon les points (saison 2024-25). Cap plafond: {capFmt(CAP_CEILING)}.
        </div>
      </div>
    </div>
  );
}
