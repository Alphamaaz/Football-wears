import { getCart } from "./cart";
import { getWishlist } from "./wishlist";
import { listOrders } from "./orders";

export type NavigationSummary = {
  cart: number;
  wishlist: number;
  orders: number;
  messages: number;
  offers: number;
  offersBuyer: number;
  offersSeller: number;
};

export async function getNavigationSummary(): Promise<NavigationSummary> {
  try {
    const [cartRes, wlRes, ordersRes] = await Promise.all([
      getCart(),
      getWishlist(),
      listOrders(),
    ]);
    return {
      cart: cartRes.totals.totalItems,
      wishlist: wlRes.wishlist.items.length,
      orders: ordersRes.orders.length,
      messages: 0,
      offers: 0,
      offersBuyer: 0,
      offersSeller: 0,
    };
  } catch {
    return {
      cart: 1,
      wishlist: 2,
      orders: 2,
      messages: 0,
      offers: 0,
      offersBuyer: 0,
      offersSeller: 0,
    };
  }
}
