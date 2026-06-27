'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Shield, DollarSign, Layers, ArrowLeftRight, Search, Menu, X, Disc } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/players', label: 'Joueurs', icon: Users },
  { href: '/teams', label: 'Équipes', icon: Shield },
  { href: '/contracts', label: 'Contrats', icon: DollarSign },
  { href: '/line-builder', label: 'Line Builder', icon: Layers },
  { href: '/trade-builder', label: 'Mock Trade', icon: ArrowLeftRight },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      background: 'rgba(8, 11, 20, 0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(59,130,246,0.12)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 60, gap: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(59,130,246,0.4)',
            }}>
              <Disc size={18} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#e2e8f0' }}>
              Hockey<span style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hub</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  fontSize: '0.85rem', fontWeight: active ? 600 : 500,
                  textDecoration: 'none',
                  color: active ? '#3b82f6' : '#94a3b8',
                  background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}>
                  <Icon size={15} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </div>

          <Link href="/search" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(59,130,246,0.12)',
            color: '#64748b', fontSize: '0.8rem', textDecoration: 'none',
          }}>
            <Search size={14} />
            <span>Rechercher...</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
