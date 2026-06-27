'use client';

import { useState, useEffect, useCallback } from 'react';
import { Layers, RefreshCw, Users, Shield, DollarSign, ChevronDown } from 'lucide-react';

interface RosterPlayer {
  id: number;
  firstName: { default: string };
  lastName: { default: string };
  sweaterNumber: number;
  positionCode: string;
  salary?: number;
}

interface LineSlot { pos: string; player: RosterPlayer | null; }
type LineSet = [LineSlot, LineSlot, LineSlot];
type PairSet = [LineSlot, LineSlot];

const NHL_TEAMS = [
  { abbrev: 'ANA', name: "Ducks d'Anaheim" },
  { abbrev: 'BOS', name: 'Bruins de Boston' },
  { abbrev: 'BUF', name: 'Sabres de Buffalo' },
  { abbrev: 'CAR', name: 'Hurricanes de la Caroline' },
  { abbrev: 'CBJ', name: 'Blue Jackets de Columbus' },
  { abbrev: 'CGY', name: 'Flames de Calgary' },
  { abbrev: 'CHI', name: 'Blackhawks de Chicago' },
  { abbrev: 'COL', name: 'Avalanche du Colorado' },
  { abbrev: 'DAL', name: 'Stars de Dallas' },
  { abbrev: 'DET', name: 'Red Wings de Detroit' },
  { abbrev: 'EDM', name: "Oilers d'Edmonton" },
  { abbrev: 'FLA', name: 'Panthers de la Floride' },
  { abbrev: 'LAK', name: 'Kings de Los Angeles' },
  { abbrev: 'MIN', name: 'Wild du Minnesota' },
  { abbrev: 'MTL', name: 'Canadiens de Montreal' },
  { abbrev: 'NJD', name: 'Devils du New Jersey' },
  { abbrev: 'NSH', name: 'Predators de Nashville' },
  { abbrev: 'NYI', name: 'Islanders de New York' },
  { abbrev: 'NYR', name: 'Rangers de New York' },
  { abbrev: 'OTT', name: "Senateurs d'Ottawa" },
  { abbrev: 'PHI', name: 'Flyers de Philadelphie' },
  { abbrev: 'PIT', name: 'Penguins de Pittsburgh' },
  { abbrev: 'SEA', name: 'Kraken de Seattle' },
  { abbrev: 'SJS', name: 'Sharks de San Jose' },
  { abbrev: 'STL', name: 'Blues de St. Louis' },
  { abbrev: 'TBL', name: 'Lightning de Tampa Bay' },
  { abbrev: 'TOR', name: 'Maple Leafs de Toronto' },
  { abbrev: 'UTA', name: 'Utah Hockey Club' },
  { abbrev: 'VAN', name: 'Canucks de Vancouver' },
  { abbrev: 'VGK', name: 'Golden Knights de Vegas' },
  { abbrev: 'WPG', name: 'Jets de Winnipeg' },
  { abbrev: 'WSH', name: 'Capitals de Washington' },
];

const CAP_CEILING = 88_000_000;
function makeLines(): LineSet[] { return [1,2,3,4].map(()=>([{pos:'LW',player:null},{pos:'C',player:null},{pos:'RW',player:null}] as LineSet)); }
function makePairs(): PairSet[] { return [1,2,3].map(()=>([{pos:'LD',player:null},{pos:'RD',player:null}] as PairSet)); }
const posColor: Record<string,string> = { LW:'#3b82f6', C:'#06b6d4', RW:'#8b5cf6', LD:'#f59e0b', RD:'#f97316' };

