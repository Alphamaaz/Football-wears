/* Admin API — mirrors Backend/src/modules/admin */

import { api, API_URL, tokenStore } from "./api";
import type { User } from "./types";
import type { Order } from "./orders";
import type { Dispute } from "./disputes";

export interface PendingCompletionOrder {
  _id: string;
  buyer: { _id?: string; fullName: string; email: string; contactNumber?: string };
  seller: { _id?: string; fullName: string; email: string; sellerProfile?: { storeName?: string } };
  items: Array<{ title: string; coverImage?: { url: string }; lineTotal: number; quantity: number }>;
  total: number;
  completionRequest?: {
    status: string;
    note: string;
    evidenceUrls: string[];
    requestedAt?: string;
  };
}

export interface EligiblePayoutItem {
  _id: string;
  seller: {
    _id?: string;
    fullName: string;
    email: string;
    contactNumber?: string;
    sellerProfile?: {
      storeName?: string;
      payoutDetails?: {
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
      };
    };
  };
  order: { _id: string; total: number; orderStatus: string; createdAt: string };
  amountKobo: number;
  status: string;
  createdAt: string;
}

export interface UnansweredQuestionItem {
  _id: string;
  product: { _id?: string; title: string; price: number; coverImage?: { url: string } };
  author: { _id?: string; fullName: string; email: string };
  seller: { _id?: string; fullName: string; sellerProfile?: { storeName?: string } };
  question: string;
  status: string;
  createdAt: string;
}

export interface RecentOfferItem {
  _id: string;
  productTitle: string;
  storeName: string;
  coverImage?: { url: string };
  listedPrice: number;
  currentPrice: number;
  status: string;
  lastProposedBy: string;
  buyer?: { fullName: string; email?: string };
  seller?: { fullName: string; sellerProfile?: { storeName?: string } };
  createdAt: string;
}

export interface AdminAnalyticsData {
  financials: {
    totalGmv: number;
    completedGmv: number;
    escrowGmv?: number;
    potentialPlatformFee: number;
    averageOrderValue?: number;
  };
  users: {
    total: number;
    sellers: number;
    pendingSellers: number;
    suspended?: number;
    recent: Array<{
      _id: string;
      fullName: string;
      email: string;
      contactNumber?: string;
      roles: string[];
      activeRole: string;
      isActive: boolean;
      createdAt: string;
    }>;
  };
  products: {
    total: number;
    active: number;
    pendingReview?: number;
    byCategory: Array<{ category: string; count: number }>;
    byState: Array<{ state: string; count: number }>;
  };
  orders: {
    total: number;
    byStatus: {
      pending_payment: number;
      paid: number;
      processing: number;
      shipped: number;
      delivered: number;
      completed: number;
      cancelled: number;
    };
    recent: Order[];
  };
  negotiations: {
    total: number;
    accepted: number;
    countered: number;
    pending: number;
    rejected?: number;
    conversionRate: number;
    recent?: RecentOfferItem[];
  };
  queues: {
    pendingListingsCount?: number;
    pendingSellersCount: number;
    pendingVerificationCount?: number;
    openDisputesCount: number;
    openListingReportsCount?: number;
    openSupportTicketsCount?: number;
    pendingCompletionCount: number;
    eligiblePayoutsCount: number;
    unansweredQuestionsCount: number;
    totalQuestionsCount?: number;
    pendingApplications: User[];
    openDisputes: Dispute[];
    pendingCompletions?: PendingCompletionOrder[];
    eligiblePayouts?: EligiblePayoutItem[];
    unansweredQuestions?: UnansweredQuestionItem[];
  };
  system: {
    paymentMode: string;
    dbConnected: boolean;
    serverUptimeSeconds: number;
    nodeVersion: string;
    memoryUsageMb?: number;
    timestamp: string;
  };
}

export type ListingModerationStatus = "pending" | "approved" | "rejected" | "blocked";

