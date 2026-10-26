"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Clock, IdCard, ShieldCheck, Upload } from "lucide-react";
import { getMe } from "@/lib/auth";
import { ApiRequestError, tokenStore } from "@/lib/api";
import { submitVerification } from "@/lib/verification";
import type { User } from "@/lib/types";
import { Alert, Button, Input, Label } from "@/components/ui";

type VerificationType = "identity" | "business";

const statusCopy = {
  not_submitted: { label: "Not submitted", className: "bg-sunken text-muted" },
  pending: { label: "Under review", className: "bg-warning/15 text-ink" },
  approved: { label: "Verified", className: "bg-success-soft text-success" },
  rejected: { label: "Needs attention", className: "bg-danger-soft text-danger" },
};

export default function SellerVerificationPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState<VerificationType>("identity");
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
    form.set("type", active);
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
  const business = user.sellerProfile?.businessVerification?.status || "not_submitted";
  const currentStatus = active === "identity" ? identity : business;
  const rejectionReason = active === "identity" ? user.sellerProfile?.identityVerification?.rejectionReason : user.sellerProfile?.businessVerification?.rejectionReason;
  const locked = currentStatus === "pending" || currentStatus === "approved";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/seller" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to seller dashboard</Link>
      <header className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl"><h1 className="text-2xl font-black text-ink sm:text-3xl">Seller verification</h1><p className="mt-2 text-sm leading-relaxed text-body">Selling approval and verification are separate. Your store can sell immediately, while badges appear only after PriceAm reviews the matching evidence.</p></div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-xs font-bold text-success"><CheckCircle2 className="h-4 w-4" /> Approved seller</span>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-sunken/60 p-4"><strong className="text-sm text-ink">Approved seller</strong><p className="mt-1 text-xs text-muted">Can create listings after platform moderation.</p></div>
          <div className="rounded-2xl bg-sunken/60 p-4"><strong className="text-sm text-ink">Identity verified</strong><p className="mt-1 text-xs text-muted">Government ID and selfie matched by an administrator.</p></div>
          <div className="rounded-2xl bg-sunken/60 p-4"><strong className="text-sm text-ink">Business verified</strong><p className="mt-1 text-xs text-muted">Registration evidence reviewed for a legal business.</p></div>
        </div>
      </header>

      <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-surface shadow-soft">
        <div className="grid grid-cols-2 border-b border-line p-2">
          {([['identity', IdCard, 'Identity'], ['business', Building2, 'Business']] as const).map(([value, Icon, label]) => (
            <button key={value} type="button" onClick={() => { setActive(value); setError(null); setNotice(null); }} className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold ${active === value ? 'bg-primary text-white' : 'text-muted hover:bg-sunken hover:text-ink'}`}><Icon className="h-4 w-4" /> {label}</button>
          ))}
        </div>
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black text-ink">{active === 'identity' ? 'Identity verification' : 'Business verification'}</h2><p className="mt-1 text-sm text-muted">{active === 'identity' ? 'Submit a valid Nigerian identity document and a clear selfie.' : 'Submit official business registration evidence. Identity verification is recommended first.'}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusCopy[currentStatus].className}`}>{statusCopy[currentStatus].label}</span></div>
          {rejectionReason && <Alert kind="error" className="mt-4">Review note: {rejectionReason}</Alert>}
          {notice && <Alert kind="success" className="mt-4">{notice}</Alert>}
          {error && <Alert kind="error" className="mt-4">{error}</Alert>}
          {locked ? (
            <div className="mt-6 rounded-2xl border border-line bg-sunken/50 p-6 text-center"><Clock className={`mx-auto h-8 w-8 ${currentStatus === 'approved' ? 'text-success' : 'text-primary'}`} /><h3 className="mt-3 font-black text-ink">{currentStatus === 'approved' ? 'Verification complete' : 'Application under review'}</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted">{currentStatus === 'approved' ? 'The corresponding badge is now shown publicly.' : 'An administrator will review your evidence. The status updates here as soon as a decision is made.'}</p></div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {active === 'identity' ? <>
                <div><Label htmlFor="legalName">Full legal name</Label><Input id="legalName" name="legalName" required placeholder="Exactly as shown on your ID" className="text-base" /></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="idType">Identity document</Label><select id="idType" name="idType" required className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink"><option value="nin">NIN slip/card</option><option value="drivers_licence">Driver’s licence</option><option value="passport">International passport</option><option value="voters_card">Voter’s card</option></select></div><div><Label htmlFor="idNumber">Document number</Label><Input id="idNumber" name="idNumber" required minLength={5} maxLength={40} autoComplete="off" className="text-base" /></div></div>
                <div className="grid gap-4 sm:grid-cols-2"><FileField name="identityDocumentFront" label="Front of ID" required /><FileField name="identityDocumentBack" label="Back of ID (if applicable)" /></div><FileField name="selfie" label="Clear selfie holding your ID" required />
              </> : <>
                <div><Label htmlFor="legalBusinessName">Registered business name</Label><Input id="legalBusinessName" name="legalBusinessName" required className="text-base" /></div>
                <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="registrationNumber">CAC/registration number</Label><Input id="registrationNumber" name="registrationNumber" required autoComplete="off" className="text-base" /></div><div><Label htmlFor="businessType">Business type</Label><select id="businessType" name="businessType" required className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink"><option value="registered_business_name">Registered business name</option><option value="limited_company">Limited company</option><option value="ngo">NGO</option><option value="other">Other registered entity</option></select></div></div>
                <FileField name="registrationDocument" label="CAC or registration document" required /><FileField name="addressDocument" label="Business address evidence (optional)" />
              </>}
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
