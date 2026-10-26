"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import styles from "./page.module.css";

type Row = Record<string, unknown>;
type IssueOption = { id: string; label: string; children: IssueOption[] };
type Action = "create" | "view" | "update" | "delete";
type Theme = "light" | "dark";
type TicketForm = {
  email: string;
  title: string;
  description: string;
  issueTypeId: string;
  childIssueTypeId: string;
};

const actions: { id: Action; label: string; description: string; icon: string }[] = [
  { id: "create", label: "Create ticket", description: "Tell the service desk what you need help with.", icon: "+" },
  { id: "view", label: "View ticket", description: "Check the latest update on a ticket you submitted.", icon: "↗" },
  { id: "update", label: "Update ticket", description: "Add details or a reply to an existing request.", icon: "↻" },
  { id: "delete", label: "Delete ticket", description: "Request removal of a ticket you no longer need.", icon: "×" },
];

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
    id: text(item, "issueTypeId", "IssueTypeId", "id", "Id"),
    label: text(item, "name", "Name", "issueTypeName", "IssueTypeName"),
    children: records(item.children ?? item.Children).map((child) => ({
      id: text(child, "issueTypeId", "IssueTypeId", "id", "Id"),
      label: text(child, "name", "Name", "issueTypeName", "IssueTypeName"),
      children: [],
    })).filter((child) => child.id && child.label),
  })).filter((item) => item.id && item.label);
}

const emptyForm = (): TicketForm => ({ email: "", title: "", description: "", issueTypeId: "", childIssueTypeId: "" });

