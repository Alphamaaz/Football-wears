"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  Banknote,
  CheckCircle2,
  Heart,
  MessageCircle,
  Package,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { assetUrl } from "@/lib/api";
import { addCartItem } from "@/lib/cart";
import { addWishlistItem, removeWishlistItem } from "@/lib/wishlist";
import { notifyCommerceChanged } from "@/lib/commerce-events";
import { Logo } from "@/components/Logo";

export function MobileProductDetail({
  product,
  rating,
  ratingCount,
}: {
  product: Product;
  rating: number;
  ratingCount: number;
}) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants.forEach((v) => {
      if (v.options.length > 0) initial[v.name] = v.options[0].value;
    });
    return initial;
  });

  const images = useMemo(() => {
    const candidates = [product.coverImage, ...(product.images || [])];
    return candidates.filter(
      (item, index, list) => item?.url && list.findIndex((other) => other.url === item.url) === index,
    );
  }, [product.coverImage, product.images]);

  async function toggleWishlist() {
    try {
      if (saved) await removeWishlistItem(product._id);
      else await addWishlistItem(product._id);
      setSaved(!saved);
      notifyCommerceChanged();
    } catch {
      // ignore
    }
  }

  async function handleAddToCart(checkout = false) {
    try {
      const selections = Object.entries(selectedVariants).map(([name, value]) => ({ name, value }));
      await addCartItem({
        productId: product._id,
        quantity: 1,
        variantSelections: selections,
      });
      notifyCommerceChanged();
      setAdded(true);
      if (checkout) {
        router.push("/checkout");
      } else {
        setTimeout(() => setAdded(false), 2000);
      }
    } catch {
      // ignore
    }
  }

  async function shareProduct() {
    const data = {
      title: product.title,
      text: `Check out ${product.title} at Football Wears`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else if (navigator.clipboard) await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <article className="mobile-product-detail md:hidden">
      <header className="mobile-product-header">
        <button type="button" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft />
        </button>
        <Logo className="mobile-product-logo" />
        <div className="flex items-center gap-1">
          <button type="button" onClick={shareProduct} aria-label="Share product">
            <Share2 />
          </button>
          <button type="button" onClick={toggleWishlist} aria-label="Save product">
            <Heart className={saved ? "fill-primary text-primary" : ""} />
          </button>
        </div>
      </header>

      <section className="mobile-product-gallery">
        <img
          src={assetUrl(images[activeImage]?.url || product.coverImage.url)}
          alt={product.title}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <div className="mobile-product-dots">
            {images.map((image, index) => (
              <button
                type="button"
                key={image.url}
                aria-label={`View image ${index + 1}`}
                className={index === activeImage ? "is-active" : ""}
                onClick={() => setActiveImage(index)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mobile-product-summary">
        <div className="mobile-product-meta">
          <span className="font-extrabold text-primary">{product.brand}</span>
          {ratingCount > 0 && (
            <strong>
              <Star /> {rating.toFixed(1)} ({ratingCount})
            </strong>
          )}
        </div>
        <h1 className="text-xl font-black text-ink">{product.title}</h1>
        <div className="mobile-product-price">PKR {product.price.toLocaleString()}</div>
      </section>

      {/* Variant Selector */}
      {product.variants.length > 0 && (
        <section className="mobile-product-options">
          {product.variants.map((variant) => (
            <div key={variant.name}>
              <strong>Select {variant.name}</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {variant.options.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={selectedVariants[variant.name] === option.value ? "is-active" : ""}
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [variant.name]: option.value }))
                    }
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="mobile-product-facts" aria-label="Listing details">
        <div>
          <ShieldCheck />
          <span>
            Authenticity<strong>100% Genuine Licensed Kit</strong>
          </span>
        </div>
        <div>
          <Banknote />
          <span>
            Payment<strong>Cash on Delivery (COD)</strong>
          </span>
        </div>
        <div>
          <Package />
          <span>
            Stock<strong>Ready for immediate dispatch</strong>
          </span>
        </div>
        <div>
          <Truck />
          <span>
            Delivery<strong>Tracked Express (24-48 Hours)</strong>
          </span>
        </div>
        <div>
          <RefreshCw />
          <span>
            Exchange<strong>14-Day Fit &amp; Size Exchange</strong>
          </span>
        </div>
      </section>

      <section className="mobile-product-description">
        <h2>Kit &amp; Material Details</h2>
        <p>{product.description}</p>
      </section>

      <aside className="mobile-product-safety">
        <Award />
        <p>
          <strong>Official Football Wears Promise:</strong> All jerseys and boots are sourced directly,
          heat-applied with official badges, and guaranteed authentic.
        </p>
      </aside>

      {/* Floating Bottom Action Bar */}
      <div className="mobile-product-actions">
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          className={`flex items-center justify-center gap-1.5 font-bold ${
            added ? "bg-emerald-600 text-white" : ""
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{added ? "Added!" : "Add to Cart"}</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          className="bg-ink text-white font-bold"
        >
          Buy Now
        </button>
      </div>
    </article>
  );
}
