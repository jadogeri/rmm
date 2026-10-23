export interface ITicket {
  ticketId?: string;
  title: string;
  description?: string;
  dueDate: string;
  ticketPriorityCode?: number;
  serviceItemId: string;
  contactId: string;
  locationId: string;
  issueTypeId: string;
  projectId: string;
}

// Helper types for your payloads
export type CreateTicketPayload = Omit<ITicket, 'ticketId'>;
export type UpdateTicketPayload = Partial<CreateTicketPayload>;


