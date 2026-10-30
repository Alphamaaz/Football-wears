"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  PackagePlus,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { getMe } from "@/lib/auth";
import { applyToSell } from "@/lib/users";
import { ApiRequestError, tokenStore } from "@/lib/api";
import { Alert, Button, Input, Label } from "@/components/ui";
import type { SellerProfile, User } from "@/lib/types";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<SellerProfile | null>(null);
  const [slugPreview, setSlugPreview] = useState("");
  const [storeImageFile, setStoreImageFile] = useState<File | null>(null);
  const [storeImagePreview, setStoreImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenStore.get()) {
      router.replace("/login?next=/seller/onboarding");
      return;
    }
    getMe()
      .then((res) => setUser(res.user))
      .catch(() => router.replace("/login?next=/seller/onboarding"))
      .finally(() => setLoading(false));
  }, [router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const storeName = String(form.get("storeName") || "").trim();
    const storeSlug = String(form.get("storeSlug") || "").trim().toLowerCase();
    const description = String(form.get("description") || "").trim();

    try {
      const res = await applyToSell({
        storeName,
        storeSlug: storeSlug || undefined,
        description: description || undefined,
        storeImage: storeImageFile || undefined,
      });

      setCreatedProfile(res.sellerProfile);
      if (res.user) {
        setUser(res.user);
      } else {
        // Refresh local user profile
        const me = await getMe().catch(() => null);
        if (me?.user) setUser(me.user);
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.errors?.length) {
          setFieldErrors(
            Object.fromEntries(err.errors.map((e) => [e.field, e.message])),
          );
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to activate store. Please check your network and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center py-24">
        <div className="h-8 w-40 rounded-full bg-sunken animate-pulse" />
      </main>
    );
  }

  if (createdProfile) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] flex-1 items-center justify-center bg-cream px-4 py-12 sm:py-20">
        <div className="w-full max-w-lg space-y-6 rounded-3xl border border-line bg-surface p-7 text-center shadow-lifted sm:p-10 animate-fade-in-up">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-success-soft text-success shadow-soft">
            <CheckCircle2 className="h-11 w-11" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
              Your seller store is ready
            </h1>
            <p className="text-xs sm:text-sm text-body leading-relaxed max-w-md mx-auto">
              <strong className="text-ink">{createdProfile.storeName}</strong> has been created. Add your first listing and submit it for review before buyers can see it.
            </p>
          </div>

          <div className="rounded-2xl bg-sunken/60 border border-line p-4 text-xs text-muted flex items-center justify-between">
            <span className="font-mono text-ink text-left truncate mr-2">
              priceam.ng/store/{createdProfile.storeSlug}
            </span>
            <span className="shrink-0 px-2 py-0.5 rounded-md bg-primary-soft text-primary font-bold text-[11px]">
              Created
            </span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link href="/seller/products/new" className="flex-1">
              <Button full size="lg" className="rounded-2xl font-black text-sm shadow-soft">
                <PackagePlus className="h-4 w-4 mr-2" />
                Post Your First Listing
              </Button>
            </Link>
            <Link href="/seller" className="flex-1">
              <Button variant="outline" full size="lg" className="rounded-2xl font-bold text-sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Seller Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (user?.roles.includes("seller") && user?.sellerProfile?.approvalStatus === "approved") {
    return (
      <main className="flex min-h-[calc(100vh-80px)] flex-1 items-center justify-center bg-cream px-4 py-16">
        <div className="rounded-3xl bg-surface border border-line p-8 sm:p-10 shadow-lifted text-center max-w-md w-full space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-soft text-success shadow-soft">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-ink">Your seller store is active</h1>
            <p className="text-xs sm:text-sm text-muted mt-1 leading-relaxed">
              Manage <strong className="text-ink">{user.sellerProfile?.storeName}</strong>, review buyer offers, and keep your listings up to date from the seller dashboard.
            </p>
          </div>
          
          <div className="pt-2 flex flex-col gap-2.5">
            <Link href="/seller/products/new">
              <Button full size="md" className="rounded-xl font-bold">
                <PackagePlus className="h-4 w-4 mr-2" />
                Post New Product
              </Button>
            </Link>
            <Link href="/seller">
              <Button variant="outline" full size="md" className="rounded-xl font-bold">
                <BarChart3 className="h-4 w-4 mr-2" />
                Merchant Dashboard
              </Button>
            </Link>
            <Link href="/seller/products">
              <Button variant="ghost" full size="sm" className="rounded-xl text-muted hover:text-ink">
                Manage Existing Listings
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-cream px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>

        <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lifted">
          <div className="border-b border-line px-5 py-6 sm:px-8 sm:py-7">
            <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
              Create your seller store
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Choose a store name and public link. You can add your logo now or complete it later from your profile.
            </p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">

            {error && <div className="mb-5"><Alert kind="error">{error}</Alert></div>}

            <form onSubmit={onSubmit} className="space-y-5">
              {/* Store Details */}
              <div>
                <Label htmlFor="storeName" className="text-xs font-bold text-ink">
                  Store or Business Name <span className="text-danger">*</span>
                </Label>
                <Input
                  id="storeName"
                  name="storeName"
                  required
                  placeholder="e.g. Lagos Tech Mart or Abuja Fashion Hub"
                  className="mt-1 h-11 rounded-2xl text-sm"
                  onChange={(e) => {
                    const generated = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setSlugPreview(generated);
                  }}
                />
                {fieldErrors.storeName && (
                  <p className="text-xs text-danger mt-1 font-medium">{fieldErrors.storeName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="storeSlug" className="text-xs font-bold text-ink">
                  Store Public Link
                </Label>
                <div className="mt-1 flex items-center rounded-2xl border border-line bg-surface px-3 focus-within:ring-4 focus-within:ring-primary/15 focus-within:border-primary transition-shadow">
                  <span className="text-xs text-muted font-mono select-none">
                    priceam.ng/store/
                  </span>
                  <input
                    id="storeSlug"
                    name="storeSlug"
                    pattern="[a-z0-9-]+"
                    value={slugPreview}
                    onChange={(e) => setSlugPreview(e.target.value.toLowerCase())}
                    placeholder="my-store-name"
                    title="Lowercase letters, numbers, and hyphens only"
                    className="w-full h-11 bg-transparent px-1 text-xs sm:text-sm font-semibold text-ink focus:outline-none"
                  />
                </div>
                {fieldErrors.storeSlug && (
                  <p className="text-xs text-danger mt-1 font-medium">{fieldErrors.storeSlug}</p>
                )}
                <p className="text-[11px] text-muted mt-1">
                  Buyers can visit this link directly to browse all your items.
                </p>
              </div>

              <div>
                <Label htmlFor="description" className="text-xs font-bold text-ink">
                  Store Description <span className="text-muted font-normal">(Optional)</span>
                </Label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  className="w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-primary/15 focus:border-primary transition-shadow mt-1"
                  placeholder="What products or brands do you specialize in?"
                />
              </div>

              <div className="space-y-3 border-t border-line pt-5">
                <div>
                  <Label className="text-xs font-bold text-ink flex items-center justify-between">
                    <span>Store Logo / Brand Photo</span>
                    <span className="text-muted font-normal text-[11px]">Optional</span>
                  </Label>
                  <p className="text-[11px] text-muted mt-0.5">
                    Use a square JPG, PNG, or WebP image up to 10MB.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 rounded-2xl bg-surface border border-line overflow-hidden flex items-center justify-center shadow-soft">
                    {storeImagePreview ? (
                      <img
                        src={storeImagePreview}
                        alt="Store Logo Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted">
                        <Store className="h-6 w-6 stroke-[1.5]" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-line hover:border-primary/50 text-ink text-xs font-semibold cursor-pointer shadow-soft transition-all">
                      <Upload className="h-3.5 w-3.5 text-primary" />
                      <span>{storeImagePreview ? "Change Logo" : "Upload Logo"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setStoreImageFile(file);
                            setStoreImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>

                    {storeImagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setStoreImageFile(null);
                          setStoreImagePreview(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-danger/20 text-danger hover:bg-danger/10 text-xs font-semibold transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 rounded-2xl bg-success-soft/60 px-4 py-3 text-left">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p className="text-xs leading-5 text-body">
                    Your store can accept listings after setup. Every listing is reviewed before it becomes visible to buyers.
                  </p>
                </div>
                <Button
                  type="submit"
                  full
                  size="lg"
                  disabled={submitting}
                  className="h-12 rounded-2xl font-black text-sm shadow-soft transition-all"
                >
                  {submitting ? (
                    "Activating Your Store…"
                  ) : (
                    "Create seller store"
                  )}
                </Button>
                <p className="text-[11px] text-center text-muted mt-2">
                  By continuing, you agree to the PriceAm Merchant Terms and Safety Guidelines.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
