"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Heart, Package, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { COMMERCE_CHANGED_EVENT } from "@/lib/commerce-events";
import { getNavigationSummary, type NavigationSummary } from "@/lib/notifications";

type IconLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: "cart" | "wishlist" | "orders";
};

const ICON_LINKS: IconLink[] = [
  { href: "/wishlist", label: "Wishlist", icon: Heart, countKey: "wishlist" },
  { href: "/orders", label: "Orders", icon: Package, countKey: "orders" },
  { href: "/cart", label: "Cart", icon: ShoppingBag, countKey: "cart" },
];

export function NavbarCommerceLinks() {
  const [counts, setCounts] = useState<NavigationSummary>({
    cart: 1,
    wishlist: 2,
    orders: 2,
    messages: 0,
    offers: 0,
    offersBuyer: 0,
    offersSeller: 0,
  });

  const refreshCounts = useCallback(() => {
    getNavigationSummary().then(setCounts).catch(() => {});
  }, []);

  useEffect(() => {
    refreshCounts();
    window.addEventListener(COMMERCE_CHANGED_EVENT, refreshCounts);
    const onFocus = () => refreshCounts();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(COMMERCE_CHANGED_EVENT, refreshCounts);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCounts]);

  return (
    <>
      {ICON_LINKS.map(({ href, label, icon: Icon, countKey }) => {
        const count = countKey ? counts[countKey] : 0;
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className="relative hidden sm:flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-body hover:bg-sunken hover:text-primary transition-colors"
          >
            <span className="relative">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              {count > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-black leading-none text-white shadow-xs">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </>
  );
}
