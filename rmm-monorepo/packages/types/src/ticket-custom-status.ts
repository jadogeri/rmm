// packages/types/src/ticket.ts
export interface TicketCustomStatus {
  TicketCustomStatusId: string;
  Name: string;
  Description: string;
  IsDefault: boolean;
  TicketStatusCode: number;
  CompanyId: string;
}
