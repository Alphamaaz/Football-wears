import type { Metadata } from "next";
import { listProductsServer } from "@/lib/products";
import { MarketplaceCatalog } from "@/components/MarketplaceCatalog";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `“${q}” — Search Kits & Gear · Football Wears` : "Search Football Collection · Football Wears" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { products, total } = await listProductsServer({
    search: q || undefined,
    limit: 36,
    sort: "featured",
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-soft">
        <span className="text-xs font-black uppercase tracking-wider text-primary">Store Search</span>
        <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mt-1">
          {q ? `Search results for “${q}”` : "All Football Wears Products"}
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1.5">
          Find match kits, cleats, retro jerseys, or accessories. Filter by category, price, or size.
        </p>
      </div>

      <MarketplaceCatalog
        initialProducts={products}
        initialTotal={total}
        initialSearch={q}
      />
    </div>
  );
}
