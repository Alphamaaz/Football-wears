export interface Category {
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  isActive: boolean;
  order: number;
  productCount?: number;
  createdAt?: string;
}

export const FOOTBALL_CATEGORIES: Category[] = [
  {
    name: "Club Kits",
    slug: "club-jerseys",
    icon: "Shirt",
    description: "Official 2024/25 & 2025/26 Home, Away, Third & Player Issue Club Kits",
    isActive: true,
    order: 1,
    productCount: 12,
  },
  {
    name: "National Teams",
    slug: "national-teams",
    icon: "Trophy",
    description: "World Cup, Copa América, AFCON & European Championship National Kits",
    isActive: true,
    order: 2,
    productCount: 8,
  },
  {
    name: "Retro Classics",
    slug: "retro-classics",
    icon: "Sparkles",
    description: "Iconic vintage & match-worn replica shirts from legendary football eras (1990-2010)",
    isActive: true,
    order: 3,
    productCount: 6,
  },
  {
    name: "Boots & Shoes",
    slug: "football-boots",
    icon: "Zap",
    description: "Pro FG, AG, SG & Turf football boots from Nike, Adidas & Puma",
    isActive: true,
    order: 4,
    productCount: 8,
  },
  {
    name: "Football Socks",
    slug: "football-socks",
    icon: "Tag",
    description: "Anti-slip pro grip socks, official team match socks & crew compression socks",
    isActive: true,
    order: 5,
    productCount: 4,
  },
  {
    name: "Training & Tracksuits",
    slug: "training-wear",
    icon: "Dumbbell",
    description: "Official club presentation tracksuits, storm-fit drill tops & pants",
    isActive: true,
    order: 6,
    productCount: 4,
  },
  {
    name: "Goalkeeper Hub",
    slug: "goalkeeper",
    icon: "ShieldCheck",
    description: "Professional match grip gloves, padded undergarments & keeper kits",
    isActive: true,
    order: 7,
    productCount: 3,
  },
  {
    name: "Match Balls & Gear",
    slug: "match-balls",
    icon: "Package",
    description: "FIFA Quality Pro UEFA Champions League & League official match balls, carbon shin guards & bags",
    isActive: true,
    order: 8,
    productCount: 4,
  },
];

export { FOOTBALL_CATEGORIES as DEFAULT_CATEGORIES };

/**
 * Public: Fetch active categories. Static frontend returns FOOTBALL_CATEGORIES.
 */
export async function getCategories(): Promise<Category[]> {
  return FOOTBALL_CATEGORIES;
}

/**
 * Admin: Fetch all categories.
 */
export async function getAdminCategories(): Promise<{ categories: Category[] }> {
  return { categories: FOOTBALL_CATEGORIES };
}

export async function createAdminCategory(data: {
  name: string;
  slug?: string;
  icon: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}): Promise<{ message: string; category: Category }> {
  return {
    message: "Category saved",
    category: {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      icon: data.icon,
      description: data.description,
      isActive: data.isActive ?? true,
      order: data.order ?? 10,
    },
  };
}

export async function updateAdminCategory(
  id: string,
  data: Partial<Category>,
): Promise<{ message: string; category: Category }> {
  const existing = FOOTBALL_CATEGORIES.find((c) => c._id === id || c.slug === id) || FOOTBALL_CATEGORIES[0];
  return {
    message: "Category updated",
    category: { ...existing, ...data },
  };
}

export async function deleteAdminCategory(
  id: string,
): Promise<{ message: string }> {
  return { message: "Category deleted" };
}
