"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Banknote,
  Camera,
  Check,
  CheckCircle2,
  DollarSign,
  Eye,
  Globe,
  ImagePlus,
  Info,
  Package,
  Plus,
  RefreshCw,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Trophy,
  Truck,
  User,
  X,
  Zap,
} from "lucide-react";
import { createProduct } from "@/lib/products";
import {
  FOOTBALL_CLUBS,
  FOOTBALL_COUNTRIES,
  FOOTBALL_EDITIONS,
  FOOTBALL_PLAYERS,
  FOOTBALL_BRANDS,
} from "@/lib/football-data";
import { tokenStore } from "@/lib/api";
import { Alert, Button, Input, Label } from "@/components/ui";

type LocalImage = {
  id: string;
  file?: File;
  previewUrl: string;
};

const FOOTBALL_CATEGORIES = [
  { slug: "club-jerseys", name: "Club Jerseys", icon: Shirt },
  { slug: "national-teams", name: "National Teams", icon: Globe },
  { slug: "retro-classics", name: "Retro Classics", icon: Sparkles },
  { slug: "football-boots", name: "Football Boots", icon: Zap },
  { slug: "football-socks", name: "Football Socks", icon: Tag },
  { slug: "training-wear", name: "Tracksuits & Training", icon: Trophy },
  { slug: "goalkeeper", name: "Goalkeeper Kits", icon: ShieldCheck },
  { slug: "match-balls", name: "Match Balls & Gear", icon: Package },
];

const COMMON_SIZES = ["S", "M", "L", "XL", "XXL"];
const BOOT_SIZES = ["UK 7", "UK 7.5", "UK 8", "UK 8.5", "UK 9", "UK 9.5", "UK 10", "UK 11"];

