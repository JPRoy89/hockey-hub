"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Users,
  Shield,
  ArrowLeftRight,
  Layers,
  TrendingUp,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/players", label: "Joueurs", icon: Users },
  { href: "/teams", label: "Équipes", icon: Shield },
  { href: "/contracts", label: "Contrats", icon: TrendingUp },
  { href: "/line-builder", label: "Line Builder", icon: Layers },
  { href: "/trade-builder", label: "Mock Trade", icon: ArrowLeftRight },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm group-hover:bg-blue-500 transition-colors">
              H
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Hockey<span className="text-blue-400">Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Search + mobile toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:block">Rechercher...</span>
            </Link>

            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border mt-2 pt-2">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
