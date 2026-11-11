"use client";

/*
  Client island for auth state in the navbar.
  Reads the current user once on mount; everything around it stays a
  Server Component so the storefront ships minimal JS.
*/

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, MessageCircle, Package, PlusCircle, ShieldCheck, Store, User as UserIcon } from "lucide-react";
import { getMe, logout } from "@/lib/auth";
import { assetUrl, tokenStore } from "@/lib/api";
import type { User } from "@/lib/types";

function subscribeStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function UserMenu() {
  const token = useSyncExternalStore(
    subscribeStorage,
    () => tokenStore.get(),
    () => null
  );
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      return;
    }
    let active = true;
    getMe()
      .then((res) => {
        if (active) setUser(res.user);
      })
      .catch(() => tokenStore.clear());
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await logout().catch(() => {});
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (token && !user) {
    return <div className="h-9 w-24 rounded-full bg-sunken animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex items-center ml-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-ink hover:text-primary border border-line bg-surface rounded-full px-4 h-9 shadow-xs hover:border-primary transition-all"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin Login
        </Link>
      </div>
    );
  }

  const initial = user.fullName.trim().charAt(0).toUpperCase();
  const isSeller = user.roles.includes("seller");
  const isAdmin = user.roles.includes("admin");

  return (
    <div className="relative ml-1" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1.5 pr-2.5 h-9 hover:bg-sunken transition-colors"
      >
        <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white overflow-hidden shrink-0">
          {user.profileImage ? (
            <img
              src={assetUrl(user.profileImage)}
              alt={user.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <span className="hidden sm:block text-sm font-medium text-ink max-w-24 truncate">
          {user.fullName.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-surface shadow-lifted py-2 animate-fade-in-up origin-top-right">
          <div className="px-4 py-2 border-b border-line mb-1">
            <p className="text-sm font-semibold text-ink truncate">{user.fullName}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink hover:bg-sunken font-bold"
              >
                <ShieldCheck className="h-4 w-4 text-primary" strokeWidth={2} />
                Admin Dashboard
              </Link>
              <Link
                href="/seller/products/new"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary hover:bg-primary-soft/50 font-extrabold"
              >
                <PlusCircle className="h-4 w-4 text-primary" strokeWidth={2} />
                Upload New Product
              </Link>
              <Link
                href="/seller/products"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-body hover:bg-sunken hover:text-ink"
              >
                <Package className="h-4 w-4" strokeWidth={1.75} />
                Manage Products
              </Link>
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-body hover:bg-sunken hover:text-ink"
              >
                <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
                Store Orders (COD)
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-body hover:bg-sunken hover:text-ink"
              >
                <UserIcon className="h-4 w-4" strokeWidth={1.75} />
                Store Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-body hover:bg-sunken hover:text-ink"
              >
                <Package className="h-4 w-4" strokeWidth={1.75} />
                My Orders
              </Link>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-body hover:bg-sunken hover:text-ink"
              >
                <UserIcon className="h-4 w-4" strokeWidth={1.75} />
                My Profile
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger-soft mt-1"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
