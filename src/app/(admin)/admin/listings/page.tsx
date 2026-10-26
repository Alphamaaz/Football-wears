"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ban, Check, Clock3, Search, ShieldCheck, X } from "lucide-react";
import { getMe } from "@/lib/auth";
import { assetUrl, tokenStore } from "@/lib/api";
import {
  getAdminListings,
  moderateListing,
  type AdminListing,
  type ListingModerationStatus,
} from "@/lib/admin";

const filters: Array<{ value: ListingModerationStatus | "all"; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "blocked", label: "Blocked" },
  { value: "all", label: "All" },
];

function formatPrice(value: number) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

export default function AdminListingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<ListingModerationStatus | "all">("pending");
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await getAdminListings({ status, search: search || undefined, limit: 50 });
      setListings(response.listings);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not load listings");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    if (!tokenStore.get()) {
      router.replace("/login");
      return;
    }
    getMe()
      .then(({ user }) => {
        if (!user.roles.includes("admin")) router.replace("/");
        else load();
      })
      .catch(() => router.replace("/login"));
  }, [load, router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") load(true);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [load]);

  async function act(listing: AdminListing, action: "approve" | "reject" | "block") {
    const reason = reasons[listing._id]?.trim();
    if (action !== "approve" && !reason) {
      setNotice(`Add a reason before you ${action} this listing.`);
      return;
    }
    setBusyId(listing._id);
    setNotice("");
    try {
      const result = await moderateListing(listing._id, action, reason);
      setNotice(result.message);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Moderation action failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-canvas px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-7">
          <Link href="/admin" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Admin dashboard
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
                <ShieldCheck className="h-4 w-4" /> Trust & safety
              </div>
              <h1 className="text-3xl font-black text-ink">Listing moderation</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted">Every listing remains hidden from buyers until an administrator approves it.</p>
            </div>
            <label className="flex min-w-64 items-center gap-2 rounded-2xl border border-line bg-sunken px-4 py-3">
              <Search className="h-4 w-4 text-muted" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, store, category" className="w-full bg-transparent text-sm outline-none" />
            </label>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button key={filter.value} onClick={() => setStatus(filter.value)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${status === filter.value ? "bg-primary text-white" : "border border-line bg-surface text-muted hover:text-ink"}`}>
              {filter.label}
            </button>
          ))}
        </nav>

        {notice && <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink">{notice}</div>}

        {loading ? (
          <div className="rounded-3xl border border-line bg-surface p-12 text-center text-muted">Loading moderation queue…</div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-surface p-12 text-center">
            <Clock3 className="mx-auto mb-3 h-8 w-8 text-muted" />
            <h2 className="font-black text-ink">No {status === "all" ? "" : status} listings</h2>
            <p className="mt-1 text-sm text-muted">This moderation queue is clear.</p>
          </div>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {listings.map((listing) => (
              <article key={listing._id} className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
                <div className="flex gap-4 p-4 sm:p-5">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-sunken sm:h-28 sm:w-28">
                    {listing.coverImage?.url ? <img src={assetUrl(listing.coverImage.url)} alt={listing.coverImage.alt || listing.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-muted">No image</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="truncate text-lg font-black text-ink">{listing.title}</h2>
                      <span className="rounded-full bg-sunken px-2.5 py-1 text-[10px] font-black uppercase text-muted">{listing.moderationStatus || "pending"}</span>
                    </div>
                    <p className="mt-1 text-lg font-black text-primary">{formatPrice(listing.price)}</p>
                    <p className="mt-1 text-xs text-muted">{listing.storeName} · {listing.category} · {listing.condition}</p>
                    <p className="text-xs text-muted">{[listing.location?.city, listing.location?.state].filter(Boolean).join(", ") || "Location not supplied"}</p>
                    {listing.moderationReason && <p className="mt-2 text-xs font-semibold text-danger">Reason: {listing.moderationReason}</p>}
                  </div>
                </div>
                <div className="border-t border-line p-4 sm:p-5">
                  <textarea value={reasons[listing._id] || ""} onChange={(event) => setReasons((current) => ({ ...current, [listing._id]: event.target.value }))} placeholder="Reason required when rejecting or blocking" maxLength={500} className="min-h-20 w-full resize-y rounded-2xl border border-line bg-sunken px-4 py-3 text-sm outline-none focus:border-primary" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button disabled={busyId === listing._id} onClick={() => act(listing, "approve")} className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" /> Approve</button>
                    <button disabled={busyId === listing._id} onClick={() => act(listing, "reject")} className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"><X className="h-4 w-4" /> Reject</button>
                    <button disabled={busyId === listing._id} onClick={() => act(listing, "block")} className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Ban className="h-4 w-4" /> Block</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
