"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  HelpCircle,
  MessageCircleQuestion,
  Package,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import type { Review } from "@/lib/reviews";
import type { ProductQuestion } from "@/lib/questions";
import { ProductQuestions } from "@/components/ProductQuestions";

interface ProductFeedbackAndQAProps {
  productId: string;
  productTitle: string;
  sellerId: string;
  storeName: string;
  sellerFullName?: string;
  allReviews: Review[];
  effectiveRatingAverage: number;
  effectiveRatingCount: number;
  initialQuestions: ProductQuestion[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "VB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function ProductFeedbackAndQA({
  productId,
  productTitle,
  sellerId,
  storeName,
  sellerFullName,
  allReviews,
  effectiveRatingAverage,
  effectiveRatingCount,
  initialQuestions,
}: ProductFeedbackAndQAProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "questions">("reviews");
  const [reviewFilter, setReviewFilter] = useState<"all" | "item" | "seller">("all");
  const [questionCount, setQuestionCount] = useState(initialQuestions.length);

  const itemReviews = useMemo(
    () => allReviews.filter((r) => r.type === "item"),
    [allReviews],
  );
  const sellerReviews = useMemo(
    () => allReviews.filter((r) => r.type === "seller"),
    [allReviews],
  );

  const displayedReviews = useMemo(() => {
    if (reviewFilter === "item") return itemReviews;
    if (reviewFilter === "seller") return sellerReviews;
    return allReviews;
  }, [reviewFilter, itemReviews, sellerReviews, allReviews]);

  const targetSellerName = storeName || sellerFullName || "this seller";

