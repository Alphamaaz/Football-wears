"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  Award,
  Baby,
  BookOpen,
  Check,
  ChevronDown,
  Dumbbell,
  Filter,
  Gamepad2,
  Globe,
  Handshake,
  Headphones,
  Home as HomeIcon,
  Laptop,
  LayoutGrid,
  List,
  MapPin,
  Package,
  PackageOpen,
  RotateCcw,
  Search,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tag,
  Trophy,
  User,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { listProducts, type Product, type ProductSort } from "@/lib/products";
import { getCategories, DEFAULT_CATEGORIES, type Category } from "@/lib/categories";
import { FOOTBALL_PLAYERS, FOOTBALL_CLUBS, FOOTBALL_COUNTRIES } from "@/lib/football-data";
import { UnisportPlayerCarousel } from "@/components/UnisportPlayerCarousel";
import { UnisportClubBar } from "@/components/UnisportClubBar";
import { ProductCard } from "@/components/ProductCard";
import { Button, Input } from "@/components/ui";

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shirt,
  Trophy,
  Sparkles,
  Zap,
  Dumbbell,
  ShieldCheck,
  Package,
  Tag,
  Smartphone,
  Laptop,
  Baby,
  Wrench,
  Headphones,
  Home: HomeIcon,
  HomeIcon,
  Gamepad2,
  BookOpen,
};

const MOBILE_CATEGORY_ITEMS = [
  { id: "club-jerseys", label: "Club Kits", icon: Shirt, color: "bg-[#ffe7a6]" },
  { id: "national-teams", label: "National Kits", icon: Trophy, color: "bg-[#ffdccc]" },
  { id: "retro-classics", label: "Retro Vault", icon: Sparkles, color: "bg-[#ffedb4]" },
  { id: "football-boots", label: "Boots & Cleats", icon: Zap, color: "bg-[#d7e8ff]" },
  { id: "football-socks", label: "Football Socks", icon: Tag, color: "bg-[#ffe3ec]" },
  { id: "training-wear", label: "Tracksuits", icon: Dumbbell, color: "bg-[#dff4e8]" },
  { id: "goalkeeper", label: "Goalkeeper", icon: ShieldCheck, color: "bg-[#f8deea]" },
  { id: "match-balls", label: "Match Balls", icon: Package, color: "bg-[#e2e4e9]" },
  { id: "accessories", label: "Accessories", icon: Tag, color: "bg-[#dff2f4]" },
] as const;

const FOOTBALL_EDITIONS = [
  "Player Issue (Match)",
  "Stadium Fan Version",
  "Retro Legend Archive",
  "Pro FG / AG Match",
  "Anti-Slip Grip Edition",
];

const FOOTBALL_BRANDS = ["Nike", "Adidas", "Puma"];

const NIGERIAN_STATES = [
  "All Nigeria",
  "Lagos",
  "Abuja FCT",
  "Rivers",
  "Oyo",
  "Kano",
  "Ogun",
  "Enugu",
  "Delta",
  "Anambra",
  "Kaduna",
  "Edo",
  "Imo",
  "Akwa Ibom",
];

const PRICE_PRESETS = [
  { label: "Any Price", min: undefined, max: undefined },
  { label: "Under PKR 30,000", min: undefined, max: 30000 },
  { label: "PKR 30,000 - PKR 60,000", min: 30000, max: 60000 },
  { label: "PKR 60,000 - PKR 100,000", min: 60000, max: 100000 },
  { label: "PKR 100,000+", min: 100000, max: undefined },
];

const PRODUCTS_PER_PAGE = 18;

interface MarketplaceCatalogProps {
  initialProducts?: Product[];
  initialTotal?: number;
  initialSearch?: string;
  initialCategory?: string;
  initialClub?: string;
  initialCountry?: string;
  initialPlayer?: string;
  initialEdition?: string;
  initialBrand?: string;
  showSpotlightSections?: boolean;
}

