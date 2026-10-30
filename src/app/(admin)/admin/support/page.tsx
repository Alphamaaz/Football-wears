'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Inbox, RefreshCw, Search } from 'lucide-react';
import { getMe } from '@/lib/auth';
import { ApiRequestError, tokenStore } from '@/lib/api';
import {
  listSupportTickets,
  updateSupportTicket,
  type SupportTicket,
  type SupportTicketStatus,
} from '@/lib/support';
import { Alert, Button, Input, Label } from '@/components/ui';

const statuses: Array<{ value: SupportTicketStatus | 'all'; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'all', label: 'All' },
];

function TicketCard({ ticket, onSaved }: { ticket: SupportTicket; onSaved: () => Promise<void> }) {
  const [status, setStatus] = useState<SupportTicketStatus>(ticket.status);
  const [response, setResponse] = useState(ticket.adminResponse || '');
  const [note, setNote] = useState(ticket.internalNote || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateSupportTicket(ticket._id, { status, adminResponse: response, internalNote: note });
      await onSaved();
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : 'Could not update this support request.');
    } finally {
      setSaving(false);
    }
  }

  return <article className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
    <div className="flex flex-col gap-5 xl:flex-row xl:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-black text-primary">{ticket.reference}</span><span className="rounded-full bg-sunken px-2.5 py-1 text-xs font-bold capitalize text-body">{ticket.status.replace('_', ' ')}</span><span className="text-xs text-muted">{ticket.category.replace('_', ' ')}</span></div>
        <h2 className="mt-3 break-words text-lg font-black text-ink">{ticket.subject}</h2>
        <p className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-sunken/50 p-4 text-sm leading-relaxed text-body">{ticket.message}</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><span className="text-xs font-bold uppercase text-muted">Requester</span><p className="font-bold text-ink">{ticket.name}</p><a href={`mailto:${ticket.email}?subject=Re%3A%20${encodeURIComponent(ticket.reference)}%20${encodeURIComponent(ticket.subject)}`} className="break-all text-xs font-semibold text-primary underline underline-offset-2">{ticket.email}</a></div><div><span className="text-xs font-bold uppercase text-muted">Submitted</span><p className="text-body">{new Date(ticket.createdAt).toLocaleString('en-NG')}</p>{ticket.handledBy && <p className="mt-1 text-xs text-muted">Last handled by {ticket.handledBy.fullName}</p>}</div></div>
      </div>
      <div className="w-full space-y-4 rounded-2xl border border-line p-4 xl:w-[25rem]">
        {error && <Alert kind="error">{error}</Alert>}
        <div><Label htmlFor={`status-${ticket._id}`}>Status</Label><select id={`status-${ticket._id}`} value={status} onChange={(event) => setStatus(event.target.value as SupportTicketStatus)} className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15">{statuses.filter((item) => item.value !== 'all').map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
        <div><Label htmlFor={`response-${ticket._id}`}>Response visible to the user</Label><textarea id={`response-${ticket._id}`} value={response} onChange={(event) => setResponse(event.target.value)} maxLength={3000} rows={4} placeholder="Explain the outcome or next step." className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-base leading-relaxed text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15" /><p className="mt-1 text-xs text-muted">Required before marking a request resolved.</p></div>
        <div><Label htmlFor={`note-${ticket._id}`}>Internal note</Label><textarea id={`note-${ticket._id}`} value={note} onChange={(event) => setNote(event.target.value)} maxLength={3000} rows={3} placeholder="Private context for administrators." className="w-full resize-y rounded-xl border border-line bg-surface px-3 py-2.5 text-base leading-relaxed text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15" /></div>
        <Button onClick={save} loading={saving} full className="min-h-11 rounded-xl">Save support update</Button>
      </div>
    </div>
  </article>;
}

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [status, setStatus] = useState<SupportTicketStatus | 'all'>('new');
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await listSupportTickets({ status, search: searchTerm || undefined, limit: 100 });
    setTickets(data.tickets);
  }, [searchTerm, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchTerm(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!tokenStore.get()) { router.replace('/login'); return; }
    getMe().then((account) => {
      if (!account.user.roles.includes('admin')) { router.replace('/'); return; }
      return load();
    }).catch(() => router.replace('/login'));
  }, [load, router]);

  useEffect(() => {
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') load().catch(() => {}); }, 15000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    setError(null);
    try { await load(); } catch (caught) { setError(caught instanceof ApiRequestError ? caught.message : 'Could not load support requests.'); } finally { setRefreshing(false); }
  }

  return <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
    <Link href="/admin" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to admin dashboard</Link>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><header><h1 className="text-2xl font-black text-ink sm:text-3xl">Support requests</h1><p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">Review questions submitted from the Contact page, record private notes, update their status, and provide a response users can see.</p></header><Button variant="outline" onClick={refresh} loading={refreshing} className="rounded-xl"><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
    {error && <Alert kind="error" className="mt-5">{error}</Alert>}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{statuses.map((item) => <button key={item.value} type="button" onClick={() => setStatus(item.value)} className={`min-h-11 whitespace-nowrap rounded-xl px-3 text-sm font-bold ${status === item.value ? 'bg-primary text-white' : 'border border-line bg-surface text-muted'}`}>{item.label}</button>)}</div><div className="relative sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference, name or subject" className="pl-10 text-base" /></div></div>
    {tickets === null ? <div className="mt-5 h-52 animate-pulse rounded-3xl bg-sunken" /> : <section className="mt-5 space-y-4">{tickets.map((ticket) => <TicketCard key={ticket._id} ticket={ticket} onSaved={load} />)}{tickets.length === 0 && <div className="rounded-3xl border border-line bg-surface p-12 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-success" /><h2 className="mt-3 font-black text-ink">No support requests in this view</h2><p className="mt-1 text-sm text-muted">New Contact page submissions will appear here automatically.</p></div>}</section>}
    <p className="mt-6 flex items-center gap-2 text-xs text-muted"><Inbox className="h-4 w-4" /> This queue refreshes every 15 seconds while the page is open.</p>
  </main>;
}
