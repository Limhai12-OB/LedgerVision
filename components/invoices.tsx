"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  Mail,
  Mic,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import {
  Badge,
  Button,
  Empty,
  Field,
  Metric,
  Modal,
  Panel,
  TrustNote,
} from "./common";
import { Invoice, invoiceTotal, newInvoice, uid, money } from "@/lib/demo";

export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const { data } = useWorkspace();
  const subtotal = invoice.items.reduce((n, l) => n + l.quantity * l.price, 0),
    tax = invoice.items.reduce(
      (n, l) => n + (l.quantity * l.price * l.tax) / 100,
      0,
    );
  return (
    <article className="invoice-paper" id="invoice-preview">
      <div className="invoice-brand">
        <div>
          <strong>{data.business.name}</strong>
          <p>
            {data.business.address}
            <br />
            {data.business.email}
          </p>
        </div>
        <div>
          <h2>INVOICE</h2>
          <span>{invoice.id}</span>
        </div>
      </div>
      <div className="invoice-address">
        <div>
          <small>BILL TO</small>
          <h3>{invoice.customer || "Customer name"}</h3>
          <p>
            {invoice.email}
            <br />
            {invoice.telegram}
          </p>
        </div>
        <div>
          <p>
            Issued <b>{invoice.date}</b>
          </p>
          <p>
            Due <b>{invoice.due}</b>
          </p>
          <Badge>{invoice.status}</Badge>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Tax</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((l) => (
              <tr key={l.id}>
                <td>{l.item || "Item description"}</td>
                <td>{l.quantity}</td>
                <td>{money(l.price)}</td>
                <td>{l.tax}%</td>
                <td>{money(l.quantity * l.price * (1 + l.tax / 100))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="invoice-totals">
        <div>
          <span>Subtotal</span>
          <b>{money(subtotal)}</b>
        </div>
        <div>
          <span>Tax</span>
          <b>{money(tax)}</b>
        </div>
        <div>
          <span>Discount</span>
          <b>−{money(invoice.discount)}</b>
        </div>
        <div className="grand-total">
          <span>Total · {invoice.currency}</span>
          <b>{money(invoiceTotal(invoice))}</b>
        </div>
      </div>
      <div className="invoice-notes">
        <h4>Notes</h4>
        <p>{invoice.notes || "—"}</p>
        <h4>Payment instructions</h4>
        <p>{invoice.payment}</p>
      </div>
    </article>
  );
}

export function InvoiceWorkspace({ voice = false }: { voice?: boolean }) {
  const { data, setData, log, notify, go } = useWorkspace();
  const [screen, setScreen] = useState<"list" | "editor" | "voice">(
      voice ? "voice" : "list",
    ),
    [draft, setDraft] = useState<Invoice>(newInvoice()),
    [preview, setPreview] = useState<Invoice | null>(null),
    [sending, setSending] = useState<Invoice | null>(null),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All statuses"),
    [channels, setChannels] = useState({ email: true, telegram: false }),
    [sendBusy, setSendBusy] = useState(false),
    [voiceStage, setVoiceStage] = useState("idle"),
    [transcript, setTranscript] = useState(
      "Create an invoice for ABC Restaurant. Ten coffee bags at twenty dollars each, delivery fee twenty-five dollars, due next Friday.",
    ),
    [error, setError] = useState(""),
    [cancel, setCancel] = useState<Invoice | null>(null);
  const next = () =>
    Math.max(
      41,
      ...data.invoices.map((i) => Number(i.id.split("-").pop()) || 0),
    ) + 1;
  function begin() {
    const invoice = newInvoice(next());
    const due = new Date(invoice.date + "T12:00:00Z");
    due.setUTCDate(due.getUTCDate() + Number(String(data.preferences.paymentTerms).split(" ")[0] || 7));
    invoice.due = due.toISOString().slice(0, 10);
    setDraft(invoice);
    setError("");
    setScreen("editor");
  }
  function save(i: Invoice, quiet = false) {
    const old = data.invoices.find((x) => x.id === i.id);
    setData((d) => ({
      ...d,
      invoices: old
        ? d.invoices.map((x) => (x.id === i.id ? i : x))
        : [i, ...d.invoices],
    }));
    log(
      old ? "Invoice updated" : "Invoice created",
      i.id,
      old?.status || "—",
      i.status,
      "Invoice editor",
    );
    if (!quiet) notify(`${i.id} saved as a draft.`);
  }
  function valid() {
    if (
      !draft.customer.trim() ||
      !draft.items.length ||
      draft.items.some(
        (i) =>
          !i.item.trim() ||
          i.quantity <= 0 ||
          i.price < 0 ||
          i.tax < 0 ||
          i.tax > 100,
      ) ||
      invoiceTotal(draft) <= 0
    ) {
      setError(
        "Add a customer and at least one valid item. The total must be greater than zero.",
      );
      return false;
    }
    if (draft.due < draft.date) {
      setError("Due date must be on or after the invoice date.");
      return false;
    }
    setError("");
    return true;
  }
  function prepareSend(i: Invoice) {
    setSending(i);
    setChannels({ email: !!i.email, telegram: !i.email && !!i.telegram });
    setError("");
  }
  function voiceStart() {
    if (voiceStage !== "idle") return;
    setVoiceStage("Listening…");
    setTimeout(() => setVoiceStage("Understanding invoice…"), 500);
    setTimeout(() => setVoiceStage("Creating draft…"), 1000);
    setTimeout(() => {
      setDraft({
        ...newInvoice(next()),
        customer: "ABC Restaurant",
        email: "accounts@abc.example",
        telegram: "@abcrestaurant",
        due: "2026-10-02",
        items: [
          { id: uid(), item: "Coffee Bags", quantity: 10, price: 20, tax: 0 },
          { id: uid(), item: "Delivery", quantity: 1, price: 25, tax: 0 },
        ],
      });
      setScreen("editor");
      setVoiceStage("idle");
      notify("Sample voice draft created. Review every field before sending.");
    }, 1500);
  }
  function updateLine(id: string, field: string, value: string) {
    setDraft((d) => ({
      ...d,
      items: d.items.map((l) =>
        l.id === id
          ? { ...l, [field]: field === "item" ? value : Number(value) }
          : l,
      ),
    }));
  }
  const filtered = data.invoices.filter(
    (i) =>
      (i.id + " " + i.customer).toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All statuses" || i.status === filter),
  );
  return (
    <>
      {screen === "list" && (
        <>
          <div className="metrics four">
            <Metric
              label="Outstanding"
              value={money(
                data.invoices
                  .filter((i) => ["Sent", "Overdue"].includes(i.status))
                  .reduce((n, i) => n + invoiceTotal(i), 0),
              )}
              icon={FileText}
              note="Awaiting payment"
            />
            <Metric
              label="Overdue invoices"
              value={String(
                data.invoices.filter((i) => i.status === "Overdue").length,
              )}
              icon={FileText}
              tone="amber"
              note="Ready for a friendly follow-up"
            />
            <Metric
              label="Paid this month"
              value={money(
                data.invoices
                  .filter((i) => i.status === "Paid")
                  .reduce((n, i) => n + invoiceTotal(i), 0),
              )}
              icon={Check}
              tone="teal"
              note="Payments confirmed"
            />
            <Metric
              label="Drafts"
              value={String(
                data.invoices.filter((i) => i.status === "Draft").length,
              )}
              icon={FileText}
              tone="purple"
              note="Work in progress"
            />
          </div>
          <Panel
            title="Your invoices"
            subtitle="From your first draft to the final payment."
            action={
              <div className="inline-actions">
                <Button variant="outline" onClick={() => setScreen("voice")}>
                  <Mic size={16} />
                  Create with voice
                </Button>
                <Button onClick={begin}>
                  <Plus size={16} />
                  Create Invoice
                </Button>
              </div>
            }
          >
            <div className="filters">
              <label className="search-input">
                <Search size={16} />
                <input
                  placeholder="Search invoices or customers…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Invoice status"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {[
                  "All statuses",
                  "Draft",
                  "Sent",
                  "Paid",
                  "Overdue",
                  "Cancelled",
                ].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {[
                      "Invoice #",
                      "Customer",
                      "Issue date",
                      "Due date",
                      "Amount",
                      "Status",
                      "Delivery method",
                      "Actions",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id}>
                      <td>
                        <button
                          className="text-link"
                          onClick={() => setPreview(i)}
                        >
                          {i.id}
                        </button>
                      </td>
                      <td>
                        <strong>{i.customer}</strong>
                      </td>
                      <td>{i.date}</td>
                      <td>{i.due}</td>
                      <td className="amount">{money(invoiceTotal(i))}</td>
                      <td>
                        <Badge>{i.status}</Badge>
                      </td>
                      <td>{i.delivery}</td>
                      <td>
                        <div className="inline-actions">
                          <button
                            className="icon-button"
                            aria-label={"Preview " + i.id}
                            title="Preview / Download PDF"
                            onClick={() => setPreview(i)}
                          >
                            <FileText size={16} />
                          </button>
                          {!["Paid", "Cancelled"].includes(i.status) && (
                            <>
                              <button
                                className="text-link"
                                onClick={() => prepareSend(i)}
                              >
                                Send
                              </button>
                              <button
                                className="text-link"
                                onClick={() => {
                                  setDraft(i);
                                  setScreen("editor");
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="icon-button danger-text"
                                title="Cancel invoice"
                                aria-label={"Cancel " + i.id}
                                onClick={() => setCancel(i)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && (
                <Empty
                  title="No invoices found"
                  text="Create your first invoice or try another filter."
                />
              )}
            </div>
          </Panel>
        </>
      )}
      {screen === "voice" && (
        <Panel className="voice-panel">
          <button
            className="text-link"
            onClick={() => (voice ? go("Invoices") : setScreen("list"))}
          >
            <ArrowLeft size={15} />
            Back to invoices
          </button>
          <div className="voice-content">
            <span className="eyebrow">
              FROM YOUR WORDS TO A READY-TO-REVIEW DRAFT
            </span>
            <h2>Create Invoice with Voice</h2>
            <p>Tap and describe your invoice.</p>
            <button
              className={
                "microphone " + (voiceStage !== "idle" ? "listening" : "")
              }
              onClick={voiceStart}
              disabled={voiceStage !== "idle"}
              aria-label="Start voice invoice simulation"
            >
              <Mic size={42} />
            </button>
            <strong aria-live="polite">
              {voiceStage === "idle" ? "Ready when you are" : voiceStage}
            </strong>
            <Field label="Example spoken input">
              <textarea
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </Field>
            <p className="muted">
              Demo simulation: no microphone access or audio recording. The
              sample creates a $225 invoice for ABC Restaurant; edit the result
              before saving.
            </p>
          </div>
        </Panel>
      )}
      {screen === "editor" && (
        <>
          <div className="toolbar">
            <button className="text-link" onClick={() => setScreen("list")}>
              <ArrowLeft size={15} />
              Back to invoices
            </button>
            <Badge tone="blue">Draft · {draft.id}</Badge>
          </div>
          <div className="invoice-editor-layout">
            <Panel
              title="Invoice details"
              subtitle="A professional invoice, with a personal touch."
            >
              <div className="form-grid">
                {[
                  ["Customer Name", "customer", "text"],
                  ["Customer Email", "email", "email"],
                  ["Customer Telegram", "telegram", "text"],
                  ["Invoice Date", "date", "date"],
                  ["Due Date", "due", "date"],
                ].map(([label, key, type]) => (
                  <Field key={key} label={label}>
                    <input
                      type={type}
                      value={draft[key as keyof Invoice] as string}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [key]: e.target.value }))
                      }
                    />
                  </Field>
                ))}
                <Field label="Currency">
                  <select
                    value={draft.currency}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, currency: e.target.value }))
                    }
                  >
                    <option>USD</option>
                  </select>
                </Field>
              </div>
              <h3 className="section-label">Invoice items</h3>
              <div className="table-scroll">
                <table className="editable-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit price</th>
                      <th>Tax %</th>
                      <th>Total</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {draft.items.map((l, i) => (
                      <tr key={l.id}>
                        <td>
                          <input
                            aria-label={"Item " + (i + 1)}
                            value={l.item}
                            placeholder="Product or service"
                            onChange={(e) =>
                              updateLine(l.id, "item", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label={"Quantity " + (i + 1)}
                            type="number"
                            min="1"
                            value={l.quantity}
                            onChange={(e) =>
                              updateLine(l.id, "quantity", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label={"Unit price " + (i + 1)}
                            type="number"
                            min="0"
                            step="0.01"
                            value={l.price}
                            onChange={(e) =>
                              updateLine(l.id, "price", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label={"Tax " + (i + 1)}
                            type="number"
                            min="0"
                            max="100"
                            value={l.tax}
                            onChange={(e) =>
                              updateLine(l.id, "tax", e.target.value)
                            }
                          />
                        </td>
                        <td className="amount">
                          {money(l.quantity * l.price * (1 + l.tax / 100))}
                        </td>
                        <td>
                          <button
                            className="icon-button"
                            title="Remove line"
                            aria-label={"Remove line " + (i + 1)}
                            disabled={draft.items.length === 1}
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                items: d.items.filter((x) => x.id !== l.id),
                              }))
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    items: [
                      ...d.items,
                      { id: uid(), item: "", quantity: 1, price: 0, tax: 0 },
                    ],
                  }))
                }
              >
                <Plus size={15} />
                Add line
              </Button>
              <div className="form-grid top-gap">
                <Field label="Notes">
                  <textarea
                    value={draft.notes}
                    rows={3}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, notes: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Payment Instructions">
                  <textarea
                    value={draft.payment}
                    rows={3}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, payment: e.target.value }))
                    }
                  />
                </Field>
              </div>
            </Panel>
            <div className="right-stack">
              <Panel title="Invoice summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <b>
                    {money(
                      draft.items.reduce((n, l) => n + l.quantity * l.price, 0),
                    )}
                  </b>
                </div>
                <div className="summary-row">
                  <span>Tax</span>
                  <b>
                    {money(
                      draft.items.reduce(
                        (n, l) => n + (l.quantity * l.price * l.tax) / 100,
                        0,
                      ),
                    )}
                  </b>
                </div>
                <Field label="Discount (USD)">
                  <input
                    min="0"
                    type="number"
                    value={draft.discount}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        discount: Math.max(0, Number(e.target.value)),
                      }))
                    }
                  />
                </Field>
                <div className="summary-row grand-total">
                  <span>Total</span>
                  <b>{money(invoiceTotal(draft))}</b>
                </div>
                {error && (
                  <p className="error-note" role="alert">
                    {error}
                  </p>
                )}
                <div className="stack-actions">
                  <Button
                    onClick={() => {
                      if (valid()) prepareSend(draft);
                    }}
                  >
                    <Send size={16} />
                    Send Invoice
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (valid()) {
                        save({ ...draft, status: "Draft" });
                        setScreen("list");
                      }
                    }}
                  >
                    Save Draft
                  </Button>
                  <Button variant="ghost" onClick={() => setPreview(draft)}>
                    Preview Invoice
                  </Button>
                </div>
              </Panel>
              <TrustNote>
                Sending always requires your final confirmation. No real
                messages are sent in this demo.
              </TrustNote>
            </div>
          </div>
        </>
      )}
      <Modal
        title="Invoice preview"
        description="Print this invoice or save it as a PDF using your browser."
        open={!!preview}
        onClose={() => setPreview(null)}
        wide
      >
        <div className="invoice-print-area">
          {preview && <InvoicePreview invoice={preview} />}
        </div>
        <div className="form-actions no-print">
          <Button variant="outline" onClick={() => window.print()}>
            <Download size={16} />
            Download PDF
          </Button>
          <Button
            onClick={() => {
              if (preview) prepareSend(preview);
              setPreview(null);
            }}
            disabled={
              preview?.status === "Paid" || preview?.status === "Cancelled"
            }
          >
            <Send size={15} />
            Send
          </Button>
        </div>
      </Modal>
      <Modal
        title="Send invoice"
        description="Confirm recipients and delivery methods. This only simulates delivery; no email or Telegram message leaves this app."
        open={!!sending}
        onClose={() => {
          if (!sendBusy) setSending(null);
        }}
      >
        {sending && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!channels.email && !channels.telegram) {
                setError("Choose at least one delivery method.");
                return;
              }
              for (const channel of ["Email", "Telegram"] as const) {
                const enabled = channel === "Email" ? channels.email : channels.telegram;
                const integration = data.integrations.find((i) => i.name === channel);
                if (enabled && (!integration?.connected || !integration.options.includes("Send invoices"))) {
                  setError(`Connect ${channel} and enable Send invoices in Integrations first.`);
                  return;
                }
              }
              setSendBusy(true);
              setTimeout(() => {
                const i = {
                  ...sending,
                  status: "Sent" as const,
                  delivery: [
                    channels.email ? "Email" : "",
                    channels.telegram ? "Telegram" : "",
                  ]
                    .filter(Boolean)
                    .join(" + "),
                };
                save(i, true);
                log(
                  "Invoice delivery simulated",
                  i.id,
                  "Awaiting confirmation",
                  i.delivery,
                  "Demo delivery",
                );
                setSendBusy(false);
                setSending(null);
                setScreen("list");
                notify(
                  `Invoice ${i.id} sent successfully. Demo only — no message sent.`,
                );
              }, 700);
            }}
          >
            <div className="delivery-options">
              <label>
                <input
                  type="checkbox"
                  checked={channels.email}
                  onChange={(e) =>
                    setChannels((c) => ({ ...c, email: e.target.checked }))
                  }
                />
                <Mail size={21} />
                <strong>Email</strong>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={channels.telegram}
                  onChange={(e) =>
                    setChannels((c) => ({ ...c, telegram: e.target.checked }))
                  }
                />
                <Send size={21} />
                <strong>Telegram</strong>
              </label>
            </div>
            {channels.email && (
              <Field label="Recipient email">
                <input
                  type="email"
                  required
                  value={sending.email}
                  onChange={(e) =>
                    setSending({ ...sending, email: e.target.value })
                  }
                />
              </Field>
            )}
            {channels.telegram && (
              <Field label="Recipient Telegram">
                <input
                  required
                  pattern="@[A-Za-z0-9_]+"
                  placeholder="@customertelegram"
                  value={sending.telegram}
                  onChange={(e) =>
                    setSending({ ...sending, telegram: e.target.value })
                  }
                />
              </Field>
            )}
            <div className="message-preview">
              <small>MESSAGE PREVIEW</small>
              <p>Hello {sending.customer},</p>
              <p>
                Your invoice {sending.id} for{" "}
                <b>{money(invoiceTotal(sending))}</b> is ready. Payment is due
                on {sending.due}.
              </p>
              <p>
                Thank you,
                <br />
                {data.business.name}
              </p>
            </div>
            {error && (
              <p className="error-note" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                disabled={sendBusy}
                onClick={() => setSending(null)}
              >
                Cancel
              </Button>
              <Button disabled={sendBusy}>
                {sendBusy ? "Sending simulation…" : "Confirm & Send Invoice"}
                <ArrowRight size={15} />
              </Button>
            </div>
          </form>
        )}
      </Modal>
      <Modal
        title="Cancel invoice?"
        open={!!cancel}
        onClose={() => setCancel(null)}
        description="The invoice will remain visible with a Cancelled status."
      >
        <p>
          {cancel?.id} · {cancel?.customer}
        </p>
        <div className="form-actions">
          <Button variant="outline" onClick={() => setCancel(null)}>
            Keep invoice
          </Button>
          <Button
            className="danger"
            onClick={() => {
              if (!cancel) return;
              setData((d) => ({
                ...d,
                invoices: d.invoices.map((i) =>
                  i.id === cancel.id ? { ...i, status: "Cancelled" } : i,
                ),
              }));
              log(
                "Invoice cancelled",
                cancel.id,
                cancel.status,
                "Cancelled",
                "User confirmation",
              );
              setCancel(null);
              notify("Invoice cancelled.");
            }}
          >
            Confirm cancellation
          </Button>
        </div>
      </Modal>
    </>
  );
}