export default function Home() {
  const [form, setForm] = useState<TicketForm>(emptyForm);
  const [issues, setIssues] = useState<IssueOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [selectedAction, setSelectedAction] = useState<Action>("create");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("rmm-service-desk-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme: Theme = saved === "dark" || saved === "light" ? saved : preferred;
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("rmm-service-desk-theme", theme);
  }, [theme]);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/issue-types", { cache: "no-store" });
      if (!response.ok) throw new Error("The service desk could not load issue types. Check the backend connection and try again.");
      const available = issueOptions(records(await response.json()));
      if (!available.length) throw new Error("No issue types are configured. Contact your service desk.");
      setIssues(available);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load issue types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOptions(); }, [loadOptions]);

  const selectedIssue = issues.find((item) => item.id === form.issueTypeId);
  const childIssues = selectedIssue?.children ?? [];
  const resolvedIssueTypeId = childIssues.length ? form.childIssueTypeId : form.issueTypeId;

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setTicketNumber("");
    if (!resolvedIssueTypeId) {
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
          issueTypeId: resolvedIssueTypeId,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const body = result && typeof result === "object" ? result as Row : {};
        const message = Array.isArray(body.message) ? body.message.join(" ") : typeof body.message === "string" ? body.message : "Ticket could not be created. Review the details and try again.";
        throw new Error(message);
      }
      const body = result && typeof result === "object" ? result as Row : {};
      setTicketNumber(text(body, "ticketNumber", "TicketNumber"));
      setForm(emptyForm());
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Ticket could not be created.");
    } finally {
      setSubmitting(false);
    }
  }

  function chooseAction(action: Action) {
    setSelectedAction(action);
    setSubmitError("");
    setTicketNumber("");
  }

  const activeAction = actions.find((action) => action.id === selectedAction)!;

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <a className={styles.brand} href="/" aria-label="RMM service desk home">
          <span className={styles.brandMark}>R</span>
          <span>RMM <span className={styles.brandSub}>/ SERVICE DESK</span></span>
        </a>
        <div className={styles.topbarRight}>
          <span className={styles.online}><i /> Helpdesk portal</span>
          <button className={styles.themeToggle} type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={"Switch to " + (theme === "light" ? "dark" : "light") + " mode"}>
            <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
            <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
          </button>
        </div>
      </header>

      <motion.section className={styles.hero} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span /> SUPPORT REQUEST</div>
          <h1>Support that<br /><span>moves you forward.</span></h1>
          <p>Choose what you need and we’ll help get it sorted.</p>
        </div>
        <motion.div className={styles.heroBadge} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12, duration: 0.4 }}>
          <span className={styles.badgeIcon} aria-hidden="true">✓</span>
          <span><strong>Here when you need us</strong><small>One request, one place.</small></span>
        </motion.div>
      </motion.section>

      <nav className={styles.actionNav} aria-label="Ticket actions">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            type="button"
            className={styles.actionCard + (selectedAction === action.id ? " " + styles.actionSelected : "")}
            onClick={() => chooseAction(action.id)}
            aria-pressed={selectedAction === action.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index, duration: 0.3 }}
            whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
          >
            <span className={styles.actionIcon} aria-hidden="true">{action.icon}</span>
            <span className={styles.actionLabel}>{action.label}</span>
            <span className={styles.actionDescription}>{action.description}</span>
          </motion.button>
        ))}
      </nav>

      <div className={styles.contentGrid}>
        <AnimatePresence mode="wait" initial={false}>
          {selectedAction === "create" ? (
            <motion.section key="create" className={styles.formCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <div className={styles.cardHeader}>
                <div><span className={styles.kicker}>NEW TICKET</span><h2>What can we help with?</h2><p>Share the details we need to route your request.</p></div>
                <span className={styles.cardCount}>01 <i>/ 01</i></span>
              </div>
              <AnimatePresence mode="wait">
                {ticketNumber && <motion.div className={styles.successNotice} role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <span className={styles.successIcon}>✓</span><span><strong>Ticket created</strong><small>{"Ticket number " + ticketNumber + ". Keep it for reference."}</small></span>
                  <button type="button" className={styles.dismiss} onClick={() => setTicketNumber("")} aria-label="Dismiss success message">×</button>
                </motion.div>}
              </AnimatePresence>
              {loadError && <div className={styles.errorNotice} role="alert"><strong>Couldn’t load issue types</strong><span>{loadError}</span><button type="button" onClick={() => void loadOptions()}>Try again</button></div>}
              {submitError && <div className={styles.errorNotice} role="alert"><strong>Ticket not sent</strong><span>{submitError}</span></div>}

              <form onSubmit={submitTicket} className={styles.form}>
                <section className={styles.formSection}>
                  <div className={styles.sectionHeading}><span>1</span><div><h3>Your request</h3><p>Use the email address listed for your service-desk contact.</p></div></div>
                  <label className={styles.fieldFull}><span>Email address <b>*</b></span><input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" /></label>
                  <label className={styles.fieldFull}><span>Ticket title <b>*</b></span><input required maxLength={160} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. I can’t connect to the office network" /></label>
                  <label className={styles.fieldFull}><span>Description <b>*</b></span><textarea required rows={5} maxLength={4000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What happened? Include useful steps or error messages." /></label>
                </section>

                <section className={styles.formSection}>
                  <div className={styles.sectionHeading}><span>2</span><div><h3>Issue type</h3><p>Choose a category and, when available, one sub-issue.</p></div></div>
                  <label className={styles.fieldFull}><span>Issue type <b>*</b></span><select required value={form.issueTypeId} onChange={(event) => setForm((current) => ({ ...current, issueTypeId: event.target.value, childIssueTypeId: "" }))} disabled={loading || !!loadError}>
                    <option value="">Select an issue type</option>{issues.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select></label>
                  {childIssues.length > 0 && <label className={styles.fieldFull}><span>Sub-issue <b>*</b></span><select required value={form.childIssueTypeId} onChange={(event) => setForm((current) => ({ ...current, childIssueTypeId: event.target.value }))}><option value="">Select one sub-issue</option>{childIssues.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><em>Select one child issue; only that choice is attached to the ticket.</em></label>}
                </section>

                <div className={styles.formFooter}>
                  <span className={styles.secureNote}><span aria-hidden="true">⌑</span> Ticket number is a reference, not an access credential.</span>
                  <button className={styles.submitButton} type="submit" disabled={loading || submitting || !!loadError}>
                    {submitting ? <><i className={styles.spinner} /> Sending…</> : <>Create ticket <span aria-hidden="true">→</span></>}
                  </button>
                </div>
              </form>
            </motion.section>
          ) : (
            <motion.section key={selectedAction} className={styles.lockedCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
              <span className={styles.kicker}>OWNERSHIP CHECK REQUIRED</span>
              <div className={styles.lockIcon} aria-hidden="true">⌑</div>
              <h2>{activeAction.label} is not enabled yet</h2>
              <p>{activeAction.description} Before this portal can access a saved ticket, it needs to verify that you own it. Email plus a ticket number alone is not enough to protect ticket details.</p>
              <div className={styles.verificationNote}><strong>What’s needed</strong><span>A one-time verification code or a code sent to your email before viewing or changing a ticket.</span></div>
              <button type="button" className={styles.backButton} onClick={() => chooseAction("create")}>Back to create a ticket <span aria-hidden="true">→</span></button>
            </motion.section>
          )}
        </AnimatePresence>

        <aside className={styles.sidePanel}>
          <div className={styles.sideCard}>
            <span className={styles.sideEyebrow}>GOOD TO KNOW</span><h3>A little context goes a long way.</h3><p>Add the exact error message and what you were doing when it happened. It helps us find a fix sooner.</p>
            <div className={styles.tipLine}><span>01</span><div><strong>Use your work email</strong><small>The service desk matches it to your contact record.</small></div></div>
            <div className={styles.tipLine}><span>02</span><div><strong>Be specific</strong><small>What’s affected, and when did it start?</small></div></div>
            <div className={styles.tipLine}><span>03</span><div><strong>Keep your ticket number</strong><small>It helps us identify your request; it doesn’t grant access.</small></div></div>
          </div>
          <div className={styles.statusCard}><span className={styles.statusPulse} /><div><strong>{loading ? "Connecting to service desk" : loadError ? "Connection needs attention" : "Service desk connected"}</strong><small>{loading ? "Loading issue types" : loadError ? "Issue types unavailable" : "Issue types are up to date"}</small></div></div>
        </aside>
      </div>

      <footer className={styles.footer}><span>RMM SERVICE DESK</span><span>Here to keep your work moving.</span></footer>
    </main>
  );
}
