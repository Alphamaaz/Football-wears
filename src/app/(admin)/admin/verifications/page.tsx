"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2, Eye, IdCard, ShieldCheck, XCircle } from "lucide-react";
import { getMe } from "@/lib/auth";
import { getVerificationApplications, openVerificationDocument, reviewVerification, type VerificationApplication } from "@/lib/admin";
import { ApiRequestError, tokenStore } from "@/lib/api";
import { Alert, Button } from "@/components/ui";

type Filter = "pending" | "approved" | "rejected" | "all";

export default function AdminVerificationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<VerificationApplication[] | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await getVerificationApplications();
    setApplications(data.applications);
  }

  useEffect(() => {
    if (!tokenStore.get()) { router.replace("/login"); return; }
    Promise.all([getMe(), getVerificationApplications()]).then(([me, data]) => {
      if (!me.user.roles.includes("admin")) router.replace("/");
      else setApplications(data.applications);
    }).catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    if (!applications) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") load().catch(() => {});
    }, 15000);
    return () => window.clearInterval(interval);
  }, [applications]);

  const allRows = useMemo(() => (applications || []).flatMap((user) => {
    const identity = user.sellerProfile.identityVerification;
    const business = user.sellerProfile.businessVerification;
    return [
      identity && identity.status !== "not_submitted" ? { user, type: "identity" as const, verification: identity } : null,
      business && business.status !== "not_submitted" ? { user, type: "business" as const, verification: business } : null,
    ].filter(Boolean) as Array<{ user: VerificationApplication; type: "identity" | "business"; verification: NonNullable<typeof identity> | NonNullable<typeof business> }>;
  }), [applications]);
  const rows = useMemo(() => allRows.filter((row) => filter === "all" || row.verification.status === filter), [allRows, filter]);

  async function decide(userId: string, type: "identity" | "business", action: "approve" | "reject") {
    const reason = action === "reject" ? window.prompt("Explain what the seller must correct:")?.trim() : undefined;
    if (action === "reject" && !reason) return;
    const key = `${userId}-${type}`;
    setBusy(key); setError(null);
    try { await reviewVerification(userId, type, action, reason); await load(); }
    catch (caught) { setError(caught instanceof ApiRequestError ? caught.message : "Could not update verification."); }
    finally { setBusy(null); }
  }

  if (!applications) return <main className="mx-auto max-w-6xl px-4 py-20"><div className="h-44 animate-pulse rounded-3xl bg-sunken" /></main>;

  return <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
    <Link href="/admin" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to admin dashboard</Link>
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-black text-ink sm:text-3xl">Verification requests</h1><p className="mt-1 max-w-2xl text-sm text-muted">Review the submitted evidence before granting identity or business badges. Seller approval alone never grants either badge.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-warning/15 px-3 py-1.5 text-xs font-bold text-ink"><ShieldCheck className="h-4 w-4 text-primary" /> {allRows.filter((row) => row.verification.status === "pending").length} awaiting review</span></header>
    {error && <Alert kind="error" className="mt-5">{error}</Alert>}
    <div className="mt-6 flex gap-2 overflow-x-auto border-b border-line pb-3">{(["pending", "approved", "rejected", "all"] as Filter[]).map((value) => <button key={value} type="button" onClick={() => setFilter(value)} className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-sm font-bold capitalize ${filter === value ? "bg-primary text-white" : "bg-surface text-muted hover:text-ink"}`}>{value}</button>)}</div>
    <section className="mt-5 space-y-4">
      {rows.map(({ user, type, verification }) => {
        const identity = type === "identity" ? user.sellerProfile.identityVerification : undefined;
        const business = type === "business" ? user.sellerProfile.businessVerification : undefined;
        const key = `${user._id}-${type}`;
        const documents = type === "identity" ? [["Front of ID", identity?.documentFront], ["Back of ID", identity?.documentBack], ["Selfie", identity?.selfie]] : [["Registration document", business?.registrationDocument], ["Address evidence", business?.addressDocument]];
        return <article key={key} className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`grid h-9 w-9 place-items-center rounded-xl ${type === "identity" ? "bg-success-soft text-success" : "bg-accent/20 text-ink"}`}>{type === "identity" ? <IdCard className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}</span><h2 className="text-lg font-black text-ink">{user.fullName}</h2><span className="rounded-full bg-sunken px-2.5 py-1 text-xs font-bold capitalize text-body">{type} · {verification.status.replace("_", " ")}</span></div><p className="mt-2 break-all text-sm text-muted">{user.email} · {user.contactNumber}</p>
            <dl className="mt-5 grid gap-3 rounded-2xl bg-sunken/50 p-4 sm:grid-cols-2">{type === "identity" ? <><Detail label="Legal name" value={identity?.legalName} /><Detail label="Document type" value={identity?.idType?.replaceAll("_", " ")} /><Detail label="Document number" value={identity?.idNumber} /></> : <><Detail label="Legal business name" value={business?.legalBusinessName} /><Detail label="Business type" value={business?.businessType?.replaceAll("_", " ")} /><Detail label="Registration number" value={business?.registrationNumber} /></>}</dl>
            <div className="mt-4 flex flex-wrap gap-2">{documents.filter(([, path]) => path).map(([label, documentPath]) => <button key={label} type="button" onClick={() => openVerificationDocument(documentPath!)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-ink hover:border-primary hover:text-primary"><Eye className="h-4 w-4" /> {label}</button>)}</div>
          </div>
          {verification.status === "pending" && <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col"><Button onClick={() => decide(user._id, type, "approve")} loading={busy === key} disabled={busy !== null} className="min-h-11 rounded-xl"><CheckCircle2 className="h-4 w-4" /> Approve {type}</Button><Button variant="outline" onClick={() => decide(user._id, type, "reject")} disabled={busy !== null} className="min-h-11 rounded-xl text-danger"><XCircle className="h-4 w-4" /> Request correction</Button></div>}
          </div>
        </article>;
      })}
      {rows.length === 0 && <div className="rounded-3xl border border-line bg-surface p-12 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-success" /><h2 className="mt-3 font-black text-ink">No verification requests here</h2><p className="mt-1 text-sm text-muted">New submissions will appear in this queue immediately.</p></div>}
    </section>
  </main>;
}

function Detail({ label, value }: { label: string; value?: string }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt><dd className="mt-1 break-words text-sm font-bold capitalize text-ink">{value || "Not provided"}</dd></div>; }
