"use client";
import React, { useRef, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Leaf,
  Link2,
  Plus,
  Repeat,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
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
  TextLink,
  TrustNote,
} from "./common";
import { ExpenseChart, FinanceChart } from "./charts";
import {
  Transaction,
  Job,
  Review,
  uid,
  money,
  transactions as initial,
  trends,
  invoiceTotal,
} from "@/lib/demo";

export function TransactionTable({
  rows,
  compact = false,
  onOpen,
}: {
  rows: Transaction[];
  compact?: boolean;
  onOpen?: (t: Transaction) => void;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Merchant / Description</th>
            <th>Date</th>
            <th>Category</th>
            {!compact && (
              <>
                <th>Type</th>
                <th>Source</th>
              </>
            )}
            <th className="align-right">Amount</th>
            {!compact && <th>Reconciliation</th>}
            <th>AI status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((t, i) => (
            <tr key={t.id}>
              <td>
                <button
                  className="merchant"
                  onClick={() => onOpen?.(t)}
                  aria-label={"View " + t.merchant}
                >
                  <span className={"merchant-icon tone-" + (i % 5)}>
                    {t.type === "Income" ? (
                      <ArrowDownLeft size={17} />
                    ) : t.category === "Ingredients" ? (
                      <Leaf size={17} />
                    ) : (
                      <CreditCard size={17} />
                    )}
                  </span>
                  <span>
                    <strong>{t.merchant}</strong>
                    <small>{t.description}</small>
                  </span>
                </button>
              </td>
              <td>
                {new Date(t.date + "T12:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td>
                <span className="category-pill">{t.category}</span>
              </td>
              {!compact && (
                <>
                  <td>{t.type}</td>
                  <td>
                    <span className="source-text">{t.source}</span>
                  </td>
                </>
              )}
              <td
                className={
                  "align-right amount " +
                  (t.type === "Income" ? "positive" : "")
                }
              >
                {t.type === "Income" ? "+" : "−"}
                {money(t.amount)}
              </td>
              {!compact && (
                <td>
                  <Badge>{t.reconciliation}</Badge>
                </td>
              )}
              <td>
                <Badge>{t.ai}</Badge>
              </td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => onOpen?.(t)}
                  title="View transaction"
                  aria-label={"Details for " + t.merchant}
                >
                  <ChevronRight size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <Empty
          title="No matching transactions"
          text="Adjust your filters or add a new transaction."
        />
      )}
    </div>
  );
}

export function TransactionDialog({
  transaction,
  onClose,
}: {
  transaction: Transaction | "new" | null;
  onClose: () => void;
}) {
  const { data, saveTx, setData, log, go } = useWorkspace();
  const [editing, setEditing] = useState(false),
    [deleting, setDeleting] = useState(false),
    [attachment, setAttachment] = useState("");
  const t = transaction && transaction !== "new" ? transaction : null;
  function close() {
    setEditing(false);
    setDeleting(false);
    setAttachment("");
    onClose();
  }
  return (
    <Modal
      open={!!transaction}
      onClose={close}
      title={
        transaction === "new"
          ? "Add transaction"
          : editing
            ? "Edit transaction"
            : "Transaction details"
      }
      wide
      description="Source data is preserved. Any changes you confirm appear in audit history."
    >
      {editing || transaction === "new" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            saveTx({
              id: t?.id || uid(),
              date: String(f.get("date")),
              merchant: String(f.get("merchant")),
              description: String(f.get("description")),
              category: String(f.get("category")),
              type: f.get("type") as Transaction["type"],
              amount: Number(f.get("amount")),
              source: t?.source || "Manual",
              reconciliation: t?.reconciliation || "Unmatched",
              ai: "Verified",
              receipt: attachment || t?.receipt,
            });
            close();
          }}
        >
          <div className="form-grid">
            <Field label="Merchant">
              <input name="merchant" defaultValue={t?.merchant} required />
            </Field>
            <Field label="Amount">
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={t?.amount}
                required
              />
            </Field>
            <Field label="Date">
              <input
                name="date"
                type="date"
                defaultValue={t?.date || "2026-09-28"}
                required
              />
            </Field>
            <Field label="Category">
              <select name="category" defaultValue={t?.category}>
                {data.categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select name="type" defaultValue={t?.type || "Expense"}>
                <option>Expense</option>
                <option>Income</option>
              </select>
            </Field>
            <Field label="Description">
              <input
                name="description"
                defaultValue={t?.description}
                required
              />
            </Field>
          </div>
          <Field label="Attach receipt">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files?.[0])
                  setAttachment(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </Field>
          {attachment && <Badge>Receipt attached locally</Badge>}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button>Save transaction</Button>
          </div>
        </form>
      ) : (
        t && (
          <>
            <div className="detail-hero">
              <span className="icon-box teal">
                <CreditCard size={24} />
              </span>
              <div>
                <h2>{t.merchant}</h2>
                <p>{t.description}</p>
              </div>
              <strong>{money(t.amount)}</strong>
            </div>
            <div className="detail-grid">
              {[
                ["Date", t.date],
                ["Category", t.category],
                ["Type", t.type],
                ["Source", t.source],
                ["Reconciliation", t.reconciliation],
                ["AI status", t.ai],
              ].map(([l, v]) => (
                <div key={l}>
                  <small>{l}</small>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            {t.receipt && (
              <a
                className="text-link"
                href={t.receipt}
                target="_blank"
                rel="noreferrer"
              >
                View attached receipt <Link2 size={14} />
              </a>
            )}
            <details className="source-box">
              <summary>Original imported data</summary>
              <pre>{t.original || "Created manually in this workspace."}</pre>
            </details>
            <div className="notice blue">
              <Sparkles size={17} />
              <div>
                <strong>AI suggestions</strong>
                <p>
                  {data.reviews
                    .filter((r) => r.txId === t.id)
                    .map(
                      (r) => `${r.field}: ${r.suggestion} (${r.confidence}%)`,
                    )
                    .join(" · ") || "No pending suggestions for this record."}
                </p>
              </div>
            </div>
            <h3 className="section-label">Recent audit history</h3>
            {data.audit
              .filter((a) => a.record === t.merchant)
              .slice(0, 3)
              .map((a) => (
                <p className="muted" key={a.id}>
                  {a.action} · {a.original} → {a.value}
                </p>
              ))}
            <div className="form-actions">
              <Button
                variant="ghost"
                className="danger-text"
                onClick={() => setDeleting(true)}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  close();
                  go("Audit History");
                }}
              >
                Audit history
              </Button>
              <Button onClick={() => setEditing(true)}>Edit transaction</Button>
            </div>
            {deleting && (
              <div className="confirm-inline">
                <p>
                  Delete this transaction from the demo ledger? Its audit
                  history will remain.
                </p>
                <Button variant="outline" onClick={() => setDeleting(false)}>
                  Keep transaction
                </Button>
                <Button
                  className="danger"
                  onClick={() => {
                    setData((d) => ({
                      ...d,
                      transactions: d.transactions.filter((x) => x.id !== t.id),
                      reviews: d.reviews.filter((r) => r.txId !== t.id),
                    }));
                    log(
                      "Transaction deleted",
                      t.merchant,
                      money(t.amount),
                      "Deleted",
                      t.source,
                    );
                    close();
                  }}
                >
                  Confirm delete
                </Button>
              </div>
            )}
          </>
        )
      )}
    </Modal>
  );
}

