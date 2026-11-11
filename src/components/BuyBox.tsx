"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Banknote,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  MessageCircle,
  Package,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
  Truck,
  Zap,
} from "lucide-react";
import type { Product } from "@/lib/products";
import { addCartItem } from "@/lib/cart";
import { addWishlistItem, removeWishlistItem } from "@/lib/wishlist";
import { notifyCommerceChanged } from "@/lib/commerce-events";
import { Alert, Button, Input } from "@/components/ui";

export function BuyBox({ product }: { product: Product }) {
  const router = useRouter();

  // Initial variant choices
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variants.forEach((v) => {
      if (v.options.length > 0) {
        initial[v.name] = v.options[0].value;
      }
    });
    return initial;
  });

  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [savedToWishlist, setSavedToWishlist] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Compute active price from selections
  const displayPrice = useMemo(() => {
    let price = product.price;
    product.variants.forEach((v) => {
      const chosenValue = selectedVariants[v.name];
      const opt = v.options.find((o) => o.value === chosenValue);
      if (opt && opt.price > price) {
        price = opt.price;
      }
    });
    return price;
  }, [product, selectedVariants]);

  const activeSelections = useMemo(() => {
    const result = Object.entries(selectedVariants).map(([name, value]) => ({ name, value }));
    if (customName.trim() || customNumber.trim()) {
      result.push({
        name: "Custom Print",
        value: `${customName.trim().toUpperCase()} #${customNumber.trim() || "0"}`,
      });
    }
    return result;
  }, [selectedVariants, customName, customNumber]);

  async function handleAddToCart(goToCheckout = false) {
    setBusy(true);
    setNotice(null);
    try {
      await addCartItem({
        productId: product._id,
        quantity,
        variantSelections: activeSelections,
      });
      notifyCommerceChanged();
      setAdded(true);
      if (goToCheckout) {
        router.push("/checkout");
      } else {
        setNotice(`Added ${quantity}x "${product.title}" to your cart.`);
        setTimeout(() => setAdded(false), 2500);
      }
    } catch {
      setNotice("Could not add item to cart. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleWishlist() {
    try {
      if (savedToWishlist) {
        await removeWishlistItem(product._id);
        setSavedToWishlist(false);
      } else {
        await addWishlistItem(product._id);
        setSavedToWishlist(true);
      }
      notifyCommerceChanged();
    } catch {
      // ignore
    }
  }

  const isJersey = product.category === "club-jerseys" || product.category === "national-teams" || product.category === "retro-classics";

  return (
    <div className="space-y-5">
      {/* CARD 1: Price & Kit Configuration */}
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft space-y-6">
        {/* Top: Price and Stock status */}
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line/60 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-1">
              Store Price
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-ink tracking-tight">
                PKR {displayPrice.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                In Stock &amp; Ready to Ship
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
              savedToWishlist
                ? "bg-primary-soft text-primary border-primary"
                : "border-line text-muted hover:border-primary hover:text-primary"
            }`}
          >
            <Heart className={`h-4 w-4 ${savedToWishlist ? "fill-primary" : ""}`} />
            <span>{savedToWishlist ? "Saved" : "Save for later"}</span>
          </button>
        </div>

        {/* Variants Selector (Size, Printing, etc.) */}
        {product.variants.map((variant) => (
          <div key={variant.name} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                Select {variant.name}
              </span>
              <span className="text-xs font-semibold text-primary">
                {selectedVariants[variant.name]}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {variant.options.map((option) => {
                const active = selectedVariants[variant.name] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [variant.name]: option.value }))
                    }
                    className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all ${
                      active
                        ? "bg-ink text-white ring-2 ring-primary ring-offset-2 ring-offset-surface shadow-xs"
                        : "border border-line bg-cream/50 text-body hover:border-primary/50 hover:bg-surface"
                    }`}
                  >
                    {option.value}
                    {option.price > product.price && (
                      <span className="ml-1 text-[10px] text-accent-dark">
                        (+PKR {(option.price - product.price).toLocaleString()})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Name & Number Printing drawer for Jerseys */}
        {isJersey && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Custom Name &amp; Number Printing (Optional)
              </span>
            </div>
            <p className="text-[11px] text-body leading-relaxed">
              Want your own name on the back? Enter details below (official club/league heat-applied font):
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <input
                  type="text"
                  maxLength={14}
                  placeholder="e.g. YOUR NAME"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-xs font-bold uppercase text-ink placeholder:normal-case placeholder:font-normal placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="NO. (e.g. 7)"
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full h-10 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-center text-ink placeholder:font-normal placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="flex items-center justify-between border-t border-line/60 pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-ink">Quantity</span>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-1">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-8 w-8 rounded-lg text-ink hover:bg-sunken font-bold disabled:opacity-40"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-black text-ink">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="h-8 w-8 rounded-lg text-ink hover:bg-sunken font-bold"
            >
              +
            </button>
          </div>
        </div>

        {notice && <Alert kind="success">{notice}</Alert>}

        {/* CTAs: Add to Cart and Buy Now */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleAddToCart(false)}
            className={`w-full h-13 rounded-2xl flex items-center justify-center gap-2 font-black text-sm tracking-wide shadow-soft transition-all active:scale-[0.99] ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-primary hover:bg-primary-dark text-white"
            }`}
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>{added ? "Item Added to Cart!" : "Add to Shopping Cart"}</span>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => handleAddToCart(true)}
            className="w-full h-13 rounded-2xl bg-ink hover:bg-ink-900 text-white flex items-center justify-center gap-2 font-black text-sm tracking-wide shadow-soft transition-all active:scale-[0.99]"
          >
            <span>Instant Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CARD 2: Direct Shop Specialist & Quick Inquiry */}
      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="relative h-13 w-13 shrink-0 rounded-2xl overflow-hidden border border-primary/30 bg-ink flex items-center justify-center text-white font-black text-lg">
            ⚽
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-base text-ink">Football Wears Pro Store</h3>
            <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Curated &amp; Dispatched by Hamad
            </p>
          </div>
        </div>

        <p className="text-xs text-body leading-relaxed">
          Need sizing help or custom team kit orders? Message the shop specialist directly:
        </p>

        <a
          href="https://wa.me/2348031234567?text=Hello%2C%20I%20am%20inquiring%20about%20the%20football%20kit%20on%20Football%20Wears"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-11 rounded-2xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          <span>WhatsApp Quick Inquiry (+234 803 123 4567)</span>
        </a>
      </div>

      {/* CARD 3: Authentic Guarantee Badges */}
      <div className="rounded-3xl border border-line bg-sunken/60 p-5 space-y-3 text-xs text-body">
        <div className="flex items-center gap-2.5 font-bold text-ink">
          <Award className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>100% Guaranteed Authentic Football Gear</span>
        </div>
        <div className="flex items-center gap-2.5 font-bold text-emerald-800">
          <Banknote className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>Cash on Delivery (COD) Available Nationwide</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>Fast Tracked Dispatch across Nigeria (24h - 48h)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <RefreshCw className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>14-Day Free Size &amp; Fit Exchange Guarantee</span>
        </div>
      </div>
    </div>
  );
}