export interface AdminListing {
  _id: string;
  title: string;
  category: string;
  price: number;
  condition: "new" | "used";
  status: "active" | "inactive" | "sold";
  moderationStatus?: ListingModerationStatus;
  moderationReason?: string;
  submittedAt?: string;
  createdAt: string;
  coverImage?: { url: string; alt?: string };
  location?: { city?: string; state?: string };
  storeName: string;
  seller?: {
    _id: string;
    fullName: string;
    email: string;
    contactNumber?: string;
    isActive: boolean;
    sellerProfile?: { storeName?: string };
  };
}

export async function getAdminAnalytics() {
  return api<{ analytics: AdminAnalyticsData }>("/admin/analytics");
}

export async function getAdminUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.role) query.set("role", params.role);
  const qStr = query.toString();
  return api<{ users: User[]; total: number; page: number; pages: number }>(`/admin/users${qStr ? `?${qStr}` : ""}`);
}

export async function toggleUserStatus(userId: string) {
  return api<{ message: string; user: User }>(`/admin/users/${userId}/toggle-status`, {
    method: "PATCH",
  });
}

export async function getAdminListings(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ListingModerationStatus | "all";
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  const qStr = query.toString();
  return api<{ listings: AdminListing[]; total: number; page: number; pages: number }>(
    `/admin/listings${qStr ? `?${qStr}` : ""}`
  );
}

export async function moderateListing(
  productId: string,
  action: "approve" | "reject" | "block",
  reason?: string
) {
  return api<{ message: string; product: AdminListing }>(`/admin/listings/${productId}/moderate`, {
    method: "PATCH",
    body: { action, reason },
  });
}

export type PendingSeller = Pick<
  User,
  "_id" | "fullName" | "email" | "contactNumber" | "sellerProfile" | "createdAt"
>;

export async function getPendingSellers() {
  return api<{ applicants: PendingSeller[] }>("/admin/sellers/pending");
}

export const getPendingSellerApplications = getPendingSellers;

export async function approveSeller(userId: string) {
  return api<{ message: string; user: User }>(`/admin/sellers/${userId}/approve`, {
    method: "PATCH",
  });
}

export async function rejectSeller(userId: string, reason: string) {
  return api<{ message: string }>(`/admin/sellers/${userId}/reject`, {
    method: "PATCH",
    body: { reason },
  });
}

export interface VerificationApplication extends Pick<User, "_id" | "fullName" | "email" | "contactNumber" | "createdAt"> {
  sellerProfile: NonNullable<User["sellerProfile"]> & {
    identityVerification?: NonNullable<User["sellerProfile"]>["identityVerification"] & { idNumber?: string; documentFront?: string; documentBack?: string; selfie?: string };
  };
}

export async function getVerificationApplications() {
  return api<{ applications: VerificationApplication[] }>("/admin/verifications");
}

export async function reviewVerification(userId: string, type: "identity", action: "approve" | "reject", reason?: string) {
  return api<{ message: string }>(`/admin/verifications/${userId}`, { method: "PATCH", body: { type, action, reason } });
}

export async function openVerificationDocument(path: string) {
  const preview = window.open("", "_blank");
  const response = await fetch(`${API_URL}${path}`, { headers: tokenStore.get() ? { Authorization: `Bearer ${tokenStore.get()}` } : {}, credentials: "include" });
  if (!response.ok) {
    preview?.close();
    throw new Error("Could not open verification document");
  }
  const url = URL.createObjectURL(await response.blob());
  if (preview) preview.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export async function hideQuestion(questionId: string) {
  return api<{ message: string }>(`/admin/questions/${questionId}/hide`, {
    method: "PATCH",
  });
}

export async function answerQuestionAsAdmin(questionId: string, answer: string) {
  return api<{ message: string }>(`/questions/${questionId}/answer`, {
    method: "POST",
    body: { answer },
  });
}

export async function reviewOrderCompletion(
  orderId: string,
  decision: "approve" | "reject",
  note: string
) {
  return api<{ message: string }>(`/orders/${orderId}/completion-request/review`, {
    method: "PATCH",
    body: { decision, note },
  });
}

