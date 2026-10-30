import { api } from './api';

export type SupportTicketStatus = 'new' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketCategory = 'general' | 'account' | 'listing' | 'safety' | 'technical' | 'feedback';

export interface SupportTicket {
  _id: string;
  reference: string;
  requester?: { _id: string; fullName: string; email: string; roles?: string[]; activeRole?: string };
  name: string;
  email: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  adminResponse?: string;
  internalNote?: string;
  handledBy?: { _id: string; fullName: string; email: string };
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createSupportTicket(payload: {
  name: string;
  email: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
}) {
  return api<{ message: string; ticket: Pick<SupportTicket, '_id' | 'reference' | 'status' | 'createdAt'> }>('/support/tickets', {
    method: 'POST',
    body: payload,
  });
}

export async function listMySupportTickets() {
  return api<{ tickets: SupportTicket[] }>('/support/tickets/mine');
}

export async function listSupportTickets(params?: { status?: SupportTicketStatus | 'all'; search?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString();
  return api<{ tickets: SupportTicket[]; total: number; page: number; pages: number }>(`/support/tickets${suffix ? `?${suffix}` : ''}`);
}

export async function updateSupportTicket(ticketId: string, payload: {
  status: SupportTicketStatus;
  adminResponse?: string;
  internalNote?: string;
}) {
  return api<{ message: string; ticket: SupportTicket }>(`/support/tickets/${ticketId}`, {
    method: 'PATCH',
    body: payload,
  });
}
