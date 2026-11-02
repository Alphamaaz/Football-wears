"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  Star,
  Store,
} from "lucide-react";
import { Alert, Button, Label } from "@/components/ui";
import { ApiRequestError, assetUrl } from "@/lib/api";
import type { Order } from "@/lib/orders";
import {
  createItemReview,
  createSellerReview,
  getReviewEligibility,
  type ReviewEligibility,
} from "@/lib/reviews";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function RatingInput({
  name,
  value,
  onChange,
  label = "Choose a rating",
}: {
  name: string;
  value: number;
  onChange: (rating: number) => void;
  label?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeRating = hovered !== null ? hovered : value;

  return (
    <fieldset className="space-y-2">
      <div className="flex items-center justify-between">
        <legend className="text-xs sm:text-sm font-semibold text-ink">{label}</legend>
        {activeRating > 0 ? (
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 transition-all">
            ★ {activeRating}/5 · {RATING_LABELS[activeRating]}
          </span>
        ) : (
          <span className="text-xs text-muted">Tap to rate</span>
        )}
      </div>

      <div
        className="flex items-center gap-2"
        onMouseLeave={() => setHovered(null)}
      >
        <input type="hidden" name={name} value={value || 0} />
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeRating >= star;
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star === 1 ? "" : "s"} - ${RATING_LABELS[star]}`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-150 active:scale-90 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
                isFilled
                  ? "border-amber-400 bg-amber-500/15 text-amber-500 shadow-xs"
                  : "border-line bg-surface text-muted/40 hover:border-amber-300 hover:text-amber-400"
              }`}
            >
              <Star
                className={`h-5 w-5 transition-transform duration-150 ${
                  isFilled ? "fill-amber-500 text-amber-500 scale-105" : "fill-transparent text-muted/40"
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function OrderReviewSection({ order }: { order: Order }) {
  const [data, setData] = useState<ReviewEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Ratings state (defaults to 0 so user taps their desired rating)
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});
  const [itemText, setItemText] = useState<Record<string, string>>({});
  const [sellerRating, setSellerRating] = useState<number>(0);
  const [sellerText, setSellerText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const eligibility = await getReviewEligibility(order._id);
      setData(eligibility);
    } catch (err) {
      setLoadError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not load review options. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [order._id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitItem(event: React.FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const formRating = Number(form.get("rating") || form.get(`item-rating-${productId}`));
    const chosenRating = itemRatings[productId] || formRating;

    if (!chosenRating) {
      setActionError("Please select a star rating for the item.");
      return;
    }

    const text = (itemText[productId] ?? "").trim();
    if (text.length < 10) {
      setActionError("Item review must contain at least 10 characters.");
      return;
    }

    setBusy(productId);
    setActionError(null);
    setNotice(null);
    try {
      const result = await createItemReview(
        order._id,
        productId,
        chosenRating,
        text
      );
      setNotice(result.message);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not publish the item review. Please try again."
      );
    } finally {
      setBusy(null);
    }
  }

  async function submitSeller(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const formRating = Number(form.get("rating") || form.get("seller-rating"));
    const chosenRating = sellerRating || formRating;

    if (!chosenRating) {
      setActionError("Please select a star rating for the seller.");
      return;
    }

    if (selectedTags.length === 0) {
      setActionError("Please choose at least 1 seller description.");
      return;
    }

    setBusy("seller");
    setActionError(null);
    setNotice(null);
    try {
      const result = await createSellerReview(
        order._id,
        chosenRating,
        selectedTags,
        sellerText.trim()
      );
      setNotice(result.message);
      await load();
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not publish the seller rating. Please try again."
      );
    } finally {
      setBusy(null);
    }
  }

  const allItemsReviewed = Boolean(
    data?.eligible &&
      order.items.every((it) =>
        data.itemReviews.some((rev) => rev.product === it.product)
      )
  );
  const sellerReviewed = Boolean(data?.eligible && data.sellerReview);
  const everythingReviewed = allItemsReviewed && sellerReviewed;

  return (
    <section
      className="rounded-3xl border border-line bg-surface p-5 sm:p-8 shadow-soft space-y-6"
      aria-labelledby="order-reviews-title"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-5">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
            <Star className="h-5 w-5 fill-amber-500" aria-hidden="true" />
          </span>
          <div>
            <h2 id="order-reviews-title" className="text-base sm:text-lg font-bold text-ink">
              Review Your Completed Deal
            </h2>
            <p className="text-xs sm:text-sm text-body mt-0.5">
              Rate the item condition and your merchant experience to help other PriceAm buyers.
            </p>
          </div>
        </div>

        {everythingReviewed && (
          <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/30">
            <Check className="h-3.5 w-3.5" /> All reviews completed
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-live="polite">
          <div className="h-72 animate-pulse rounded-2xl bg-sunken/70" />
          <div className="h-72 animate-pulse rounded-2xl bg-sunken/70" />
        </div>
      )}

      {/* Load Error state */}
      {!loading && loadError && !data && (
        <div className="space-y-4">
          <Alert kind="error">{loadError}</Alert>
          <Button
            type="button"
            variant="outline"
            onClick={() => void load()}
            className="rounded-xl min-h-11"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}

      {/* Not Eligible state */}
      {!loading && !loadError && data && !data.eligible && (
        <div className="rounded-2xl border border-line bg-sunken/50 p-5 text-sm text-body text-center">
          Reviews become available once the deal has been officially confirmed as completed.
        </div>
      )}

      {/* Eligible Form / Reviews Content */}
      {!loading && data?.eligible && (
        <div className="space-y-6">
          {actionError && <Alert kind="error">{actionError}</Alert>}
          {notice && <Alert kind="success">{notice}</Alert>}

          {/* Celebratory Completed Banner when both are already completed */}
          {everythingReviewed ? (
            <div className="rounded-2xl border border-success/30 bg-success-soft/30 p-6 sm:p-8 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success text-white shadow-soft">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-ink">
                Thank You For Your Reviews!
              </h3>
              <p className="text-xs sm:text-sm text-body max-w-md mx-auto leading-relaxed">
                Your item review and seller rating have been published. Your feedback helps maintain a trusted and transparent peer-to-peer marketplace on PriceAm.
              </p>
            </div>
          ) : (
            /* Responsive 2-Column Grid (Item Review on Left, Seller Rating on Right) */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Column 1: Items Reviews */}
              <div className="space-y-6">
                {order.items.map((item) => {
                  const reviewed = data.itemReviews.some((r) => r.product === item.product);
                  const currentItemText = itemText[item.product] ?? "";
                  const itemLength = currentItemText.trim().length;
                  const charProgress = Math.min(100, Math.round((itemLength / 10) * 100));
                  const charsRemaining = Math.max(0, 10 - itemLength);
                  const currentItemRating = itemRatings[item.product] || 0;

                  if (reviewed) {
                    return (
                      <div
                        key={item.product}
                        className="h-full rounded-2xl border border-success/30 bg-success-soft/25 p-5 sm:p-6 flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={assetUrl(item.coverImage.url)}
                            alt={item.title}
                            className="h-12 w-12 rounded-xl object-cover border border-line shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-success uppercase tracking-wider">
                              Product Review
                            </span>
                            <h3 className="font-bold text-sm sm:text-base text-ink truncate">
                              {item.title}
                            </h3>
                            <p className="text-xs text-muted">{item.storeName}</p>
                          </div>
                        </div>

                        <div className="py-4 text-center space-y-2">
                          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-success text-white shadow-xs">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <h4 className="font-bold text-sm text-ink">Review Published</h4>
                          <p className="text-xs text-body leading-relaxed max-w-xs mx-auto">
                            Your feedback for this product is live and helping other buyers.
                          </p>
                        </div>

                        <span className="self-center inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/30">
                          <Check className="h-3 w-3" /> Published
                        </span>
                      </div>
                    );
                  }

                  return (
                    <form
                      key={item.product}
                      onSubmit={(e) => void submitItem(e, item.product)}
                      className="h-full rounded-2xl border border-line bg-surface p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xs"
                    >
                      {/* Product Header */}
                      <div className="flex items-center gap-3 border-b border-line/50 pb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={assetUrl(item.coverImage.url)}
                          alt={item.title}
                          className="h-12 w-12 rounded-xl object-cover border border-line shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-wider">
                            <MessageSquareText className="h-3.5 w-3.5" />
                            <span>Product Review</span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-ink truncate" title={item.title}>
                            {item.title}
                          </h3>
                          <p className="text-xs text-muted truncate">{item.storeName}</p>
                        </div>
                      </div>

                      {/* Rating Component */}
                      <RatingInput
                        name="rating"
                        value={currentItemRating}
                        onChange={(rating) =>
                          setItemRatings((prev) => ({ ...prev, [item.product]: rating }))
                        }
                        label={`Rate ${item.title}`}
                      />

                      {/* Text Review & Live Character Count Progress */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={`item-${item.product}`}
                            className="text-xs sm:text-sm font-semibold text-ink"
                          >
                            Item review
                          </Label>
                          <span className="text-[11px] font-medium text-muted">
                            Min 10 characters
                          </span>
                        </div>

                        <textarea
                          id={`item-${item.product}`}
                          value={itemText[item.product] ?? ""}
                          onChange={(e) =>
                            setItemText((cur) => ({ ...cur, [item.product]: e.target.value }))
                          }
                          required
                          minLength={10}
                          maxLength={10000}
                          rows={4}
                          placeholder="Share details about the item's condition, functionality, and whether it matched the description (min 10 characters)..."
                          className="w-full resize-y min-h-[96px] rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm sm:text-base text-ink placeholder:text-muted/60 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                        />

                        {/* Progress Bar & Character Counter */}
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold ${itemLength >= 10 ? "text-success" : "text-body"}`}>
                              {itemLength >= 10 ? (
                                <span className="inline-flex items-center gap-1 text-success">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Minimum reached ({itemLength} characters)
                                </span>
                              ) : (
                                <span>
                                  {itemLength} / 10 characters{" "}
                                  <span className="text-muted font-normal">
                                    ({charsRemaining} more required)
                                  </span>
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-muted text-[11px]">
                              {charProgress}%
                            </span>
                          </div>

                          <div className="h-1.5 w-full bg-sunken rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                itemLength >= 10 ? "bg-success" : "bg-primary"
                              }`}
                              style={{ width: `${charProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit Item Button */}
                      <Button
                        type="submit"
                        loading={busy === item.product}
                        disabled={busy !== null || itemLength < 10 || currentItemRating === 0}
                        full
                        className="rounded-xl font-bold min-h-11 shadow-soft"
                      >
                        Publish Item Review
                      </Button>
                    </form>
                  );
                })}
              </div>

              {/* Column 2: Seller Rating */}
              <div className="space-y-6">
                {data.sellerReview ? (
                  <div className="h-full rounded-2xl border border-success/30 bg-success-soft/25 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success border border-success/20">
                        <Store className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-bold text-success uppercase tracking-wider">
                          Merchant Feedback
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-ink truncate">
                          {order.items[0]?.storeName || "Seller Rating"}
                        </h3>
                        <p className="text-xs text-muted">Experience &amp; conduct</p>
                      </div>
                    </div>

                    <div className="py-4 text-center space-y-2">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-success text-white shadow-xs">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-sm text-ink">Seller Rating Published</h4>
                      <p className="text-xs text-body leading-relaxed max-w-xs mx-auto">
                        Your review for this merchant has been saved and factored into their store rating.
                      </p>
                    </div>

                    <span className="self-center inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success border border-success/30">
                      <Check className="h-3 w-3" /> Published
                    </span>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => void submitSeller(e)}
                    className="h-full rounded-2xl border border-line bg-surface p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xs"
                  >
                    {/* Seller Header */}
                    <div className="flex items-center gap-3 border-b border-line/50 pb-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary border border-primary/20">
                        <Store className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-accent-dark text-[11px] font-bold uppercase tracking-wider">
                          <Store className="h-3.5 w-3.5" />
                          <span>Merchant Rating</span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-ink truncate">
                          {order.items[0]?.storeName || "Seller Rating"}
                        </h3>
                        <p className="text-xs text-muted">Communication &amp; reliability</p>
                      </div>
                    </div>

                    {/* Rating Component */}
                    <RatingInput
                      name="rating"
                      value={sellerRating}
                      onChange={setSellerRating}
                      label="Rate your seller experience"
                    />

                    {/* Description Tags */}
                    <fieldset className="space-y-2">
                      <div className="flex items-center justify-between">
                        <legend className="text-xs sm:text-sm font-semibold text-ink">
                          Choose 1 to 5 descriptions
                        </legend>
                        <span className="text-xs font-bold text-muted">
                          {selectedTags.length} / 5 selected
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {data.tags.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          const isMaxReached = !isSelected && selectedTags.length >= 5;

                          return (
                            <label
                              key={tag}
                              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                                isSelected
                                  ? "border-primary bg-primary text-white shadow-xs font-semibold"
                                  : isMaxReached
                                  ? "border-line/60 bg-sunken/40 text-muted/50 cursor-not-allowed"
                                  : "border-line bg-surface text-body hover:border-ink/30 hover:bg-sunken/60"
                              }`}
                            >
                              <input
                                type="checkbox"
                                value={tag}
                                checked={isSelected}
                                disabled={isMaxReached}
                                onChange={(event) =>
                                  setSelectedTags((current) =>
                                    event.target.checked
                                      ? [...current, tag]
                                      : current.filter((val) => val !== tag)
                                  )
                                }
                                className="sr-only"
                              />
                              <span className="capitalize">{tag}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    {/* Optional Comment */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="seller-review"
                          className="text-xs sm:text-sm font-semibold text-ink"
                        >
                          Seller comments <span className="font-normal text-muted">(optional)</span>
                        </Label>
                        <span className="text-xs text-muted">
                          {(sellerText ?? "").length} / 1,000 max
                        </span>
                      </div>

                      <textarea
                        id="seller-review"
                        value={sellerText}
                        onChange={(e) => setSellerText(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        placeholder="How was the seller's communication, punctuality, and meetup arrangement?..."
                        className="w-full resize-y min-h-[80px] rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm sm:text-base text-ink placeholder:text-muted/60 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                      />
                    </div>

                    {/* Submit Seller Button */}
                    <Button
                      type="submit"
                      loading={busy === "seller"}
                      disabled={
                        busy !== null ||
                        selectedTags.length === 0 ||
                        sellerRating === 0
                      }
                      full
                      className="rounded-xl font-bold min-h-11 shadow-soft"
                    >
                      Publish Seller Rating
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