export function MarketplaceCatalog({
  initialProducts = [],
  initialTotal = 0,
  initialSearch = "",
  initialCategory = "",
  initialClub = "",
  initialCountry = "",
  initialPlayer = "",
  initialEdition = "",
  initialBrand = "",
  showSpotlightSections = false,
}: MarketplaceCatalogProps) {
  const [, startTransition] = useTransition();

  // Dynamic Categories from API / Defaults
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    getCategories()
      .then((cats) => {
        if (cats && cats.length > 0) setDynamicCategories(cats);
      })
      .catch(() => {});
  }, []);

  const categoryItems = useMemo(() => {
    return [
      { id: "", label: "All Categories", icon: Package },
      ...dynamicCategories
        .filter((c) => c.isActive !== false)
        .map((c) => ({
          id: c.slug,
          label: c.name,
          icon: CATEGORY_ICON_MAP[c.icon] || Package,
        })),
    ];
  }, [dynamicCategories]);

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedClub, setSelectedClub] = useState(initialClub);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedPlayer, setSelectedPlayer] = useState(initialPlayer);
  const [selectedEdition, setSelectedEdition] = useState(initialEdition);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedState, setSelectedState] = useState("All Nigeria");
  const [condition, setCondition] = useState<"" | "new" | "used">("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [identityVerifiedOnly, setIdentityVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<ProductSort>("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid";
    try {
      const saved = localStorage.getItem("priceam_view_mode");
      return saved === "grid" || saved === "list" ? saved : "grid";
    } catch {
      return "grid";
    }
  });

  const handleSetViewMode = (mode: "grid" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem("priceam_view_mode", mode);
    } catch {
      // ignore
    }
  };

  // Custom price range
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");
  const [appliedMin, setAppliedMin] = useState<number | undefined>(undefined);
  const [appliedMax, setAppliedMax] = useState<number | undefined>(undefined);

  // Results State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / PRODUCTS_PER_PAGE));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  useEffect(() => {
    if (!categorySheetOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setCategorySheetOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [categorySheetOpen]);

  // Fetch products based on active filters
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listProducts({
        page: 1,
        limit: PRODUCTS_PER_PAGE,
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        club: selectedClub || undefined,
        country: selectedCountry || undefined,
        player: selectedPlayer || undefined,
        edition: selectedEdition || undefined,
        brand: selectedBrand || undefined,
        condition: condition || undefined,
        inStock: inStockOnly || undefined,
        state: selectedState !== "All Nigeria" ? selectedState : undefined,
        negotiable: negotiableOnly ? true : undefined,
        identityVerified: identityVerifiedOnly ? true : undefined,
        minPrice: appliedMin,
        maxPrice: appliedMax,
        sort,
      });

      startTransition(() => {
        setProducts(res.products);
        setTotal(res.total);
        setCurrentPage(res.page);
        setTotalPages(res.pages);
      });
    } catch (err) {
      console.error("Failed to filter products", err);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    selectedCategory,
    selectedClub,
    selectedCountry,
    selectedPlayer,
    selectedEdition,
    selectedBrand,
    condition,
    inStockOnly,
    selectedState,
    negotiableOnly,
    identityVerifiedOnly,
    appliedMin,
    appliedMax,
    sort,
  ]);

  // Trigger search on filter changes (with slight debounce for search text)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchFilteredProducts]);

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || currentPage >= totalPages) return;
    setLoadingMore(true);
    try {
      const res = await listProducts({
        page: currentPage + 1,
        limit: PRODUCTS_PER_PAGE,
        search: search.trim() || undefined,
        category: selectedCategory || undefined,
        club: selectedClub || undefined,
        country: selectedCountry || undefined,
        player: selectedPlayer || undefined,
        edition: selectedEdition || undefined,
        brand: selectedBrand || undefined,
        condition: condition || undefined,
        inStock: inStockOnly || undefined,
        state: selectedState !== "All Nigeria" ? selectedState : undefined,
        negotiable: negotiableOnly ? true : undefined,
        identityVerified: identityVerifiedOnly ? true : undefined,
        minPrice: appliedMin,
        maxPrice: appliedMax,
        sort,
      });
      startTransition(() => {
        setProducts((current) => {
          const knownIds = new Set(current.map((product) => product._id));
          return [...current, ...res.products.filter((product) => !knownIds.has(product._id))];
        });
        setTotal(res.total);
        setCurrentPage(res.page);
        setTotalPages(res.pages);
      });
    } catch (err) {
      console.error("Failed to load more products", err);
    } finally {
      setLoadingMore(false);
    }
  }, [
    loadingMore,
    currentPage,
    totalPages,
    search,
    selectedCategory,
    selectedClub,
    selectedCountry,
    selectedPlayer,
    selectedEdition,
    selectedBrand,
    condition,
    inStockOnly,
    selectedState,
    negotiableOnly,
    identityVerifiedOnly,
    appliedMin,
    appliedMax,
    sort,
  ]);

  // Handle Preset Price click
  function handlePresetSelect(index: number) {
    setSelectedPresetIndex(index);
    const preset = PRICE_PRESETS[index];
    setAppliedMin(preset.min);
    setAppliedMax(preset.max);
    setCustomMin(preset.min ? String(preset.min) : "");
    setCustomMax(preset.max ? String(preset.max) : "");
  }

  // Handle Custom Price Submit
  function handleCustomPriceApply(e: React.FormEvent) {
    e.preventDefault();
    const min = customMin ? Number(customMin) : undefined;
    const max = customMax ? Number(customMax) : undefined;
    setAppliedMin(min);
    setAppliedMax(max);
    setSelectedPresetIndex(-1); // Deselect presets
  }

  // Reset all filters
  function resetAllFilters() {
    setSearch("");
    setSelectedCategory("");
    setSelectedClub("");
    setSelectedCountry("");
    setSelectedPlayer("");
    setSelectedEdition("");
    setSelectedBrand("");
    setSelectedState("All Nigeria");
    setCondition("");
    setInStockOnly(false);
    setNegotiableOnly(false);
    setIdentityVerifiedOnly(false);
    setSelectedPresetIndex(0);
    setCustomMin("");
    setCustomMax("");
    setAppliedMin(undefined);
    setAppliedMax(undefined);
    setSort("featured");
  }

  // Count active filter tags
  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedClub ? 1 : 0) +
    (selectedCountry ? 1 : 0) +
    (selectedPlayer ? 1 : 0) +
    (selectedEdition ? 1 : 0) +
    (selectedBrand ? 1 : 0) +
    (selectedState !== "All Nigeria" ? 1 : 0) +
    (condition ? 1 : 0) +
    (appliedMin !== undefined || appliedMax !== undefined ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (negotiableOnly ? 1 : 0) +
    (identityVerifiedOnly ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="space-y-5 sm:space-y-6" id="catalog-section">
      {/* Optional Unisport Spotlights (Players & Clubs Carousels) */}
      {showSpotlightSections && (
        <div className="space-y-6 rounded-3xl border border-line bg-surface/70 p-4 sm:p-6 shadow-xs">
          <UnisportPlayerCarousel
            selectedPlayer={selectedPlayer}
            onSelectPlayer={(p) => {
              setSelectedPlayer(p);
            }}
          />
          <UnisportClubBar
            selectedClub={selectedClub}
            selectedCountry={selectedCountry}
            onSelectClub={(c) => {
              setSelectedClub(c);
            }}
            onSelectCountry={(cntry) => {
              setSelectedCountry(cntry);
            }}
          />
        </div>
      )}
      <div className="space-y-7 sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-muted" strokeWidth={1.8} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search kits, boots, retro jerseys (e.g. Madrid, Arsenal, Messi)..."
            className="h-[58px] w-full rounded-full border border-line bg-surface pl-14 pr-20 text-base text-ink shadow-soft outline-none placeholder:text-muted/70 focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open filters"
            className="absolute right-1.5 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-[#ffd000] text-ink shadow-soft"
          >
            <SlidersHorizontal className="h-5 w-5" strokeWidth={2.5} />
            {activeFiltersCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{activeFiltersCount}</span>}
          </button>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[1.65rem] font-bold tracking-tight text-ink">Categories</h2>
            <button
              type="button"
              onClick={() => setCategorySheetOpen(true)}
              aria-haspopup="dialog"
              className="min-h-11 rounded-lg px-2 text-base font-semibold text-primary-darker transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              View All
            </button>
          </div>
          <div className="scrollbar-none -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
            {MOBILE_CATEGORY_ITEMS.map((cat) => {
              const Icon = cat.icon;
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                  }}
                  aria-pressed={active}
                  className="w-[78px] shrink-0 text-center"
                >
                  <span className={`grid h-[70px] w-[70px] place-items-center rounded-2xl ${cat.color} ${active ? "ring-2 ring-primary ring-offset-2 ring-offset-cream" : ""}`}>
                    <Icon className="h-7 w-7 text-ink" strokeWidth={1.9} />
                  </span>
                  <span className="mt-2 block truncate text-[13px] font-medium text-ink">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>
        <h2 className="text-center text-[1.65rem] font-bold tracking-tight text-ink">Products</h2>
      </div>

      {categorySheetOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end bg-ink/55 sm:hidden"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setCategorySheetOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="all-categories-title"
            className="max-h-[88dvh] w-full overflow-y-auto rounded-t-[2rem] bg-surface px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3 shadow-lifted"
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-line-strong" />
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="all-categories-title" className="text-2xl font-extrabold tracking-tight text-ink">All Categories</h2>
                <p className="mt-1 text-sm text-muted">Explore products by category</p>
              </div>
              <button
                type="button"
                onClick={() => setCategorySheetOpen(false)}
                aria-label="Close all categories"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOBILE_CATEGORY_ITEMS.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCategorySheetOpen(false);
                    }}
                    className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      active ? "border-primary bg-primary-soft" : "border-line bg-cream/60 hover:border-primary/40"
                    }`}
                  >
                    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl ${cat.color}`}>
                      <Icon className="h-6 w-6 text-primary-darker" strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0">
                      <strong className="block truncate text-[15px] font-bold text-ink">{cat.label}</strong>
                      <small className="mt-0.5 block text-xs text-muted">Explore items</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* High-Efficiency Catalog Action Bar */}
      <div className="hidden rounded-2xl border border-line bg-surface p-2 shadow-xs sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-2.5 sm:p-2.5">
        {/* Search within catalog (hidden on mobile to prevent duplicate search bars) */}
        <div className="hidden md:block relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within listings…"
            className="w-full h-9 rounded-xl border border-line bg-sunken/60 pl-9 pr-7 text-xs text-ink placeholder:text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Mode & Mobile Trigger */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Drawer Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden inline-flex h-9 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-ink shadow-xs hover:border-primary transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-primary text-white text-[10px] font-black px-1.5 py-0.2">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
              className="h-9 appearance-none rounded-xl border border-line bg-surface pl-3 pr-7 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/25 shadow-xs cursor-pointer"
            >
              <option value="featured">Featured Deals</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
          </div>

          {/* Grid vs List View Toggle (Visible on all devices including mobile) */}
          <div className="flex items-center rounded-xl border border-line bg-sunken/60 p-0.5 shadow-xs shrink-0">
            <button
              onClick={() => handleSetViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              title="Grid View (2 columns on mobile)"
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </button>
            <button
              onClick={() => handleSetViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-surface text-primary shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              title="Single List View"
              aria-label="Single List View"
            >
              <List className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[17rem_1fr] items-start gap-4 sm:gap-5">
        {/* =================================================================== */}
        {/* LEFT COLUMN: FILTER SIDEBAR (DESKTOP)                               */}
        {/* =================================================================== */}
        <aside className="hidden lg:block sticky top-20 rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-2 font-bold text-ink text-sm">
              <Filter className="h-4 w-4 text-primary" />
              <span>Football Gear Filters</span>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-primary/10 text-primary text-[11px] font-black px-2 py-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          {/* 1. Category Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-primary" />
              Department
            </label>
            <div className="space-y-1">
              {categoryItems.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? "" : cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-white shadow-soft"
                        : "text-muted hover:text-ink hover:bg-sunken"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-primary"}`} />
                      {cat.label}
                    </span>
                    {isSelected && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Player Filter */}
          <div className="space-y-2.5 pt-4 border-t border-line">
            <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Shop by Player
            </label>
            <div className="relative">
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full h-9 appearance-none rounded-xl border border-line bg-sunken/60 pl-3 pr-8 text-xs font-bold text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Players</option>
                {FOOTBALL_PLAYERS.map((p) => (
                  <option key={p.id} value={p.name}>
                    #{p.number} {p.name} ({p.club})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            </div>
          </div>

          {/* 3. Club Filter */}
          <div className="space-y-2.5 pt-4 border-t border-line">
            <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Club / Team
            </label>
            <div className="relative">
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                className="w-full h-9 appearance-none rounded-xl border border-line bg-sunken/60 pl-3 pr-8 text-xs font-bold text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Clubs</option>
                {FOOTBALL_CLUBS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.crest} {c.name} ({c.league})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            </div>
          </div>

          {/* 4. National Team Filter */}
          <div className="space-y-2.5 pt-4 border-t border-line">
            <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              Country / National Team
            </label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full h-9 appearance-none rounded-xl border border-line bg-sunken/60 pl-3 pr-8 text-xs font-bold text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Countries</option>
                {FOOTBALL_COUNTRIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
            </div>
          </div>

          {/* 5. Edition Filter */}
          <div className="space-y-2.5 pt-4 border-t border-line">
            <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-accent" />
              Kit &amp; Gear Edition
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedEdition("")}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  !selectedEdition ? "bg-primary-soft text-primary-darker font-bold" : "text-muted hover:bg-sunken"
                }`}
              >
                All Editions
              </button>
              {FOOTBALL_EDITIONS.map((ed) => (
                <button
                  key={ed}
                  type="button"
                  onClick={() => setSelectedEdition(selectedEdition === ed ? "" : ed)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedEdition === ed
                      ? "bg-primary-soft text-primary-darker font-bold border border-primary/20"
                      : "text-muted hover:text-ink hover:bg-sunken"
                  }`}
                >
                  {ed}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Brand Filter */}
          <div className="space-y-2.5 pt-4 border-t border-line">
            <label className="text-xs font-bold text-ink uppercase tracking-wider">
              Brand
            </label>
            <div className="grid grid-cols-4 gap-1">
              {["", ...FOOTBALL_BRANDS].map((brand) => (
                <button
                  key={brand || "all"}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={`py-1.5 text-center rounded-xl text-[11px] font-bold transition-all border ${
                    selectedBrand === brand
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface border-line text-muted hover:text-ink"
                  }`}
                >
                  {brand || "All"}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Price Filter */}
          <div className="space-y-3 pt-4 border-t border-line">
            <label className="text-xs font-bold text-ink uppercase tracking-wider">
              Price Range (PKR)
            </label>
            <div className="space-y-1">
              {PRICE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetSelect(idx)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedPresetIndex === idx
                      ? "bg-primary-soft text-primary-darker font-bold border border-primary/20"
                      : "text-muted hover:text-ink hover:bg-sunken"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomPriceApply} className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Min"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  className="h-8 text-xs rounded-xl"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  className="h-8 text-xs rounded-xl"
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="w-full h-8 rounded-xl text-xs font-bold">
                Apply Price
              </Button>
            </form>
          </div>

          {/* 8. Availability */}
          <div className="space-y-2.5 pt-4 border-t border-line">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-xs font-semibold text-ink group-hover:text-primary transition-colors flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-muted" />
                In Stock Only
              </span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </label>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: ACTIVE FILTER CHIPS & PRODUCT GRID                    */}
        {/* =================================================================== */}
        <main className="space-y-3.5">
          {/* Active Filter Chips & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-ink">
                {selectedCategory
                  ? categoryItems.find((c) => c.id === selectedCategory)?.label || "Listings"
                  : "All Marketplace Listings"}
              </h2>
              <span className="text-[11px] font-bold text-muted bg-sunken border border-line px-2 py-0.5 rounded-full">
                {loading ? "Searching…" : `${total} items`}
              </span>
              {selectedState !== "All Nigeria" && (
                <span className="text-xs text-muted hidden sm:inline">
                  in <strong className="text-ink">{selectedState}</strong>
                </span>
              )}
            </div>

            {/* Active Chips Strip */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                    <span className="capitalize">{categoryItems.find((c) => c.id === selectedCategory)?.label || selectedCategory}</span>
                    <button onClick={() => setSelectedCategory("")} className="hover:opacity-75">✕</button>
                  </span>
                )}
                {selectedPlayer && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
                    <span>Player: {selectedPlayer}</span>
                    <button onClick={() => setSelectedPlayer("")} className="hover:opacity-75">✕</button>
                  </span>
                )}
                {selectedClub && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
                    <span>Club: {selectedClub}</span>
                    <button onClick={() => setSelectedClub("")} className="hover:opacity-75">✕</button>
                  </span>
                )}
                {selectedCountry && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    <span>Country: {selectedCountry}</span>
                    <button onClick={() => setSelectedCountry("")} className="hover:opacity-75">✕</button>
                  </span>
                )}
                {selectedEdition && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/25 px-3 py-1 text-xs font-bold text-ink">
                    <span>Edition: {selectedEdition}</span>
                    <button onClick={() => setSelectedEdition("")} className="hover:opacity-75">✕</button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sunken border border-line px-3 py-1 text-xs font-bold text-ink">
                    <span>Brand: {selectedBrand}</span>
                    <button onClick={() => setSelectedBrand("")} className="hover:opacity-75">✕</button>
                  </span>
                )}
                {(appliedMin !== undefined || appliedMax !== undefined) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sunken border border-line px-3 py-1 text-xs font-semibold text-ink">
                    <span>
                      {appliedMin ? `PKR ${appliedMin.toLocaleString()}` : "PKR 0"} - {appliedMax ? `PKR ${appliedMax.toLocaleString()}` : "Any"}
                    </span>
                    <button onClick={() => { setAppliedMin(undefined); setAppliedMax(undefined); setSelectedPresetIndex(0); }} className="hover:opacity-75">✕</button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sunken border border-line px-3 py-1 text-xs font-semibold text-ink">
                    <span>In Stock Only</span>
                    <button onClick={() => setInStockOnly(false)} className="hover:opacity-75">✕</button>
                  </span>
                )}
                <button
                  onClick={resetAllFilters}
                  className="text-xs font-bold text-danger hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Loading Shimmer State */}
          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
                  : "flex flex-col gap-4 sm:gap-6"
              }
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl sm:rounded-3xl border border-line bg-surface p-4 animate-pulse ${
                    viewMode === "grid"
                      ? "space-y-3 sm:space-y-4"
                      : "flex flex-col sm:flex-row gap-4 sm:gap-6"
                  }`}
                >
                  <div
                    className={
                      viewMode === "grid"
                        ? "aspect-[4/3] rounded-2xl bg-sunken"
                        : "aspect-[16/10] sm:aspect-auto sm:w-64 md:w-72 lg:w-80 shrink-0 rounded-2xl bg-sunken"
                    }
                  />
                  <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                    <div className="space-y-2">
                      <div className="h-5 bg-sunken rounded-md w-3/4" />
                      <div className="h-3.5 bg-sunken rounded-md w-1/2" />
                    </div>
                    <div className="pt-2 border-t border-line flex justify-between items-center">
                      <div className="h-6 bg-sunken rounded-md w-28" />
                      <div className="h-8 bg-sunken rounded-xl w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border border-line bg-surface p-12 sm:p-16 text-center space-y-4 shadow-soft">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary mx-auto">
                <PackageOpen className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">No listings found matching your filters</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Try broadening your price range, choosing another Nigerian state, or searching with general terms.
                </p>
              </div>
              <Button onClick={resetAllFilters} variant="outline" size="sm" className="rounded-xl">
                Reset All Filters
              </Button>
            </div>
          ) : (
            /* Product List or Grid */
            <div className="space-y-6">
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
                    : "flex flex-col gap-4 sm:gap-6"
                }
              >
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} viewMode={viewMode} />
                ))}
              </div>
              {currentPage < totalPages && (
                <div className="flex flex-col items-center gap-2 border-t border-line pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="min-w-44 rounded-xl"
                  >
                    {loadingMore ? "Loading listings…" : "Load more listings"}
                  </Button>
                  <p className="text-xs text-muted">
                    Showing {products.length} of {total} listings
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* MOBILE FILTER SLIDE-OVER DRAWER                                     */}
      {/* =================================================================== */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-sm bg-surface h-full shadow-glow p-6 flex flex-col justify-between overflow-y-auto space-y-6 animate-fade-in-up">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2 font-bold text-ink">
                  <Filter className="h-4 w-4 text-primary" />
                  <span>Filters ({activeFiltersCount})</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="text-muted hover:text-ink text-sm font-bold p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  Department
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {categoryItems.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? "" : cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left truncate transition-colors border ${
                        selectedCategory === cat.id
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-line text-muted"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Shop by Player
                </label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full h-10 rounded-2xl border border-line bg-sunken px-3 text-xs font-semibold text-ink"
                >
                  <option value="">All Players</option>
                  {FOOTBALL_PLAYERS.map((p) => (
                    <option key={p.id} value={p.name}>
                      #{p.number} {p.name} ({p.club})
                    </option>
                  ))}
                </select>
              </div>

              {/* Club Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-primary" />
                  Club / Team
                </label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full h-10 rounded-2xl border border-line bg-sunken px-3 text-xs font-semibold text-ink"
                >
                  <option value="">All Clubs</option>
                  {FOOTBALL_CLUBS.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.crest} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-emerald-600" />
                  Country / National Team
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full h-10 rounded-2xl border border-line bg-sunken px-3 text-xs font-semibold text-ink"
                >
                  <option value="">All Countries</option>
                  {FOOTBALL_COUNTRIES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Edition */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-accent" />
                  Edition
                </label>
                <select
                  value={selectedEdition}
                  onChange={(e) => setSelectedEdition(e.target.value)}
                  className="w-full h-10 rounded-2xl border border-line bg-sunken px-3 text-xs font-semibold text-ink"
                >
                  <option value="">All Editions</option>
                  {FOOTBALL_EDITIONS.map((ed) => (
                    <option key={ed} value={ed}>
                      {ed}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Brand
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["", ...FOOTBALL_BRANDS].map((brand) => (
                    <button
                      key={brand || "all"}
                      type="button"
                      onClick={() => setSelectedBrand(brand)}
                      className={`py-2 text-center rounded-xl text-xs font-bold border ${
                        selectedBrand === brand
                          ? "bg-primary text-white border-primary"
                          : "bg-surface border-line text-muted"
                      }`}
                    >
                      {brand || "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Price Presets
                </label>
                <div className="space-y-1">
                  {PRICE_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      onClick={() => handlePresetSelect(idx)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium ${
                        selectedPresetIndex === idx
                          ? "bg-primary-soft text-primary font-bold"
                          : "text-muted hover:bg-sunken"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock toggle */}
              <div className="space-y-2 pt-2 border-t border-line">
                <label className="flex items-center justify-between text-xs font-semibold text-ink">
                  <span className="inline-flex items-center gap-1.5"><Package className="h-4 w-4 text-primary" /> In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-line flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllFilters}
                className="rounded-xl flex-1 text-xs"
              >
                Reset All
              </Button>
              <Button
                size="sm"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded-xl flex-1 text-xs font-bold"
              >
                Show {total} Deals
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
