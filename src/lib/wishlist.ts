/* Wishlist API — Frontend-only localStorage backed store */

import type { Product } from "./products";
import { FOOTBALL_PRODUCTS } from "./football-data";
import { notifyCommerceChanged } from "./commerce-events";

export interface WishlistItem {
  product: Product | null;
  addedAt?: string;
}

export interface Wishlist {
  _id: string;
  user: string;
  items: WishlistItem[];
}

const STORAGE_KEY = "football_wears_wishlist_v1";

function getInitialWishlist(): Wishlist {
  const p1 = FOOTBALL_PRODUCTS.find((p) => p._id === "fw-ars-invincible-04") || FOOTBALL_PRODUCTS[0];
  const p2 = FOOTBALL_PRODUCTS.find((p) => p._id === "fw-adidas-predator-elite") || FOOTBALL_PRODUCTS[1];
  return {
    _id: "wishlist-static-user",
    user: "customer-1",
    items: [
      { product: p1, addedAt: new Date().toISOString() },
      { product: p2, addedAt: new Date().toISOString() },
    ],
  };
}

function readWishlistFromStorage(): Wishlist {
  if (typeof window === "undefined") {
    return getInitialWishlist();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialWishlist();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Wishlist;
    // Hydrate products with fresh static data
    parsed.items = parsed.items.map((item) => {
      const prodId = typeof item.product === "string" ? item.product : item.product?._id;
      const hydrated = FOOTBALL_PRODUCTS.find((p) => p._id === prodId) || item.product;
      return { ...item, product: hydrated };
    });
    return parsed;
  } catch {
    return getInitialWishlist();
  }
}

function saveWishlistToStorage(wl: Wishlist): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wl));
    notifyCommerceChanged();
  } catch {
    // ignore
  }
}

export async function getWishlist(): Promise<{ wishlist: Wishlist }> {
  return { wishlist: readWishlistFromStorage() };
}

export async function addWishlistItem(productId: string): Promise<{ message: string; wishlist: Wishlist }> {
  const wl = readWishlistFromStorage();
  const exists = wl.items.some((i) => i.product?._id === productId);
  if (!exists) {
    const product = FOOTBALL_PRODUCTS.find((p) => p._id === productId) || null;
    wl.items.push({
      product,
      addedAt: new Date().toISOString(),
    });
    saveWishlistToStorage(wl);
  }
  return { message: "Saved to Wishlist", wishlist: wl };
}

export async function removeWishlistItem(productId: string): Promise<{ message: string; wishlist: Wishlist }> {
  const wl = readWishlistFromStorage();
  wl.items = wl.items.filter((i) => i.product?._id !== productId);
  saveWishlistToStorage(wl);
  return { message: "Removed from Wishlist", wishlist: wl };
}

export async function clearWishlist(): Promise<{ message: string; wishlist: Wishlist }> {
  const wl: Wishlist = {
    _id: "wishlist-static-user",
    user: "customer-1",
    items: [],
  };
  saveWishlistToStorage(wl);
  return { message: "Wishlist cleared", wishlist: wl };
}
