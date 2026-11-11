/* Cart API — Frontend-only localStorage backed store */

import type { VariantSelection } from "./offers";
import { FOOTBALL_PRODUCTS } from "./football-data";
import { notifyCommerceChanged } from "./commerce-events";

export interface CartItem {
  _id: string;
  product: string;
  seller: string;
  storeName: string;
  storeSlug: string;
  title: string;
  coverImage: { url: string; alt?: string };
  variantSelections: VariantSelection[];
  variantKey: string;
  priceSnapshot: number;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export interface CartTotals {
  subtotal: number;
  totalItems: number;
}

export interface CartResponse {
  message?: string;
  cart: Cart;
  totals: CartTotals;
}

const STORAGE_KEY = "football_wears_cart_v1";

function computeTotals(items: CartItem[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalItems };
}

function getInitialCart(): Cart {
  return {
    _id: "cart-static-user",
    user: "customer-1",
    items: [
      {
        _id: "cart-item-default-1",
        product: "fw-rm-home-2025",
        seller: "seller-football-wears",
        storeName: "Football Wears Pro Shop",
        storeSlug: "football-wears",
        title: "Real Madrid 2024/25 Home Kit — Authentic Player Issue (HEAT.RDY)",
        coverImage: {
          url: "/kits/real-madrid-2025-home.jpg",
          alt: "Real Madrid 2024/25 Authentic Home Kit",
        },
        variantSelections: [
          { name: "Size", value: "L (Large)" },
          { name: "Player Printing", value: "BELLINGHAM #5 (Official UCL Font)" },
        ],
        variantKey: "Size:L (Large)|Player Printing:BELLINGHAM #5 (Official UCL Font)",
        priceSnapshot: 59000,
        quantity: 1,
      },
    ],
  };
}

function readCartFromStorage(): Cart {
  if (typeof window === "undefined") {
    return getInitialCart();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialCart();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as Cart;
  } catch {
    return getInitialCart();
  }
}

function saveCartToStorage(cart: Cart): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    notifyCommerceChanged();
  } catch {
    // ignore
  }
}

export async function getCart(): Promise<CartResponse> {
  const cart = readCartFromStorage();
  return {
    cart,
    totals: computeTotals(cart.items),
  };
}

export async function addCartItem(input: {
  productId: string;
  quantity?: number;
  variantSelections?: VariantSelection[];
}): Promise<CartResponse> {
  const cart = readCartFromStorage();
  const product = FOOTBALL_PRODUCTS.find((p) => p._id === input.productId) || FOOTBALL_PRODUCTS[0];
  const qty = input.quantity && input.quantity > 0 ? input.quantity : 1;
  const selections = input.variantSelections || [];
  const variantKey = selections.map((s) => `${s.name}:${s.value}`).sort().join("|");

  let calculatedPrice = product.price;
  if (selections.length > 0 && product.variants.length > 0) {
    const matchedPrices = selections.map((sel) => {
      const v = product.variants.find((item) => item.name === sel.name);
      const opt = v?.options.find((o) => o.value === sel.value);
      return opt?.price || product.price;
    });
    calculatedPrice = Math.max(...matchedPrices, product.price);
  }

  const existingIndex = cart.items.findIndex(
    (item) => item.product === product._id && item.variantKey === variantKey,
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += qty;
  } else {
    cart.items.push({
      _id: `cart-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      product: product._id,
      seller: product.seller,
      storeName: product.storeName,
      storeSlug: product.storeSlug,
      title: product.title,
      coverImage: {
        url: product.coverImage?.url || "",
        alt: product.coverImage?.alt || product.title,
      },
      variantSelections: selections,
      variantKey,
      priceSnapshot: calculatedPrice,
      quantity: qty,
    });
  }

  saveCartToStorage(cart);
  return {
    message: "Added to cart",
    cart,
    totals: computeTotals(cart.items),
  };
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartResponse> {
  const cart = readCartFromStorage();
  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item._id !== itemId);
  } else {
    const item = cart.items.find((i) => i._id === itemId);
    if (item) {
      item.quantity = quantity;
    }
  }
  saveCartToStorage(cart);
  return {
    message: "Cart updated",
    cart,
    totals: computeTotals(cart.items),
  };
}

export async function removeCartItem(itemId: string): Promise<CartResponse> {
  const cart = readCartFromStorage();
  cart.items = cart.items.filter((item) => item._id !== itemId);
  saveCartToStorage(cart);
  return {
    message: "Item removed",
    cart,
    totals: computeTotals(cart.items),
  };
}

export async function clearCart(): Promise<CartResponse> {
  const cart: Cart = {
    _id: "cart-static-user",
    user: "customer-1",
    items: [],
  };
  saveCartToStorage(cart);
  return {
    message: "Cart cleared",
    cart,
    totals: { subtotal: 0, totalItems: 0 },
  };
}
