"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquareText, RotateCcw, Star, Store } from "lucide-react";
import { Alert, Button, Label } from "@/components/ui";
import { ApiRequestError } from "@/lib/api";
import type { Order } from "@/lib/orders";
import { createItemReview, createSellerReview, getReviewEligibility, type ReviewEligibility } from "@/lib/reviews";

const words = (value: string) => value.trim().split(/\s+/u).filter(Boolean).length;

function RatingInput({ name }: { name: string }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">Choose a rating</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className="cursor-pointer">
            <input className="peer sr-only" type="radio" name={name} value={rating} required />
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-muted transition-colors hover:border-accent hover:text-accent peer-checked:border-accent peer-checked:bg-warning-soft peer-checked:text-accent-dark peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20">
              <Star className="h-5 w-5 fill-current" aria-hidden="true" />
              <span className="sr-only">{rating} star{rating === 1 ? "" : "s"}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function OrderReviewSection({ order }: { order: Order }) {
  const [data, setData] = useState<ReviewEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [itemText, setItemText] = useState<Record<string, string>>({});
  const [sellerText, setSellerText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getReviewEligibility(order._id));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load your review options. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [order._id]);

  useEffect(() => { void load(); }, [load]);

  async function submitItem(event: React.FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(productId); setError(null); setNotice(null);
    try {
      const result = await createItemReview(order._id, productId, Number(form.get("rating")), itemText[productId] ?? "");
      setNotice(result.message);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not publish the item review. Please try again.");
    } finally { setBusy(null); }
  }

  async function submitSeller(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy("seller"); setError(null); setNotice(null);
    try {
      const result = await createSellerReview(order._id, Number(form.get("rating")), selectedTags, sellerText);
      setNotice(result.message);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not publish the seller rating. Please try again.");
    } finally { setBusy(null); }
  }

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6" aria-labelledby="order-reviews-title">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-accent-dark"><Star className="h-5 w-5 fill-current" aria-hidden="true" /></span>
        <div><h2 id="order-reviews-title" className="text-base font-bold text-ink">Review your completed deal</h2><p className="mt-1 text-sm text-body">Rate the item separately from your experience with the seller.</p></div>
      </div>

      {loading && <div className="mt-5 space-y-3" aria-live="polite" aria-label="Loading review options"><div className="h-24 animate-pulse rounded-2xl bg-sunken" /><div className="h-24 animate-pulse rounded-2xl bg-sunken" /></div>}
      {!loading && error && <div className="mt-5 space-y-3"><Alert kind="error">{error}</Alert><Button type="button" variant="outline" onClick={() => void load()} className="min-h-11 rounded-xl"><RotateCcw className="h-4 w-4" aria-hidden="true" />Try again</Button></div>}
      {!loading && !error && data && !data.eligible && <div className="mt-5 rounded-2xl border border-line bg-sunken p-4 text-sm text-body">Reviews are available to the buyer after the deal is completed.</div>}

      {!loading && !error && data?.eligible && <>
        {notice && <div className="mt-5"><Alert kind="success">{notice}</Alert></div>}
        <div className="mt-5 space-y-5">{order.items.map((item) => {
          const reviewed = data.itemReviews.some((review) => review.product === item.product);
          if (reviewed) return <div key={item.product} className="rounded-2xl bg-success-soft p-4 text-sm font-semibold text-success">Your review for {item.title} has been published.</div>;
          const itemWords = words(itemText[item.product] ?? "");
          return <form key={item.product} onSubmit={(event) => void submitItem(event, item.product)} className="rounded-2xl border border-line p-4 sm:p-5">
            <div className="flex items-center gap-2 text-ink"><MessageSquareText className="h-4 w-4 text-primary" aria-hidden="true" /><h3 className="font-bold">Rate {item.title}</h3></div>
            <div className="mt-4"><RatingInput name={`item-rating-${item.product}`} /></div>
            <div className="mt-4"><Label htmlFor={`item-${item.product}`}>Item review — minimum 100 words</Label><textarea id={`item-${item.product}`} value={itemText[item.product] ?? ""} onChange={(event) => setItemText((current) => ({ ...current, [item.product]: event.target.value }))} required rows={6} maxLength={20000} className="mt-2 w-full resize-y rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" /><p className={`mt-1 text-xs ${itemWords >= 100 ? "text-success" : "text-muted"}`} aria-live="polite">{itemWords} / 100 minimum words</p></div>
            <Button type="submit" loading={busy === item.product} disabled={busy !== null || itemWords < 100} className="mt-4 min-h-11 rounded-xl">Publish item review</Button>
          </form>;
        })}</div>

        {!data.sellerReview ? <form onSubmit={(event) => void submitSeller(event)} className="mt-5 rounded-2xl border border-line p-4 sm:p-5">
          <div className="flex items-center gap-2 text-ink"><Store className="h-4 w-4 text-primary" aria-hidden="true" /><h3 className="font-bold">Rate the seller</h3></div>
          <div className="mt-4"><RatingInput name="seller-rating" /></div>
          <fieldset className="mt-4"><legend className="text-sm font-semibold text-ink">Choose 1 to 5 descriptions</legend><div className="mt-2 flex flex-wrap gap-2">{data.tags.map((tag) => <label key={tag} className="cursor-pointer rounded-full border border-line px-3 py-2 text-sm capitalize transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/15"><input type="checkbox" value={tag} checked={selectedTags.includes(tag)} disabled={!selectedTags.includes(tag) && selectedTags.length >= 5} onChange={(event) => setSelectedTags((current) => event.target.checked ? [...current, tag] : current.filter((value) => value !== tag))} className="sr-only" />{tag}</label>)}</div></fieldset>
          <div className="mt-4"><Label htmlFor="seller-review">Seller comments — optional, maximum 100 words</Label><textarea id="seller-review" value={sellerText} onChange={(event) => setSellerText(event.target.value)} rows={4} maxLength={2000} className="mt-2 w-full resize-y rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15" /><p className={`mt-1 text-xs ${words(sellerText) > 100 ? "text-danger" : "text-muted"}`} aria-live="polite">{words(sellerText)} / 100 words</p></div>
          <Button type="submit" loading={busy === "seller"} disabled={busy !== null || selectedTags.length === 0 || words(sellerText) > 100} className="mt-4 min-h-11 rounded-xl">Publish seller rating</Button>
        </form> : <div className="mt-5 rounded-2xl bg-success-soft p-4 text-sm font-semibold text-success">Your seller rating has been published.</div>}
      </>}
    </section>
  );
}