export function Dashboard() {
  const { data, go, period } = useWorkspace();
  const [selected, setSelected] = useState<Transaction | null>(null),
    [range, setRange] = useState("6 months");
  const month = period.startsWith("August")
    ? trends[4]
    : period.startsWith("July")
      ? trends[3]
      : trends[5];
  const history = trends.slice(0, trends.indexOf(month) + 1);
  const previous = trends[trends.indexOf(month) - 1];
  const delta = (type: string) =>
    data.transactions
      .filter((t) => t.type === type)
      .reduce((n, t) => n + t.amount, 0) -
    initial.filter((t) => t.type === type).reduce((n, t) => n + t.amount, 0);
  const rev = month.revenue + (month.month === "Sep" ? delta("Income") : 0),
    exp = month.expenses + (month.month === "Sep" ? delta("Expense") : 0);
  const outstanding = data.invoices
    .filter((i) => i.status === "Sent" || i.status === "Overdue")
    .reduce((n, i) => n + invoiceTotal(i), 0);
  return (
    <>
      <div className="insight-banner">
        <span className="banner-icon">
          <Sparkles size={21} />
        </span>
        <div>
          <strong>A growing business. A clearer path forward.</strong>
          <p>
            September revenue is up 8%. A closer look at ingredient costs could
            protect your margin.
          </p>
        </div>
        <TextLink onClick={() => go("AI Insights")}>Explore insights</TextLink>
      </div>
      <div className="metrics five">
        <Metric
          label="Revenue"
          value={money(rev)}
          change={((rev / previous.revenue - 1) * 100).toFixed(1) + "%"}
          icon={Wallet}
        />
        <Metric
          label="Expenses"
          value={money(exp)}
          change={((exp / previous.expenses - 1) * 100).toFixed(1) + "%"}
          icon={CreditCard}
          tone="amber"
        />
        <Metric
          label="Net profit"
          value={money(rev - exp)}
          icon={TrendingUp}
          tone="teal"
          note={`${(rev ? (rev - exp) / rev * 100 : 0).toFixed(0)}% profit margin · ${month.month}`}
        />
        <Metric
          label="Cash flow"
          value="$7,840.00"
          icon={Activity}
          tone="purple"
          note="Available operating cash"
        />
        <Metric
          label="Outstanding invoices"
          value={money(outstanding)}
          icon={FileText}
          tone="orange"
          note={`${data.invoices.filter((i) => i.status === "Overdue").length} invoices overdue`}
        />
      </div>
      <div className="quick-actions">
        <span>QUICK ACTIONS</span>
        {[
          [Camera, "Upload receipt", "Capture Receipt"],
          [Plus, "Create invoice", "Invoices"],
          [Sparkles, "Ask AI", "Ask AI"],
          [CloudUpload, "Import data", "Import Data"],
          [CheckCheck, "Reconcile", "Reconciliation"],
          [TrendingUp, "View forecast", "Forecasting"],
        ].map(([I, label, page]) => {
          const Icon = I as typeof Camera;
          return (
            <button
              key={String(label)}
              onClick={() => go(page as Parameters<typeof go>[0])}
            >
              <Icon size={16} />
              {String(label)}
            </button>
          );
        })}
      </div>
      <div className="charts-grid">
        <Panel
          title="Revenue vs. expenses"
          subtitle="A little perspective on your cash flow."
          action={
            <select
              aria-label="Chart range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              <option>6 months</option>
              <option>3 months</option>
            </select>
          }
        >
          <div className="legend">
            <span>
              <i />
              Revenue
            </span>
            <span>
              <i className="teal" />
              Expenses
            </span>
            <small>{range === "3 months" ? history.at(-3)?.month : "Apr"} – {month.month} 2026</small>
          </div>
          <FinanceChart
            data={range === "3 months" ? history.slice(-3) : history}
          />
        </Panel>
        <Panel
          title="Where your money goes"
          subtitle={`${period} · Sample category proportions`}
        >
          <ExpenseChart total={exp} />
          <TextLink onClick={() => go("Transactions")}>
            View expense breakdown
          </TextLink>
        </Panel>
      </div>
      <div className="lower-grid">
        <Panel
          title="Recent transactions"
          subtitle="The latest activity across your business."
          action={
            <TextLink onClick={() => go("Transactions")}>View all</TextLink>
          }
          className="recent-transactions"
        >
          <TransactionTable
            rows={data.transactions.slice(0, 5)}
            compact
            onOpen={setSelected}
          />
          <TrustNote>
            Your records stay traceable to their original source.
          </TrustNote>
        </Panel>
        <div className="right-stack">
          <Panel
            title="AI business insights"
            action={<span className="new-tag">4 new</span>}
          >
            <div className="mini-insight">
              <span className="icon-box amber">
                <TrendingUp size={17} />
              </span>
              <div>
                <strong>Ingredient costs are climbing</strong>
                <p>
                  Spending is up <b>22%</b> this month. A supplier check-in
                  could help.
                </p>
                <TextLink onClick={() => go("AI Insights")}>
                  Take a closer look
                </TextLink>
              </div>
            </div>
            <div className="mini-insight">
              <span className="icon-box teal">
                <Repeat size={17} />
              </span>
              <div>
                <strong>Know your fixed costs</strong>
                <p>
                  Recurring costs account for <b>64%</b> of classified spending.
                </p>
                <TextLink onClick={() => go("Cost Patterns")}>
                  Explore cost patterns
                </TextLink>
              </div>
            </div>
          </Panel>
          <div className="review-card">
            <div>
              <ShieldCheck size={18} />
              <strong>A quick review</strong>
              <Badge tone="amber">{data.reviews.length}</Badge>
            </div>
            <p>
              A few records need your confirmation. Your judgment makes AI
              better.
            </p>
            <TextLink onClick={() => go("Review Queue")}>
              Review suggestions
            </TextLink>
          </div>
        </div>
      </div>
      <div className="two-column dashboard-secondary">
        <Panel
          title="Sales trend"
          subtitle="September sales grew 9% over August"
        >
          <FinanceChart kind="sales" height={180} />
        </Panel>
        <Panel
          title="Profit trend"
          subtitle="A six-month view of your bottom line"
        >
          <FinanceChart kind="profit" height={180} />
        </Panel>
      </div>
      <TrustNote>
        Demo workspace · Financial summaries include sample monthly totals and
        your session changes.
      </TrustNote>
      <TransactionDialog
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

export function Transactions() {
  const { data } = useWorkspace();
  const [selected, setSelected] = useState<Transaction | "new" | null>(null),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All categories"),
    [type, setType] = useState("All types"),
    [source, setSource] = useState("All sources"),
    [status, setStatus] = useState("All statuses"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [page, setPage] = useState(1);
  const rows = data.transactions.filter(
    (t) =>
      (t.merchant + " " + t.description)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === "All categories" || t.category === category) &&
      (type === "All types" || t.type === type) &&
      (source === "All sources" || t.source === source) &&
      (status === "All statuses" || t.reconciliation === status) &&
      (!from || t.date >= from) &&
      (!to || t.date <= to),
  );
  const count = Math.max(1, Math.ceil(rows.length / 7)),
    current = Math.min(page, count);
  return (
    <Panel
      title="All transactions"
      subtitle={`${rows.length} records · All amounts in USD`}
      action={
        <Button onClick={() => setSelected("new")}>
          <Plus size={16} />
          Add transaction
        </Button>
      }
    >
      <div className="filters">
        <label className="search-input">
          <Search size={16} />
          <input
            placeholder="Search transactions…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        {[
          [
            category,
            setCategory,
            ["All categories", ...data.categories.map((c) => c.name)],
          ],
          [type, setType, ["All types", "Income", "Expense"]],
          [
            source,
            setSource,
            [
              "All sources",
              "Manual",
              "Receipt OCR",
              "CSV",
              "Bank",
              "Shopify",
              "POS",
            ],
          ],
          [
            status,
            setStatus,
            [
              "All statuses",
              "Matched",
              "Possible Match",
              "Unmatched",
              "Needs Review",
            ],
          ],
        ].map(([value, set, options], i) => (
          <select
            key={i}
            aria-label={
              [
                "Category filter",
                "Type filter",
                "Source filter",
                "Reconciliation filter",
              ][i]
            }
            value={value as string}
            onChange={(e) => {
              (set as (v: string) => void)(e.target.value);
              setPage(1);
            }}
          >
            {(options as string[]).map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ))}
        <input
          aria-label="From date"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          aria-label="To date"
          type="date"
          value={to}
          min={from}
          onChange={(e) => setTo(e.target.value)}
        />
        <button
          className="text-link"
          onClick={() => {
            setQuery("");
            setCategory("All categories");
            setType("All types");
            setSource("All sources");
            setStatus("All statuses");
            setFrom("");
            setTo("");
          }}
        >
          Clear filters
        </button>
      </div>
      <TransactionTable
        rows={rows.slice((current - 1) * 7, current * 7)}
        onOpen={setSelected}
      />
      <div className="pagination">
        <span>
          {rows.length} transactions · Page {current} of {count}
        </span>
        <Button
          variant="outline"
          disabled={current === 1}
          onClick={() => setPage(current - 1)}
        >
          <ChevronLeft size={14} />
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={current === count}
          onClick={() => setPage(current + 1)}
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
      <TransactionDialog
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </Panel>
  );
}

export function ReviewQueue() {
  const { data, review, setData, log, notify } = useWorkspace();
  const [filter, setFilter] = useState("All items"),
    [bulk, setBulk] = useState(false),
    [edit, setEdit] = useState<Review | null>(null),
    [value, setValue] = useState("");
  const threshold = Math.max(90, Number(data.preferences.threshold));
  const high = data.reviews.filter((r) => r.confidence >= threshold),
    rows = data.reviews.filter(
      (r) => filter === "All items" || r.kind === filter,
    );
  return (
    <>
      <div className="toolbar">
        <TrustNote>
          Nothing changes until you confirm. High confidence means {threshold}% or above.
        </TrustNote>
        <Button
          variant="outline"
          disabled={!high.length}
          onClick={() => setBulk(true)}
        >
          <CheckCheck size={16} />
          Accept all high confidence ({high.length})
        </Button>
      </div>
      <div className="tabs">
        {[
          "All items",
          "Missing values",
          "Incorrect categories",
          "Duplicate transactions",
          "Invalid dates",
          "Abnormal amounts",
          "Incorrect field mapping",
          "Unknown merchants",
        ].map((f) => (
          <button
            className={filter === f ? "selected" : ""}
            key={f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      {rows.map((r) => (
        <Panel
          key={r.id}
          title={
            data.transactions.find((t) => t.id === r.txId)?.merchant ||
            "Imported record"
          }
          subtitle={`${r.source} · September 2026`}
          action={<Badge tone="amber">{r.kind}</Badge>}
          className="review-item"
        >
          <div className="suggestion">
            <div>
              <small>ORIGINAL {r.field.toUpperCase()}</small>
              <strong>{r.original}</strong>
            </div>
            <ArrowRight size={20} />
            <div>
              <small>AI SUGGESTION</small>
              <strong>{r.suggestion}</strong>
            </div>
            <Badge tone={r.confidence >= 90 ? "green" : "amber"}>
              {r.confidence}% confidence
            </Badge>
          </div>
          <p className="reason">
            <Sparkles size={15} />
            {r.reason}
          </p>
          <div className="form-actions">
            <Button variant="ghost" onClick={() => review([r.id], false)}>
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEdit(r);
                setValue(r.suggestion);
              }}
            >
              Edit
            </Button>
            <Button onClick={() => review([r.id], true)}>
              <Check size={15} />
              Accept
            </Button>
          </div>
        </Panel>
      ))}
      {!rows.length && (
        <Panel>
          <Empty
            title="All clear here"
            text="No suggestions need your attention in this view."
          />
        </Panel>
      )}
      <Modal
        open={bulk}
        onClose={() => setBulk(false)}
        title="Confirm high-confidence suggestions"
        description="Review this list before applying. Original imported data will remain available."
      >
        <div className="bulk-list">
          {high.map((r) => (
            <div key={r.id}>
              <strong>
                {r.field}: {r.original} → {r.suggestion}
              </strong>
              <Badge>{r.confidence}%</Badge>
            </div>
          ))}
        </div>
        <div className="form-actions">
          <Button variant="outline" onClick={() => setBulk(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              review(
                high.map((r) => r.id),
                true,
              );
              setBulk(false);
            }}
          >
            Confirm {high.length} changes
          </Button>
        </div>
      </Modal>
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Correct AI suggestion"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!edit) return;
            setData((d) => ({
              ...d,
              transactions: d.transactions.map((t) =>
                t.id === edit.txId
                  ? {
                      ...t,
                      [edit.field]:
                        edit.field === "amount" ? Number(value) : value,
                      ai: d.reviews.some(
                        (r) => r.txId === t.id && r.id !== edit.id,
                      )
                        ? "Needs review"
                        : "Verified",
                    }
                  : t,
              ),
              reviews: d.reviews.filter((r) => r.id !== edit.id),
            }));
            log(
              "AI suggestion corrected",
              data.transactions.find((t) => t.id === edit.txId)?.merchant ||
                edit.txId,
              edit.original,
              value,
              edit.source,
            );
            setEdit(null);
            notify("Your correction has been applied.");
          }}
        >
          <Field label="Corrected value">
            <input
              required
              type={
                edit?.field === "amount"
                  ? "number"
                  : edit?.field === "date"
                    ? "date"
                    : "text"
              }
              min={edit?.field === "amount" ? 0.01 : undefined}
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Field>
          <div className="form-actions">
            <Button>Confirm correction</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ImportData() {
  const { data, setData, go, log, notify } = useWorkspace();
  const input = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<"upload" | "processing" | "preview">(
      "upload",
    ),
    [job, setJob] = useState<Job | null>(null),
    [mapping, setMapping] = useState([
      "Date",
      "Description",
      "Amount",
      "Merchant",
    ]),
    [validated, setValidated] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  function begin(file: File) {
    if (!/\.(csv|xlsx?|pdf|png|jpe?g|zip)$/i.test(file.name)) {
      setError(
        "Unsupported file. Choose CSV, Excel, PDF, ZIP receipts, or an image.",
      );
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Please choose a file smaller than 20 MB.");
      return;
    }
    const j: Job = {
      id: uid(),
      name: file.name,
      source: /\.(png|jpe?g|zip)$/i.test(file.name)
        ? "Receipt OCR"
        : /\.pdf$/i.test(file.name)
          ? "Bank"
          : "CSV",
      date: "2026-09-28",
      count: 3,
      status: "Pending",
      progress: 0,
    };
    setJob(j);
    setError("");
    setStage("processing");
    setValidated(false);
    setData((d) => ({ ...d, jobs: [j, ...d.jobs] }));
    setTimeout(
      () =>
        setData((d) => ({
          ...d,
          jobs: d.jobs.map((x) =>
            x.id === j.id ? { ...x, status: "Processing", progress: 65 } : x,
          ),
        })),
      250,
    );
    setTimeout(() => {
      setJob({ ...j, status: "Processing", progress: 100 });
      setStage("preview");
    }, 900);
  }
  function complete() {
    if (!job) return;
    setBusy(true);
    setTimeout(() => {
      const autoCategory = Boolean(data.preferences.autoCategory) && 88 >= Number(data.preferences.threshold);
      const autoReconcile = Boolean(data.preferences.autoReconcile);
      const imported = initial.slice(0, 3).map((t, i) => {
        const row = [t.date, t.description, String(t.amount), t.merchant];
        const record: Transaction = {
          ...t,
          id: uid(),
          source: job.source,
          date: row[mapping.indexOf("Date")],
          amount: Number(row[mapping.indexOf("Amount")]),
          merchant: row[mapping.indexOf("Merchant")],
          category: i === 0 && !autoCategory ? "Other" : t.category,
          ai: i === 0 && !autoCategory ? "Needs review" : "Verified",
          reconciliation: i === 1 && autoReconcile ? "Matched" : "Unmatched",
          description: "Sample imported row · " + job.name,
          original: JSON.stringify({ "Transaction Date": t.date, Description: t.description, Debit: t.amount, Vendor: t.merchant, source: job.name }, null, 2),
        };
        return record;
      });
      const pendingReview: Review = {
        id: uid(), txId: imported[0].id, kind: "Incorrect categories", field: "category",
        original: "Other", suggestion: "Ingredients", confidence: 88,
        reason: "Please confirm the suggested category for this simulated import.", source: job.name,
      };
      setData((d) => ({
        ...d,
        transactions: [...imported, ...d.transactions],
        reviews: [...(autoCategory ? [] : [pendingReview]), ...d.reviews],
        jobs: d.jobs.map((j) =>
          j.id === job.id
            ? { ...j, status: autoCategory ? "Completed" : "Review Required", count: 3, progress: 100 }
            : j,
        ),
      }));
      log(
        "Import completed",
        job.name,
        "Pending",
        autoCategory ? "3 sample rows confirmed" : "3 sample rows · 1 needs review",
        job.source,
      );
      if (autoCategory) log("Automatic category confirmed", imported[0].merchant, "Other", "Ingredients · 88% confidence", "Previously authorized AI preference");
      if (autoReconcile) log("Automatic reconciliation", imported[1].merchant, "Unmatched", "Matched · 99% confidence", "Previously authorized AI preference");
      notify(autoCategory ? "3 sample records imported. Authorized AI actions are logged." : "3 sample records imported. One suggestion needs your review.");
      setBusy(false);
      go(autoCategory ? "Transactions" : "Review Queue");
    }, 700);
  }
  if (stage === "processing")
    return (
      <Panel>
        <div className="processing">
          <span className="spinner" />
          <h2>Making sense of your data</h2>
          <p>{job?.name}</p>
          <progress
            value={data.jobs.find((j) => j.id === job?.id)?.progress || 10}
            max="100"
          />
          <small>
            Reading sample rows · Detecting fields · Preparing suggestions
          </small>
        </div>
      </Panel>
    );
  if (stage === "preview")
    return (
      <Panel
        title="Preview & map your data"
        subtitle={job?.name}
        action={<Badge tone="blue">Simulated extraction</Badge>}
      >
        <div className="notice blue">
          <ShieldCheck size={18} />
          <p>
            This prototype uses three sample rows. Your file is not parsed or
            sent to a server. Confirm the field mapping before importing.
          </p>
        </div>
        <div className="mapping-grid">
          {["Transaction Date", "Description", "Debit", "Vendor"].map(
            (c, i) => (
              <Field label={c} key={c}>
                <select
                  value={mapping[i]}
                  onChange={(e) => {
                    setMapping((m) =>
                      m.map((v, j) => (j === i ? e.target.value : v)),
                    );
                    setValidated(false);
                  }}
                >
                  {[
                    "Date",
                    "Description",
                    "Amount",
                    "Merchant",
                    "Category",
                    "Ignore",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
            ),
          )}
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {["Transaction Date", "Description", "Debit", "Vendor"].map(
                  (h) => (
                    <th key={h}>{h}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {initial.slice(0, 3).map((t) => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.description}</td>
                  <td>{t.amount}</td>
                  <td>{t.merchant}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && (
          <p role="alert" className="error-note">
            {error}
          </p>
        )}
        {validated && (
          <div className="notice green">
            <CheckCheck size={18} />
            <p>
              Validation passed. Three sample rows are ready; uncertain values
              will go to Review Queue.
            </p>
          </div>
        )}
        <div className="form-actions">
          <Button variant="outline" onClick={() => setStage("upload")}>
            Back
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              const active = mapping.filter((m) => m !== "Ignore");
              if (
                new Set(active).size !== active.length ||
                !["Date", "Amount", "Merchant"].every((x) =>
                  mapping.includes(x),
                )
              ) {
                setError(
                  "Use unique mappings and include Date, Amount, and Merchant.",
                );
                return;
              }
              const samples = initial.slice(0, 3).map((t) => [t.date, t.description, String(t.amount), t.merchant]);
              if (samples.some((row) => !/^\d{4}-\d{2}-\d{2}$/.test(row[mapping.indexOf("Date")]) || !Number.isFinite(Number(row[mapping.indexOf("Amount")])))) {
                setError("Date must map to a valid date column and Amount to a numeric column.");
                return;
              }
              setBusy(true);
              setError("");
              setTimeout(() => {
                setBusy(false);
                setValidated(true);
              }, 450);
            }}
          >
            {busy ? "Processing…" : "Validate Data"}
          </Button>
          <Button disabled={!validated || busy} onClick={complete}>
            Continue Import
            <ArrowRight size={15} />
          </Button>
        </div>
      </Panel>
    );
  return (
    <>
      <div className="import-options">
        {[
          ["Upload CSV / Excel", "Spreadsheets, organized", FileSpreadsheet],
          ["Upload Bank Statement", "Bring your accounts together", CreditCard],
          ["Upload Receipt", "A photo is all you need", Camera],
          ["Upload PDF", "Turn documents into records", FileText],
          ["Connect Shopify", "Sync sales and inventory", Link2],
          ["Import POS Data", "Keep daily sales in view", Activity],
        ].map(([title, desc, I]) => {
          const Icon = I as typeof Camera;
          return (
            <button
              className="card import-option"
              key={String(title)}
              onClick={() =>
                title === "Connect Shopify"
                  ? go("Integrations")
                  : title === "Upload Receipt"
                    ? go("Capture Receipt")
                    : input.current?.click()
              }
            >
              <span className="icon-box blue">
                <Icon size={21} />
              </span>
              <strong>{String(title)}</strong>
              <small>{String(desc)}</small>
              <ArrowUpRight size={15} />
            </button>
          );
        })}
      </div>
      <div
        className="upload-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files[0]) begin(e.dataTransfer.files[0]);
        }}
      >
        <span className="upload-icon">
          <CloudUpload size={35} />
        </span>
        <h2>Your financial data, all in one place.</h2>
        <p>Drag and drop a file, or browse from your device.</p>
        <Button onClick={() => input.current?.click()}>
          <Plus size={16} />
          Browse files
        </Button>
        <small>CSV, Excel, PDF, receipt images, or ZIP · Up to 20 MB</small>
        <input
          ref={input}
          type="file"
          hidden
          accept=".csv,.xls,.xlsx,.pdf,.png,.jpg,.jpeg,.zip"
          onChange={(e) => {
            if (e.target.files?.[0]) begin(e.target.files[0]);
            e.target.value = "";
          }}
        />
        {error && (
          <p className="error-note" role="alert">
            {error}
          </p>
        )}
      </div>
      <Panel
        title="Recent imports"
        subtitle="Follow each file from upload to review."
        className="top-gap"
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>File / source</th>
                <th>Source</th>
                <th>Date</th>
                <th>Records</th>
                <th>Progress</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.jobs.map((j) => (
                <tr key={j.id}>
                  <td>
                    <strong>{j.name}</strong>
                  </td>
                  <td>{j.source}</td>
                  <td>{j.date}</td>
                  <td>{j.count}</td>
                  <td>
                    <progress max="100" value={j.progress} />
                  </td>
                  <td>
                    <Badge>{j.status}</Badge>
                  </td>
                  <td>
                    <TextLink
                      onClick={() => {
                        if (j.status === "Review Required") {
                          go("Review Queue");
                          return;
                        }
                        if (j.status === "Failed") {
                          setJob(j);
                          setValidated(false);
                          setStage("preview");
                          setError(
                            "Previous attempt failed: unrecognized columns. Map the sample fields and retry.",
                          );
                          return;
                        }
                        setJob(j);
                        setStage("preview");
                        setValidated(false);
                        setError("");
                      }}
                    >
                      {j.status === "Failed" ? "Retry" : "View"}
                    </TextLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

export function CaptureReceipt() {
  const { data, saveTx, go, notify } = useWorkspace();
  const input = useRef<HTMLInputElement>(null),
    camera = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState("capture"),
    [image, setImage] = useState(""),
    [error, setError] = useState("");
  function scan(file?: File) {
    if (file && !file.type.startsWith("image/")) {
      setError("Choose a receipt image.");
      return;
    }
    if (image) URL.revokeObjectURL(image);
    setImage(file ? URL.createObjectURL(file) : "");
    setError("");
    setStage("Scanning receipt…");
    setTimeout(() => setStage("Extracting data…"), 450);
    setTimeout(() => setStage("review"), 950);
  }
  return (
    <div className="capture-layout">
      <Panel
        title="A receipt today. A clear record tomorrow."
        subtitle="Capture, review, and save in a few simple steps."
      >
        <input
          hidden
          ref={input}
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) scan(e.target.files[0]);
          }}
        />
        <input
          hidden
          ref={camera}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            if (e.target.files?.[0]) scan(e.target.files[0]);
          }}
        />
        {stage === "capture" ? (
          <div className="camera-area">
            <div className="camera-frame">
              <Camera size={52} />
              <p>Place your receipt inside the frame</p>
            </div>
            <div className="form-actions">
              <Button onClick={() => camera.current?.click()}>
                <Camera size={16} />
                Take Photo
              </Button>
              <Button variant="outline" onClick={() => input.current?.click()}>
                Choose Photo
              </Button>
            </div>
            <button className="text-link" onClick={() => scan()}>
              Try a sample receipt <ArrowRight size={15} />
            </button>
            {error && (
              <p role="alert" className="error-note">
                {error}
              </p>
            )}
          </div>
        ) : stage === "review" ? (
          <div className="receipt-paper">
            {image ? (
              <img src={image} alt="Uploaded receipt" />
            ) : (
              <>
                <Leaf size={30} />
                <h3>ANGKOR MARKET</h3>
                <p>
                  Phnom Penh, Cambodia
                  <br />
                  28 September 2026
                </p>
                <hr />
                <div>
                  <span>Coffee supplies</span>
                  <b>$90.00</b>
                </div>
                <div>
                  <span>Fresh ingredients</span>
                  <b>$35.00</b>
                </div>
                <hr />
                <div>
                  <strong>TOTAL</strong>
                  <strong>$125.00</strong>
                </div>
                <p>Thank you for shopping local.</p>
                <div className="barcode" />
              </>
            )}
          </div>
        ) : (
          <div className="processing">
            <span className="spinner" />
            <h2>{stage}</h2>
            <p>Demo OCR simulation · Nothing is uploaded</p>
          </div>
        )}
        <TrustNote>
          Extracted values are sample data. Compare them with your receipt.
        </TrustNote>
      </Panel>
      {stage === "review" && (
        <Panel
          title="Review extracted details"
          subtitle="You have the final say on every field."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              saveTx({
                id: uid(),
                merchant: String(f.get("merchant")),
                date: String(f.get("date")),
                amount: Number(f.get("amount")),
                category: String(f.get("category")),
                description: "Receipt confirmed by owner",
                source: "Receipt OCR",
                type: "Expense",
                ai: "Verified",
                reconciliation: "Unmatched",
                receipt: image || undefined,
              });
              notify("Receipt saved as a verified transaction.");
              go("Transactions");
            }}
          >
            {[
              ["Merchant", "merchant", "Angkor Market", "text", "99%"],
              ["Date", "date", "2026-09-28", "date", "98%"],
              ["Amount", "amount", "125", "number", "99%"],
            ].map(([l, n, v, t, c]) => (
              <Field label={l} key={n}>
                <div className="confidence-field">
                  <input
                    aria-label={l}
                    name={n}
                    defaultValue={v}
                    type={t}
                    required
                    min={t === "number" ? "0.01" : undefined}
                    step="0.01"
                  />
                  <Badge tone="green">{c}</Badge>
                </div>
              </Field>
            ))}
            <Field label="Category">
              <select name="category" defaultValue="Ingredients">
                {data.categories.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
            </Field>
            <p className="muted">
              Category confidence: 72% · Confirmation required
            </p>
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStage("capture")}
              >
                Retake
              </Button>
              <Button>Save Transaction</Button>
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}

export function CostPatterns() {
  const { data, setData, log } = useWorkspace();
  const recurring = data.costs
      .filter((c) => c.recurring)
      .reduce((s, c) => s + c.amount, 0),
    once = data.costs
      .filter((c) => !c.recurring)
      .reduce((s, c) => s + c.amount, 0);
  return (
    <>
      <div className="metrics three">
        <Metric
          label="Recurring monthly costs"
          value={money(recurring)}
          icon={Repeat}
          note="Confirmed cost classifications"
        />
        <Metric
          label="One-time costs"
          value={money(once)}
          icon={CreditCard}
          tone="teal"
          note="September purchases"
        />
        <Metric
          label="Recurring costs percentage"
          value={`${Math.round((recurring / (recurring + once + 1200)) * 100)}%`}
          icon={Activity}
          tone="purple"
          note="Includes $1,200 unclassified spending"
        />
      </div>
      {[true, false].map((rec) => (
        <Panel
          key={String(rec)}
          title={rec ? "Recurring costs" : "One-time costs"}
          subtitle={
            rec
              ? "Your predictable monthly commitments."
              : "Investments and occasional purchases."
          }
          className="top-gap"
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "Merchant",
                    "Category",
                    "Amount",
                    "Frequency",
                    "Last paid",
                    "AI confidence",
                    "Classification",
                  ].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.costs
                  .filter((c) => c.recurring === rec)
                  .map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.merchant}</strong>
                      </td>
                      <td>{c.category}</td>
                      <td>{money(c.amount)}</td>
                      <td>{c.frequency}</td>
                      <td>{c.paid}</td>
                      <td>
                        <Badge>{c.confidence}%</Badge>
                      </td>
                      <td>
                        <button
                          className="text-link"
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              costs: d.costs.map((x) =>
                                x.id === c.id
                                  ? {
                                      ...x,
                                      recurring: !rec,
                                      frequency: rec ? "One-time" : "Monthly",
                                    }
                                  : x,
                              ),
                            }));
                            log(
                              "Cost classification updated",
                              c.merchant,
                              rec ? "Recurring" : "One-time",
                              rec ? "One-time" : "Recurring",
                              "User correction",
                            );
                          }}
                        >
                          Mark as {rec ? "One-Time" : "Recurring"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ))}
      <TrustNote>
        AI identifies patterns. You can correct any classification.
      </TrustNote>
    </>
  );
}

