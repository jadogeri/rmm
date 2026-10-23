"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import styles from "./page.module.css";

type Row = Record<string, unknown>;
type Choice = { id: string; label: string; code?: number };
type TicketForm = {
  title: string;
  customerId: string;
  contactId: string;
  locationId: string;
  serviceItemId: string;
  issueTypeId: string;
  projectId: string;
  dueDate: string;
  priorityCode: string;
  description: string;
};

function localDate(daysAhead = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function records(value: unknown): Row[] {
  if (Array.isArray(value)) return value.filter((item): item is Row => !!item && typeof item === "object");
  if (!value || typeof value !== "object") return [];
  const source = value as Row;
  if (Array.isArray(source.value)) return records(source.value);
  if (Array.isArray(source.data)) return records(source.data);
  if (Array.isArray(source.items)) return records(source.items);
  return [];
}

function text(row: Row, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" || typeof value === "number") return String(value);
  }
  return "";
}

function flattenIssues(items: Row[], output: Choice[] = []): Choice[] {
  for (const item of items) {
    const id = text(item, "issueTypeId", "IssueTypeId", "id");
    const label = text(item, "name", "Name", "issueTypeName", "IssueTypeName");
    if (id && label) output.push({ id, label });
    const children = records(item.children ?? item.Children);
    if (children.length) flattenIssues(children, output);
  }
  return output;
}

function priorityChoices(items: Row[]): Choice[] {
  return items.map((item) => {
    const code = text(item, "ticketPriorityCode", "TicketPriorityCode", "priorityCode", "PriorityCode", "code", "Code", "value");
    const label = text(item, "ticketPriorityName", "TicketPriorityName", "name", "Name", "label", "Label", "description", "Description") || (code ? "Priority " + code : "");
    return { id: code || label, label, code: code && Number.isFinite(Number(code)) ? Number(code) : undefined };
  }).filter((item) => item.id && item.label);
}

const initialForm = (): TicketForm => ({
  title: "",
  customerId: "",
  contactId: "",
  locationId: "",
  serviceItemId: "",
  issueTypeId: "",
  projectId: "",
  dueDate: localDate(),
  priorityCode: "",
  description: "",
});

