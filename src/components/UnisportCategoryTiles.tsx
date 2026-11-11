import Link from "next/link";
import { ArrowUpRight, Flame, ShieldCheck, Sparkles, Tag, Zap } from "lucide-react";

const TILES = [
  {
    title: "Football Shirts",
    subtitle: "2024/25 Club & Country Kits with Official Player Printing",
    tag: "Player Issue & Stadium",
    href: "/category/club-jerseys",
    bgImage: "/kits/real-madrid-2025-home.jpg",
    badgeColor: "bg-primary text-ink font-black",
    icon: Flame,
  },
  {
    title: "Boots & Cleats",
    subtitle: "Nike Mercurial Air Zoom, Adidas Predator FT & Puma Future",
    tag: "Pro FG / AG Match",
    href: "/category/football-boots",
    bgImage: "/kits/nike-mercurial-superfly.jpg",
    badgeColor: "bg-emerald-600 text-white font-black",
    icon: Zap,
  },
  {
    title: "Football Socks",
    subtitle: "Pro Hexagonal Non-Slip Grip Socks & Team Match Sleeves",
    tag: "Anti-Blister & Grip",
    href: "/category/football-socks",
    bgImage: "/kits/football-grip-socks.jpg",
    badgeColor: "bg-amber-500 text-ink font-black",
    icon: Tag,
  },
  {
    title: "Retro Classics Vault",
    subtitle: "Iconic Unbeaten Invincibles '04 & Moscow '08 Champions",
    tag: "Vintage Archive",
    href: "/category/retro-classics",
    bgImage: "/kits/manchester-united-2008-retro.jpg",
    badgeColor: "bg-purple-600 text-white font-black",
    icon: Sparkles,
  },
];

export function UnisportCategoryTiles() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
          Featured Collections
        </h2>
        <span className="text-xs font-bold text-muted uppercase tracking-wider">
          Curated Pro Gear
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative h-72 sm:h-80 overflow-hidden rounded-3xl border border-line bg-ink shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lifted"
            >
              {/* Background Photography with Gradient Overlay */}
              <img
                src={tile.bgImage}
                alt={tile.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-85"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />

              {/* Top Tag */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-soft ${tile.badgeColor}`}>
                  <Icon className="h-3 w-3" />
                  {tile.tag}
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white group-hover:text-ink">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1.5 text-white">
                <h3 className="text-lg font-black tracking-tight text-white group-hover:text-primary-light transition-colors">
                  {tile.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {tile.subtitle}
                </p>
                <div className="pt-2 text-[11px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                  <span>Explore Collection</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

