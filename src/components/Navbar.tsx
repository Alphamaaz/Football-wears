import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { SearchBar } from "./SearchBar";
import { NavbarCommerceLinks } from "./NavbarCommerceLinks";
import { MobileSidebar } from "./MobileSidebar";
import Link from "next/link";
import {
  Flame,
  Percent,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Sparkles,
  Tag,
  Trophy,
  Truck,
  Zap,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/category/club-jerseys", label: "Football Shirts", icon: Shirt, badge: "New 24/25" },
  { href: "/category/national-teams", label: "National Teams", icon: Trophy },
  { href: "/category/football-boots", label: "Boots & Cleats", icon: Zap, badge: "Pro FG/AG" },
  { href: "/category/football-socks", label: "Football Socks", icon: Tag, badge: "Grip & Team" },
  { href: "/category/retro-classics", label: "Retro Vault", icon: Sparkles },
  { href: "/category/training-wear", label: "Tracksuits & Training" },
  { href: "/category/goalkeeper", label: "Goalkeeper" },
  { href: "/category/match-balls", label: "Match Balls & Gear" },
  { href: "/#catalog-section", label: "Sale & Offers", icon: Percent, isSale: true },
];

export function Navbar() {
  return (
    <header className="site-navbar sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md shadow-xs">
      {/* Unisport-Style Top Announcement Banner */}
      <div className="border-b border-line bg-ink text-white">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[11px] font-bold sm:px-6">
          <div className="flex items-center gap-4 overflow-hidden">
            <span className="flex items-center gap-1.5 text-accent">
              <Flame className="h-3.5 w-3.5 shrink-0" />
              <span>2024/25 Player Issue Kits Now In Stock</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-white/80">
              <Truck className="h-3.5 w-3.5 text-primary" /> Free Express Delivery on orders over PKR 60,000
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-white/80">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 100% Genuine Merchandise
            </span>
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="h-3.5 w-3.5 text-accent" /> 14-Day Size Exchange
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-4 px-4 sm:px-6">
        <MobileSidebar />
        <Logo className="shrink-0" />

        <SearchBar className="hidden md:flex flex-1 max-w-lg lg:max-w-xl mx-4" />

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/admin"
            className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface hover:bg-sunken px-2.5 py-1.5 text-xs font-black text-ink shadow-2xs transition-colors"
            title="Admin & Shop Management"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Admin</span>
          </Link>
          <NavbarCommerceLinks />
          <div className="w-px h-6 bg-line mx-1 hidden sm:block" />
          <UserMenu />
        </div>
      </div>

      {/* Unisport-Style Sub-Navigation Category Ribbon */}
      <div className="border-t border-line/60 bg-surface/90 overflow-x-auto scrollbar-none hidden md:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-4 sm:px-6 text-xs font-bold text-body">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${
                item.isSale
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100 font-extrabold"
                  : "hover:bg-sunken hover:text-primary"
              }`}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-primary/10 text-primary text-[9px] px-1.5 py-0.2 uppercase font-black tracking-wider">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