export default function Home() {
  const [form, setForm] = useState<TicketForm>(initialForm);
  const [customers, setCustomers] = useState<Row[]>([]);
  const [contacts, setContacts] = useState<Row[]>([]);
  const [locations, setLocations] = useState<Row[]>([]);
  const [services, setServices] = useState<Row[]>([]);
  const [issues, setIssues] = useState<Choice[]>([]);
  const [priorities, setPriorities] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [createdTicket, setCreatedTicket] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const paths = ["customers", "contacts", "locations", "service-items", "issue-types", "ticket-priorities"];
      const responses = await Promise.all(paths.map((path) => fetch("/api/" + path, { cache: "no-store" })));
      const failed = responses.find((response) => !response.ok);
      if (failed) throw new Error("The service desk returned an error while loading form options. Check the backend connection and try again.");
      const payloads: unknown[] = await Promise.all(responses.map((response) => response.json()));
      setCustomers(records(payloads[0]));
      setContacts(records(payloads[1]));
      setLocations(records(payloads[2]));
      setServices(records(payloads[3]));
      setIssues(flattenIssues(records(payloads[4])));
      setPriorities(priorityChoices(records(payloads[5])));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load ticket options.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOptions(); }, [loadOptions]);

  const selectedCustomer = customers.find((item) => text(item, "customerId", "CustomerId", "id") === form.customerId);
  const customerCompany = selectedCustomer ? text(selectedCustomer, "companyId", "CompanyId") : "";
  const customerOptions = customers.map((item) => ({ id: text(item, "customerId", "CustomerId", "id"), label: text(item, "customerName", "CustomerName", "name", "Name") })).filter((item) => item.id && item.label);
  const contactOptions = useMemo(() => contacts.filter((item) => !customerCompany || text(item, "companyId", "CompanyId") === customerCompany).map((item) => ({
    id: text(item, "contactId", "ContactId", "id"),
    label: [text(item, "firstName", "FirstName"), text(item, "lastName", "LastName")].filter(Boolean).join(" ") || text(item, "emailAddress", "EmailAddress", "name", "Name"),
  })).filter((item) => item.id && item.label), [contacts, customerCompany]);
  const locationOptions = useMemo(() => locations.filter((item) => !form.customerId || text(item, "customerId", "CustomerId") === form.customerId).map((item) => ({
    id: text(item, "locationId", "LocationId", "id"),
    label: text(item, "locationName", "LocationName", "name", "Name"),
  })).filter((item) => item.id && item.label), [locations, form.customerId]);
  const serviceOptions = useMemo(() => services.filter((item) => !form.customerId || text(item, "customerId", "CustomerId") === form.customerId).map((item) => ({
    id: text(item, "serviceItemId", "ServiceItemId", "id"),
    label: text(item, "serviceItemName", "ServiceItemName", "name", "Name"),
  })).filter((item) => item.id && item.label), [services, form.customerId]);

  function update<K extends keyof TicketForm>(key: K, value: TicketForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setCreatedTicket("");
    setTicketSent(false);
    const priority = priorities.find((item) => item.id === form.priorityCode);
    const payload = {
      title: form.title.trim(),
      dueDate: new Date(form.dueDate + "T23:59:59").toISOString(),
      serviceItemId: form.serviceItemId,
      contactId: form.contactId,
      locationId: form.locationId,
      issueTypeId: form.issueTypeId,
      projectId: form.projectId.trim(),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      ...(priority?.code !== undefined ? { ticketPriorityCode: priority.code } : {}),
    };
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const body = result && typeof result === "object" ? result as Row : {};
        const message = Array.isArray(body.message) ? body.message.join(" ") : typeof body.message === "string" ? body.message : "Ticket could not be created. Review the details and try again.";
        throw new Error(message);
      }
      const body = result && typeof result === "object" ? result as Row : {};
      setCreatedTicket(text(body, "ticketId", "TicketId", "id", "ticketNumber", "TicketNumber"));
      setTicketSent(true);
      setForm(initialForm());
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ticket could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/" aria-label="RMM service desk home">
          <span className={styles.brandMark}>R</span>
          <span>RMM<span className={styles.brandSub}> / SERVICE DESK</span></span>
        </a>
        <div className={styles.topbarMeta}><span className={styles.onlineDot} /> Helpdesk portal</div>
      </header>

      <section className={styles.hero}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className={styles.eyebrow}><span /> SUPPORT REQUEST</div>
          <h1>Let’s get it<br /><span>sorted.</span></h1>
          <p className={styles.heroText}>Tell us what’s happening. We’ll get the right people on it.</p>
        </motion.div>
        <motion.div className={styles.heroAside} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12, duration: 0.45 }}>
          <div className={styles.asideIcon}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 20 7v5.4c0 4.4-3.1 7-8 8.7-4.9-1.7-8-4.3-8-8.7V7l8-3.5Z" /><path d="m8.8 12.2 2.1 2.1 4.5-4.7" /></svg></div>
          <div><strong>One request, one place.</strong><span>Share the details and we’ll take it from here.</span></div>
        </motion.div>
      </section>

      <div className={styles.contentGrid}>
        <motion.section className={styles.formCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.45 }}>
          <div className={styles.cardHeader}>
            <div><span className={styles.sectionKicker}>NEW TICKET</span><h2>What do you need help with?</h2><p>Fields marked with <b>*</b> are required.</p></div>
            <div className={styles.cardNumber}>01 <span>/ 01</span></div>
          </div>

          <AnimatePresence mode="wait">
            {ticketSent && <motion.div className={styles.successNotice} role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <span className={styles.successIcon}>✓</span><span><strong>Ticket created</strong><small>{createdTicket ? "Reference " + createdTicket : "Your request was sent to the service desk."}</small></span>
              <button type="button" className={styles.dismissButton} onClick={() => { setCreatedTicket(""); setTicketSent(false); }} aria-label="Dismiss success message">×</button>
            </motion.div>}
          </AnimatePresence>
          {loadError && <div className={styles.errorNotice} role="alert"><strong>Couldn’t load ticket options.</strong><span>{loadError}</span><button type="button" onClick={() => void loadOptions()}>Try again</button></div>}
          {submitError && <div className={styles.errorNotice} role="alert"><strong>Ticket not sent</strong><span>{submitError}</span></div>}

          <form onSubmit={submitTicket} className={styles.form}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}><span className={styles.sectionIndex}>1</span><div><h3>Request details</h3><p>A clear title helps us route your request.</p></div></div>
              <label className={styles.fieldFull}><span>Ticket title <b>*</b></span><input required maxLength={160} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. I can’t connect to the office network" /></label>
              <label className={styles.fieldFull}><span>Description <em>Optional</em></span><textarea rows={4} maxLength={4000} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="What happened? Include any useful steps or error messages." /></label>
              <div className={styles.fieldGrid}>
                <label><span>Customer <b>*</b></span><select required value={form.customerId} onChange={(event) => setForm((current) => ({ ...current, customerId: event.target.value, contactId: "", locationId: "", serviceItemId: "" }))} disabled={loading || !!loadError}><option value="">Select a customer</option>{customerOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <label><span>Contact <b>*</b></span><select required value={form.contactId} onChange={(event) => update("contactId", event.target.value)} disabled={loading || !form.customerId}><option value="">Select a contact</option>{contactOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <label><span>Location <b>*</b></span><select required value={form.locationId} onChange={(event) => update("locationId", event.target.value)} disabled={loading || !form.customerId}><option value="">Select a location</option>{locationOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <label><span>Service item <b>*</b></span><select required value={form.serviceItemId} onChange={(event) => update("serviceItemId", event.target.value)} disabled={loading || !form.customerId}><option value="">Select a service</option>{serviceOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              </div>
              {form.customerId && !loading && (contactOptions.length === 0 || locationOptions.length === 0 || serviceOptions.length === 0) && <p className={styles.helperText}>Some customer options are missing from the synced service desk data. Refresh the backend data before submitting.</p>}
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}><span className={styles.sectionIndex}>2</span><div><h3>Routing & timing</h3><p>Help the team send this to the right place.</p></div></div>
              <div className={styles.fieldGrid}>
                <label><span>Issue type <b>*</b></span><select required value={form.issueTypeId} onChange={(event) => update("issueTypeId", event.target.value)} disabled={loading || !!loadError}><option value="">Select an issue type</option>{issues.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
                <label><span>Due date <b>*</b></span><input type="date" required min={localDate(0)} value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} /></label>
                <label><span>Project ID <b>*</b></span><input required value={form.projectId} onChange={(event) => update("projectId", event.target.value)} placeholder="Enter the project ID" /></label>
                <label><span>Priority <em>Optional</em></span><select value={form.priorityCode} onChange={(event) => update("priorityCode", event.target.value)} disabled={loading}><option value="">Use service desk default</option>{priorities.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              </div>
              <p className={styles.helperText}>The current backend requires a Project ID but does not expose a project list endpoint.</p>
            </div>

            <div className={styles.formFooter}>
              <span className={styles.secureNote}><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="8" width="12" height="9" rx="2" /><path d="M6.5 8V6a3.5 3.5 0 0 1 7 0v2" /></svg> Your request is sent securely to the service desk.</span>
              <button className={styles.submitButton} type="submit" disabled={loading || submitting || !!loadError}>
                {submitting ? <><span className={styles.spinner} /> Sending…</> : <>Create ticket <span aria-hidden="true">↗</span></>}
              </button>
            </div>
          </form>
        </motion.section>

        <aside className={styles.sidePanel}>
          <div className={styles.sideCard}>
            <span className={styles.sideEyebrow}>GOOD TO KNOW</span>
            <h3>A little context goes a long way.</h3>
            <p>Add the exact error message or what you were doing when it happened. It helps us get to a fix sooner.</p>
            <div className={styles.tipLine}><span>01</span><div><strong>Be specific</strong><small>What’s affected, and when did it start?</small></div></div>
            <div className={styles.tipLine}><span>02</span><div><strong>Add the details</strong><small>Include error messages or steps to reproduce.</small></div></div>
            <div className={styles.tipLine}><span>03</span><div><strong>Pick the right contact</strong><small>We’ll know who to follow up with.</small></div></div>
          </div>
          <div className={styles.statusCard}><span className={styles.statusPulse} /><div><strong>{loading ? "Connecting to service desk" : loadError ? "Connection needs attention" : "Service desk connected"}</strong><small>{loading ? "Loading request options" : loadError ? "Ticket options unavailable" : "Request options are up to date"}</small></div></div>
          <p className={styles.sideFoot}>Need help with an existing ticket? Reach out to your service desk contact.</p>
        </aside>
      </div>
      <footer className={styles.footer}><span>RMM SERVICE DESK</span><span>Here to keep your work moving.</span></footer>
    </main>
  );
}
