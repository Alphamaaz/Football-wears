"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Flag, Heart, Home, LayoutDashboard, PackageSearch, ReceiptText, ShieldCheck, Store, UserRound } from "lucide-react";
import { getMe } from "@/lib/auth";
import { tokenStore } from "@/lib/api";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/seller", label: "Switch to Sell", icon: Store, sell: true },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(tokenStore.get() ? null : false);
  useEffect(() => { if (tokenStore.get()) getMe().then(({ user }) => setIsAdmin(user.roles.includes("admin"))).catch(() => {}); }, []);
  const visibleItems = isAdmin ? [
    { href: "/admin", label: "Admin", icon: LayoutDashboard },
    { href: "/admin/listings", label: "Listings", icon: PackageSearch },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/verifications", label: "Verify", icon: ShieldCheck },
    { href: "/profile", label: "Profile", icon: UserRound },
  ] : items;
  if (isAdmin === null) return null;
  return (
    <nav className="mobile-app-nav sm:hidden" aria-label="Primary navigation">
      {visibleItems.map((item) => {
        const { href, label, icon: Icon } = item;
        const sell = "sell" in item && item.sell;
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={`mobile-app-nav-item ${active ? "is-active" : ""}`}>
            <span className={sell ? "mobile-app-sell-icon" : "mobile-app-nav-icon"}>
              <Icon className="h-6 w-6" strokeWidth={2} />
              {sell && <span className="mobile-app-sell-arrow">→</span>}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
