"use client";
import React, { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChartColumnIncreasing,
  Check,
  Plus,
  Repeat,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import {
  Badge,
  Button,
  Empty,
  Field,
  Modal,
  Panel,
  TextLink,
  TrustNote,
} from "./common";
import { FinanceChart } from "./charts";
import { money } from "@/lib/demo";

type Answer = {
  text: string;
  metric: string;
  label: string;
  rows: [string, string][];
  source: string;
};
export function AskAI() {
  const { data, go } = useWorkspace();
  const [messages, setMessages] = useState<
      { role: string; text: string; answer?: Answer }[]
    >([]),
    [question, setQuestion] = useState(""),
    [busy, setBusy] = useState(false);
  const prompts = [
    "How much did I spend last month?",
    "What was my largest expense?",
    "Compare revenue with last month.",
    "Which expense category increased the most?",
    "How much am I spending on ingredients?",
    "Show me all recurring expenses.",
    "What were my best-selling products?",
  ];
  function ask(q: string) {
    if (!q.trim() || busy) return;
    setQuestion("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: q }]);
    const lower = q.toLowerCase();
    let a: Answer;
    if (/product|selling/.test(lower)) {
      const best = [...data.products]
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 3);
      a = {
        text: `${best[0].name} is your best-selling product in the sample sales data.`,
        metric: `${best[0].sold} sold`,
        label: "Top product",
        rows: best.map((p) => [
          p.name,
          `${p.sold} sold · ${money(p.sold * p.price)}`,
        ]),
        source: "Sales & Stock · September 2026",
      };
    } else if (/recurring|repeat|fixed/.test(lower)) {
      const costs = data.costs.filter((c) => c.recurring);
      a = {
        text: "These are your currently classified recurring commitments. You can correct their classification in Cost Patterns.",
        metric: money(costs.reduce((n, c) => n + c.amount, 0)),
        label: "Recurring monthly costs",
        rows: costs.map((c) => [c.merchant, money(c.amount)]),
        source: "Cost Patterns · User-reviewed classifications",
      };
    } else if (/ingredient|category/.test(lower)) {
      a = {
        text: "September ingredient spending increased by 22% compared with August. Consider reviewing supplier pricing and ingredient waste.",
        metric: "$3,030",
        label: "September ingredient spending",
        rows: [
          ["August", "$2,484"],
          ["September", "$3,030"],
          ["Change", "+22%"],
        ],
        source: "Monthly summary · Ingredients · Aug–Sep 2026",
      };
    } else if (/revenue|compare|make/.test(lower)) {
      a = {
        text: "Revenue increased by 8% from August to September, while expenses increased 16%. Keep an eye on your margin as costs grow.",
        metric: "$15,300",
        label: "September revenue",
        rows: [
          ["August revenue", "$14,167"],
          ["September revenue", "$15,300"],
          ["Change", "+8%"],
        ],
        source: "Monthly financial summaries · Aug–Sep 2026",
      };
    } else if (/largest|biggest/.test(lower)) {
      const largest = data.transactions
        .filter((t) => t.type === "Expense")
        .sort((a, b) => b.amount - a.amount)[0];
      a = {
        text: `${largest.merchant} is the largest individual expense among the currently loaded transactions.`,
        metric: money(largest.amount),
        label: "Largest loaded expense",
        rows: [
          ["Merchant", largest.merchant],
          ["Category", largest.category],
          ["Source", largest.source],
        ],
        source: "Loaded transaction ledger · September 2026",
      };
    } else if (/spend|expense/.test(lower)) {
      a = {
        text: "You spent $8,707 in August. September expenses are $10,100, a 16% increase. Ingredients and equipment are the main areas to review.",
        metric: "$8,707",
        label: "Last month’s spending",
        rows: [
          ["August", "$8,707"],
          ["September", "$10,100"],
          ["Change", "+16%"],
        ],
        source: "Monthly financial summaries · Aug–Sep 2026",
      };
    } else
      a = {
        text: "This prototype can answer sample questions about expenses, revenue, recurring costs, and product sales. Choose a suggested question to explore the available business data.",
        metric: "Demo assistant",
        label: "Available topics",
        rows: [
          ["Revenue & expenses", "Monthly summaries"],
          ["Products & stock", "Sales records"],
          ["Recurring costs", "Classified payments"],
        ],
        source: "Demo workspace · No live AI model",
      };
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: a.text, answer: a },
      ]);
      setBusy(false);
    }, 650);
  }
  return (
    <div className="chat-layout">
      <Panel className="chat-panel">
        <div className="chat-welcome">
          <span className="ai-orb">
            <Sparkles size={27} />
          </span>
          <span className="eyebrow">YOUR NUMBERS HAVE A STORY</span>
          <h2>Ask LedgerVision AI</h2>
          <p>Clear answers. Real context. Better decisions.</p>
        </div>
        <div className="question-grid">
          {prompts.map((p) => (
            <button disabled={busy} key={p} onClick={() => ask(p)}>
              {p}
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
        <div className="chat-messages" aria-live="polite">
          {messages.map((m, i) => (
            <div className={"chat-message " + m.role} key={i}>
              {m.role === "assistant" && (
                <span className="chat-avatar">
                  <Sparkles size={18} />
                </span>
              )}
              <div>
                <p>{m.text}</p>
                {m.answer && (
                  <>
                    <div className="answer-metric">
                      <small>{m.answer.label}</small>
                      <strong>{m.answer.metric}</strong>
                    </div>
                    <table className="answer-table">
                      <tbody>
                        {m.answer.rows.map(([l, v]) => (
                          <tr key={l}>
                            <td>{l}</td>
                            <td>
                              <b>{v}</b>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <small className="answer-source">
                      Source: {m.answer.source} · Mock data
                    </small>
                    <TextLink
                      onClick={() =>
                        go(
                          m.answer!.source.startsWith("Sales")
                            ? "Sales & Stock"
                            : m.answer!.source.startsWith("Cost")
                              ? "Cost Patterns"
                              : "Transactions",
                        )
                      }
                    >
                      View source{" "}
                      {m.answer.source.startsWith("Sales")
                        ? "products"
                        : "transactions"}
                    </TextLink>
                  </>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="chat-message assistant">
              <Sparkles size={18} />
              <p className="pulse">Looking through your business data…</p>
            </div>
          )}
        </div>
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <Sparkles size={18} />
          <input
            aria-label="Ask a financial question"
            placeholder="Ask anything about your business finances..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button
            disabled={busy || !question.trim()}
            aria-label="Send question"
          >
            <ArrowRight size={19} />
          </Button>
        </form>
        <TrustNote>
          Answers use labelled sample data. You stay in control of every
          financial decision.
        </TrustNote>
      </Panel>
      <div className="chat-context">
        <Panel title="Connected to your business">
          <div className="feature-list">
            {[
              "Transactions & expenses",
              "Monthly summaries",
              "Product sales & stock",
              "Recurring cost patterns",
            ].map((t) => (
              <p key={t}>
                <Check size={16} />
                {t}
              </p>
            ))}
          </div>
          <Badge tone="green">Demo data ready</Badge>
        </Panel>
        <Panel title="Looking for a bigger picture?">
          <p>
            See the trends behind the numbers in your monthly business report.
          </p>
          <TextLink onClick={() => go("Monthly Reports")}>
            Open monthly report
          </TextLink>
        </Panel>
      </div>
    </div>
  );
}

export function Insights() {
  const { go, data } = useWorkspace();
  const items = [
    {
      title: "Ingredient costs increased 22%",
      value: "+22%",
      tag: "Needs attention",
      tone: "amber",
      text: "Ingredient costs are rising faster than revenue. Compare supplier prices and check waste before the next order.",
      page: "Transactions",
    },
    {
      title: "Sales are growing steadily",
      value: "+9%",
      tag: "Good news",
      tone: "green",
      text: "September sales increased compared with August. Weekend performance is especially strong.",
      page: "Sales & Stock",
    },
    {
      title: `${data.invoices.filter((i) => i.status === "Overdue").length} invoices are overdue`,
      value: money(
        data.invoices
          .filter((i) => i.status === "Overdue")
          .reduce(
            (n, i) => n + i.items.reduce((s, l) => s + l.quantity * l.price, 0),
            0,
          ),
      ),
      tag: "Follow up",
      tone: "amber",
      text: "A friendly payment reminder can help turn outstanding invoices into available cash.",
      page: "Invoices",
    },
    {
      title: "Know your recurring commitments",
      value: "64%",
      tag: "Opportunity",
      tone: "blue",
      text: "Recurring costs represent 64% of the classified cost analysis, including unclassified spend. Review subscriptions for savings.",
      page: "Cost Patterns",
    },
    {
      title: "Marketing spending is lower",
      value: "−8%",
      tag: "Good to know",
      tone: "blue",
      text: "Track new customer visits to see whether reduced marketing spend changes acquisition.",
      page: "Transactions",
    },
    {
      title: "Utilities increased slightly",
      value: "+4%",
      tag: "Monitor",
      tone: "purple",
      text: "Electricity costs are slightly higher than last month. Keep seasonal usage in mind.",
      page: "Transactions",
    },
  ];
  return (
    <>
      <div className="notice blue">
        <Sparkles size={24} />
        <div>
          <strong>Small discoveries. Better business decisions.</strong>
          <p>
            Here are the changes worth a closer look in your September finances.
          </p>
        </div>
      </div>
      <div className="insights-grid">
        {items.map((item, i) => (
          <Panel key={item.title} className="insight-large">
            <div className="toolbar">
              <span className={"icon-box " + item.tone}>
                {i === 2 ? <FileTextIcon /> : <TrendingUp size={20} />}
              </span>
              <Badge tone={item.tone}>{item.tag}</Badge>
            </div>
            <h2>{item.title}</h2>
            <div className="insight-number">{item.value}</div>
            <p>{item.text}</p>
            <div className="mini-bars">
              {[30, 43, 35, 60, 52, 65, 78, 90].map((h, j) => (
                <i
                  key={j}
                  style={{
                    height: h + "%",
                    background:
                      i === 1 ? "#24b49b" : i === 2 ? "#edb35f" : "#5b8def",
                  }}
                />
              ))}
            </div>
            <TextLink onClick={() => go(item.page as Parameters<typeof go>[0])}>
              Explore details
            </TextLink>
          </Panel>
        ))}
      </div>
      <TrustNote>
        Insights are suggestions from a sample September analysis, not automatic
        changes to your records.
      </TrustNote>
    </>
  );
}
function FileTextIcon() {
  return <ChartColumnIncreasing size={20} />;
}

export function Settings({ onboarding = false }: { onboarding?: boolean }) {
  const { data, setData, log, notify, go } = useWorkspace();
  const [tab, setTab] = useState("Business Profile"),
    [category, setCategory] = useState<{
      name: string;
      type: string;
      original?: string;
    } | null>(null),
    [deleting, setDeleting] = useState<string | null>(null),
    [error, setError] = useState(""),
    [invite, setInvite] = useState(false),
    [autoConfirm, setAutoConfirm] = useState<string | null>(null);
  const tabs = [
    "Business Profile",
    "Financial Settings",
    "Categories",
    "Team",
    "AI Preferences",
    "Invoice Settings",
    "Notifications",
    "Integrations",
    "Security",
  ];
  function preference(key: string, value: boolean | number | string) {
    const before = String(data.preferences[key]);
    setData((d) => ({ ...d, preferences: { ...d.preferences, [key]: value } }));
    log("Preference updated", key, before, String(value), "Settings");
  }
  return (
    <div className={"settings-layout " + (onboarding ? "onboarding" : "")}>
      {!onboarding && (
        <aside className="settings-nav">
          {tabs.map((t) => (
            <button
              key={t}
              className={tab === t ? "selected" : ""}
              onClick={() => {
                setTab(t);
                setError("");
              }}
            >
              {t}
              <ChevronRightIcon />
            </button>
          ))}
        </aside>
      )}
      <div className="settings-main">
        {(onboarding ||
          tab === "Business Profile" ||
          tab === "Financial Settings") && (
          <Panel
            title={onboarding ? "Tell us about your business" : tab}
            subtitle="A few details help make this workspace yours."
          >
            <form
              key={tab}
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget),
                  updates = Object.fromEntries(f.entries()) as Record<
                    string,
                    string
                  >;
                setData((d) => ({
                  ...d,
                  business: { ...d.business, ...updates },
                }));
                log(
                  "Business profile updated",
                  updates.name || data.business.name,
                  "Previous profile",
                  "Updated business details",
                  "Settings",
                );
                notify("Business settings saved for this session.");
                if (onboarding) go("Import Data");
              }}
            >
              <div className="form-grid">
                {(tab === "Financial Settings" && !onboarding
                  ? [
                      ["Country", "country"],
                      ["Currency", "currency"],
                      ["Fiscal year starts", "fiscal"],
                    ]
                  : [
                      ["Business name", "name"],
                      ["Business owner", "owner"],
                      ["Business type", "type"],
                      ["Contact email", "email"],
                      ["Phone number", "phone"],
                      ["Business address", "address"],
                      ["Country", "country"],
                      ["Currency", "currency"],
                      ["Fiscal year starts", "fiscal"],
                    ]
                ).map(([label, key]) => (
                  <Field label={label} key={key}>
                    {key === "currency" ? (
                      <select name={key} defaultValue={data.business[key]}>
                        <option>USD</option>
                      </select>
                    ) : key === "fiscal" ? (
                      <select name={key} defaultValue={data.business[key]}>
                        {["January", "April", "July", "October"].map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name={key}
                        type={key === "email" ? "email" : "text"}
                        defaultValue={data.business[key]}
                        required
                      />
                    )}
                  </Field>
                ))}
              </div>
              <p className="muted">
                This demo uses USD across all financial records.
              </p>
              <div className="form-actions">
                <Button>
                  {onboarding ? "Continue to data import" : "Save settings"}
                  <ArrowRight size={15} />
                </Button>
              </div>
            </form>
            {onboarding && (
              <div className="onboarding-categories">
                <h3>Starting expense categories</h3>
                <div className="chip-list">
                  {data.categories.map((c) => (
                    <span className="category-pill" key={c.name}>
                      {c.name}
                    </span>
                  ))}
                </div>
                <p>Customize these anytime in Settings → Categories.</p>
              </div>
            )}
          </Panel>
        )}
        {!onboarding && tab === "Categories" && (
          <Panel
            title="Custom categories"
            subtitle="Organize your finances around your business."
            action={
              <Button
                onClick={() => {
                  setCategory({ name: "", type: "Expense" });
                  setError("");
                }}
              >
                <Plus size={15} />
                Add category
              </Button>
            }
          >
            {data.categories.map((c) => (
              <div className="category-row" key={c.name}>
                <span
                  className={
                    "category-dot " + (c.type === "Income" ? "teal" : "")
                  }
                />
                <strong>{c.name}</strong>
                <Badge>{c.type}</Badge>
                <span>
                  {
                    data.transactions.filter((t) => t.category === c.name)
                      .length
                  }{" "}
                  records
                </span>
                <button
                  className="text-link"
                  onClick={() => {
                    setCategory({ ...c, original: c.name });
                    setError("");
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-link danger-text"
                  onClick={() => setDeleting(c.name)}
                >
                  Delete
                </button>
              </div>
            ))}
          </Panel>
        )}
        {!onboarding && tab === "Team" && (
          <Panel
            title="Your team"
            subtitle="Demo member management. Invitations are not emailed."
            action={
              <Button onClick={() => setInvite(true)}>
                <Plus size={15} />
                Invite member
              </Button>
            }
          >
            {data.team.map((m) => (
              <div className="team-row" key={m.email}>
                <span className="avatar">
                  {m.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <strong>{m.name}</strong>
                  <p>{m.email}</p>
                </div>
                <Badge>{m.role}</Badge>
              </div>
            ))}
          </Panel>
        )}
        {!onboarding && tab === "AI Preferences" && (
          <Panel
            title="AI that works on your terms"
            subtitle="Control suggestions, confidence, and notifications."
          >
            <Field label="AI Suggestion Confidence Threshold">
              <div className="range-field">
                <input
                  type="range"
                  aria-label="AI Suggestion Confidence Threshold"
                  min="50"
                  max="99"
                  value={Number(data.preferences.threshold)}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      preferences: {
                        ...d.preferences,
                        threshold: Number(e.target.value),
                      },
                    }))
                  }
                />
                <strong>{String(data.preferences.threshold)}%</strong>
              </div>
            </Field>
            <p className="muted">
              Suggestions below this threshold remain in Review Queue. Bulk
              acceptance uses a minimum of 90%.
            </p>
            {[
              ["Auto Categorization", "autoCategory"],
              ["Auto Reconciliation", "autoReconcile"],
              ["AI Insight Notifications", "insightNotifications"],
              ["Forecasting", "forecasting"],
            ].map(([label, key]) => (
              <label className="setting-toggle" key={key}>
                <span>
                  <strong>{label}</strong>
                  <small>
                    {key.startsWith("auto")
                      ? "Future imports only; existing records require review."
                      : "Enable this feature’s notifications and summaries."}
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(data.preferences[key])}
                  onChange={(e) => {
                    if (key.startsWith("auto") && e.target.checked)
                      setAutoConfirm(key);
                    else preference(key, e.target.checked);
                  }}
                />
              </label>
            ))}
            <TrustNote>
              Enabling automatic behavior requires confirmation and leaves an
              audit trail.
            </TrustNote>
            <Button
              variant="outline"
              onClick={() => {
                log(
                  "Confidence threshold updated",
                  "AI preferences",
                  "Previous threshold",
                  String(data.preferences.threshold),
                  "Settings",
                );
                notify("AI preferences saved.");
              }}
            >
              Save preferences
            </Button>
          </Panel>
        )}
        {!onboarding && tab === "Invoice Settings" && (
          <Panel
            title="Invoice defaults"
            subtitle="Set up your standard payment terms."
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                preference("paymentTerms", String(f.get("terms")));
                notify("Invoice defaults saved.");
              }}
            >
              <Field label="Invoice numbering">
                <input readOnly value="INV-2026-####" />
              </Field>
              <Field label="Default payment terms">
                <select
                  name="terms"
                  defaultValue={String(data.preferences.paymentTerms)}
                >
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                </select>
              </Field>
              <p className="muted">
                New invoices can be edited before sending. Delivery always
                requires confirmation.
              </p>
              <Button>Save invoice settings</Button>
            </form>
          </Panel>
        )}
        {!onboarding && tab === "Notifications" && (
          <Panel
            title="Notification preferences"
            subtitle="Choose the updates that help you run your business."
          >
            {[
              ["Low-stock alerts", "stockAlerts"],
              ["Unusual-expense alerts", "expenseAlerts"],
              ["Monthly reports", "reportAlerts"],
            ].map(([l, k]) => (
              <label className="setting-toggle" key={k}>
                <strong>{l}</strong>
                <input
                  type="checkbox"
                  checked={Boolean(data.preferences[k])}
                  onChange={(e) => preference(k, e.target.checked)}
                />
              </label>
            ))}
            <TrustNote>
              Preferences are stored in local frontend state for this session.
            </TrustNote>
          </Panel>
        )}
        {!onboarding && tab === "Integrations" && (
          <Panel title="Connected business tools">
            <p>
              Manage Telegram, Shopify, Email, and POS connections in one place.
            </p>
            <Button onClick={() => go("Integrations")}>
              Manage integrations
              <ArrowRight size={15} />
            </Button>
          </Panel>
        )}
        {!onboarding && tab === "Security" && (
          <Panel
            title="Workspace security"
            subtitle="Clear access boundaries for your business data."
          >
            <div className="notice green">
              <ShieldCheck size={22} />
              <p>
                Telegram replies are limited to the authorized account
                configured for your business.
              </p>
            </div>
            <div className="summary-row">
              <span>Authentication</span>
              <Badge tone="blue">Demo only</Badge>
            </div>
            <div className="summary-row">
              <span>Data storage</span>
              <strong>Current browser session</strong>
            </div>
            <p className="muted">
              No passwords, credentials, or financial files are sent to external
              services. Real security controls will be implemented with the
              backend.
            </p>
            <Button variant="outline" onClick={() => go("Login")}>
              Open demo sign-in
            </Button>
          </Panel>
        )}
      </div>
      <Modal
        title={category?.original ? "Edit category" : "Add category"}
        open={!!category}
        onClose={() => setCategory(null)}
      >
        {category && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = category.name.trim();
              if (!name) {
                setError("Enter a category name.");
                return;
              }
              if (
                data.categories.some(
                  (c) =>
                    c.name.toLowerCase() === name.toLowerCase() &&
                    c.name !== category.original,
                )
              ) {
                setError("This category already exists.");
                return;
              }
              setData((d) => ({
                ...d,
                categories: category.original
                  ? d.categories.map((c) =>
                      c.name === category.original
                        ? { name, type: category.type }
                        : c,
                    )
                  : [...d.categories, { name, type: category.type }],
                transactions: category.original
                  ? d.transactions.map((t) =>
                      t.category === category.original
                        ? { ...t, category: name }
                        : t,
                    )
                  : d.transactions,
              }));
              log(
                category.original ? "Category updated" : "Category added",
                name,
                category.original || "—",
                `${name} · ${category.type}`,
                "Settings",
              );
              setCategory(null);
              notify("Category saved.");
            }}
          >
            <Field label="Category name">
              <input
                required
                value={category.name}
                onChange={(e) =>
                  setCategory({ ...category, name: e.target.value })
                }
              />
            </Field>
            <Field label="Category type">
              <select
                value={category.type}
                onChange={(e) =>
                  setCategory({ ...category, type: e.target.value })
                }
              >
                <option>Expense</option>
                <option>Income</option>
              </select>
            </Field>
            {error && (
              <p role="alert" className="error-note">
                {error}
              </p>
            )}
            <div className="form-actions">
              <Button>Save category</Button>
            </div>
          </form>
        )}
      </Modal>
      <Modal
        title="Delete category?"
        open={!!deleting}
        onClose={() => setDeleting(null)}
      >
        <p>
          Delete {deleting}? Existing transactions will move to Uncategorized.
        </p>
        <div className="form-actions">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            className="danger"
            onClick={() => {
              setData((d) => ({
                ...d,
                categories: d.categories.filter((c) => c.name !== deleting),
                transactions: d.transactions.map((t) =>
                  t.category === deleting
                    ? { ...t, category: "Uncategorized" }
                    : t,
                ),
              }));
              log(
                "Category deleted",
                deleting || "",
                deleting || "",
                "Uncategorized",
                "Settings",
              );
              setDeleting(null);
            }}
          >
            Confirm delete
          </Button>
        </div>
      </Modal>
      <Modal
        title="Invite a team member"
        description="This simulates an invitation. No email will be sent."
        open={invite}
        onClose={() => setInvite(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const member = {
              name: String(f.get("name")),
              email: String(f.get("email")),
              role: String(f.get("role")),
            };
            setData((d) => ({ ...d, team: [...d.team, member] }));
            log(
              "Team invitation simulated",
              member.email,
              "—",
              member.role,
              "Settings",
            );
            setInvite(false);
            notify("Demo member added. No invitation email was sent.");
          }}
        >
          <Field label="Member name">
            <input name="name" required />
          </Field>
          <Field label="Member email">
            <input name="email" type="email" required />
          </Field>
          <Field label="Role">
            <select name="role">
              <option>Accountant</option>
              <option>Viewer</option>
              <option>Manager</option>
            </select>
          </Field>
          <div className="form-actions">
            <Button>Simulate invitation</Button>
          </div>
        </form>
      </Modal>
      <Modal
        title="Enable automatic suggestions?"
        open={!!autoConfirm}
        onClose={() => setAutoConfirm(null)}
        description="This preference applies to future imports; current financial records will not change."
      >
        <p>
          High-confidence suggestions can be applied during future simulated
          imports. Every automatic action will be logged; uncertain results
          still require review.
        </p>
        <div className="form-actions">
          <Button variant="outline" onClick={() => setAutoConfirm(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (autoConfirm) preference(autoConfirm, true);
              setAutoConfirm(null);
              notify("Preference enabled. Current records are unchanged.");
            }}
          >
            Enable preference
          </Button>
        </div>
      </Modal>
    </div>
  );
}
function ChevronRightIcon() {
  return <ArrowRight size={13} />;
}

