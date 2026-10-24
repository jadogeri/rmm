export const resourceNames = [
  'users', 'tickets', 'company', 'contacts', 'customers',
  'issueTypes', 'locations', 'serviceItems', 'ticketCustomStatuses',
] as const;

export type ResourceName = (typeof resourceNames)[number];
export type ODataRecord = Record<string, unknown>;

export const resourceIdFields: Record<ResourceName, string> = {
  users: 'userId', tickets: 'ticketId', company: 'companyId', contacts: 'contactId',
  customers: 'customerId', issueTypes: 'issueTypeId', locations: 'locationId',
  serviceItems: 'serviceItemId', ticketCustomStatuses: 'ticketCustomStatusId',
};

const aliases: Record<string, ResourceName> = {
  user: 'users', users: 'users', ticket: 'tickets', tickets: 'tickets', company: 'company',
  contact: 'contacts', contacts: 'contacts', customer: 'customers', customers: 'customers',
  issuetype: 'issueTypes', issuetypes: 'issueTypes', location: 'locations', locations: 'locations',
  serviceitem: 'serviceItems', serviceitems: 'serviceItems',
  ticketcustomstatus: 'ticketCustomStatuses', ticketcustomstatuses: 'ticketCustomStatuses',
};

export function resolveResource(value: string): ResourceName | undefined {
  return aliases[value.replace(/[^a-z0-9]/gi, '').toLowerCase()];
}
