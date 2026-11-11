import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Handshake,
  MapPin,
  Package,
  ShieldAlert,
  ShieldCheck,
  Star,
  Store,
  Tag,
} from "lucide-react";
import { getProductServer, listProductsServer } from "@/lib/products";
import { BuyBox } from "@/components/BuyBox";
import { ProductGallery } from "@/components/ProductGallery";
import { listProductReviewsServer, listSellerReviewsServer, type Review } from "@/lib/reviews";
import { listProductQuestionsServer } from "@/lib/questions";
import { PromotionActions } from "@/components/PromotionActions";
import { ProductFeedbackAndQA } from "@/components/ProductFeedbackAndQA";
import { ProductCard } from "@/components/ProductCard";
import { MobileProductDetail } from "@/components/MobileProductDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductServer(id);
  if (!product) return { title: "Kit Not Found · Football Wears" };
  return {
    title: `${product.title} · PKR ${product.price.toLocaleString()} · Football Wears Pro Shop`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { id } = await params;
  const { ref } = await searchParams;
  const product = await getProductServer(id);
  if (!product) notFound();

  const [reviewResult, sellerReviewResult, questionResult, relatedResult] = await Promise.all([
    listProductReviewsServer(id),
    listSellerReviewsServer(product.seller),
    listProductQuestionsServer(id),
    listProductsServer({ category: product.category, limit: 4, sort: "popular" }),
  ]);

  const listingMedia = product.media?.length
    ? product.media
    : product.images.map((image) => ({ ...image, type: "image" as const }));

  const locationText = product.location?.state
    ? product.location.city
      ? `${product.location.city}, ${product.location.state}`
      : `${product.location.state}, Nigeria`
    : "Nigeria";

  const relatedProducts = relatedResult.products.filter((p) => p._id !== id).slice(0, 3);

  // Merge and deduplicate seller & product reviews for a unified P2P trust view
  const reviewMap = new Map<string, Review>();
  sellerReviewResult.reviews.forEach((r) => reviewMap.set(r._id, r));
  reviewResult.reviews.forEach((r) => {
    if (!reviewMap.has(r._id)) {
      reviewMap.set(r._id, r);
    }
  });
  const allReviews = Array.from(reviewMap.values());
  const effectiveRatingCount =
    (product.sellerRatingCount ?? 0) > 0
      ? product.sellerRatingCount!
      : product.ratingCount > 0
      ? product.ratingCount
      : allReviews.length;
  const effectiveRatingAverage =
    (product.sellerRatingAverage ?? 0) > 0
      ? product.sellerRatingAverage!
      : product.ratingAverage > 0
      ? product.ratingAverage
      : allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

  return (
    <>
      <MobileProductDetail product={product} rating={effectiveRatingAverage} ratingCount={effectiveRatingCount} />
    <div className="hidden space-y-10 sm:space-y-12 max-w-7xl mx-auto md:block">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-muted/60" />
        <Link
          href={`/category/${product.category}`}
          className="capitalize hover:text-primary transition-colors font-medium"
        >
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3 text-muted/60" />
        {product.location?.state && (
          <>
            <span className="hover:text-primary transition-colors">{product.location.state}</span>
            <ChevronRight className="h-3 w-3 text-muted/60" />
          </>
        )}
        <span className="text-ink font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* ================================================================= */}
        {/* LEFT COLUMN: Media Gallery + Specifications + Detailed Description */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 space-y-8">
          {/* Enhanced Media Gallery */}
          <ProductGallery
            title={product.title}
            cover={product.coverImage}
            media={listingMedia}
            condition={product.condition}
            locationText={locationText}
            isNegotiable={product.negotiable !== false}
          />

          {/* Quick Specifications Highlights Grid */}
          <section className="rounded-3xl border border-line bg-surface p-6 shadow-soft space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Kit &amp; Gear Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {product.club && (
                <div className="rounded-2xl bg-sunken/60 p-3.5 border border-line space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted">Club / Team</span>
                  <div className="font-extrabold text-ink truncate">{product.club}</div>
                </div>
              )}

              {product.country && (
                <div className="rounded-2xl bg-sunken/60 p-3.5 border border-line space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted">Country</span>
                  <div className="font-extrabold text-ink truncate">{product.country}</div>
                </div>
              )}

              {product.player && (
                <div className="rounded-2xl bg-primary-soft/60 p-3.5 border border-primary/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-primary">Player Edition</span>
                  <div className="font-extrabold text-primary truncate">{product.player}</div>
                </div>
              )}

              {product.edition && (
                <div className="rounded-2xl bg-sunken/60 p-3.5 border border-line space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted">Edition &amp; Version</span>
                  <div className="font-extrabold text-ink truncate">{product.edition}</div>
                </div>
              )}

              {product.badge && (
                <div className="rounded-2xl bg-sunken/60 p-3.5 border border-line space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted">Sleeve Badges</span>
                  <div className="font-extrabold text-ink truncate">{product.badge}</div>
                </div>
              )}

              {product.brand && (
                <div className="rounded-2xl bg-sunken/60 p-3.5 border border-line space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted">Manufacturer</span>
                  <div className="font-extrabold text-ink">{product.brand}</div>
                </div>
              )}

              {product.colorway && (
                <div className="rounded-2xl bg-sunken/60 p-3.5 border border-line space-y-1">
                  <span className="text-[10px] font-bold uppercase text-muted">Official Colorway</span>
                  <div className="font-extrabold text-ink truncate">{product.colorway}</div>
                </div>
              )}

              <div className="rounded-2xl bg-sunken/60 p-3.5 border border-line space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted">Condition</span>
                <div className="font-extrabold text-emerald-700 capitalize flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% Brand New (Tags On)</span>
                </div>
              </div>

              <div className="rounded-2xl bg-sunken/60 p-3.5 border border-line space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted">Stock Availability</span>
                <div className="font-extrabold text-ink">
                  {product.stock > 0 ? `${product.stock} units in dispatch hub` : "Out of stock"}
                </div>
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section className="rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-soft space-y-3">
            <h2 className="text-base font-bold text-ink">Item Description</h2>
            <div className="prose prose-sm text-body/90 whitespace-pre-line leading-relaxed text-xs sm:text-sm">
              {product.description}
            </div>
          </section>

          {/* Delivery & Logistics Arrangement Card — Commented out as shipping and delivery are arranged directly in Transaction Chat */}
          {/*
          <section className="rounded-3xl border border-line bg-surface p-6 shadow-soft space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Pickup &amp; Delivery Arrangement</h3>
                <p className="text-xs text-muted">
                  {product.delivery?.mode === "seller_included"
                    ? "Delivery is handled directly by the seller upon deal confirmation."
                    : "Direct peer-to-peer pickup or delivery arranged directly with the seller in chat."}
                  {product.delivery?.estimatedDays ? ` Expected within ${product.delivery.estimatedDays}.` : ""}
                </p>
              </div>
            </div>
            {product.delivery?.details && (
              <div className="rounded-2xl bg-sunken p-3.5 text-xs text-muted border border-line mt-2">
                <strong className="text-ink">Seller Delivery Note:</strong> {product.delivery.details}
              </div>
            )}
          </section>
          */}
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: Sticky Executive BuyBox & Merchant Card             */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* Header Title & Store Link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
                <Package className="h-3.5 w-3.5" />
                {product.category}
              </span>
              <span className="flex items-center gap-1 font-semibold text-muted">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {locationText}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight leading-tight">
              {product.title}
            </h1>

            {/* Merchant Identity & Feedback */}
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-line px-3 py-1 text-xs font-semibold text-ink shadow-xs">
                <Store className="h-3.5 w-3.5 text-primary" />
                <span>{product.storeName}</span>
              </div>

              {(product.sellerRatingCount ?? 0) > 0 && (
                <div className="inline-flex items-center gap-1 text-xs font-bold text-ink">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span>{product.sellerRatingAverage?.toFixed(1)}</span>
                  <span className="text-muted font-normal">({product.sellerRatingCount} ratings)</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive BuyBox (Variants, Price Am bargaining drawer, WhatsApp/Call) */}
          <BuyBox product={product} />

          {/* Promotion / Affiliate Share Actions */}
          <PromotionActions
            productId={product._id}
            referralCode={ref}
            enabled={Boolean(product.promotion?.enabled)}
          />

          {/* Football Wears Authenticity & Service Promise */}
          <div className="rounded-3xl border border-line bg-surface p-5 space-y-3.5 shadow-soft">
            <div className="flex items-center gap-2 font-black text-ink text-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Football Wears Authenticity Promise</span>
            </div>
            <ul className="space-y-2 text-xs text-muted leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-ink">100% Licensed &amp; Authentic:</strong> Sourced directly with original manufacturer barcodes and tags.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-ink">Official Name &amp; Number Fonts:</strong> Match-spec player printing and authentic competition sleeve badges.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-ink">14-Day Size Exchange:</strong> Hassle-free size swaps if the jersey or boot fit isn&apos;t exact.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-ink">Fast Tracked Shipping:</strong> Dispatched in heavy-duty protective kit sleeves within 24–48 hours.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* UNIFIED: Customer Feedback & Community Q&A                        */}
      {/* ================================================================= */}
      <div className="border-t border-line pt-8">
        <ProductFeedbackAndQA
          productId={product._id}
          productTitle={product.title}
          sellerId={product.seller}
          storeName={product.storeName}
          sellerFullName={product.sellerFullName}
          allReviews={allReviews}
          effectiveRatingAverage={effectiveRatingAverage}
          effectiveRatingCount={effectiveRatingCount}
          initialQuestions={questionResult.questions}
        />
      </div>

      {/* ================================================================= */}
      {/* RELATED LISTINGS IN THIS CATEGORY                                 */}
      {/* ================================================================= */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-line space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Discover More</span>
              <h2 className="text-xl sm:text-2xl font-black text-ink">Similar Listings You Might Like</h2>
            </div>
            <Link
              href={`/category/${product.category}`}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All {product.category} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
    </>
  );
}
