export const COMMERCE_CHANGED_EVENT = "pricem:commerce-changed";

/** Notify navbar badges after a cart, wishlist, payment, or order mutation. */
export function notifyCommerceChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMMERCE_CHANGED_EVENT));
  }
}

/** Subscribe to commerce changed events (cart, orders, wishlist). */
export function onCommerceChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(COMMERCE_CHANGED_EVENT, handler);
  return () => window.removeEventListener(COMMERCE_CHANGED_EVENT, handler);
}
