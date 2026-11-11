import type { Metadata } from "next";
import { listProductsServer } from "@/lib/products";
import { FOOTBALL_CATEGORIES } from "@/lib/football-data";
import { MarketplaceCatalog } from "@/components/MarketplaceCatalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = FOOTBALL_CATEGORIES.find((c) => c.slug === slug);
  const name = cat ? cat.name : slug.replace("-", " ");
  return { title: `${name} · Football Wears Official Shop` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = FOOTBALL_CATEGORIES.find((c) => c.slug === slug);
  const formattedName = cat ? cat.name : slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  const description = cat?.description || `Explore our authentic ${formattedName.toLowerCase()} selection.`;

  const { products, total } = await listProductsServer({
    category: slug,
    limit: 36,
    sort: "featured",
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-soft">
        <span className="text-xs font-black uppercase tracking-wider text-primary">
          Shop Department
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-ink tracking-tight mt-1">
          {formattedName}
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-2 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>

      <MarketplaceCatalog
        initialProducts={products}
        initialTotal={total}
        initialCategory={slug}
      />
    </div>
  );
}
