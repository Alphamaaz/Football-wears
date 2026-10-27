"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, IdCard, ShieldAlert, ShieldCheck, Upload } from "lucide-react";
import { getMe } from "@/lib/auth";
import { ApiRequestError, tokenStore } from "@/lib/api";
import { submitVerification } from "@/lib/verification";
import type { User } from "@/lib/types";
import { Alert, Button, Input, Label } from "@/components/ui";

const statusCopy = {
  not_submitted: { label: "Identity not verified", className: "border-line bg-sunken text-body", icon: ShieldAlert },
  pending: { label: "Verification pending", className: "border-warning/30 bg-warning/15 text-ink", icon: Clock },
  approved: { label: "Identity verified", className: "border-success/30 bg-success-soft text-success", icon: CheckCircle2 },
  rejected: { label: "Verification needs attention", className: "border-danger/25 bg-danger-soft text-danger", icon: ShieldAlert },
};

export default function SellerVerificationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const hasLoadedUser = Boolean(user);

  useEffect(() => {
    if (!tokenStore.get()) { router.replace("/login"); return; }
    getMe().then(({ user: current }) => {
      if (current.roles.includes("admin")) router.replace("/admin");
      else if (!current.roles.includes("seller") || current.sellerProfile?.approvalStatus !== "approved") router.replace("/seller/onboarding");
      else setUser(current);
    }).catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    if (!hasLoadedUser) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        getMe().then(({ user: current }) => setUser(current)).catch(() => {});
      }
    }, 15000);
    return () => window.clearInterval(interval);
  }, [hasLoadedUser]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true); setError(null); setNotice(null);
    const form = new FormData(formElement);
    form.set("type", "identity");
    try {
      const response = await submitVerification(form);
      setUser(response.user);
      setNotice(response.message);
      formElement.reset();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : "Could not submit verification. Please try again.");
    } finally { setBusy(false); }
  }

  if (!user) return <main className="mx-auto max-w-3xl px-4 py-20"><div className="h-40 animate-pulse rounded-3xl bg-sunken" /></main>;
  const identity = user.sellerProfile?.identityVerification?.status || user.sellerProfile?.kycStatus || "not_submitted";
  const currentStatus = identity;
  const rejectionReason = user.sellerProfile?.identityVerification?.rejectionReason;
  const locked = currentStatus === "pending" || currentStatus === "approved";
  const CurrentStatusIcon = statusCopy[currentStatus].icon;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/seller" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to seller dashboard</Link>
      <header className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl"><h1 className="text-2xl font-black text-ink sm:text-3xl">Identity verification</h1><p className="mt-2 text-sm leading-relaxed text-body">Verify your identity with a valid Nigerian ID and a clear selfie. Your public badge appears only after an administrator approves your documents.</p></div>
          <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusCopy[currentStatus].className}`}><CurrentStatusIcon className="h-4 w-4" /> {statusCopy[currentStatus].label}</span>
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-sunken/60 p-4">
          <IdCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div><strong className="text-sm text-ink">One clear trust signal</strong><p className="mt-1 text-xs leading-relaxed text-muted">Email confirmation or permission to sell does not mean identity verified. Only approved KYC displays the green identity badge.</p></div>
        </div>
      </header>

      <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black text-ink">Submit your KYC</h2><p className="mt-1 text-sm text-muted">Your legal name and ID details must match the documents you upload.</p></div></div>
          {rejectionReason && <Alert kind="error" className="mt-4">Review note: {rejectionReason}</Alert>}
          {notice && <Alert kind="success" className="mt-4">{notice}</Alert>}
          {error && <Alert kind="error" className="mt-4">{error}</Alert>}
          {locked ? (
            <div className="mt-6 rounded-2xl border border-line bg-sunken/50 p-6 text-center"><Clock className={`mx-auto h-8 w-8 ${currentStatus === 'approved' ? 'text-success' : 'text-primary'}`} /><h3 className="mt-3 font-black text-ink">{currentStatus === 'approved' ? 'Verification complete' : 'Application under review'}</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted">{currentStatus === 'approved' ? 'The corresponding badge is now shown publicly.' : 'An administrator will review your evidence. The status updates here as soon as a decision is made.'}</p></div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <>
                <div><Label htmlFor="legalName">Full legal name</Label><Input id="legalName" name="legalName" required placeholder="Exactly as shown on your ID" className="text-base" /></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="idType">Identity document</Label><select id="idType" name="idType" required className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink"><option value="nin">NIN slip/card</option><option value="drivers_licence">Driver’s licence</option><option value="passport">International passport</option><option value="voters_card">Voter’s card</option></select></div><div><Label htmlFor="idNumber">Document number</Label><Input id="idNumber" name="idNumber" required minLength={5} maxLength={40} autoComplete="off" className="text-base" /></div></div>
                <div className="grid gap-4 sm:grid-cols-2"><FileField name="identityDocumentFront" label="Front of ID" required /><FileField name="identityDocumentBack" label="Back of ID (if applicable)" /></div><FileField name="selfie" label="Clear selfie holding your ID" required />
              </>
              <div className="rounded-2xl bg-warning/10 p-4 text-xs leading-relaxed text-body"><ShieldCheck className="mr-2 inline h-4 w-4 text-primary" />Your documents are stored privately and are available only to authorised administrators reviewing your application.</div>
              <Button type="submit" loading={busy} className="min-h-12 w-full rounded-2xl sm:w-auto"><Upload className="h-4 w-4" /> Submit for review</Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function FileField({ name, label, required = false }: { name: string; label: string; required?: boolean }) {
  return <div><Label htmlFor={name}>{label}</Label><input id={name} name={name} type="file" accept="image/jpeg,image/png,image/webp" required={required} className="block min-h-12 w-full rounded-xl border border-line bg-surface p-2 text-sm text-body file:mr-3 file:rounded-lg file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:font-bold file:text-primary" /><p className="mt-1 text-xs text-muted">JPG, PNG or WebP · maximum 10 MB</p></div>;
}
