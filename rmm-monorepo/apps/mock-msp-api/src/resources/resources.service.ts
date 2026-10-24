import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { resolveResource, type ODataRecord, type ResourceName } from './resource-types';

@Injectable()
export class ResourcesService {
  constructor(private readonly database: DatabaseService) {}

  list(resourceText: string, query: Record<string, unknown>, origin: string) {
    const resource = this.getResource(resourceText);
    const rows = this.database.list(resource);
    const filtered = this.applyFilter(rows, this.stringParam(query, '$filter'));
    const ordered = this.applyOrder(filtered, this.stringParam(query, '$orderby'));
    const skip = this.integerParam(query, '$skip', 0, 0, 10000);
    const top = this.integerParam(query, '$top', 100, 0, 1000);
    let values = ordered.slice(skip, skip + top);
    const select = this.stringParam(query, '$select');
    if (select) values = values.map((row) => this.select(row, select));
    if (resource === 'company') {
      const company = values[0];
      if (!company) throw new NotFoundException('Company not found.');
      return company;
    }
    const result: Record<string, unknown> = {
      '@odata.context': origin + '/odata/$metadata#' + this.contextName(resource),
      value: values,
    };
    if (this.stringParam(query, '$count')?.toLowerCase() === 'true') result['@odata.count'] = filtered.length;
    return result;
  }

  getOne(resourceText: string, id: string) {
    const resource = this.getResource(resourceText);
    const record = this.database.get(resource, id);
    if (!record) throw new NotFoundException('Record not found.');
    return record;
  }

  createTicket(input: ODataRecord) {
    const payload = this.pickFields(input, ['title', 'description', 'dueDate', 'serviceItemId', 'contactId', 'locationId', 'issueTypeId', 'projectId', 'ticketPriorityCode']);
    const title = this.asString(payload.title);
    const serviceItemId = this.asString(payload.serviceItemId);
    if (!title || !serviceItemId) throw new BadRequestException('title and serviceItemId are required.');
    this.requireReference('serviceItems', serviceItemId, 'serviceItemId');
    const contactId = this.optionalString(payload.contactId);
    const locationId = this.optionalString(payload.locationId);
    const issueTypeId = this.optionalString(payload.issueTypeId);
    if (contactId) this.requireReference('contacts', contactId, 'contactId');
    if (locationId) this.requireReference('locations', locationId, 'locationId');
    if (issueTypeId) this.requireReference('issueTypes', issueTypeId, 'issueTypeId');
    const dueDate = this.optionalString(payload.dueDate);
    if (dueDate && Number.isNaN(Date.parse(dueDate))) throw new BadRequestException('dueDate must be a valid date-time string.');

    const company = this.database.list('company')[0];
    const ticketNumber = Number(company?.lastTicketNumber || 0) + 1;
    if (company) {
      company.lastTicketNumber = ticketNumber;
      this.database.save('company', String(company.companyId), company);
    }
    const status = this.database.list('ticketCustomStatuses').find((item) => item.isDefault === true);
    const now = new Date().toISOString();
    const ticket: ODataRecord = {
      ticketId: randomUUID(), ticketNumber, title,
      description: this.optionalString(payload.description), dueDate, serviceItemId,
      contactId, locationId, issueTypeId, projectId: this.optionalString(payload.projectId),
      ticketPriorityCode: this.integerValue(payload.ticketPriorityCode, 1, 1, 4),
      ticketStatusCode: Number(status?.ticketStatusCode || 1), ticketCustomStatusId: status?.ticketCustomStatusId || null,
      createdBy: null, createdDate: now, updatedBy: null, updatedDate: now, completedDate: null,
      timeRounded: 0, isBillable: true, isTaxable: false, isArchived: false,
    };
    this.database.save('tickets', String(ticket.ticketId), ticket);
    return ticket;
  }

  updateTicket(id: string, input: ODataRecord) {
    const ticket = this.database.get('tickets', id);
    if (!ticket) throw new NotFoundException('Ticket not found.');
    const patch = this.pickFields(input, ['title', 'description', 'dueDate', 'serviceItemId', 'contactId', 'locationId', 'issueTypeId', 'projectId', 'ticketPriorityCode', 'ticketStatusCode', 'ticketCustomStatusId', 'isArchived', 'isBillable', 'isTaxable']);
    Object.assign(ticket, patch, { updatedDate: new Date().toISOString() });
    this.database.save('tickets', id, ticket);
    return ticket;
  }

