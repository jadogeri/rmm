"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import styles from "./page.module.css";

type Row = Record<string, unknown>;
type IssueOption = { id: string; label: string; children: IssueOption[] };
type TicketForm = {
  email: string;
  title: string;
  description: string;
  issueTypeId: string;
  childIssueTypeId: string;
};

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

function issueOptions(items: Row[]): IssueOption[] {
  return items.map((item) => ({
    id: text(item, "issueTypeId", "IssueTypeId", "id"),
    label: text(item, "name", "Name", "issueTypeName", "IssueTypeName"),
    children: records(item.children ?? item.Children).map((child) => ({
      id: text(child, "issueTypeId", "IssueTypeId", "id"),
      label: text(child, "name", "Name", "issueTypeName", "IssueTypeName"),
      children: [],
    })).filter((child) => child.id && child.label),
  })).filter((item) => item.id && item.label);
}

const initialForm = (): TicketForm => ({
  email: "",
  title: "",
  description: "",
  issueTypeId: "",
  childIssueTypeId: "",
});

export default function Home() {
  const [form, setForm] = useState<TicketForm>(initialForm);
  const [issues, setIssues] = useState<IssueOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [createdTicketNumber, setCreatedTicketNumber] = useState("");
  const [ticketSent, setTicketSent] = useState(false);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/issue-types", { cache: "no-store" });
      if (!response.ok) throw new Error("The service desk could not load issue types. Check the backend connection and try again.");
      setIssues(issueOptions(records(await response.json())));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load issue types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOptions(); }, [loadOptions]);

  const selectedIssue = issues.find((item) => item.id === form.issueTypeId);
  const childIssues = selectedIssue?.children ?? [];
  const selectedIssueTypeId = childIssues.length > 0 ? form.childIssueTypeId : form.issueTypeId;

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setCreatedTicketNumber("");
    setTicketSent(false);
    if (!selectedIssueTypeId) {
      setSubmitError(childIssues.length ? "Select one sub-issue to continue." : "Select an issue type to continue.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/tickets/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          title: form.title.trim(),
          description: form.description.trim(),
          issueTypeId: selectedIssueTypeId,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const body = result && typeof result === "object" ? result as Row : {};
        const message = Array.isArray(body.message) ? body.message.join(" ") : typeof body.message === "string" ? body.message : "Ticket could not be created. Review the details and try again.";
        throw new Error(message);
      }
      const body = result && typeof result === "object" ? result as Row : {};
      setCreatedTicketNumber(text(body, "ticketNumber", "TicketNumber"));
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
            <div><span className={styles.sectionKicker}>NEW TICKET</span><h2>What do you need help with?</h2><p>Only the information needed to route your request.</p></div>
            <div className={styles.cardNumber}>01 <span>/ 01</span></div>
          </div>

          <AnimatePresence mode="wait">
            {ticketSent && <motion.div className={styles.successNotice} role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <span className={styles.successIcon}>✓</span>
              <span><strong>Ticket created</strong><small>{createdTicketNumber ? "Ticket number " + createdTicketNumber + ". Keep it for reference." : "Your request was sent to the service desk."}</small></span>
              <button type="button" className={styles.dismissButton} onClick={() => { setCreatedTicketNumber(""); setTicketSent(false); }} aria-label="Dismiss success message">×</button>
            </motion.div>}
          </AnimatePresence>
          {loadError && <div className={styles.errorNotice} role="alert"><strong>Couldn’t load issue types.</strong><span>{loadError}</span><button type="button" onClick={() => void loadOptions()}>Try again</button></div>}
          {submitError && <div className={styles.errorNotice} role="alert"><strong>Ticket not sent</strong><span>{submitError}</span></div>}

          <form onSubmit={submitTicket} className={styles.form}>
            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}><span className={styles.sectionIndex}>1</span><div><h3>Your request</h3><p>Use the email address already listed for your service-desk contact.</p></div></div>
              <label className={styles.fieldFull}><span>Email address <b>*</b></span><input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" /></label>
              <label className={styles.fieldFull}><span>Ticket title <b>*</b></span><input required maxLength={160} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. I can’t connect to the office network" /></label>
              <label className={styles.fieldFull}><span>Description <b>*</b></span><textarea required rows={5} maxLength={4000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What happened? Include useful steps or error messages." /></label>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formSectionTitle}><span className={styles.sectionIndex}>2</span><div><h3>Issue type</h3><p>Choose one category. If it has sub-issues, choose one child.</p></div></div>
              <label className={styles.fieldFull}><span>Issue type <b>*</b></span><select required value={form.issueTypeId} onChange={(event) => setForm((current) => ({ ...current, issueTypeId: event.target.value, childIssueTypeId: "" }))} disabled={loading || !!loadError}><option value="">Select an issue type</option>{issues.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              {childIssues.length > 0 && <label className={styles.fieldFull}><span>Sub-issue <b>*</b></span><select required value={form.childIssueTypeId} onChange={(event) => setForm((current) => ({ ...current, childIssueTypeId: event.target.value }))}><option value="">Select one sub-issue</option>{childIssues.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
              {childIssues.length > 0 && <p className={styles.helperText}>Select one sub-issue; only that child issue will be attached to the ticket.</p>}
            </div>

            <div className={styles.formFooter}>
              <span className={styles.secureNote}><svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="8" width="12" height="9" rx="2" /><path d="M6.5 8V6a3.5 3.5 0 0 1 7 0v2" /></svg> Ticket number is a reference, not an access credential.</span>
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
            <div className={styles.tipLine}><span>01</span><div><strong>Use your work email</strong><small>The service desk matches it to your contact record.</small></div></div>
            <div className={styles.tipLine}><span>02</span><div><strong>Be specific</strong><small>What’s affected, and when did it start?</small></div></div>
            <div className={styles.tipLine}><span>03</span><div><strong>Choose one sub-issue</strong><small>Pick one child issue when the category offers them.</small></div></div>
          </div>
          <div className={styles.statusCard}><span className={styles.statusPulse} /><div><strong>{loading ? "Connecting to service desk" : loadError ? "Connection needs attention" : "Service desk connected"}</strong><small>{loading ? "Loading issue types" : loadError ? "Issue types unavailable" : "Issue types are up to date"}</small></div></div>
          <p className={styles.sideFoot}>Self-service viewing and status changes for existing tickets are not enabled until ownership verification is added.</p>
        </aside>
      </div>
      <footer className={styles.footer}><span>RMM SERVICE DESK</span><span>Here to keep your work moving.</span></footer>
    </main>
  );
}