  return (
    <section className="product-feedback-qa rounded-3xl border border-line bg-surface shadow-soft overflow-hidden">
      {/* Top Segmented Tab Switcher */}
      <div className="flex border-b border-line bg-sunken/40 p-2 sm:p-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "bg-surface text-ink shadow-soft border border-line"
              : "text-muted hover:text-ink hover:bg-surface/60"
          }`}
        >
          <Star
            className={`h-4 w-4 ${
              activeTab === "reviews" ? "fill-accent text-accent" : "text-muted"
            }`}
          />
          <span>Ratings &amp; Reviews</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-sunken font-extrabold text-ink border border-line/60">
            {allReviews.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "questions"
              ? "bg-surface text-ink shadow-soft border border-line"
              : "text-muted hover:text-ink hover:bg-surface/60"
          }`}
        >
          <MessageCircleQuestion
            className={`h-4 w-4 ${
              activeTab === "questions" ? "text-primary" : "text-muted"
            }`}
          />
          <span>Community Q&amp;A</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-sunken font-extrabold text-ink border border-line/60">
            {questionCount}
          </span>
        </button>
      </div>

      {/* Main Tab Content Container */}
      <div className="p-5 sm:p-8">
        {/* ============================================================== */}
        {/* TAB 1: RATINGS & REVIEWS                                       */}
        {/* ============================================================== */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Scoreboard & Filter Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-line">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/20 text-accent-dark">
                    <Star className="h-4.5 w-4.5 fill-accent text-accent" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
                    Verified Buyer Feedback
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted">
                  Authentic ratings from buyers who completed inspections and handovers with{" "}
                  <span className="font-semibold text-ink">{targetSellerName}</span>.
                </p>
              </div>

              {effectiveRatingCount > 0 ? (
                <div className="flex items-center gap-3 bg-sunken/80 px-4 py-2.5 rounded-2xl border border-line self-start lg:self-auto">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-5 w-5 fill-accent text-accent" />
                    <span className="text-xl font-black text-ink">
                      {effectiveRatingAverage.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-5 w-px bg-line-strong" />
                  <div className="text-xs">
                    <span className="font-bold text-ink">
                      {effectiveRatingCount} {effectiveRatingCount === 1 ? "review" : "reviews"}
                    </span>
                    <span className="block text-[11px] text-muted">100% Verified Deals</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-semibold text-muted bg-sunken px-3.5 py-2 rounded-xl border border-line self-start lg:self-auto">
                  No completed-deal reviews yet
                </span>
              )}
            </div>

            {/* Filter Pills Bar (Item Reviews vs Seller Reviews) */}
            {allReviews.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-muted mr-1">Show:</span>

                <button
                  type="button"
                  onClick={() => setReviewFilter("all")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    reviewFilter === "all"
                      ? "bg-ink text-white shadow-xs"
                      : "bg-sunken text-body hover:bg-line border border-line/60"
                  }`}
                >
                  All Feedback
                  <span className="text-[11px] opacity-80 font-normal">
                    ({allReviews.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewFilter("item")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    reviewFilter === "item"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50/80 text-blue-800 hover:bg-blue-100 border border-blue-200/80"
                  }`}
                >
                  <Package className="h-3.5 w-3.5" />
                  Product Reviews
                  <span className="text-[11px] opacity-80 font-normal">
                    ({itemReviews.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewFilter("seller")}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    reviewFilter === "seller"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-amber-50/80 text-amber-900 hover:bg-amber-100 border border-amber-200/80"
                  }`}
                >
                  <Store className="h-3.5 w-3.5" />
                  Seller Ratings
                  <span className="text-[11px] opacity-80 font-normal">
                    ({sellerReviews.length})
                  </span>
                </button>
              </div>
            )}

            {/* Review Cards Grid */}
            {displayedReviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedReviews.map((review) => {
                  const isItemReview = review.type === "item";
                  const reviewerName =
                    typeof review.buyer === "string"
                      ? "Verified Buyer"
                      : review.buyer?.fullName || "Verified Buyer";
                  const initials = getInitials(reviewerName);

                  return (
                    <article
                      key={review._id}
                      className="rounded-2xl bg-surface border border-line p-5 shadow-xs transition-shadow hover:shadow-soft flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3.5">
                        {/* Card Top: Distinct Category Badge + Star Rating */}
                        <div className="flex items-center justify-between gap-2">
                          {isItemReview ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80">
                              <Package className="h-3.5 w-3.5 text-blue-600" />
                              Product Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200/80">
                              <Store className="h-3.5 w-3.5 text-amber-700" />
                              Seller Rating
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-xs font-black text-amber-950 bg-accent/20 px-2 py-0.5 rounded-lg border border-accent/40">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            {review.rating}/5
                          </span>
                        </div>

                        {/* Buyer Info Row */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sunken border border-line-strong text-xs font-bold text-ink">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-ink text-xs sm:text-sm truncate">
                                {reviewerName}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60 shrink-0">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Verified Deal
                              </span>
                            </div>
                            <time className="text-[11px] text-muted block mt-0.5">
                              {new Date(review.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </time>
                          </div>
                        </div>

                        {/* Seller Trait Tags (if seller review) */}
                        {!isItemReview && review.tags && review.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {review.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-lg bg-sunken px-2.5 py-1 text-[11px] font-semibold capitalize text-ink border border-line"
                              >
                                ✓ {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Review Comment Text */}
                        {review.text ? (
                          <p className="text-xs sm:text-sm text-body leading-relaxed bg-sunken/40 rounded-xl p-3 border border-line/40">
                            &ldquo;{review.text}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs text-muted italic">
                            Buyer rated this deal without additional written notes.
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Context Explanation */}
                      <div className="pt-3 border-t border-line/60 text-[11px] text-muted flex items-center gap-1.5">
                        {isItemReview ? (
                          <>
                            <Package className="h-3 w-3 text-blue-600 shrink-0" />
                            <span>Rated the quality and condition of this item.</span>
                          </>
                        ) : (
                          <>
                            <Store className="h-3 w-3 text-amber-700 shrink-0" />
                            <span>Rated seller communication, punctuality, and handover.</span>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : allReviews.length > 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-8 text-center bg-sunken/20">
                <p className="text-xs sm:text-sm font-semibold text-ink">
                  No {reviewFilter === "item" ? "product" : "seller"} reviews found under this filter.
                </p>
                <button
                  type="button"
                  onClick={() => setReviewFilter("all")}
                  className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  View all reviews ({allReviews.length})
                </button>
              </div>
            ) : (
              /* Completely Empty State (No Reviews Yet) */
              <div className="rounded-2xl border border-dashed border-line bg-sunken/30 p-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-ink">New Seller on PriceAm</h3>
                <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
                  <span className="font-semibold text-ink">{targetSellerName}</span> hasn&apos;t
                  received buyer reviews yet. Meet in a public place, inspect the item thoroughly, and
                  confirm receipt in PriceAm to release your rating!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: QUESTIONS & ANSWERS                                     */}
        {/* ============================================================== */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <MessageCircleQuestion className="h-4.5 w-4.5" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
                    Community Questions &amp; Answers
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Public Q&amp;A for this listing. All visitors can see questions and seller answers.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-3.5 py-1.5 text-xs font-bold text-muted border border-line">
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                {questionCount} Question{questionCount === 1 ? "" : "s"}
              </span>
            </div>

            <ProductQuestions
              productId={productId}
              sellerId={sellerId}
              storeName={storeName}
              initialQuestions={initialQuestions}
              embedded={true}
              onQuestionsCountChange={setQuestionCount}
            />
          </div>
        )}
      </div>
    </section>
  );
}