export function MonthlyReports() {
  const { period, go, data } = useWorkspace();
  const month = period.startsWith("August")
    ? trends[4]
    : period.startsWith("July")
      ? trends[3]
      : trends[5];
  const history = trends.slice(0, trends.indexOf(month) + 1);
  const previous = trends[trends.indexOf(month) - 1];
  return (
    <div className="print-report">
      <div className="report-header">
        <div>
          <span className="eyebrow">{data.business.name.toUpperCase()}</span>
          <h2>{period}</h2>
          <p>Monthly Business Report</p>
        </div>
        <Button onClick={() => window.print()}>
          <Download size={16} />
          Export PDF
        </Button>
      </div>
      <div className="metrics four">
        <Metric
          label="Revenue"
          value={money(month.revenue)}
          change={((month.revenue / previous.revenue - 1) * 100).toFixed(1) + "%"}
          icon={Wallet}
        />
        <Metric
          label="Expenses"
          value={money(month.expenses)}
          change={((month.expenses / previous.expenses - 1) * 100).toFixed(1) + "%"}
          tone="amber"
          icon={CreditCard}
        />
        <Metric
          label="Profit"
          value={money(month.profit)}
          icon={TrendingUp}
          note="After operating expenses"
        />
        <Metric
          label="Profit margin"
          value={((month.profit / month.revenue) * 100).toFixed(0) + "%"}
          icon={Activity}
          note="Profit / revenue"
        />
      </div>
      <Panel
        title="AI Summary"
        action={<Sparkles size={19} />}
        className="report-summary"
      >
        <h2>A growing business, with room to spend smarter.</h2>
        <p>
          {period.startsWith("September")
            ? "Revenue increased by 8% compared with August. Expenses increased faster than revenue, mainly because ingredient and equipment spending increased."
            : `${period} generated ${money(month.revenue)} in revenue against ${money(month.expenses)} in expenses.`}{" "}
          Review supplier pricing and keep an eye on inventory to protect your
          margin.
        </p>
        <div className="key-changes">
          {[
            ["Ingredients", "+22%"],
            ["Marketing", "−8%"],
            ["Utilities", "+4%"],
            ["Sales", "+9%"],
          ].map(([l, v]) => (
            <div key={l}>
              <span>{l}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
        <small>Summary and key changes use the September demo analysis.</small>
      </Panel>
      <div className="two-column top-gap">
        <Panel title="Revenue vs. expenses">
          <FinanceChart data={history} />
        </Panel>
        <Panel title="Monthly profit trend">
          <FinanceChart kind="profit" data={history} />
        </Panel>
        <Panel title="Expense categories" subtitle={period}>
          <ExpenseChart total={month.expenses} />
        </Panel>
        <Panel title="Sales trend">
          <FinanceChart kind="sales" data={history} />
        </Panel>
      </div>
      <Panel title="Important AI insights" className="top-gap">
        <div className="insight-list">
          <p>
            Ingredient costs increased 22%. Compare supplier pricing before your
            next order.
          </p>
          <p>
            Three invoices are overdue. Following up can improve available cash.
          </p>
          <p>
            Weekend sales are trending upward. Keep your most popular products
            stocked.
          </p>
        </div>
        <TextLink onClick={() => go("AI Insights")}>
          Explore all insights
        </TextLink>
      </Panel>
      <TrustNote>
        Prepared from mock business data. Export uses your browser’s Save as PDF
        option.
      </TrustNote>
    </div>
  );
}

export function AuditHistory() {
  const { data } = useWorkspace();
  const [q, setQ] = useState("");
  const rows = data.audit.filter((a) =>
    Object.values(a).join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Panel
      title="A clear trail of every decision"
      subtitle="Original values, confirmed changes, and the people behind them."
      action={
        <label className="search-input">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search audit history…"
          />
        </label>
      }
    >
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {[
                "Date & time",
                "User",
                "Action",
                "Record",
                "Original value",
                "New value",
                "Source",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  {new Date(a.time).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>{a.user}</td>
                <td>
                  <strong>{a.action}</strong>
                </td>
                <td>{a.record}</td>
                <td className="wrap-cell">{a.original}</td>
                <td className="wrap-cell">{a.value}</td>
                <td>{a.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty title="No matching changes" />}
      </div>
      <TrustNote>
        Changes in this prototype last for the current session.
      </TrustNote>
    </Panel>
  );
}
