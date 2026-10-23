// packages/types/src/customer.ts
export interface ICustomer {
  customerId: string;       // UUID string
  customerName: string;
  referenceId: string | null;
  programLevelId: string;   // UUID string
  customerStatusId: number;
  companyId?: string | null;       // Optional, or removed entirely to fix Bad Requests
}
