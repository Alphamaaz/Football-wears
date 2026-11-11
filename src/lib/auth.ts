/* Auth API — Frontend-only static demo authentication */

import { tokenStore } from "./api";
import type { AuthResponse, User } from "./types";
import { disconnectRealtime } from "./realtime";

export const DEMO_USER: User = {
  _id: "user-hamad-owner",
  fullName: "Hamad",
  email: "hamad@footballwears.shop",
  contactNumber: "+234 803 123 4567",
  profileImage: "/players/ronaldo.jpg",
  roles: ["admin", "seller", "buyer"],
  activeRole: "admin",
  sellerProfile: {
    storeName: "Football Wears Pro Shop",
    storeSlug: "football-wears",
    description: "100% Authentic Football Kits, Boots & Official Gear",
    approvalStatus: "approved",
    kycStatus: "approved",
  },
  emailVerified: true,
  isActive: true,
  createdAt: "2024-03-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

export async function register(input: {
  fullName: string;
  email: string;
  contactNumber: string;
  password: string;
}) {
  const user: User = {
    ...DEMO_USER,
    fullName: input.fullName,
    email: input.email,
    contactNumber: input.contactNumber,
  };
  tokenStore.set("demo_football_token");
  return { message: "Account created successfully", user, emailVerified: true };
}

export async function verifyEmail(input: { email: string; otp: string }) {
  return { message: "Email verified successfully" };
}

export async function resendVerification(email: string) {
  return { message: "Verification code sent" };
}

export async function login(input: { email: string; password: string }): Promise<AuthResponse> {
  tokenStore.set("demo_football_token");
  return {
    accessToken: "demo_football_token",
    refreshToken: "demo_football_refresh",
    user: { ...DEMO_USER, email: input.email || DEMO_USER.email },
  };
}

export async function logout() {
  try {
    disconnectRealtime();
  } finally {
    tokenStore.clear();
  }
}

export async function forgotPassword(email: string) {
  return { message: "Password reset link sent to your email." };
}

export async function resetPassword(input: {
  email: string;
  otp: string;
  password: string;
}) {
  return { message: "Password updated successfully" };
}

export async function getMe(): Promise<{ user: User }> {
  return { user: DEMO_USER };
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return { message: "Password updated successfully", requiresLogin: false };
}