function SlotCard({ slot, onDrop, onRemove }: { slot: LineSlot; onDrop: (p: RosterPlayer) => void; onRemove: () => void; }) {
  const [dragOver, setDragOver] = useState(false);
  const col = posColor[slot.pos] || '#94a3b8';
  return (
    <div
      onDragOver={e=>{e.preventDefault();setDragOver(true);}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={e=>{e.preventDefault();setDragOver(false);const raw=e.dataTransfer.getData('player');if(raw){try{onDrop(JSON.parse(raw));}catch{}}}}
      style={{ border: `1px solid ${dragOver?col:'rgba(59,130,246,0.15)'}`, borderRadius:10, padding:'10px 12px', background:dragOver?`${col}12`:slot.player?'var(--bg-elevated)':'rgba(255,255,255,0.02)', cursor:'pointer', minWidth:130, minHeight:68, display:'flex', flexDirection:'column', gap:4, transition:'all 0.15s', position:'relative' }}
    >
      <div style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.1em', color:col, marginBottom:4 }}>{slot.pos}</div>
      {slot.player ? (
        <>
          <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#e2e8f0', lineHeight:1.2 }}>{slot.player.lastName.default}</div>
          <div style={{ fontSize:'0.72rem', color:'#64748b' }}>#{slot.player.sweaterNumber}</div>
          <button onClick={onRemove} style={{ position:'absolute', top:6, right:6, background:'rgba(239,68,68,0.15)', border:'none', borderRadius:4, color:'#ef4444', cursor:'pointer', fontSize:'0.65rem', padding:'1px 5px', lineHeight:1.4 }}>x</button>
        </>
      ) : (
        <div style={{ fontSize:'0.75rem', color:'#374151', marginTop:4, fontStyle:'italic' }}>Glisser ici</div>
      )}
    </div>
  );
}

function PlayerCard({ player }: { player: RosterPlayer }) {
  const col = posColor[player.positionCode] || '#94a3b8';
  const name = `${player.firstName.default} ${player.lastName.default}`;
  return (
    <div
      draggable
      onDragStart={e=>e.dataTransfer.setData('player',JSON.stringify(player))}
      style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-elevated)', cursor:'grab', marginBottom:4, transition:'all 0.15s' }}
      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=col;(e.currentTarget as HTMLDivElement).style.background=`${col}10`;}}
      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='rgba(59,130,246,0.12)';(e.currentTarget as HTMLDivElement).style.background='var(--bg-elevated)';}}
    >
      <span style={{ fontSize:'0.65rem', fontWeight:700, padding:'2px 5px', borderRadius:4, background:`${col}20`, color:col, flexShrink:0 }}>{player.positionCode}</span>
      <span style={{ fontSize:'0.8rem', color:'#e2e8f0', fontWeight:500, flex:1 }}>{name}</span>
      <span style={{ fontSize:'0.72rem', color:'#4b5563' }}>#{player.sweaterNumber}</span>
    </div>
  );
}
export function LineBuilderClient() {
  const [teamAbbrev, setTeamAbbrev] = useState('MTL');
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<LineSet[]>(makeLines());
  const [pairs, setPairs] = useState<PairSet[]>(makePairs());
  const [capUsed, setCapUsed] = useState(0);

  const fetchRoster = useCallback(async (abbrev: string) => {
    setLoading(true); setRoster([]);
    try {
      const res = await fetch(`https://api-web.nhle.com/v1/roster/${abbrev}/20242025`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setRoster([...(data.forwards||[]),...(data.defensemen||[])]);
    } catch { console.error('Roster fetch failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRoster(teamAbbrev); }, [teamAbbrev, fetchRoster]);
  useEffect(() => {
    const count = lines.flat().filter(s=>s.player).length + pairs.flat().filter(s=>s.player).length;
    setCapUsed(count * 3_200_000);
  }, [lines, pairs]);

  const capPct = Math.min(100, (capUsed / CAP_CEILING) * 100);
  const capColor = capPct > 90 ? '#ef4444' : capPct > 75 ? '#f59e0b' : '#10b981';
  const forwards = roster.filter(p => ['C','L','R','LW','RW'].includes(p.positionCode));
  const defensemen = roster.filter(p => ['D','LD','RD'].includes(p.positionCode));

  return (
    <div style={{ background:'var(--bg-base)', minHeight:'100vh' }}>
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Layers size={20} color="#8b5cf6" />
            </div>
            <div>
              <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#e2e8f0', letterSpacing:'-0.02em' }}>Line Builder</h1>
              <p style={{ fontSize:'0.8rem', color:'#4b5563' }}>Glisse les joueurs dans les positions</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ position:'relative' }}>
              <select value={teamAbbrev} onChange={e=>{setTeamAbbrev(e.target.value);setLines(makeLines());setPairs(makePairs());}} style={{ appearance:'none', background:'var(--bg-surface)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:8, padding:'8px 36px 8px 12px', color:'#e2e8f0', fontSize:'0.9rem', fontWeight:600, cursor:'pointer', outline:'none' }}>
                {NHL_TEAMS.map(t => <option key={t.abbrev} value={t.abbrev}>{t.abbrev} -- {t.name}</option>)}
              </select>
              <ChevronDown size={14} color="#64748b" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            </div>
            <button onClick={()=>fetchRoster(teamAbbrev)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', borderRadius:8, padding:8, cursor:'pointer', color:'#94a3b8' }}><RefreshCw size={16} /></button>
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:20 }}>
          <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:16, height:'fit-content' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <Users size={16} color="#3b82f6" />
              <span style={{ fontWeight:700, color:'#e2e8f0', fontSize:'0.9rem' }}>Roster -- {teamAbbrev}</span>
            </div>
            {loading ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:32, gap:10 }}>
                <div className="spinner" /><span style={{ color:'#64748b', fontSize:'0.85rem' }}>Chargement...</span>
              </div>
            ) : (
              <>
                {forwards.length>0&&<><div style={{ fontSize:'0.7rem', fontWeight:700, color:'#3b82f6', letterSpacing:'0.1em', marginBottom:6, marginTop:4 }}>ATTAQUANTS</div>{forwards.map(p=><PlayerCard key={p.id} player={p} />)}</>}
                {defensemen.length>0&&<><div style={{ fontSize:'0.7rem', fontWeight:700, color:'#f59e0b', letterSpacing:'0.1em', marginBottom:6, marginTop:12 }}>DEFENSEURS</div>{defensemen.map(p=><PlayerCard key={p.id} player={p} />)}</>}
              </>
            )}
          </div>
          <div>
            <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:12, padding:'14px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
              <DollarSign size={16} color="#10b981" />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:'0.78rem', color:'#94a3b8', fontWeight:600 }}>Masse salariale estimee</span>
                  <span style={{ fontSize:'0.85rem', fontWeight:800, color:capColor }}>${(capUsed/1_000_000).toFixed(1)}M / $88M</span>
                </div>
                <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3 }}>
                  <div style={{ height:'100%', borderRadius:3, background:capColor, width:`${capPct}%`, transition:'all 0.3s' }} />
                </div>
              </div>
            </div>
            <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:16, marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <Shield size={15} color="#3b82f6" />
                <span style={{ fontWeight:700, fontSize:'0.9rem', color:'#e2e8f0' }}>Trios attaquants</span>
              </div>
              {lines.map((line,li)=>(
                <div key={li} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:li<3?8:0 }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:800, color:'#4b5563', width:24, textAlign:'center' }}>{li+1}</span>
                  {line.map((slot,si)=>(
                    <SlotCard key={`${li}-${si}`} slot={slot}
                      onDrop={p=>{const n=lines.map(l=>l.map(s=>({...s}))) as LineSet[];n[li][si].player=p;setLines(n);}}
                      onRemove={()=>{const n=lines.map(l=>l.map(s=>({...s}))) as LineSet[];n[li][si].player=null;setLines(n);}}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <Shield size={15} color="#f59e0b" />
                <span style={{ fontWeight:700, fontSize:'0.9rem', color:'#e2e8f0' }}>Paires defenseurs</span>
              </div>
              {pairs.map((pair,pi)=>(
                <div key={pi} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:pi<2?8:0 }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:800, color:'#4b5563', width:24, textAlign:'center' }}>{pi+1}</span>
                  {pair.map((slot,si)=>(
                    <SlotCard key={`d${pi}-${si}`} slot={slot}
                      onDrop={p=>{const n=pairs.map(pr=>pr.map(s=>({...s}))) as PairSet[];n[pi][si].player=p;setPairs(n);}}
                      onRemove={()=>{const n=pairs.map(pr=>pr.map(s=>({...s}))) as PairSet[];n[pi][si].player=null;setPairs(n);}}
                    />
                  ))}
                </div>
              ))}
            </div>
            <button onClick={()=>{setLines(makeLines());setPairs(makePairs());}} className="btn-ghost" style={{ marginTop:12, width:'100%', justifyContent:'center' }}>
              <RefreshCw size={14} /> Reinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}