export function Login() {
  const { go, notify, setData } = useWorkspace();
  const [mode, setMode] = useState("Sign in");
  return (
    <Panel className="auth-form">
      <span className="ai-orb">
        <ChartColumnIncreasing size={28} />
      </span>
      <h2>
        {mode === "Sign in"
          ? "Welcome back."
          : mode === "Register"
            ? "Start with a little clarity."
            : "Reset your password"}
      </h2>
      <p>Your business, brought into focus.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (mode === "Reset password") {
            notify("Demo reset requested. No email was sent.");
            return;
          }
          const f = new FormData(e.currentTarget);
          if (mode === "Register")
            setData((d) => ({
              ...d,
              business: {
                ...d.business,
                owner: String(f.get("name")),
                email: String(f.get("email")),
              },
            }));
          go(mode === "Register" ? "Business Setup" : "Dashboard");
          notify("Welcome to the demo workspace.");
        }}
      >
        {mode === "Register" && (
          <Field label="Your name">
            <input name="name" required />
          </Field>
        )}
        <Field label="Email">
          <input
            name="email"
            type="email"
            required
            placeholder="you@business.com"
          />
        </Field>
        {mode !== "Reset password" && (
          <Field label="Password">
            <input
              type="password"
              minLength={8}
              required
              placeholder="At least 8 characters"
            />
          </Field>
        )}
        <Button>
          {mode === "Register"
            ? "Create account"
            : mode === "Reset password"
              ? "Request reset"
              : mode}
        </Button>
      </form>
      <button
        className="text-link"
        onClick={() => setMode(mode === "Register" ? "Sign in" : "Register")}
      >
        {mode === "Register"
          ? "Already have an account? Sign in"
          : "Create an account"}
      </button>
      <button className="text-link" onClick={() => setMode("Reset password")}>
        Forgot password?
      </button>
      <TrustNote>
        Prototype only. No real authentication or email delivery.
      </TrustNote>
    </Panel>
  );
}
