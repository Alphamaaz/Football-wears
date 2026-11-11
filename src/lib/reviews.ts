export type Review = {
  _id: string;
  type: "item" | "seller";
  order: string;
  buyer: string | { _id: string; fullName: string };
  seller: string;
  product?: string;
  rating: number;
  text?: string;
  tags: string[];
  createdAt: string;
};

export type ReviewList = { reviews: Review[]; total: number; page: number; pages: number };
export type ReviewEligibility = { eligible: boolean; itemReviews: Review[]; sellerReview: Review | null; tags: string[] };

const SAMPLE_REVIEWS: Review[] = [
  {
    _id: "rev-1",
    type: "item",
    order: "FW-ORD-2025-0814",
    buyer: { _id: "b1", fullName: "Chinedu O." },
    seller: "seller-football-wears",
    rating: 5,
    text: "Top-notch quality! The fabric has the exact authentic HEAT.RDY weave, and the Bellingham #5 lettering with UCL Starball patch is pristine. Delivery to Lekki took less than 24 hours.",
    tags: ["Authentic Quality", "Fast Shipping", "Flawless Printing"],
    createdAt: "2025-02-02T10:15:00.000Z",
  },
  {
    _id: "rev-2",
    type: "item",
    order: "FW-ORD-2025-0780",
    buyer: { _id: "b2", fullName: "Tunde Bakare" },
    seller: "seller-football-wears",
    rating: 5,
    text: "I was skeptical about buying jerseys online until I found Football Wears. Everything from the neck label to the hologram serial tag is 100% genuine. Fits true to size.",
    tags: ["Genuine Item", "True to Size"],
    createdAt: "2025-01-28T14:20:00.000Z",
  },
  {
    _id: "rev-3",
    type: "seller",
    order: "FW-ORD-2025-0720",
    buyer: { _id: "b3", fullName: "Emeka Davies" },
    seller: "seller-football-wears",
    rating: 5,
    text: "Hamad answered all my questions regarding the player-issue sizing and even sent me sleeve patch options. Very professional customer service. Will definitely be ordering the retro 2008 Ronaldo shirt next!",
    tags: ["Great Communication", "Fast Dispatch", "Trusted Seller"],
    createdAt: "2025-01-24T18:00:00.000Z",
  },
];

export function getReviewEligibility(orderId: string): Promise<ReviewEligibility> {
  return Promise.resolve({
    eligible: true,
    itemReviews: SAMPLE_REVIEWS.filter((r) => r.type === "item"),
    sellerReview: SAMPLE_REVIEWS.find((r) => r.type === "seller") || null,
    tags: ["Authentic", "Fast Delivery", "Great Fabric", "Top Printing"],
  });
}

export function createItemReview(orderId: string, productId: string, rating: number, text: string) {
  const newRev: Review = {
    _id: `rev-${Date.now()}`,
    type: "item",
    order: orderId,
    buyer: { _id: "b-current", fullName: "You" },
    seller: "seller-football-wears",
    product: productId,
    rating,
    text,
    tags: ["Verified Purchase"],
    createdAt: new Date().toISOString(),
  };
  return Promise.resolve({ message: "Review posted!", review: newRev });
}

export function createSellerReview(orderId: string, rating: number, tags: string[], text: string) {
  const newRev: Review = {
    _id: `rev-${Date.now()}`,
    type: "seller",
    order: orderId,
    buyer: { _id: "b-current", fullName: "You" },
    seller: "seller-football-wears",
    rating,
    tags,
    text,
    createdAt: new Date().toISOString(),
  };
  return Promise.resolve({ message: "Seller review posted!", review: newRev });
}

export async function listProductReviewsServer(productId: string): Promise<ReviewList> {
  return {
    reviews: SAMPLE_REVIEWS,
    total: SAMPLE_REVIEWS.length,
    page: 1,
    pages: 1,
  };
}

export async function listSellerReviewsServer(sellerId: string): Promise<ReviewList> {
  return {
    reviews: SAMPLE_REVIEWS.filter((r) => r.type === "seller"),
    total: 1,
    page: 1,
    pages: 1,
  };
}
