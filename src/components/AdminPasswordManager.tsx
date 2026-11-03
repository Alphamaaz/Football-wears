"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { Alert, Button, Input, Label } from "@/components/ui";
import { changePassword, forgotPassword, resetPassword } from "@/lib/auth";
import { getPasswordValidationError } from "@/lib/password";
import { ApiRequestError, tokenStore } from "@/lib/api";
import { disconnectRealtime } from "@/lib/realtime";

export function AdminPasswordManager({
  adminEmail,
  inModal = false,
  onClose,
  onSuccess,
}: {
  adminEmail?: string;
  inModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();

  // Mode: "change" = known current password, "forgot" = reset via email OTP
  const [mode, setMode] = useState<"change" | "forgot">("change");

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changing, setChanging] = useState(false);

  // Forgot Password / OTP state
  const [otp, setOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNew, setShowForgotNew] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Common notification state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const emailToUse = adminEmail || "admin@priceam.ng";

  // Real-time password criteria evaluation
  const activePassword = mode === "change" ? newPassword : forgotNewPassword;
  const hasMinLength = activePassword.length >= 8;
  const hasUpper = /[A-Z]/.test(activePassword);
  const hasLower = /[a-z]/.test(activePassword);
  const hasNumber = /\d/.test(activePassword);
  const isCriteriaMet = hasMinLength && hasUpper && hasLower && hasNumber;

  const passwordsMatch =
    mode === "change"
      ? newPassword && confirmPassword && newPassword === confirmPassword
      : forgotNewPassword && forgotConfirmPassword && forgotNewPassword === forgotConfirmPassword;

  // Handle standard password change
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    const validationErr = getPasswordValidationError(newPassword);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setChanging(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess("Superadmin password updated successfully! Redirecting to login to verify your new credentials...");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (onSuccess) onSuccess();

      setTimeout(() => {
        disconnectRealtime();
        tokenStore.clear();
        router.replace("/login?changed=1");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to update superadmin password. Please try again."
      );
    } finally {
      setChanging(false);
    }
  }

  // Handle sending OTP code for forgot password
  async function handleSendOtp() {
    setError(null);
    setSuccess(null);
    setSendingOtp(true);
    try {
      await forgotPassword(emailToUse);
      setOtpSent(true);
      setCooldown(60);
      setSuccess(`A 6-digit reset code has been sent to ${emailToUse}. Please check your inbox or spam.`);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not send verification code. Please try again."
      );
    } finally {
      setSendingOtp(false);
    }
  }

  // Handle resetting password using OTP
  async function handleResetWithOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit code sent to your email.");
      return;
    }

    const validationErr = getPasswordValidationError(forgotNewPassword);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setResetting(true);
    try {
      await resetPassword({
        email: emailToUse,
        otp: cleanOtp,
        password: forgotNewPassword,
      });
      setSuccess("Superadmin password has been reset successfully! Redirecting to login...");
      setOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");

      if (onSuccess) onSuccess();

      setTimeout(() => {
        disconnectRealtime();
        tokenStore.clear();
        router.replace("/login?reset=1");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Failed to reset password. The code may be invalid or expired."
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className={`space-y-6 ${inModal ? "p-1" : ""}`}>
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
            {mode === "change" ? <Lock className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span>Superadmin Credentials</span>
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-primary border border-primary/20">
                Security
              </span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Account: <strong className="text-ink font-semibold">{emailToUse}</strong>
            </p>
          </div>
        </div>

        {/* Mode Selector Pills */}
        <div className="flex items-center rounded-xl bg-sunken p-1 border border-line self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode("change");
              setError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "change"
                ? "bg-surface text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "forgot"
                ? "bg-surface text-ink shadow-xs"
                : "text-muted hover:text-ink"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Forgot Password</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <Alert kind="error" className="animate-fade-in-up">
          {error}
        </Alert>
      )}

      {success && (
        <Alert kind="success" className="animate-fade-in-up">
          {success}
        </Alert>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: CHANGE PASSWORD (KNOWS CURRENT PASSWORD)                          */}
      {/* ========================================================================= */}
      {mode === "change" && (
        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="admin-current-password">Current Password</Label>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                }}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Forgot current password?
              </button>
            </div>
            <div className="relative mt-1">
              <Input
                id="admin-current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current superadmin password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <Label htmlFor="admin-new-password">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="admin-new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong new password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements Badges */}
          <div className="rounded-xl border border-line bg-sunken/40 p-3 space-y-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Security Requirements
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span
                className={`flex items-center gap-1.5 ${
                  hasMinLength ? "text-success font-semibold" : "text-muted"
                }`}
              >
                <Check className={`h-3.5 w-3.5 ${hasMinLength ? "text-success" : "opacity-30"}`} />
                8+ characters
              </span>
              <span
                className={`flex items-center gap-1.5 ${
                  hasUpper ? "text-success font-semibold" : "text-muted"
                }`}
              >
                <Check className={`h-3.5 w-3.5 ${hasUpper ? "text-success" : "opacity-30"}`} />
                Uppercase letter (A-Z)
              </span>
              <span
                className={`flex items-center gap-1.5 ${
                  hasLower ? "text-success font-semibold" : "text-muted"
                }`}
              >
                <Check className={`h-3.5 w-3.5 ${hasLower ? "text-success" : "opacity-30"}`} />
                Lowercase letter (a-z)
              </span>
              <span
                className={`flex items-center gap-1.5 ${
                  hasNumber ? "text-success font-semibold" : "text-muted"
                }`}
              >
                <Check className={`h-3.5 w-3.5 ${hasNumber ? "text-success" : "opacity-30"}`} />
                Number (0-9)
              </span>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="admin-confirm-password">Confirm New Password</Label>
              {confirmPassword && (
                <span
                  className={`text-xs font-semibold ${
                    newPassword === confirmPassword ? "text-success" : "text-danger"
                  }`}
                >
                  {newPassword === confirmPassword ? "✓ Passwords match" : "✕ Passwords do not match"}
                </span>
              )}
            </div>
            <div className="relative mt-1">
              <Input
                id="admin-confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your new password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {inModal && onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              loading={changing}
              disabled={
                changing ||
                !currentPassword ||
                !isCriteriaMet ||
                newPassword !== confirmPassword ||
                currentPassword === newPassword
              }
              className="rounded-xl text-xs font-bold min-h-11 px-6 shadow-soft"
            >
              <Lock className="h-4 w-4 mr-1.5" />
              Update Superadmin Password
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: FORGOT PASSWORD (RESET VIA SUPERADMIN EMAIL OTP)                  */}
      {/* ========================================================================= */}
      {mode === "forgot" && (
        <div className="space-y-5">
          {/* Step 1: Request Code Notice */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-ink text-sm">
                  Email Verification Code Reset
                </p>
                <p className="text-body leading-relaxed">
                  If you do not remember your current superadmin password, we will send a 6-digit one-time passcode (OTP) directly to your registered administrator email:
                </p>
                <p className="font-mono font-bold text-primary text-xs pt-0.5">
                  {emailToUse}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted">
                {otpSent ? "Code already dispatched" : "Ready to receive reset code"}
              </span>
              <Button
                type="button"
                size="sm"
                variant={otpSent ? "outline" : "primary"}
                loading={sendingOtp}
                disabled={sendingOtp || cooldown > 0}
                onClick={handleSendOtp}
                className="rounded-xl text-xs font-bold"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {otpSent
                  ? cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : "Resend Code"
                  : "Send Reset Code to Email"}
              </Button>
            </div>
          </div>

          {/* Step 2: Enter OTP & New Password */}
          {otpSent && (
            <form onSubmit={handleResetWithOtp} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="admin-reset-otp">6-Digit Verification Code (OTP)</Label>
                <Input
                  id="admin-reset-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  required
                  className="font-mono text-base tracking-widest text-center max-w-[200px]"
                />
              </div>

              <div>
                <Label htmlFor="admin-forgot-new-password">New Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="admin-forgot-new-password"
                    type={showForgotNew ? "text" : "password"}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Create a strong new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNew(!showForgotNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    tabIndex={-1}
                  >
                    {showForgotNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Badges */}
              <div className="rounded-xl border border-line bg-sunken/40 p-3 space-y-2">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                  Security Requirements
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? "text-success font-semibold" : "text-muted"
                    }`}
                  >
                    <Check className={`h-3.5 w-3.5 ${hasMinLength ? "text-success" : "opacity-30"}`} />
                    8+ characters
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      hasUpper ? "text-success font-semibold" : "text-muted"
                    }`}
                  >
                    <Check className={`h-3.5 w-3.5 ${hasUpper ? "text-success" : "opacity-30"}`} />
                    Uppercase letter (A-Z)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      hasLower ? "text-success font-semibold" : "text-muted"
                    }`}
                  >
                    <Check className={`h-3.5 w-3.5 ${hasLower ? "text-success" : "opacity-30"}`} />
                    Lowercase letter (a-z)
                  </span>
                  <span
                    className={`flex items-center gap-1.5 ${
                      hasNumber ? "text-success font-semibold" : "text-muted"
                    }`}
                  >
                    <Check className={`h-3.5 w-3.5 ${hasNumber ? "text-success" : "opacity-30"}`} />
                    Number (0-9)
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-forgot-confirm-password">Confirm New Password</Label>
                  {forgotConfirmPassword && (
                    <span
                      className={`text-xs font-semibold ${
                        forgotNewPassword === forgotConfirmPassword
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {forgotNewPassword === forgotConfirmPassword
                        ? "✓ Passwords match"
                        : "✕ Passwords do not match"}
                    </span>
                  )}
                </div>
                <div className="relative mt-1">
                  <Input
                    id="admin-forgot-confirm-password"
                    type={showForgotConfirm ? "text" : "password"}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Re-type your new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirm(!showForgotConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    tabIndex={-1}
                  >
                    {showForgotConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {inModal && onClose && (
                  <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  loading={resetting}
                  disabled={
                    resetting ||
                    otp.trim().length !== 6 ||
                    !isCriteriaMet ||
                    forgotNewPassword !== forgotConfirmPassword
                  }
                  className="rounded-xl text-xs font-bold min-h-11 px-6 shadow-soft"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Verify OTP &amp; Reset Password
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
