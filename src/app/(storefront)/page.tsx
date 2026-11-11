import Link from "next/link";
import { ArrowRight, Award, Flame, ShieldCheck, Sparkles, Trophy, Zap } from "lucide-react";
import { listProductsServer } from "@/lib/products";
import { MarketplaceCatalog } from "@/components/MarketplaceCatalog";
import { UnisportCategoryTiles } from "@/components/UnisportCategoryTiles";

export default async function HomePage() {
  const { products, total } = await listProductsServer({ limit: 18, sort: "featured" });

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Football Hero Banner with Star Players Group Photo */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-surface via-surface to-sunken shadow-lifted">
        {/* Subtle decorative stadium glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 lg:p-10">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-primary-darker font-extrabold border border-primary/25">
                <Flame className="h-3.5 w-3.5 text-primary" /> 2024/2025 New Season Kits In Stock
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 100% Authentic Guaranteed
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
              Wear The Passion. <br />
              <span className="bg-gradient-to-r from-primary via-emerald-600 to-ink bg-clip-text text-transparent">
                Play Like A Pro.
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm leading-relaxed text-body sm:text-base max-w-xl">
              Your personal online destination for authentic club jerseys, national kits, legendary retro classics,
              and pro football boots. Official player font printing and sleeve badges available on all kits.
            </p>

            {/* Category Quick Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/category/club-jerseys"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-colors shadow-xs"
              >
                <Trophy className="h-3.5 w-3.5 text-primary" /> Club Kits
              </Link>
              <Link
                href="/category/retro-classics"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-colors shadow-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Retro Vault
              </Link>
              <Link
                href="/category/football-boots"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-colors shadow-xs"
              >
                <Zap className="h-3.5 w-3.5 text-primary" /> Pro Cleats
              </Link>
              <Link
                href="/category/football-socks"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-colors shadow-xs"
              >
                <Award className="h-3.5 w-3.5 text-amber-600" /> Grip Socks
              </Link>
              <Link
                href="/category/national-teams"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink hover:border-primary hover:text-primary transition-colors shadow-xs"
              >
                <Award className="h-3.5 w-3.5 text-emerald-600" /> National Teams
              </Link>
            </div>

            {/* Actions & Dispatch Stat */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href="#catalog-section"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-black text-ink shadow-soft hover:bg-primary-dark transition-all active:scale-[.98]"
              >
                Browse Shop Collection <ArrowRight className="h-4 w-4" />
              </a>
              <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/90 px-4 py-2.5 shadow-xs">
                <div>
                  <span className="block text-base font-black text-ink">100%</span>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider">Official Kit</span>
                </div>
                <div className="w-px h-7 bg-line" />
                <div>
                  <span className="block text-base font-black text-primary">24h–48h</span>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider">Dispatch</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Prominent Football Players Group Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden rounded-3xl border border-line bg-ink shadow-lifted group">
              {/* Star Players Celebration Photo */}
              <img
                src="/hero-football-stars.jpg"
                alt="Star Football Players Celebrating on the Pitch"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              {/* Subtle Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Top Floating Badge */}
              <div className="absolute top-3.5 left-3.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-black text-white shadow-soft border border-white/20">
                  <Flame className="h-3.5 w-3.5 text-primary" />
                  <span>Star Players Showcase</span>
                </span>
              </div>

              {/* Bottom Caption Pill */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    2024/25 Official Roster Kits
                  </span>
                  <span className="text-[10px] font-bold text-white/80">Mbappé • Messi • Saka • Bellingham</span>
                </div>
                <p className="text-[11px] text-white/90 leading-tight">
                  Authentic shirts, name-set player heat pressing &amp; competition badges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unisport-Style 4 Featured Collection Tiles */}
      <UnisportCategoryTiles />

      {/* Catalog with Unisport Player Spotlight, Club Ribbon, & Filters */}
      <MarketplaceCatalog
        initialProducts={products}
        initialTotal={total}
        showSpotlightSections={true}
      />
    </div>
  );
}
