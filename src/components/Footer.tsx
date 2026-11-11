"use client";

import Link from "next/link";
import { Award, Flame, RefreshCw, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Shop Collections",
    links: [
      { href: "/category/club-jerseys", label: "2024/25 Club Kits" },
      { href: "/category/national-teams", label: "National Team Kits" },
      { href: "/category/retro-classics", label: "Retro Classics Vault" },
      { href: "/category/football-boots", label: "Pro Boots & Cleats" },
      { href: "/category/training-wear", label: "Training & Tracksuits" },
      { href: "/category/match-balls", label: "FIFA Match Balls" },
    ],
  },
  {
    title: "Personalization",
    links: [
      { href: "/category/club-jerseys", label: "Official Name & Number Printing" },
      { href: "/category/club-jerseys", label: "UCL & League Badges" },
      { href: "/about", label: "Authenticity & Fabrics (HEAT.RDY/Dri-FIT)" },
      { href: "/about", label: "Kit Care & Washing Guide" },
    ],
  },
  {
    title: "Orders & Support",
    links: [
      { href: "/cart", label: "Shopping Cart" },
      { href: "/orders", label: "Track My Order" },
      { href: "/wishlist", label: "Saved Wishlist" },
      { href: "/contact", label: "Contact Kit Specialist" },
    ],
  },
  {
    title: "About Store",
    links: [
      { href: "/about", label: "Founder's Story" },
      { href: "/admin", label: "Admin & Product Upload" },
      { href: "/contact", label: "Lagos Dispatch Hub" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & 14-Day Exchanges" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/conversations/")) {
    return null;
  }

  return (
    <footer className="mt-auto hidden border-t border-line bg-surface sm:block">
      {/* Trust bar */}
      <div className="border-b border-line bg-sunken/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs sm:text-sm font-semibold text-body">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.8} />
            100% Authentic &amp; Official Licensed Kits
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.8} />
            Official Nameset &amp; Badge Customization
          </span>
          <span className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" strokeWidth={1.8} />
            Express Tracked Nationwide Delivery
          </span>
          <span className="hidden lg:flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" strokeWidth={1.8} />
            14-Day Size Exchange Guarantee
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2 space-y-4">
          <Logo />
          <p className="text-sm text-muted max-w-sm leading-relaxed">
            Your personal destination for top-tier football wears. Sourcing authentic club jerseys,
            rare retro classics, match boots, and official accessories directly for dedicated players and fans.
          </p>
          <div className="flex items-center gap-3 text-xs font-bold text-ink">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-primary">
              <Flame className="h-3.5 w-3.5" /> 2,500+ Players Geared Up
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-3 py-1 text-muted">
              <Award className="h-3.5 w-3.5 text-accent" /> 4.96/5 Star Rating
            </span>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-bold text-ink mb-3 tracking-wide">{col.title}</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-body">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <span>© {new Date().getFullYear()} Football Wears. All rights reserved.</span>
          <span>Crafted with passion for the beautiful game ⚽</span>
        </div>
      </div>
    </footer>
  );
}
