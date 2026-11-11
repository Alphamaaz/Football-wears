"use client";

import Link from "next/link";
import { FOOTBALL_PLAYERS } from "@/lib/football-data";
import { ChevronRight, Sparkles } from "lucide-react";

export function UnisportPlayerCarousel({
  onSelectPlayer,
  selectedPlayer,
}: {
  onSelectPlayer?: (playerName: string) => void;
  selectedPlayer?: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unisport Spotlight</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-ink tracking-tight mt-0.5">
            Shop by Player
          </h2>
        </div>
        <a
          href="#catalog-section"
          className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 transition-colors"
        >
          <span>View all kits</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="scrollbar-none -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {FOOTBALL_PLAYERS.map((player) => {
          const isSelected = selectedPlayer?.toLowerCase() === player.name.toLowerCase();
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => {
                if (onSelectPlayer) {
                  onSelectPlayer(isSelected ? "" : player.name);
                } else {
                  window.location.href = `/?player=${encodeURIComponent(player.name)}#catalog-section`;
                }
              }}
              className={`group flex w-[100px] sm:w-[115px] shrink-0 flex-col items-center text-center transition-transform active:scale-95 ${
                isSelected ? "scale-105" : ""
              }`}
            >
              {/* Circular Avatar Container with Gradient Border */}
              <div
                className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-full p-1 transition-all ${
                  isSelected
                    ? "ring-3 ring-primary shadow-glow bg-gradient-to-tr from-primary to-accent"
                    : "border-2 border-line group-hover:border-primary/60 group-hover:shadow-lifted bg-surface"
                }`}
              >
                <div className="relative h-full w-full overflow-hidden rounded-full bg-sunken">
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Number Badge */}
                  <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-ink font-black text-[10px] text-white shadow-soft ring-1 ring-white">
                    {player.number}
                  </span>
                </div>
              </div>

              {/* Player Label */}
              <span className="mt-2 text-xs font-black text-ink group-hover:text-primary transition-colors truncate w-full">
                {player.shortName}
              </span>
              <span className="text-[10px] font-semibold text-muted truncate w-full">
                {player.club}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

