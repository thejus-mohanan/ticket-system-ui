export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'ongoing' | 'closed';
  priority: 'low' | 'medium' | 'high';
  customer: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

export type TicketStatus = 'new' | 'ongoing' | 'closed';