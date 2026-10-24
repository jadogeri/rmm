import { faker } from '@faker-js/faker';
import type { ODataRecord, ResourceName } from './resource-types';

type SeedRecord = { resource: ResourceName; id: string; data: ODataRecord };

export function createFakeDataset(): SeedRecord[] {
  faker.seed(Number(process.env.FAKER_SEED || 20261023));
  const companyId = faker.string.uuid();
  const company: ODataRecord = {
    companyId,
    companyName: faker.company.name(),
    lastTicketNumber: 1000,
    ownerSalt: faker.string.alphanumeric(32),
    businessType: faker.number.int({ min: 1, max: 8 }),
  };
  const records: SeedRecord[] = [{ resource: 'company', id: companyId, data: company }];
  const customerCount = Math.max(1, Math.min(100, Number.parseInt(process.env.FAKE_CUSTOMER_COUNT || '12', 10) || 12));
  const customers: ODataRecord[] = [];
  const locations: ODataRecord[] = [];
  const contacts: ODataRecord[] = [];
  const services: ODataRecord[] = [];
  const issueTypes: ODataRecord[] = [];
  const statuses: ODataRecord[] = [
    { ticketCustomStatusId: faker.string.uuid(), name: 'New', description: 'Newly received request', isDefault: true, ticketStatusCode: 1, companyId },
    { ticketCustomStatusId: faker.string.uuid(), name: 'In Progress', description: 'Work is underway', isDefault: false, ticketStatusCode: 2, companyId },
    { ticketCustomStatusId: faker.string.uuid(), name: 'Waiting on Customer', description: 'Waiting for customer information', isDefault: false, ticketStatusCode: 3, companyId },
    { ticketCustomStatusId: faker.string.uuid(), name: 'Resolved', description: 'Work is complete', isDefault: false, ticketStatusCode: 4, companyId },
  ];
  const baseDate = Date.now();

  for (let index = 0; index < customerCount; index += 1) {
    const customerId = faker.string.uuid();
    const customer: ODataRecord = {
      customerId,
      customerName: faker.company.name(),
      referenceId: 'DEMO-' + String(index + 1).padStart(4, '0'),
      programLevelId: faker.string.uuid(),
      customerStatusId: 1,
      companyId,
      customerToInvoiceId: null,
      accountingRefName: null,
      emailDomain: faker.internet.domainName(),
      isTaxable: faker.datatype.boolean(),
      leadSource: faker.helpers.arrayElement(['Referral', 'Website', 'Partner', 'Existing account']),
      phoneMain: faker.phone.number(),
      rmReferenceId: null,
      startDate: new Date(baseDate - faker.number.int({ min: 10, max: 900 }) * 86400000).toISOString(),
      company: { ...company },
    };
    customers.push(customer);

    const customerLocations: ODataRecord[] = [];
    const locationCount = faker.number.int({ min: 1, max: 3 });
    for (let locationIndex = 0; locationIndex < locationCount; locationIndex += 1) {
      const location: ODataRecord = {
        locationId: faker.string.uuid(), customerId,
        locationName: locationIndex === 0 ? 'Main office' : faker.location.city() + ' office',
        address1: faker.location.streetAddress(), address2: null,
        city: faker.location.city(), state: faker.location.state(), zip: faker.location.zipCode(),
        country: 'United States', phoneMain: faker.phone.number(), isDefault: locationIndex === 0, onDash: false,
      };
      locations.push(location);
      customerLocations.push(location);
    }

    const contactCount = faker.number.int({ min: 2, max: 4 });
    for (let contactIndex = 0; contactIndex < contactCount; contactIndex += 1) {
      contacts.push({
        contactId: faker.string.uuid(), customerId,
        firstName: faker.person.firstName(), lastName: faker.person.lastName(),
        emailAddress: faker.internet.email(), phoneMain: faker.phone.number(), phoneMobile: faker.phone.number(),
        title: faker.person.jobTitle(), locationId: faker.helpers.arrayElement(customerLocations).locationId,
        isPortalUser: faker.datatype.boolean(), isPortalAdmin: false,
        isPrimaryPointOfContact: contactIndex === 0, onDash: false,
      });
    }

    const serviceCount = faker.number.int({ min: 1, max: 3 });
    for (let serviceIndex = 0; serviceIndex < serviceCount; serviceIndex += 1) {
      const start = new Date(baseDate - faker.number.int({ min: 10, max: 700 }) * 86400000);
      services.push({
        serviceItemId: faker.string.uuid(),
        serviceItemName: faker.helpers.arrayElement(['Managed support', 'Endpoint protection', 'Cloud backup', 'Network monitoring', 'Help desk coverage']),
        serviceItemTypeCode: faker.number.int({ min: 1, max: 8 }), customerId,
        startDate: start.toISOString(), endDate: new Date(start.getTime() + 365 * 86400000).toISOString(),
        dollarLimit: faker.number.float({ min: 1000, max: 25000, fractionDigits: 2 }),
        dollarMinimum: faker.number.float({ min: 0, max: 500, fractionDigits: 2 }),
        hourLimit: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
        hourlyRate: faker.number.float({ min: 80, max: 240, fractionDigits: 2 }),
        invoiceDescription: null, invoicePriority: null, isActive: true,
        isAllowOverage: faker.datatype.boolean(), isDefault: serviceIndex === 0,
        isFullBillingPeriod: true, isInvoiceDetail: true, isLinkedWithTemplate: false,
        isTaxableDefault: false, isUseAssetCount: false, quantity: faker.number.int({ min: 1, max: 150 }),
        renewalPeriodCode: 1, slaPolicyId: null,
      });
    }
  }

  const issueNames = ['Hardware', 'Software', 'Network', 'Email', 'Account access', 'Security'];
  for (const name of issueNames) {
    const parentId = faker.string.uuid();
    issueTypes.push({ issueTypeId: parentId, name, description: name + ' support', rmReferenceId: null, companyId, parentIssueTypeId: null });
    issueTypes.push({ issueTypeId: faker.string.uuid(), name: name + ' / General', description: null, rmReferenceId: null, companyId, parentIssueTypeId: parentId });
  }

  const users: ODataRecord[] = Array.from({ length: Math.max(4, Math.min(20, customerCount)) }, () => ({
    userId: faker.string.uuid(), emailAddress: faker.internet.email(),
    firstName: faker.person.firstName(), lastName: faker.person.lastName(), status: 'Active', enabled: true,
    lastLogin: faker.date.recent({ days: 20 }).toISOString(), phoneMobile: faker.phone.number(), companyId,
    isProvisioningUser: false, isRmmIntegrationUser: false, isSuperUser: false,
  }));

  const tickets: ODataRecord[] = [];
  for (let index = 0; index < customerCount * 3; index += 1) {
    const contact = faker.helpers.arrayElement(contacts);
    const status = faker.helpers.arrayElement(statuses);
    const customerServices = services.filter((item) => item.customerId === contact.customerId);
    const createdDate = new Date(baseDate - faker.number.int({ min: 1, max: 180 }) * 86400000);
    tickets.push({
      ticketId: faker.string.uuid(), ticketNumber: 1001 + index,
      title: faker.helpers.arrayElement(['Unable to sign in', 'Printer connection issue', 'Request for software access', 'Email sync is delayed', 'Laptop setup assistance', 'VPN connection drops']),
      description: faker.lorem.sentence(), dueDate: new Date(createdDate.getTime() + faker.number.int({ min: 1, max: 7 }) * 86400000).toISOString(),
      ticketPriorityCode: faker.number.int({ min: 1, max: 4 }), ticketStatusCode: status.ticketStatusCode,
      serviceItemId: faker.helpers.arrayElement(customerServices).serviceItemId,
      contactId: contact.contactId, locationId: contact.locationId, issueTypeId: faker.helpers.arrayElement(issueTypes).issueTypeId,
      projectId: faker.datatype.boolean() ? faker.string.uuid() : null, ticketCustomStatusId: status.ticketCustomStatusId,
      createdBy: null, createdDate: createdDate.toISOString(), updatedBy: null, updatedDate: createdDate.toISOString(),
      completedDate: status.ticketStatusCode === 4 ? new Date(createdDate.getTime() + 3600000).toISOString() : null,
      timeRounded: faker.number.float({ min: 0.25, max: 8, fractionDigits: 2 }), isBillable: true, isTaxable: false, isArchived: false,
    });
  }

  const collections = [
    ['customers', customers, 'customerId'], ['locations', locations, 'locationId'],
    ['contacts', contacts, 'contactId'], ['serviceItems', services, 'serviceItemId'],
    ['issueTypes', issueTypes, 'issueTypeId'], ['ticketCustomStatuses', statuses, 'ticketCustomStatusId'],
    ['users', users, 'userId'], ['tickets', tickets, 'ticketId'],
  ] as const;
  for (const [resource, values, idField] of collections) {
    for (const data of values) records.push({ resource, id: String(data[idField]), data });
  }
  return records;
}