  deleteTicket(id: string) {
    if (!this.database.delete('tickets', id)) throw new NotFoundException('Ticket not found.');
  }

  private getResource(value: string): ResourceName {
    const resource = resolveResource(value);
    if (!resource) throw new NotFoundException('This resource is not available in the mock MSP API.');
    return resource;
  }

  private requireReference(resource: ResourceName, id: string, field: string) {
    if (!this.database.get(resource, id)) throw new BadRequestException(field + ' does not reference an existing record.');
  }

  private stringParam(query: Record<string, unknown>, name: string): string | undefined {
    const value = query[name];
    return typeof value === 'string' && value.length ? value : undefined;
  }

  private integerParam(query: Record<string, unknown>, name: string, fallback: number, min: number, max: number) {
    const value = this.stringParam(query, name);
    if (value === undefined) return fallback;
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new BadRequestException(name + ' must be between ' + min + ' and ' + max + '.');
    return parsed;
  }

  private applyFilter(rows: ODataRecord[], filter?: string) {
    if (!filter) return rows;
    const match = /^\s*([A-Za-z][A-Za-z0-9]*)\s+(eq|ne)\s+(?:'((?:[^']|'')*)'|"([^"]*)"|([^\s]+))\s*$/i.exec(filter);
    if (!match) throw new BadRequestException('Supported $filter format is field eq value or field ne value.');
    const field = match[1];
    const operator = match[2].toLowerCase();
    const expected = (match[3] ?? match[4] ?? match[5] ?? '').replace(/''/g, "'");
    return rows.filter((row) => {
      const key = Object.keys(row).find((item) => item.toLowerCase() === field.toLowerCase());
      const equal = key !== undefined && String(row[key] ?? '') === expected;
      return operator === 'eq' ? equal : !equal;
    });
  }

  private applyOrder(rows: ODataRecord[], order?: string) {
    if (!order) return rows;
    const [field, direction = 'asc'] = order.trim().split(/\s+/);
    if (!field || !['asc', 'desc'].includes(direction.toLowerCase())) throw new BadRequestException('$orderby must be a field optionally followed by asc or desc.');
    return [...rows].sort((left, right) => {
      const leftKey = Object.keys(left).find((key) => key.toLowerCase() === field.toLowerCase());
      const rightKey = Object.keys(right).find((key) => key.toLowerCase() === field.toLowerCase());
      const a = leftKey ? left[leftKey] : undefined;
      const b = rightKey ? right[rightKey] : undefined;
      const comparison = a === b ? 0 : a == null ? -1 : b == null ? 1 : typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
      return direction.toLowerCase() === 'desc' ? -comparison : comparison;
    });
  }

  private select(row: ODataRecord, fields: string) {
    const selected: ODataRecord = {};
    for (const field of fields.split(',').map((item) => item.trim()).filter(Boolean)) {
      const key = Object.keys(row).find((name) => name.toLowerCase() === field.toLowerCase());
      if (key) selected[key] = row[key];
    }
    return selected;
  }

  private pickFields(input: ODataRecord, fields: string[]): ODataRecord {
    const output: ODataRecord = {};
    const inputEntries = Object.entries(input || {});
    for (const field of fields) {
      const found = inputEntries.find(([key]) => key.toLowerCase() === field.toLowerCase());
      if (found) output[field] = found[1];
    }
    return output;
  }

  private asString(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }
  private optionalString(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
  private integerValue(value: unknown, fallback: number, min: number, max: number) {
    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max ? number : fallback;
  }

  private contextName(resource: ResourceName) {
    const names: Record<ResourceName, string> = {
      users: 'Users', tickets: 'Tickets', company: 'Company', contacts: 'Contacts', customers: 'Customers',
      issueTypes: 'IssueTypes', locations: 'Locations', serviceItems: 'ServiceItems', ticketCustomStatuses: 'TicketCustomStatuses',
    };
    return names[resource];
  }
}
