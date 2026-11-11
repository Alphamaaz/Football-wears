"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  HelpCircle,
  Home,
  Info,
  Mail,
  Menu,
  Package,
  ScrollText,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "./Logo";

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="grid h-11 w-11 place-items-center text-ink sm:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-7 w-7" strokeWidth={2.2} />
      </button>

      {open &&
        createPortal(
          <div className="seller-drawer-layer sm:hidden" role="dialog" aria-modal="true" aria-label="Main menu">
            <button className="seller-drawer-backdrop" type="button" aria-label="Close menu" onClick={close} />
            <aside className="seller-drawer">
              <button type="button" className="seller-drawer-close" aria-label="Close menu" onClick={close}>
                <X />
              </button>
              <div className="seller-drawer-profile">
                <Logo />
                <div className="seller-drawer-profile-info mt-2">
                  <h2>
                    Welcome to <span className="seller-drawer-brand-name">Football Wears</span>
                  </h2>
                  <strong className="seller-drawer-slogan-sub">Personal Football Kit &amp; Gear Shop</strong>
                  <p className="seller-drawer-slogan-tag">100% Authentic Guaranteed</p>
                </div>
              </div>

              <nav className="seller-drawer-nav" aria-label="Main navigation">
                <Link href="/" className={pathname === "/" ? "is-active" : ""} onClick={close}>
                  <Home />
                  <span>Shop All Products</span>
                </Link>
                <Link href="/category/club-jerseys" onClick={close}>
                  <Shirt />
                  <span>Club Kits (2024/25)</span>
                </Link>
                <Link href="/category/national-teams" onClick={close}>
                  <Trophy />
                  <span>National Teams</span>
                </Link>
                <Link href="/category/retro-classics" onClick={close}>
                  <Sparkles />
                  <span>Retro Classics Vault</span>
                </Link>
                <Link href="/category/football-boots" onClick={close}>
                  <Zap />
                  <span>Pro Match Boots</span>
                </Link>

                <div className="my-2 border-t border-line/60" />

                <Link href="/cart" onClick={close}>
                  <ShoppingBag />
                  <span>Shopping Cart</span>
                </Link>
                <Link href="/wishlist" onClick={close}>
                  <Heart />
                  <span>Wishlist</span>
                </Link>
                <Link href="/orders" onClick={close}>
                  <Package />
                  <span>Track Orders</span>
                </Link>
                <Link href="/admin" onClick={close} className="text-primary font-bold">
                  <ShieldCheck />
                  <span>Admin &amp; Upload</span>
                </Link>

                <div className="my-2 border-t border-line/60" />

                <Link href="/about" className="seller-drawer-info" onClick={close}>
                  <Info />
                  <span>About Our Shop</span>
                </Link>
                <Link href="/contact" onClick={close}>
                  <Mail />
                  <span>Contact Store Specialist</span>
                </Link>
                <Link href="/privacy" onClick={close}>
                  <ShieldCheck />
                  <span>Privacy Policy</span>
                </Link>
                <Link href="/terms" onClick={close}>
                  <ScrollText />
                  <span>Terms &amp; 14-Day Exchanges</span>
                </Link>
              </nav>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