const BADGE_OPTIONS = [
  "UEFA Champions League Starball + 15",
  "Premier League Gold Champions",
  "La Liga Official Sleeve Badge",
  "FIFA World Champions Gold Crest",
  "None (Clean Kit)",
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function NewProductPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Set<string>());

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Football Product Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("club-jerseys");
  const [club, setClub] = useState("Real Madrid");
  const [country, setCountry] = useState("Spain");
  const [player, setPlayer] = useState("");
  const [edition, setEdition] = useState("Player Issue (Authentic)");
  const [brand, setBrand] = useState("Adidas");
  const [badge, setBadge] = useState("UEFA Champions League Starball + 15");
  const [colorway, setColorway] = useState("White / Houndstooth / Gold");
  const [condition, setCondition] = useState<"new" | "used">("new");
  const [description, setDescription] = useState(
    "Official player edition jersey engineered with lightweight air-cooling fabric, heat-applied silicone crest, and athletic match-fit silhouette."
  );

  // Pricing & Inventory
  const [price, setPrice] = useState("54000");
  const [originalPrice, setOriginalPrice] = useState("60000");
  const [stock, setStock] = useState("25");

  // Selected Sizes
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L", "XL"]);

  // Media (Images Only - No Video)
  const [cover, setCover] = useState<LocalImage | null>({
    id: "default-cover",
    previewUrl: "/kits/real-madrid-2025-home.jpg",
  });
  const [gallery, setGallery] = useState<LocalImage[]>([
    { id: "sample-2", previewUrl: "/kits/arsenal-2025-home.jpg" },
    { id: "sample-3", previewUrl: "/kits/barcelona-2025-home.jpg" },
  ]);

  useEffect(() => {
    if (!tokenStore.get()) router.replace("/login");
  }, [router]);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function makeLocalImage(file: File): LocalImage {
    const previewUrl = URL.createObjectURL(file);
    previewUrls.current.add(previewUrl);
    return { id: createId(), file, previewUrl };
  }

  function releaseImage(image: LocalImage) {
    if (image.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(image.previewUrl);
      previewUrls.current.delete(image.previewUrl);
    }
  }

  function onCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setError("Cover photo must be 15 MB or smaller.");
      event.target.value = "";
      return;
    }
    setCover((current) => {
      if (current) releaseImage(current);
      return makeLocalImage(file);
    });
    setFieldErrors((current) => ({ ...current, coverImage: "" }));
    event.target.value = "";
  }

  function onGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const remaining = 8 - gallery.length;
    if (remaining <= 0) {
      setError("You can add at most 8 gallery photos.");
      event.target.value = "";
      return;
    }
    const accepted: File[] = [];
    for (const f of files) {
      if (f.size > 15 * 1024 * 1024) {
        setError(`'${f.name}' exceeds 15 MB limit.`);
        continue;
      }
      if (accepted.length < remaining) accepted.push(f);
    }
    setGallery((current) => [...current, ...accepted.map(makeLocalImage)]);
    event.target.value = "";
  }

  function removeGalleryImage(id: string) {
    setGallery((current) => {
      const img = current.find((item) => item.id === id);
      if (img) releaseImage(img);
      return current.filter((item) => item.id !== id);
    });
  }

  function toggleSize(sizeValue: string) {
    setSelectedSizes((current) =>
      current.includes(sizeValue)
        ? current.filter((s) => s !== sizeValue)
        : [...current, sizeValue]
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!title.trim()) {
      setError("Please provide a product title.");
      return;
    }

    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0) {
      setError("Please provide a valid product price.");
      return;
    }

    if (!cover) {
      setError("Please select a cover photo for the kit.");
      return;
    }

    setSubmitting(true);
    const form = new FormData();
    form.set("title", title.trim());
    form.set("category", category);
    form.set("club", club);
    form.set("country", country);
    form.set("player", player.trim());
    form.set("edition", edition);
    form.set("brand", brand);
    form.set("badge", badge);
    form.set("colorway", colorway);
    form.set("condition", condition);
    form.set("price", String(numericPrice));
    if (originalPrice) form.set("originalPrice", originalPrice);
    form.set("stock", stock);
    form.set("description", description);

    // Build size variants
    const sizeOptions = selectedSizes.map((sz) => ({
      value: sz,
      price: numericPrice,
      stock: Math.max(1, Math.floor(Number(stock) / (selectedSizes.length || 1))),
    }));
    form.set(
      "variants",
      JSON.stringify([{ name: category === "football-boots" ? "Boot Size" : "Size", options: sizeOptions }])
    );

    try {
      await createProduct(form);
      router.push("/seller/products?submitted=1");
    } catch {
      setError("Failed to upload product. Please check fields and try again.");
      setSubmitting(false);
    }
  }

  const numericPrice = Number(price) || 0;
  const numericOriginal = Number(originalPrice) || 0;
  const isBoots = category === "football-boots";

  return (
    <main className="min-h-screen bg-canvas px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Admin Dashboard
              </Link>
              <span className="text-muted">·</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-wider">
                <Store className="h-3.5 w-3.5" /> Football Wears Pro Shop
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Upload New Football Product
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-0.5">
              Publish official kits, retro shirts, boots, and gear directly to your personal storefront with Cash on Delivery.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/seller/products"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-ink hover:bg-sunken transition-all shadow-2xs"
            >
              <Package className="h-4 w-4 text-primary" />
              Manage Inventory
            </Link>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-muted hover:text-ink transition-all shadow-2xs"
            >
              Live Storefront ↗
            </Link>
          </div>
        </div>

        {error && (
          <Alert kind="error" className="rounded-2xl shadow-soft">
            {error}
          </Alert>
        )}

        <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          {/* Left Column: Form Details */}
          <div className="space-y-6">
            {/* Section 1: Photos Studio (Images Only - No Video) */}
            <section className="rounded-3xl bg-surface border border-line shadow-soft p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-ink">Kit &amp; Gear Photos</h2>
                    <p className="text-xs text-muted">Clean studio or flatlay photos of the kit (front, back, badges).</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-full">
                  Images Only · 0 Videos
                </span>
              </div>

              {/* Hidden Inputs */}
              <input ref={coverInputRef} type="file" accept="image/*" className="sr-only" onChange={onCoverChange} />
              <input ref={galleryInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={onGalleryChange} />

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* 1. Main Cover Photo */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-dashed border-primary/50 bg-primary-soft/15 flex flex-col items-center justify-center sm:col-span-2">
                  {cover ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover.previewUrl} alt="Cover preview" className="h-full w-full object-contain p-2" />
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-soft">
                        Primary Cover
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          releaseImage(cover);
                          setCover(null);
                        }}
                        className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                        title="Remove cover"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-primary hover:bg-primary-soft/30 transition-colors"
                    >
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-xs font-black">Upload Front Cover</span>
                      <span className="text-[10px] text-muted">JPEG / PNG / WebP</span>
                    </button>
                  )}
                </div>

                {/* 2. Gallery Photos */}
                {gallery.map((item, idx) => (
                  <div key={item.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-sunken">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt={`Gallery ${idx + 1}`} className="h-full w-full object-contain p-1.5" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(item.id)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* 3. Add More Photos Button */}
                {gallery.length < 6 && (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="aspect-[4/3] rounded-2xl border-2 border-dashed border-line bg-sunken text-muted hover:border-primary hover:text-primary hover:bg-primary-soft/10 transition-all flex flex-col items-center justify-center gap-1.5 p-3"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-xs font-bold">Add Detail Photo</span>
                    <span className="text-[10px] text-muted">{gallery.length}/6 added</span>
                  </button>
                )}
              </div>

              {/* Photo Preset Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-muted">Or pick an existing kit photo:</span>
                {[
                  { name: "Real Madrid 24/25", url: "/kits/real-madrid-2025-home.jpg" },
                  { name: "Arsenal 24/25", url: "/kits/arsenal-2025-home.jpg" },
                  { name: "Barcelona 24/25", url: "/kits/barcelona-2025-home.jpg" },
                  { name: "Man Utd 2008 Retro", url: "/kits/manchester-united-2008-retro.jpg" },
                  { name: "Nike Mercurial Boots", url: "/kits/nike-mercurial-superfly.jpg" },
                ].map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => setCover({ id: sample.name, previewUrl: sample.url })}
                    className="text-[11px] font-semibold bg-sunken hover:bg-primary-soft hover:text-primary px-2.5 py-1 rounded-lg border border-line transition-colors"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </section>

            {/* Section 2: Football Specifications */}
            <section className="rounded-3xl bg-surface border border-line shadow-soft p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-line">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Shirt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Kit &amp; Gear Specifications</h2>
                  <p className="text-xs text-muted">Club, country, player edition, brand, and badges.</p>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-xs font-bold text-ink">Product Title *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Real Madrid 2024/25 Home Shirt — Authentic Match Edition (Mbappé #9)"
                  className="h-11 rounded-xl text-sm font-semibold mt-1"
                />
              </div>

              {/* Department & Brand */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-xs font-bold text-ink">Category / Department *</Label>
                  <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 mt-1"
                  >
                    {FOOTBALL_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="brand" className="text-xs font-bold text-ink">Brand / Manufacturer *</Label>
                  <select
                    id="brand"
                    name="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 mt-1"
                  >
                    {FOOTBALL_BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Club & Country */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="club" className="text-xs font-bold text-ink">Club / Team</Label>
                  <select
                    id="club"
                    name="club"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    className="w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 mt-1"
                  >
                    <option value="">None / National Gear</option>
                    {FOOTBALL_CLUBS.map((c) => (
                      <option key={c.id} value={c.name}>{c.name} ({c.league})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="country" className="text-xs font-bold text-ink">Country / National Team</Label>
                  <select
                    id="country"
                    name="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 mt-1"
                  >
                    <option value="">None / Club Kit</option>
                    {FOOTBALL_COUNTRIES.map((ct) => (
                      <option key={ct.id} value={ct.name}>{ct.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Player & Edition */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="player" className="text-xs font-bold text-ink">Star Player Printing (Optional)</Label>
                  <select
                    id="player"
                    name="player"
                    value={player}
                    onChange={(e) => setPlayer(e.target.value)}
                    className="w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 mt-1"
                  >
                    <option value="">Blank (No Name / Number)</option>
                    {FOOTBALL_PLAYERS.map((p) => (
                      <option key={p.id} value={p.name}>#{p.number} {p.name} ({p.club})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="edition" className="text-xs font-bold text-ink">Kit &amp; Gear Edition *</Label>
                  <select
                    id="edition"
                    name="edition"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    className="w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 mt-1"
                  >
                    {FOOTBALL_EDITIONS.map((ed) => (
                      <option key={ed} value={ed}>{ed}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sleeve Badge & Colorway */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="badge" className="text-xs font-bold text-ink">Sleeve / Competition Badge</Label>
                  <select
                    id="badge"
                    name="badge"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full h-11 rounded-xl border border-line bg-surface px-3.5 text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 mt-1"
                  >
                    {BADGE_OPTIONS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="colorway" className="text-xs font-bold text-ink">Colorway / Style</Label>
                  <Input
                    id="colorway"
                    name="colorway"
                    value={colorway}
                    onChange={(e) => setColorway(e.target.value)}
                    placeholder="e.g. Scarlet Red / White Piping"
                    className="h-11 rounded-xl text-xs font-bold mt-1"
                  />
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <Label className="text-xs font-bold text-ink">Available Sizes in Stock *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(isBoots ? BOOT_SIZES : COMMON_SIZES).map((sz) => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => toggleSize(sz)}
                        className={`h-9 px-3.5 rounded-xl text-xs font-black transition-all border ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-surface border-line text-muted hover:text-ink hover:border-primary/40"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-xs font-bold text-ink">Kit &amp; Material Details *</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-surface p-3.5 text-xs leading-relaxed text-ink focus:ring-2 focus:ring-primary/20 mt-1"
                  placeholder="Mention fabric cooling tech (HEAT.RDY, Dri-FIT ADV), badge materials, fit recommendations..."
                />
              </div>
            </section>

            {/* Section 3: Pricing & Cash on Delivery Dispatch */}
            <section className="rounded-3xl bg-surface border border-line shadow-soft p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-line">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Pricing &amp; Cash on Delivery</h2>
                  <p className="text-xs text-muted">Set selling price and manage inventory stock.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price" className="text-xs font-bold text-ink">Store Price (PKR) *</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-muted">PKR</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="54000"
                      className="pl-12 h-11 rounded-xl text-base font-black text-ink"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="originalPrice" className="text-xs font-bold text-ink">List / Original Price (PKR)</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-muted">PKR</span>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="60000"
                      className="pl-12 h-11 rounded-xl text-sm font-semibold text-muted"
                    />
                  </div>
                  <span className="text-[10px] text-muted">Shows strike-through discount</span>
                </div>

                <div>
                  <Label htmlFor="stock" className="text-xs font-bold text-ink">Quantity in Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="1"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="25"
                    className="h-11 rounded-xl text-sm font-black mt-1"
                  />
                </div>
              </div>

              {/* Cash on Delivery Notice */}
              <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/40 p-4 space-y-2">
                <div className="flex items-center gap-2 font-black text-xs text-emerald-800">
                  <Banknote className="h-4 w-4 text-emerald-600" />
                  <span>Cash on Delivery (COD) Automatically Enabled</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Every kit listed in your shop is dispatched via tracked courier across Nigeria with zero upfront payment. Buyers pay cash or transfer to the courier upon delivery and kit inspection.
                </p>
              </div>
            </section>

            {/* Submission CTA */}
            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                full
                size="lg"
                disabled={submitting}
                className="h-14 rounded-2xl font-black text-base shadow-soft bg-primary hover:bg-primary-dark text-white"
              >
                {submitting ? "Uploading & Publishing Product…" : "Publish Product to Storefront →"}
              </Button>
              <p className="text-center text-xs text-muted">
                Published products appear live immediately in the catalog and under your brand.
              </p>
            </div>
          </div>

          {/* Right Column: Live Storefront Card Preview */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-primary" />
                  Live Storefront Preview
                </span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5">
                  COD Ready
                </span>
              </div>

              {/* Preview Card */}
              <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
                <div className="relative aspect-[4/3] bg-sunken overflow-hidden flex items-center justify-center">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.previewUrl} alt="Cover preview" className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="text-center text-muted text-xs p-4">
                      <Camera className="h-8 w-8 mx-auto mb-1 text-line-strong" />
                      <span>Upload cover image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="rounded-full bg-ink/90 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-soft">
                      {edition.includes("Player") ? "Player Issue" : "Official"}
                    </span>
                    <span className="rounded-full bg-surface/90 px-2 py-0.5 text-[9px] font-bold uppercase text-body border border-line">
                      {brand}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span className="font-bold uppercase text-primary truncate max-w-[150px]">{club || country || "Authentic"}</span>
                    <span className="font-bold text-ink">★ 5.0</span>
                  </div>

                  <h3 className="font-bold text-sm text-ink line-clamp-2 leading-snug">
                    {title || "Real Madrid 2024/25 Home Shirt — Authentic Match Edition"}
                  </h3>

                  {player && (
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      {player}
                    </div>
                  )}

                  <div className="flex items-baseline justify-between pt-1 border-t border-line/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted block">Cash on Delivery</span>
                      <span className="text-lg font-black text-ink">
                        PKR {numericPrice > 0 ? numericPrice.toLocaleString() : "54,000"}
                      </span>
                    </div>
                    {numericOriginal > numericPrice && (
                      <span className="text-xs text-muted line-through">
                        PKR {numericOriginal.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </article>

              {/* Ready Checklist */}
              <div className="rounded-2xl bg-sunken/60 p-4 border border-line space-y-2 text-xs">
                <span className="font-bold text-ink block">Product Upload Checklist:</span>
                <div className="space-y-1.5 text-[11px] text-muted">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${cover ? "text-emerald-600" : "text-muted"}`} />
                    <span>Front cover photo selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${title.length > 5 ? "text-emerald-600" : "text-muted"}`} />
                    <span>Descriptive kit title</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${numericPrice > 0 ? "text-emerald-600" : "text-muted"}`} />
                    <span>Valid store price in PKR</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${selectedSizes.length > 0 ? "text-emerald-600" : "text-muted"}`} />
                    <span>{selectedSizes.length} size options configured</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Cash on Delivery (COD) enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
