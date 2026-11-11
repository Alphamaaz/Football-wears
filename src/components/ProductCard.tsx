"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Heart, ShieldCheck, ShoppingBag, Sparkles, Star, Trophy } from "lucide-react";
import { useState } from "react";
import { assetUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/api";
import type { Product } from "@/lib/products";
import { addCartItem } from "@/lib/cart";
import { addWishlistItem } from "@/lib/wishlist";
import { notifyCommerceChanged } from "@/lib/commerce-events";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);

  const fallbackFootballImg = "/kits/real-madrid-2025-home.jpg";

  async function handleQuickAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addCartItem({
        productId: product._id,
        quantity: 1,
        variantSelections: product.variants.length > 0 ? [{ name: product.variants[0].name, value: product.variants[0].options[0].value }] : [],
      });
      setAdded(true);
      notifyCommerceChanged();
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // ignore
    }
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addWishlistItem(product._id);
      setSaved(!saved);
      notifyCommerceChanged();
    } catch {
      // ignore
    }
  }

  const mobileCard = (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all active:scale-[.99] sm:hidden">
      <Link href={`/products/${product._id}`} className="relative block aspect-[1.1/1] overflow-hidden bg-sunken">
        <img
          src={product.coverImage?.url ? assetUrl(product.coverImage.url) : fallbackFootballImg}
          alt={product.coverImage?.alt ?? product.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = fallbackFootballImg;
          }}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-colors ${
            saved ? "bg-primary text-white" : "bg-ink/50 text-white"
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`h-4.5 w-4.5 ${saved ? "fill-white" : ""}`} strokeWidth={2.2} />
        </button>
        {product.isFeatured && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            Top Pick
          </span>
        )}
      </Link>
      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span className="font-bold uppercase tracking-wider text-primary">{product.brand || "Authentic"}</span>
          <span className="flex items-center gap-1 font-bold text-ink">
            <Star className="h-3 w-3 fill-accent text-accent" />
            {product.ratingAverage.toFixed(1)}
          </span>
        </div>
        <Link
          href={`/products/${product._id}`}
          className="block font-bold text-sm leading-snug text-ink line-clamp-2 hover:text-primary"
        >
          {product.title}
        </Link>
        <div className="flex items-center justify-between pt-1">
          <p className="text-base font-black text-ink">PKR {product.price.toLocaleString()}</p>
          <button
            type="button"
            onClick={handleQuickAddToCart}
            className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all ${
              added ? "bg-emerald-600 text-white" : "bg-primary text-white hover:bg-primary-dark"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>{added ? "Added!" : "Add"}</span>
          </button>
        </div>
      </div>
    </article>
  );

  if (viewMode === "list") {
    return (
      <>
        {mobileCard}
        <article className="group hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:border-primary/40 hover:shadow-lifted sm:flex sm:flex-row overflow-hidden">
          <Link
            href={`/products/${product._id}`}
            className="relative w-72 shrink-0 bg-sunken overflow-hidden block"
          >
            <img
              src={product.coverImage?.url ? assetUrl(product.coverImage.url) : fallbackFootballImg}
              alt={product.coverImage?.alt ?? product.title}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = fallbackFootballImg;
              }}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.isFeatured && (
              <span className="absolute top-3 left-3 rounded-full bg-ink/90 backdrop-blur px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-soft">
                Featured Kit
              </span>
            )}
          </Link>

          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-muted">
                <span className="font-extrabold uppercase tracking-wider text-primary">{product.brand} · {product.category.replace("-", " ")}</span>
                <span className="flex items-center gap-1 font-bold text-ink">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  {product.ratingAverage.toFixed(1)} ({product.ratingCount} reviews)
                </span>
              </div>
              <Link href={`/products/${product._id}`} className="mt-2 block">
                <h3 className="text-lg font-bold text-ink group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
              </Link>
              <p className="mt-2 text-xs text-body line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-line mt-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">Direct Shop Price</span>
                <p className="text-2xl font-black text-ink">PKR {product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`grid h-10 w-10 place-items-center rounded-xl border border-line transition-colors ${
                    saved ? "bg-primary-soft text-primary border-primary" : "hover:bg-sunken text-muted"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-4 w-4 ${saved ? "fill-primary" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={handleQuickAddToCart}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-extrabold text-white transition-all ${
                    added ? "bg-emerald-600" : "bg-primary hover:bg-primary-dark"
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{added ? "Added to Cart!" : "Add to Cart"}</span>
                </button>
                <Link
                  href={`/products/${product._id}`}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-surface px-4 text-xs font-bold text-ink hover:border-primary hover:text-primary"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        </article>
      </>
    );
  }

  // Grid view
  return (
    <>
      {mobileCard}
      <article className="group relative hidden h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lifted sm:flex">
        {/* Cover Image */}
        <Link href={`/products/${product._id}`} className="relative aspect-[4/3] bg-sunken overflow-hidden block">
          <img
            src={product.coverImage?.url ? assetUrl(product.coverImage.url) : fallbackFootballImg}
            alt={product.coverImage?.alt ?? product.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = fallbackFootballImg;
            }}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {product.isFeatured && (
              <span className="rounded-full bg-ink/90 backdrop-blur px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-soft">
                Featured
              </span>
            )}
            <span className="rounded-full bg-surface/90 backdrop-blur px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-body border border-line">
              {product.brand}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-2.5 right-2.5 grid h-8 w-8 place-items-center rounded-full backdrop-blur-md transition-colors ${
              saved ? "bg-primary text-white" : "bg-black/40 hover:bg-black/60 text-white"
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
          </button>
        </Link>

        {/* Details */}
        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span className="font-semibold capitalize truncate">{product.category.replace("-", " ")}</span>
              <span className="flex items-center gap-1 font-bold text-ink shrink-0">
                <Star className="h-3 w-3 fill-accent text-accent" />
                {product.ratingAverage.toFixed(1)}
              </span>
            </div>
            <Link href={`/products/${product._id}`} className="block">
              <h3 className="font-bold text-sm leading-snug text-ink group-hover:text-primary transition-colors line-clamp-2">
                {product.title}
              </h3>
            </Link>
          </div>

          <div className="pt-2 border-t border-line/60 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted block">Price</span>
              <p className="text-base font-black text-ink">PKR {product.price.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={handleQuickAddToCart}
              className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white transition-all active:scale-95 ${
                added ? "bg-emerald-600" : "bg-primary hover:bg-primary-dark"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{added ? "Added!" : "Add to Cart"}</span>
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
