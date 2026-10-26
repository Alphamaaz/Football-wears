import { api } from "./api";

export type ProductReportStatus = "open" | "under_review" | "resolved" | "dismissed";
export interface ProductReport {
  _id: string;
  reason: string;
  details: string;
  status: ProductReportStatus;
  adminNote?: string;
  createdAt: string;
  product?: { _id: string; title: string; category: string; storeName: string; moderationStatus?: string; coverImage?: { url: string } };
  reporter?: { fullName: string; email: string; contactNumber?: string };
  seller?: { _id: string; fullName: string; email: string; contactNumber?: string; isActive: boolean; sellerProfile?: { storeName?: string } };
}

export async function listProductReports(status: ProductReportStatus | "all" = "all") {
  return api<{ reports: ProductReport[] }>(`/reports?status=${status}`);
}

export async function reviewProductReport(reportId: string, action: "review" | "resolve" | "dismiss", note: string) {
  return api<{ message: string }>(`/reports/${reportId}`, { method: "PATCH", body: { action, note } });
}
