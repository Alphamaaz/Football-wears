"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Handshake,
  HelpCircle,
  Home,
  LayoutDashboard,
  Info,
  LogIn,
  Mail,
  Menu,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { getMe } from "@/lib/auth";
import { assetUrl, tokenStore } from "@/lib/api";
import type { User } from "@/lib/types";

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!tokenStore.get()) return;
    getMe().then((response) => setUser(response.user)).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const profile = useMemo(() => {
    const name = user?.fullName || "Welcome to PriceAm";
    const initials = user
      ? name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
      : "PA";
    const memberSince = user?.createdAt
      ? new Intl.DateTimeFormat("en-NG", { month: "short", year: "numeric" }).format(new Date(user.createdAt))
      : null;
    return { name, initials, memberSince };
  }, [user]);

  const isSeller = Boolean(user?.roles.includes("seller"));
  const isAdmin = Boolean(user?.roles.includes("admin"));
  const close = () => setOpen(false);

  return (
    <>
      <button type="button" className="grid h-11 w-11 place-items-center text-ink sm:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <Menu className="h-7 w-7" strokeWidth={2.2} />
      </button>

      {open && createPortal(
        <div className="seller-drawer-layer sm:hidden" role="dialog" aria-modal="true" aria-label="Main menu">
          <button className="seller-drawer-backdrop" type="button" aria-label="Close menu" onClick={close} />
          <aside className="seller-drawer">
            <button type="button" className="seller-drawer-close" aria-label="Close menu" onClick={close}><X /></button>
            <div className="seller-drawer-profile">
              {user?.profileImage ? (
                <Link href="/profile" onClick={close} className="seller-drawer-avatar-link" aria-label="My Profile">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assetUrl(user.profileImage)} alt={profile.name} className="seller-drawer-avatar" />
                </Link>
              ) : user ? (
                <Link href="/profile" onClick={close} className="seller-drawer-avatar-link" aria-label="My Profile">
                  <span className="seller-drawer-avatar seller-drawer-initials">{profile.initials}</span>
                </Link>
              ) : (
                <Link href="/" onClick={close} className="seller-drawer-logo-badge" aria-label="PriceAm Home">
                  <Image src="/logo/PA.svg" alt="PriceAm" width={48} height={37} className="seller-drawer-logo-img" priority />
                </Link>
              )}
              <div className="seller-drawer-profile-info">
                <h2>
                  {user ? (
                    profile.name
                  ) : (
                    <>
                      Welcome to <span className="seller-drawer-brand-name">PriceAm</span>
                    </>
                  )}
                </h2>
                <strong className="seller-drawer-slogan-sub">
                  {isAdmin ? "Marketplace administrator" : isSeller ? "Seller" : user ? "Buyer" : "Nigeria’s marketplace"}
                </strong>
                <p className="seller-drawer-slogan-tag">
                  {profile.memberSince ? `Member since ${profile.memberSince}` : "Find it. Price it. Make the deal."}
                </p>
              </div>
            </div>

            <nav className="seller-drawer-nav" aria-label="Main navigation">
              {isAdmin ? <Link href="/admin" className={pathname.startsWith("/admin") ? "is-active" : ""} onClick={close}><LayoutDashboard /><span>Admin Dashboard</span></Link> : <Link href={isSeller ? "/seller" : "/"} className={(isSeller ? pathname === "/seller" : pathname === "/") ? "is-active" : ""} onClick={close}><Home /><span>{isSeller ? "Dashboard" : "Marketplace"}</span></Link>}
              {user && <Link href="/profile" onClick={close}><UserRound /><span>Profile</span></Link>}
              {!isAdmin && <Link href="/conversations" onClick={close}><MessageCircle /><span>Messages</span></Link>}
              {!isAdmin && <Link href="/offers" onClick={close}><Handshake /><span>My Offers</span></Link>}
              {!isAdmin && isSeller && <Link href="/seller/products" onClick={close}><Store /><span>My Shop</span></Link>}
              {!isAdmin && <Link href="/orders" onClick={close}><ShoppingBag /><span>Orders</span></Link>}
              {!isAdmin && <Link href="/conversations" onClick={close}><Bell /><span>Notifications</span></Link>}
              <Link href="/contact" onClick={close}><HelpCircle /><span>Help</span></Link>
              {!user && <Link href="/login" onClick={close}><LogIn /><span>Log in</span></Link>}
              {!isAdmin && !isSeller && <Link href="/seller/onboarding" className="seller-drawer-sell" onClick={close}><Store /><span>Start selling</span></Link>}
              <Link href="/about" className="seller-drawer-info" onClick={close}><Info /><span>About Price Am</span></Link>
              <Link href="/contact" onClick={close}><Mail /><span>Contact Us</span></Link>
              <Link href="/privacy" onClick={close}><ShieldCheck /><span>Privacy Policy</span></Link>
              <Link href="/terms" onClick={close}><ScrollText /><span>Terms &amp; Conditions</span></Link>
              <Link href="/cookies" onClick={close}><ScrollText /><span>Cookie Policy</span></Link>
            </nav>
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
}
