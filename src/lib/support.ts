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

const STATIC_TICKETS: SupportTicket[] = [
  {
    _id: "t-101",
    reference: "FW-TCK-8921",
    name: "Alex Cole",
    email: "alex@footballwears.shop",
    category: "general",
    subject: "Inquiry on 2004 Arsenal Invincibles shirt restock",
    message: "Will you be restocking Size L for the Thierry Henry 14 Invincibles jersey?",
    status: "resolved",
    adminResponse: "Yes, Size L is now back in stock with the official felt Premier League champions badges!",
    createdAt: "2025-01-26T10:00:00.000Z",
    updatedAt: "2025-01-26T12:00:00.000Z",
  },
];

export async function createSupportTicket(payload: {
  name: string;
  email: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
}) {
  const ref = `FW-TCK-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket: SupportTicket = {
    _id: `tick-${Date.now()}`,
    reference: ref,
    ...payload,
    status: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  STATIC_TICKETS.unshift(ticket);
  return {
    message: "Support request received. We will respond within 2 hours.",
    ticket: {
      _id: ticket._id,
      reference: ticket.reference,
      status: ticket.status,
      createdAt: ticket.createdAt,
    },
  };
}

export async function listMySupportTickets() {
  return { tickets: STATIC_TICKETS };
}

export async function listSupportTickets(params?: {
  status?: SupportTicketStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
}) {
  return { tickets: STATIC_TICKETS, total: STATIC_TICKETS.length, page: 1, pages: 1 };
}

export async function updateSupportTicket(ticketId: string, payload: {
  status: SupportTicketStatus;
  adminResponse?: string;
  internalNote?: string;
}) {
  const ticket = STATIC_TICKETS.find((t) => t._id === ticketId) || STATIC_TICKETS[0];
  Object.assign(ticket, payload);
  return { message: "Ticket updated", ticket };
}
