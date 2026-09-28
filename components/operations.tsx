"use client";
import React, { useState } from "react";
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  Box,
  Check,
  CheckCheck,
  ChevronRight,
  CloudUpload,
  Link2,
  Mail,
  Package,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  Unplug,
  Wallet,
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
import { FinanceChart, ForecastChart, ProductChart } from "./charts";
import { Match, Product, Integration, money } from "@/lib/demo";

export function Reconciliation() {
  const { data, setData, log, notify } = useWorkspace();
  const [filter, setFilter] = useState("All records"),
    [choosing, setChoosing] = useState<Match | null>(null),
    [choice, setChoice] = useState(""),
    [auto, setAuto] = useState(false);
  const confirmed = data.matches.filter((m) => m.status === "Matched").length;
  function update(m: Match, status: string, record = m.record) {
    setData((d) => ({
      ...d,
      matches: d.matches.map((x) =>
        x.id === m.id ? { ...x, status, record } : x,
      ),
      transactions: d.transactions.map((t) =>
        (m.id === "m1" && t.id === "t1") || (m.id === "m4" && t.id === "t5")
          ? { ...t, reconciliation: status }
          : t,
      ),
    }));
    log(
      "Reconciliation updated",
      m.bank,
      m.status,
      status + " · " + record,
      "Bank matching",
    );
    notify(
      status === "Matched"
        ? "Match confirmed and recorded."
        : "Record marked unmatched.",
    );
  }
  const rows = data.matches.filter(
    (m) => filter === "All records" || m.status === filter,
  );
  return (
    <>
      <div className="metrics four">
        <Metric
          label="Bank transactions"
          value="246"
          icon={Wallet}
          note="September statement"
        />
        <Metric
          label="Matched"
          value={String(217 + confirmed)}
          icon={CheckCheck}
          tone="teal"
          note="Includes 217 earlier matches"
        />
        <Metric
          label="Needs review"
          value={String(
            19 +
              data.matches.filter((m) =>
                ["Possible Match", "Needs Review"].includes(m.status),
              ).length,
          )}
          icon={ShieldCheck}
          tone="amber"
          note="Confirm suggested pairs"
        />
        <Metric
          label="Unmatched"
          value={String(
            6 + data.matches.filter((m) => m.status === "Unmatched").length,
          )}
          icon={ArrowLeftRight}
          tone="purple"
          note="Find a corresponding record"
        />
      </div>
      <div className="notice blue">
        <Sparkles size={22} />
        <div>
          <strong>A match is more than a matching amount.</strong>
          <p>
            We compare dates, references, amounts, and merchant names. You
            confirm the final connection.
          </p>
        </div>
      </div>
      <div className="toolbar">
        <div className="tabs">
          {[
            "All records",
            "Matched",
            "Possible Match",
            "Needs Review",
            "Unmatched",
          ].map((f) => (
            <button
              className={filter === f ? "selected" : ""}
              onClick={() => setFilter(f)}
              key={f}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="switch-label">
          <input
            type="checkbox"
            checked={Boolean(data.preferences.autoReconcile)}
            onChange={(e) =>
              e.target.checked
                ? setAuto(true)
                : setData((d) => ({
                    ...d,
                    preferences: { ...d.preferences, autoReconcile: false },
                  }))
            }
          />
          Automatically confirm matches above 98%
        </label>
      </div>
      {rows.map((m) => (
        <Panel
          className="match-card"
          key={m.id}
          action={<Badge>{m.status}</Badge>}
          title={m.status === "Matched" ? "Confirmed match" : "Suggested match"}
        >
          <div className="match-pair">
            <div>
              <small>BANK TRANSACTION</small>
              <strong>{m.bank}</strong>
              <b>{money(m.amount)}</b>
              <span>ABA Bank · September 2026</span>
            </div>
            <span className="match-connector">
              <ArrowLeftRight size={22} />
              {m.confidence > 0 && (
                <Badge tone={m.confidence > 95 ? "green" : "amber"}>
                  {m.confidence}% match
                </Badge>
              )}
            </span>
            <div>
              <small>SYSTEM RECORD</small>
              <strong>{m.record}</strong>
              <b>
                {m.record === "No suggested record" ? "—" : money(m.amount)}
              </b>
              <span>LedgerVision · Financial ledger</span>
            </div>
          </div>
          <p className="reason">
            <Sparkles size={15} />
            {m.reason}
          </p>
          {m.status !== "Matched" && (
            <div className="form-actions">
              <Button
                variant="ghost"
                disabled={m.status === "Unmatched"}
                onClick={() => update(m, "Unmatched", "No suggested record")}
              >
                Mark Unmatched
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setChoosing(m);
                  setChoice("");
                }}
              >
                Choose Different
              </Button>
              <Button
                disabled={m.record === "No suggested record"}
                onClick={() => update(m, "Matched")}
              >
                <Check size={15} />
                Confirm Match
              </Button>
            </div>
          )}
        </Panel>
      ))}
      {!rows.length && (
        <Panel>
          <Empty title="No records in this view" />
        </Panel>
      )}
      <TrustNote>
        Showing 4 representative sample records. Summary totals include the rest
        of the demo bank statement.
      </TrustNote>
      <Modal
        title="Choose a ledger record"
        open={!!choosing}
        onClose={() => setChoosing(null)}
      >
        <Field label="System record">
          <select value={choice} onChange={(e) => setChoice(e.target.value)}>
            <option value="">Select a transaction</option>
            {data.transactions.map((t) => (
              <option value={t.id} key={t.id}>
                {t.merchant} · {money(t.amount)} · {t.date}
              </option>
            ))}
          </select>
        </Field>
        {choice && (
          <div className="notice amber">
            <TriangleAlert size={17} />
            <p>
              Verify both amount and reference. A manual match can override the
              AI suggestion.
            </p>
          </div>
        )}
        <div className="form-actions">
          <Button
            disabled={!choice}
            onClick={() => {
              if (!choosing) return;
              const t = data.transactions.find((t) => t.id === choice)!;
              update(choosing, "Matched", t.merchant + " · " + t.category);
              setData((d) => ({
                ...d,
                transactions: d.transactions.map((x) =>
                  x.id === t.id ? { ...x, reconciliation: "Matched" } : x,
                ),
              }));
              setChoosing(null);
            }}
          >
            Confirm selected match
          </Button>
        </div>
      </Modal>
      <Modal
        title="Enable automatic matching?"
        open={auto}
        onClose={() => setAuto(false)}
        description="This changes future matching behavior only. Existing suggestions still need your confirmation."
      >
        <p>
          Future matches above 98% confidence will be confirmed and logged
          automatically. Lower-confidence matches will stay in Review Queue.
        </p>
        <div className="form-actions">
          <Button variant="outline" onClick={() => setAuto(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setData((d) => ({
                ...d,
                preferences: { ...d.preferences, autoReconcile: true },
              }));
              log(
                "AI preference changed",
                "Auto reconciliation",
                "Off",
                "Above 98% for future imports",
                "Settings",
              );
              setAuto(false);
              notify("Preference enabled. Existing records remain unchanged.");
            }}
          >
            Enable preference
          </Button>
        </div>
      </Modal>
    </>
  );
}

export function SalesStock() {
  const { data, setData, go, log, notify } = useWorkspace();
  const [tab, setTab] = useState("Sales overview"),
    [query, setQuery] = useState(""),
    [edit, setEdit] = useState<Product | null>(null),
    [syncing, setSyncing] = useState(false);
  const low = data.products.filter((p) => p.stock < p.reorder);
  const state = (p: Product) =>
    p.stock === 0
      ? "Out of Stock"
      : p.stock < p.reorder
        ? "Low Stock"
        : "In Stock";
  return (
    <>
      <div className="integration-strip">
        {[
          ["Shopify", ShoppingBag],
          ["POS", CreditCardIcon],
          ["Manual import", CloudUpload],
        ].map(([name, I]) => {
          const Icon = I as typeof ShoppingBag;
          const connected = data.integrations.find(
            (i) => i.name === name,
          )?.connected;
          return (
            <button
              key={String(name)}
              className="card integration-mini"
              onClick={() =>
                go(name === "Manual import" ? "Import Data" : "Integrations")
              }
            >
              <span className="icon-box teal">
                <Icon size={22} />
              </span>
              <span>
                <strong>{String(name)}</strong>
                <small>
                  {name === "Manual import"
                    ? "CSV / Excel available"
                    : name === "Shopify"
                      ? "GraphQL sync · Demo integration"
                      : "Daily sales & stock"}
                </small>
              </span>
              <Badge
                tone={
                  name === "Manual import"
                    ? "blue"
                    : connected
                      ? "green"
                      : "amber"
                }
              >
                {name === "Manual import"
                  ? "Available"
                  : connected
                    ? "Connected"
                    : "Not Connected"}
              </Badge>
              <ChevronRight size={16} />
            </button>
          );
        })}
      </div>
      <div className="toolbar">
        <div className="tabs">
          {["Sales overview", "Stock inventory"].map((t) => (
            <button
              aria-label={t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
              key={t}
            >
              {t}
              {t === "Stock inventory" && <span>{low.length}</span>}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          disabled={syncing}
          onClick={() => {
            setSyncing(true);
            setTimeout(() => {
              setSyncing(false);
              log(
                "Sales sync simulated",
                "Shopify",
                "Previous demo snapshot",
                "Latest demo snapshot",
                "Shopify",
              );
              notify("Demo sales and stock are up to date.");
            }, 700);
          }}
        >
          {syncing ? "Syncing…" : "Sync data"}
        </Button>
      </div>
      {tab === "Sales overview" ? (
        <>
          <div className="metrics four">
            <Metric
              label="Today’s sales"
              value="$890.00"
              change="12%"
              icon={Wallet}
              note="vs. yesterday"
            />
            <Metric
              label="Monthly sales"
              value="$15,300.00"
              change="9%"
              icon={TrendingUp}
            />
            <Metric
              label="Orders"
              value="486"
              icon={ShoppingBag}
              tone="teal"
              note="September 2026"
            />
            <Metric
              label="Average order value"
              value="$31.48"
              icon={Activity}
              tone="purple"
              note="Across all sales channels"
            />
          </div>
          <div className="two-column">
            <Panel
              title="Daily sales"
              subtitle="September · Representative daily performance"
            >
              <FinanceChart
                kind="sales"
                data={[
                  { month: "Mon", sales: 620 },
                  { month: "Tue", sales: 740 },
                  { month: "Wed", sales: 690 },
                  { month: "Thu", sales: 810 },
                  { month: "Fri", sales: 960 },
                  { month: "Sat", sales: 1240 },
                  { month: "Sun", sales: 890 },
                ].map((d) => ({
                  ...d,
                  revenue: d.sales,
                  expenses: 0,
                  profit: 0,
                }))}
              />
            </Panel>
            <Panel
              title="Revenue by product"
              subtitle="Current product sales snapshot"
            >
              <ProductChart
                data={data.products.map((p) => ({
                  name: p.name.replace("Arabica ", "").replace("Fresh ", ""),
                  value: p.sold * p.price,
                }))}
              />
            </Panel>
          </div>
          <Panel
            title="Top products"
            subtitle="Your customer favorites this month."
            className="top-gap"
          >
            <div className="top-products">
              {[...data.products]
                .sort((a, b) => b.sold - a.sold)
                .slice(0, 3)
                .map((p, i) => (
                  <div key={p.id}>
                    <span className={"product-art product-" + i}>
                      <Package size={32} />
                    </span>
                    <div>
                      <small>#{i + 1} BEST SELLER</small>
                      <h3>{p.name}</h3>
                      <p>
                        {p.sold} sold · {money(p.sold * p.price)} revenue
                      </p>
                    </div>
                    <span className="positive">
                      <TrendingUp size={18} />
                    </span>
                  </div>
                ))}
            </div>
          </Panel>
        </>
      ) : (
        <>
          <div className="notice amber">
            <TriangleAlert size={21} />
            <div>
              <strong>
                {low.length
                  ? `${low.length} ${low.length===1?'product needs':'products need'} a restock`
                  : "Stock levels look healthy"}
              </strong>
              <p>
                {low.map((p) => p.name).join(" and ")}
                {low.length
                  ? " below reorder level. Review inventory before your next busy weekend."
                  : "No low-stock alerts."}
              </p>
            </div>
          </div>
          <Panel
            title="Stock inventory"
            action={
              <label className="search-input">
                <Search size={16} />
                <input
                  placeholder="Search products or SKU…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            }
          >
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    {[
                      "Product",
                      "SKU",
                      "Current stock",
                      "Sold",
                      "Restock level",
                      "Status",
                      "Actions",
                    ].map((x) => (
                      <th key={x}>{x}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.products
                    .filter((p) =>
                      (p.name + p.sku)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.name}</strong>
                        </td>
                        <td>{p.sku}</td>
                        <td>{p.stock} units</td>
                        <td>{p.sold}</td>
                        <td>{p.reorder}</td>
                        <td>
                          <Badge>{state(p)}</Badge>
                        </td>
                        <td>
                          <button
                            className="text-link"
                            onClick={() => setEdit(p)}
                          >
                            Adjust stock
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
      <Modal
        title="Adjust stock level"
        description="Confirm the physical count. Changes are recorded in audit history."
        open={!!edit}
        onClose={() => setEdit(null)}
      >
        {edit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const old = data.products.find((p) => p.id === edit.id)!;
              setData((d) => ({
                ...d,
                products: d.products.map((p) => (p.id === edit.id ? edit : p)),
              }));
              log(
                "Stock adjusted",
                edit.name,
                String(old.stock),
                String(edit.stock),
                "Manual inventory count",
              );
              setEdit(null);
              notify("Stock level updated.");
            }}
          >
            <h3>{edit.name}</h3>
            <Field label="Current stock">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={edit.stock}
                onChange={(e) =>
                  setEdit({ ...edit, stock: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Restock level">
              <input
                type="number"
                min="0"
                required
                value={edit.reorder}
                onChange={(e) =>
                  setEdit({ ...edit, reorder: Number(e.target.value) })
                }
              />
            </Field>
            <div className="form-actions">
              <Button>Confirm stock adjustment</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
function CreditCardIcon(props: { size?: number }) {
  return <Activity {...props} />;
}

export function Forecasting() {
  const { data, go } = useWorkspace();
  const [months, setMonths] = useState(1);
  const revenue = Array.from(
      { length: months },
      (_, i) => 16800 * Math.pow(1.035, i),
    ).reduce((s, n) => s + n, 0),
    expense = Array.from(
      { length: months },
      (_, i) => 10600 * Math.pow(1.025, i),
    ).reduce((s, n) => s + n, 0);
  if (!data.preferences.forecasting) return <Panel title="Forecasting is turned off"><Empty title="Your forecast is paused" text="Enable Forecasting in AI Preferences to explore future business performance." action={<Button onClick={() => go("Settings")}>Open settings</Button>} /></Panel>;
  return (
    <>
      <div className="forecast-heading">
        <div className="tabs">
          {[
            [1, "Next 30 Days"],
            [3, "Next 3 Months"],
            [6, "Next 6 Months"],
            [12, "Next 12 Months"],
          ].map(([v, l]) => (
            <button
              className={months === v ? "selected" : ""}
              key={v}
              onClick={() => setMonths(Number(v))}
            >
              {l}
            </button>
          ))}
        </div>
        <Badge tone={months < 4 ? "green" : months < 7 ? "amber" : "red"}>
          {months < 4 ? "High" : months < 7 ? "Medium" : "Low"} confidence
        </Badge>
      </div>
      <div className="metrics four">
        <Metric
          label="Expected revenue"
          value={money(revenue)}
          icon={TrendingUp}
          note={`${months}-month projection`}
        />
        <Metric
          label="Expected expenses"
          value={money(expense)}
          icon={Activity}
          tone="amber"
          note="Estimated operating costs"
        />
        <Metric
          label="Expected profit"
          value={money(revenue - expense)}
          icon={Wallet}
          tone="teal"
          note="Revenue less expenses"
        />
        <Metric
          label="Expected cash flow"
          value={money(7840 + (revenue - expense) * 0.7)}
          icon={ArrowLeftRight}
          tone="purple"
          note="Illustrative cash collection model"
        />
      </div>
      <Panel
        title="A view of what could come next"
        subtitle="Six months of history, followed by a projected trend."
        action={<Badge tone="blue">Estimates, not guarantees</Badge>}
      >
        <ForecastChart months={months} />
      </Panel>
      <div className="notice blue top-gap">
        <Sparkles size={24} />
        <div>
          <strong>Why this forecast?</strong>
          <p>
            Based on the previous six months of sales, next-month revenue is
            projected at $16,800 — approximately 10% above September. Later
            months assume 3.5% monthly revenue growth and 2.5% cost growth.
            Confidence decreases as the forecast extends.
          </p>
        </div>
      </div>
      <div className="two-column top-gap">
        <Panel title="Possible risk" action={<TriangleAlert size={19} />}>
          <p>
            Ingredient expenses have increased for three consecutive months.
            Supplier changes could reduce the expected margin.
          </p>
        </Panel>
        <Panel title="Opportunity" action={<TrendingUp size={19} />}>
          <p>
            Weekend sales are trending upward. Keeping popular products stocked
            may help you capture that demand.
          </p>
        </Panel>
      </div>
      <TrustNote>
        Forecasts are estimates based on historical business data. This
        prototype uses an illustrative model.
      </TrustNote>
    </>
  );
}

export function Integrations() {
  const { data, setData, log, notify } = useWorkspace();
  const [config, setConfig] = useState<Integration | null>(null),
    [disconnect, setDisconnect] = useState<Integration | null>(null),
    [busy, setBusy] = useState(""),
    [chat, setChat] = useState(false);
  const icons: Record<string, typeof Send> = {
    Telegram: Send,
    Shopify: ShoppingBag,
    Email: Mail,
    POS: Activity,
  };
  return (
    <>
      <div className="notice blue">
        <Link2 size={22} />
        <div>
          <strong>Your business tools, working together.</strong>
          <p>
            Connect a demo account to explore the experience. No real APIs,
            credentials, or external messages are used.
          </p>
        </div>
      </div>
      <div className="integrations-grid">
        {data.integrations.map((i) => {
          const Icon = icons[i.name];
          return (
            <Panel key={i.name} className="integration-card">
              <div className="integration-card-top">
                <span className={"integration-logo " + i.name.toLowerCase()}>
                  <Icon size={27} />
                </span>
                <Badge tone={i.connected ? "green" : "amber"}>
                  {i.connected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              <h2>
                {i.name === "Telegram"
                  ? "LedgerVision Telegram Bot"
                  : i.name === "POS"
                    ? "POS System"
                    : i.name}
              </h2>
              <p>
                {
                  {
                    Telegram: "Your finances, one conversation away.",
                    Shopify: "Keep orders, products, and stock in sync.",
                    Email: "Professional invoices, delivered simply.",
                    POS: "Bring every sale into your financial picture.",
                  }[i.name]
                }
              </p>
              <div className="integration-account">
                <small>
                  {i.connected ? "CONNECTED DEMO ACCOUNT" : "DEMO CONNECTION"}
                </small>
                <strong>{i.account}</strong>
              </div>
              <div className="form-actions">
                {i.connected ? (
                  <>
                    <Button variant="ghost" onClick={() => setDisconnect(i)}>
                      <Unplug size={14} />
                      Disconnect
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setConfig({ ...i, options: [...i.options] })
                      }
                    >
                      Configure
                    </Button>
                  </>
                ) : (
                  <Button
                    disabled={busy === i.name}
                    onClick={() => {
                      setBusy(i.name);
                      setTimeout(() => {
                        setData((d) => ({
                          ...d,
                          integrations: d.integrations.map((x) =>
                            x.name === i.name ? { ...x, connected: true } : x,
                          ),
                        }));
                        log(
                          "Integration connected",
                          i.name,
                          "Disconnected",
                          i.account,
                          "Demo integration",
                        );
                        setBusy("");
                        notify(`${i.name} demo account connected.`);
                      }, 650);
                    }}
                  >
                    {busy === i.name ? "Connecting…" : "Connect " + i.name}
                  </Button>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
      <div className="two-column top-gap">
        <Panel
          title="Meet your business on Telegram"
          subtitle="A preview of your authorized business conversation."
          action={<Send size={20} />}
        >
          <div className="telegram-preview">
            <div className="telegram-message user">
              How much did I make this week?<small>10:32 ✓✓</small>
            </div>
            <div className="telegram-message bot">
              <strong>LedgerVision Bot</strong>Your revenue this week is{" "}
              <b>$3,820</b>, which is 11% higher than last week.
              <small>Demo sales summary · Sep 21–27</small>
            </div>
            <div className="telegram-message user">
              What is my biggest expense?<small>10:33 ✓✓</small>
            </div>
            <div className="telegram-message bot">
              <strong>LedgerVision Bot</strong>Ingredients were your largest
              expense: <b>$940 this week.</b>
              <small>Source: sample transactions</small>
            </div>
            {chat && (
              <div className="telegram-message bot">
                <strong>LedgerVision Bot</strong>Your September report is ready.
                Revenue $15,300 · Profit $5,200.
                <small>Simulated preview response</small>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setChat(true)}
              disabled={chat}
            >
              Preview report response
            </Button>
          </div>
        </Panel>
        <Panel
          title="You choose what your bot can do"
          subtitle="Convenience, with clear boundaries."
        >
          <div className="feature-list">
            {[
              "Only authorized business accounts",
              "Financial answers grounded in your records",
              "Final confirmation before invoice delivery",
              "Configurable stock and expense alerts",
            ].map((s) => (
              <p key={s}>
                <ShieldCheck size={18} />
                {s}
              </p>
            ))}
          </div>
          <div className="notice green">
            <ShieldCheck size={22} />
            <p>
              LedgerVision only responds to Telegram accounts authorized by your
              business.
            </p>
          </div>
          <p className="muted">
            Authorization is represented visually in this frontend. No Telegram
            bot or account is connected to a live service.
          </p>
        </Panel>
      </div>
      <Modal
        title={config ? `Configure ${config.name}` : "Configure integration"}
        description="Choose account permissions for this simulated connection."
        open={!!config}
        onClose={() => setConfig(null)}
      >
        {config && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setData((d) => ({
                ...d,
                integrations: d.integrations.map((i) =>
                  i.name === config.name ? config : i,
                ),
              }));
              log(
                "Integration configured",
                config.name,
                "Previous preferences",
                config.options.join(", "),
                "Settings",
              );
              setConfig(null);
              notify("Integration preferences saved.");
            }}
          >
            <Field
              label={
                config.name === "Telegram"
                  ? "Authorized Telegram account"
                  : "Demo account"
              }
            >
              <input
                required
                value={config.account}
                pattern={
                  config.name === "Telegram" ? "@[A-Za-z0-9_]+" : undefined
                }
                onChange={(e) =>
                  setConfig({ ...config, account: e.target.value })
                }
              />
            </Field>
            {(config.name === "Telegram"
              ? [
                  "Ask financial questions",
                  "Receive monthly report",
                  "Receive invoice notifications",
                  "Send invoices",
                  "Receive low-stock alerts",
                  "Receive unusual-expense alerts",
                ]
              : config.name === "Shopify"
                ? ["Import orders", "Sync stock", "Daily sales summary"]
                : config.name === "Email"
                  ? ["Send invoices", "Payment reminders"]
                  : ["Sync daily sales", "Sync inventory"]
            ).map((o) => (
              <label className="check-field" key={o}>
                <input
                  type="checkbox"
                  checked={config.options.includes(o)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      options: e.target.checked
                        ? [...config.options, o]
                        : config.options.filter((x) => x !== o),
                    })
                  }
                />
                {o}
              </label>
            ))}
            <div className="form-actions">
              <Button>Save configuration</Button>
            </div>
          </form>
        )}
      </Modal>
      <Modal
        title="Disconnect integration?"
        open={!!disconnect}
        onClose={() => setDisconnect(null)}
      >
        <p>
          {disconnect?.name} will stop simulated synchronization. Existing
          records are preserved.
        </p>
        <div className="form-actions">
          <Button variant="outline" onClick={() => setDisconnect(null)}>
            Keep connected
          </Button>
          <Button
            className="danger"
            onClick={() => {
              if (!disconnect) return;
              setData((d) => ({
                ...d,
                integrations: d.integrations.map((i) =>
                  i.name === disconnect.name ? { ...i, connected: false } : i,
                ),
              }));
              log(
                "Integration disconnected",
                disconnect.name,
                "Connected",
                "Disconnected",
                "User confirmation",
              );
              setDisconnect(null);
              notify("Demo integration disconnected.");
            }}
          >
            Confirm disconnect
          </Button>
        </div>
      </Modal>
    </>
  );
}
