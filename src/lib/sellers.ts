import { SERVER_API_URL } from "./api";

export interface PublicSellerProfile {
  id: string;
  fullName: string;
  profileImage?: string | null;
  memberSince: string;
  storeName: string;
  storeSlug: string;
  storeImage?: string | null;
  description?: string;
  identityVerificationStatus: "not_submitted" | "pending" | "approved" | "rejected";
  ratingAverage: number;
  ratingCount: number;
  activeListingsCount: number;
  locations: string[];
}

export async function getPublicSellerProfileServer(storeSlug: string): Promise<PublicSellerProfile | null> {
  try {
    const response = await fetch(`${SERVER_API_URL}/users/sellers/${encodeURIComponent(storeSlug)}`, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as { seller: PublicSellerProfile };
    return data.seller;
  } catch {
    return null;
  }
}
