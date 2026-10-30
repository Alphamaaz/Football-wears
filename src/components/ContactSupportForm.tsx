'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Mail, Send, TicketCheck } from 'lucide-react';
import { getMe } from '@/lib/auth';
import { ApiRequestError, tokenStore } from '@/lib/api';
import {
  createSupportTicket,
  listMySupportTickets,
  type SupportTicket,
  type SupportTicketCategory,
} from '@/lib/support';
import { Alert, Button, Input, Label } from '@/components/ui';

const SUPPORT_EMAIL = 'support@priceam.ng';
const categories: Array<{ value: SupportTicketCategory; label: string }> = [
  { value: 'general', label: 'General question' },
  { value: 'account', label: 'Account access' },
  { value: 'listing', label: 'Listing or selling' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'technical', label: 'Technical problem' },
  { value: 'feedback', label: 'Feedback or suggestion' },
];

const statusLabel: Record<SupportTicket['status'], string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function ContactSupportForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenStore.get()) return;
    Promise.all([getMe(), listMySupportTickets()])
      .then(([account, history]) => {
        setSignedIn(true);
        setName(account.user.fullName);
        setEmail(account.user.email);
        setTickets(history.tickets);
      })
      .catch(() => setSignedIn(false));
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await createSupportTicket({ name, email, category, subject, message });
      setSuccess(`Request ${result.ticket.reference} was submitted. Keep this reference for follow-up.`);
      setSubject('');
      setMessage('');
      if (signedIn) {
        const history = await listMySupportTickets();
        setTickets(history.tickets);
      }
    } catch (caught) {
      setError(caught instanceof ApiRequestError ? caught.message : 'We could not submit your request. Please email support instead.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)]" aria-label="Customer support">
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><Send className="h-5 w-5" /></span>
          <div><h2 className="text-xl font-black text-ink">Send a support request</h2><p className="mt-1 text-sm leading-relaxed text-muted">Describe what you need help with. You will receive a reference number after submission.</p></div>
        </div>
        {error && <Alert kind="error" className="mt-5">{error}</Alert>}
        {success && <Alert kind="success" className="mt-5">{success}</Alert>}
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="support-name">Full name</Label><Input id="support-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="name" disabled={signedIn} className="text-base" /></div>
          <div><Label htmlFor="support-email">Email address</Label><Input id="support-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} autoComplete="email" disabled={signedIn} className="text-base" /></div>
          <div><Label htmlFor="support-category">What do you need help with?</Label><select id="support-category" value={category} onChange={(event) => setCategory(event.target.value as SupportTicketCategory)} className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15">{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          <div><Label htmlFor="support-subject">Subject</Label><Input id="support-subject" value={subject} onChange={(event) => setSubject(event.target.value)} required minLength={5} maxLength={120} placeholder="Short summary of your question" className="text-base" /></div>
          <div className="sm:col-span-2"><Label htmlFor="support-message">How can we help?</Label><textarea id="support-message" value={message} onChange={(event) => setMessage(event.target.value)} required minLength={20} maxLength={3000} rows={6} placeholder="Include relevant listing links, order references, and the steps that led to the problem." className="w-full resize-y rounded-2xl border border-line bg-surface px-4 py-3 text-base leading-relaxed text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15" /><div className="mt-1 flex justify-between gap-3 text-xs text-muted"><span>Do not include passwords, OTPs, PINs, or card details.</span><span>{message.length}/3000</span></div></div>
          <div className="sm:col-span-2"><Button type="submit" loading={submitting} className="min-h-12 rounded-xl px-6">Submit support request</Button></div>
        </form>
      </div>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6"><Mail className="h-5 w-5 text-primary" /><h2 className="mt-3 text-lg font-black text-ink">Prefer email?</h2><p className="mt-1 text-sm leading-relaxed text-muted">Email the same support team directly. This is not a live-chat service.</p><a href={`mailto:${SUPPORT_EMAIL}?subject=Price%20Am%20support`} className="mt-4 inline-flex min-h-11 items-center font-bold text-primary underline decoration-primary/40 underline-offset-4">{SUPPORT_EMAIL}</a></div>
        {signedIn && <div className="rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6"><div className="flex items-center gap-2"><TicketCheck className="h-5 w-5 text-primary" /><h2 className="text-lg font-black text-ink">Your recent requests</h2></div>{tickets.length === 0 ? <p className="mt-4 text-sm text-muted">You have not submitted a support request yet.</p> : <div className="mt-4 space-y-3">{tickets.slice(0, 5).map((ticket) => <article key={ticket._id} className="rounded-2xl border border-line bg-sunken/40 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-primary">{ticket.reference}</strong><span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold text-body">{statusLabel[ticket.status]}</span></div><h3 className="mt-2 text-sm font-bold text-ink">{ticket.subject}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted"><Clock3 className="h-3.5 w-3.5" /> {new Date(ticket.createdAt).toLocaleString('en-NG')}</p>{ticket.adminResponse && <div className="mt-3 rounded-xl bg-success-soft p-3 text-xs leading-relaxed text-success"><span className="mb-1 flex items-center gap-1 font-bold"><CheckCircle2 className="h-3.5 w-3.5" /> Support response</span>{ticket.adminResponse}</div>}</article>)}</div>}</div>}
      </aside>
    </section>
  );
}
