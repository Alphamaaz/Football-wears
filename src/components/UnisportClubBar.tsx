"use client";

import { FOOTBALL_CLUBS, FOOTBALL_COUNTRIES } from "@/lib/football-data";
import { Trophy } from "lucide-react";

export function UnisportClubBar({
  selectedClub,
  selectedCountry,
  onSelectClub,
  onSelectCountry,
}: {
  selectedClub?: string;
  selectedCountry?: string;
  onSelectClub?: (club: string) => void;
  onSelectCountry?: (country: string) => void;
}) {
  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-wider text-ink">
            Top Clubs &amp; National Teams
          </h2>
        </div>
        <span className="text-xs text-muted font-semibold hidden sm:inline">
          Filter by your favorite team
        </span>
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {/* Clubs */}
        {FOOTBALL_CLUBS.map((club) => {
          const isSelected = selectedClub?.toLowerCase() === club.name.toLowerCase();
          return (
            <button
              key={club.id}
              type="button"
              onClick={() => onSelectClub?.(isSelected ? "" : club.name)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black transition-all active:scale-95 ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-soft"
                  : "border-line bg-surface text-ink hover:border-primary/50 hover:bg-cream/40"
              }`}
            >
              <span className="text-base">{club.crest}</span>
              <span>{club.name}</span>
            </button>
          );
        })}

        {/* Separator */}
        <div className="w-px h-7 bg-line shrink-0 my-auto mx-1" />

        {/* Countries */}
        {FOOTBALL_COUNTRIES.map((country) => {
          const isSelected = selectedCountry?.toLowerCase() === country.name.toLowerCase();
          return (
            <button
              key={country.id}
              type="button"
              onClick={() => onSelectCountry?.(isSelected ? "" : country.name)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-black transition-all active:scale-95 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-soft"
                  : "border-line bg-surface text-ink hover:border-emerald-600/50 hover:bg-emerald-50/40"
              }`}
            >
              <span className="text-base">{country.flag}</span>
              <span>{country.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

