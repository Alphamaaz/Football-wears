"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Package, ShoppingBag, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "Shop", icon: Home },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/about", label: "About", icon: UserRound },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-app-nav sm:hidden" aria-label="Primary navigation">
      {items.map((item) => {
        const { href, label, icon: Icon } = item;
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`mobile-app-nav-item ${active ? "is-active" : ""}`}>
            <span className="mobile-app-nav-icon">
              <Icon className="h-6 w-6" strokeWidth={2} />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
