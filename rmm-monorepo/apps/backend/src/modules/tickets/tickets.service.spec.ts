import { TicketsService } from './tickets.service';
import { API_ENDPOINTS } from '@repo/constants';

describe('TicketsService public ticket creation', () => {
  const contact = { contactId: 'contact-id', locationId: 'location-id' };
  const location = { locationId: 'location-id', customer: { customerId: 'customer-id' } };
  const serviceItem = { serviceItemId: 'service-item-id' };
  const issueType = { issueTypeId: 'leaf-issue-id', children: { length: 0 } };

  function setup(options?: { issueChildren?: number; contactMatches?: Array<{ contactId: string }> }) {
    const execute = jest.fn().mockResolvedValue(options?.contactMatches ?? [{ contactId: contact.contactId }]);
    const contactRepo = {
      getEntityManager: () => ({ getConnection: () => ({ execute }) }),
      findOne: jest.fn().mockResolvedValue(contact),
    };
    const locationRepo = { findOne: jest.fn().mockResolvedValue(location) };
    const issueTypeRepo = {
      findOne: jest.fn().mockResolvedValue({ ...issueType, children: { length: options?.issueChildren ?? 0 } }),
    };
    const serviceItemRepo = { findOne: jest.fn().mockResolvedValue(serviceItem) };
    const helpdeskClient = { post: jest.fn().mockResolvedValue({ TicketNumber: 1042 }) };
    const service = new TicketsService(
      helpdeskClient as any,
      contactRepo as any,
      locationRepo as any,
      issueTypeRepo as any,
      serviceItemRepo as any,
    );
    return { service, execute, helpdeskClient };
  }

  it('resolves routing fields server-side and returns the MSP ticket number', async () => {
    const { service, execute, helpdeskClient } = setup();
    const result = await service.createPortalTicket({
      email: ' Requester@Example.test ',
      title: ' VPN is unavailable ',
      description: ' The VPN client reports a timeout. ',
      issueTypeId: 'leaf-issue-id',
    });

    expect(execute).toHaveBeenCalledWith(expect.stringContaining('lower("EmailAddress") = ?'), ['requester@example.test']);
    expect(helpdeskClient.post).toHaveBeenCalledWith(API_ENDPOINTS.TICKETS.BASE, expect.objectContaining({
      Title: 'VPN is unavailable',
      Description: 'The VPN client reports a timeout.',
      ContactId: 'contact-id',
      LocationId: 'location-id',
      ServiceItemId: 'service-item-id',
      IssueTypeId: 'leaf-issue-id',
      ProjectId: null,
    }));
    expect(result).toEqual({ TicketNumber: 1042 });
  });

  it('rejects a parent issue that has child issue types', async () => {
    const { service, helpdeskClient } = setup({ issueChildren: 1 });
    await expect(service.createPortalTicket({
      email: 'requester@example.test',
      title: 'VPN is unavailable',
      description: 'The VPN client reports a timeout.',
      issueTypeId: 'parent-issue-id',
    })).rejects.toThrow('Select one child issue');
    expect(helpdeskClient.post).not.toHaveBeenCalled();
  });

  it('does not create a ticket when the email does not identify exactly one contact', async () => {
    const { service, helpdeskClient } = setup({ contactMatches: [] });
    await expect(service.createPortalTicket({
      email: 'unknown@example.test',
      title: 'Cannot sign in',
      description: 'The login page returns an error.',
      issueTypeId: 'leaf-issue-id',
    })).rejects.toThrow('could not be matched');
    expect(helpdeskClient.post).not.toHaveBeenCalled();
  });
});
