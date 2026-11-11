/* Products API — Frontend-only static football catalog */

import { FOOTBALL_PRODUCTS } from "./football-data";

export interface ProductImage {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface ProductMedia extends ProductImage {
  type: "image" | "video";
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
}

export interface VariantOption {
  value: string;
  price: number;
  minPrice?: number;
  stock: number;
  sku?: string;
}

export interface Variant {
  name: string;
  options: VariantOption[];
}

export interface Product {
  _id: string;
  seller: string;
  storeName: string;
  storeSlug: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  club?: string;
  country?: string;
  player?: string;
  edition?: string;
  badge?: string;
  colorway?: string;
  minPrice?: number;
  stock: number;
  condition: "new" | "used";
  brand?: string;
  warranty?: string;
  negotiable?: boolean;
  location?: {
    state?: string;
    city?: string;
    addressNote?: string;
  };
  description: string;
  variants: Variant[];
  coverImage: ProductImage;
  images: ProductImage[];
  media: ProductMedia[];
  delivery: {
    mode: "seller_included" | "buyer_pays_externally";
    estimatedDays?: string;
    details?: string;
  };
  status: "active" | "inactive" | "sold";
  moderationStatus?: "pending" | "approved" | "rejected" | "blocked";
  moderationReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  isFeatured: boolean;
  viewsCount: number;
  salesCount: number;
  ratingAverage: number;
  ratingCount: number;
  sellerRatingAverage?: number;
  sellerRatingCount?: number;
  sellerFullName?: string;
  sellerStoreImage?: string;
  sellerProfileImage?: string;
  sellerJoinedAt?: string;
  sellerKycStatus?: "not_submitted" | "pending" | "approved" | "rejected";
  promotion?: { enabled: boolean; commissionPercent?: number; startsAt?: string; endsAt?: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export type ProductSort =
  | "featured"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "popular"
  | "rating";

export interface ListProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  club?: string;
  country?: string;
  player?: string;
  edition?: string;
  brand?: string;
  condition?: "new" | "used";
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  storeSlug?: string;
  inStock?: boolean;
  state?: string;
  negotiable?: boolean;
  identityVerified?: boolean;
  sort?: ProductSort;
}

function filterStaticProducts(params: ListProductsParams = {}): ProductListResponse {
  let list = [...FOOTBALL_PRODUCTS];

  if (params.category) {
    const cat = params.category.toLowerCase().trim();
    list = list.filter((p) => p.category.toLowerCase() === cat);
  }

  if (params.club) {
    const club = params.club.toLowerCase().trim();
    list = list.filter((p) => p.club?.toLowerCase().includes(club));
  }

  if (params.country) {
    const country = params.country.toLowerCase().trim();
    list = list.filter((p) => p.country?.toLowerCase().includes(country));
  }

  if (params.player) {
    const player = params.player.toLowerCase().trim();
    list = list.filter((p) => p.player?.toLowerCase().includes(player) || p.title.toLowerCase().includes(player));
  }

  if (params.edition) {
    const ed = params.edition.toLowerCase().trim();
    list = list.filter((p) => p.edition?.toLowerCase().includes(ed));
  }

  if (params.brand) {
    const brand = params.brand.toLowerCase().trim();
    list = list.filter((p) => p.brand?.toLowerCase() === brand);
  }

  if (params.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.club && p.club.toLowerCase().includes(q)) ||
        (p.country && p.country.toLowerCase().includes(q)) ||
        (p.player && p.player.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (params.condition) {
    list = list.filter((p) => p.condition === params.condition);
  }

  if (params.inStock) {
    list = list.filter((p) => p.stock > 0);
  }

  if (params.minPrice !== undefined) {
    list = list.filter((p) => p.price >= params.minPrice!);
  }

  if (params.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= params.maxPrice!);
  }

  const sort = params.sort || "featured";
  switch (sort) {
    case "price_asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      list.sort((a, b) => b.salesCount - a.salesCount);
      break;
    case "rating":
      list.sort((a, b) => b.ratingAverage - a.ratingAverage);
      break;
    case "newest":
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "featured":
    default:
      list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      break;
  }

  const page = params.page || 1;
  const limit = params.limit || 24;
  const total = list.length;
  const pages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const products = list.slice(start, start + limit);

  return { products, total, page, pages };
}

/** Client-side list (browsing with filters). */
export async function listProducts(params: ListProductsParams = {}): Promise<ProductListResponse> {
  return filterStaticProducts(params);
}

/** Client-side public product detail. */
export async function getProduct(id: string): Promise<{ product: Product }> {
  const product = FOOTBALL_PRODUCTS.find((p) => p._id === id) || FOOTBALL_PRODUCTS[0];
  return { product };
}

export type ProductReportReason = "suspected_scam" | "misleading_listing" | "counterfeit_item" | "prohibited_item" | "already_sold" | "other";

export async function reportProduct(productId: string, reason: ProductReportReason, details: string) {
  return { message: "Thank you. Your feedback has been noted by Football Wears support." };
}

/**
 * Server-side list for RSC pages.
 */
export async function listProductsServer(
  params: ListProductsParams = {},
): Promise<ProductListResponse> {
  return filterStaticProducts(params);
}

/** Server-side detail for RSC pages. */
export async function getProductServer(id: string): Promise<Product | null> {
  const found = FOOTBALL_PRODUCTS.find((p) => p._id === id);
  return found || null;
}

/** Seller: own products. */
export async function listMyProducts(page = 1, limit = 20) {
  return filterStaticProducts({ page, limit });
}

export async function getMyProduct(id: string): Promise<Product | null> {
  return FOOTBALL_PRODUCTS.find((p) => p._id === id) || null;
}

export async function createProduct(form: FormData) {
  const title = String(form.get("title") || "New Football Kit / Gear");
  const price = Number(form.get("price")) || 45000;
  const category = String(form.get("category") || "club-jerseys");
  const description = String(form.get("description") || "Authentic official merchandise.");
  const brand = String(form.get("brand") || "Nike");

  const newProduct: Product = {
    ...FOOTBALL_PRODUCTS[0],
    _id: `fw-item-${Date.now()}`,
    title,
    price,
    category,
    description,
    brand,
    stock: Number(form.get("stock")) || 15,
    condition: "new",
    coverImage: {
      url: "/kits/real-madrid-2025-home.jpg",
      alt: title,
    },
    images: [{ url: "/kits/real-madrid-2025-home.jpg", alt: title }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  FOOTBALL_PRODUCTS.unshift(newProduct);
  return { message: "Item uploaded successfully to your personal store", product: newProduct };
}

export async function updateProduct(id: string, form: FormData) {
  return { message: "Item updated", product: FOOTBALL_PRODUCTS[0] };
}

export async function removeProduct(id: string) {
  return { message: "Item archived" };
}

/** Category options shown in UI. */
export const CATEGORIES = [
  "club-jerseys",
  "national-teams",
  "retro-classics",
  "football-boots",
  "training-wear",
  "goalkeeper",
  "match-balls",
  "accessories",
] as const;

export const NIGERIAN_STATES = [
  "Lagos", "Abuja FCT", "Rivers", "Oyo", "Kano", "Ogun", "Anambra", "Edo", "Delta",
  "Enugu", "Kaduna", "Kwara", "Imo", "Plateau", "Osun", "Akwa Ibom", "Abia", "Ondo",
  "Cross River", "Benue", "Bayelsa", "Ekiti", "Bauchi", "Gombe", "Kogi", "Katsina",
  "Kebbi", "Nasarawa", "Niger", "Sokoto", "Taraba", "Yobe", "Zamfara", "Adamawa", "Borno", "Jigawa", "Ebonyi"
] as const;
