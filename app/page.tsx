"use client";
import React, { useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  ChartColumnIncreasing,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CloudUpload,
  FileText,
  History,
  LayoutDashboard,
  Leaf,
  Link2,
  LogOut,
  Menu,
  Mic,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { WorkspaceProvider, useWorkspace } from "@/components/workspace";
import { Badge, Button, Modal, TrustNote } from "@/components/common";
import {
  Dashboard,
  Transactions,
  ReviewQueue,
  ImportData,
  CaptureReceipt,
  CostPatterns,
  MonthlyReports,
  AuditHistory,
  TransactionDialog,
} from "@/components/finance";
import { InvoiceWorkspace } from "@/components/invoices";
import {
  Reconciliation,
  SalesStock,
  Forecasting,
  Integrations,
} from "@/components/operations";
import { AskAI, Insights, Settings, Login } from "@/components/intelligence";
import { Page, Transaction, money } from "@/lib/demo";
const navigation: {
  name: Page;
  icon: typeof LayoutDashboard;
  group?: string;
}[] = [
  { name: "Dashboard", icon: LayoutDashboard, group: "BUSINESS OVERVIEW" },
  { name: "Import Data", icon: CloudUpload },
  { name: "Transactions", icon: ArrowLeftRight },
  { name: "Reconciliation", icon: ShieldCheck },
  { name: "Invoices", icon: FileText },
  { name: "Sales & Stock", icon: ShoppingBag },
  { name: "Ask AI", icon: Sparkles, group: "BUSINESS INTELLIGENCE" },
  { name: "AI Insights", icon: ChartColumnIncreasing },
  { name: "Forecasting", icon: TrendingUp },
  { name: "Monthly Reports", icon: FileText },
  { name: "Review Queue", icon: ShieldCheck, group: "WORKSPACE" },
  { name: "Integrations", icon: Link2 },
  { name: "Audit History", icon: History },
  { name: "Settings", icon: SettingsIcon },
];
const subtitles: Partial<Record<Page, string>> = {
  Dashboard: "Here’s how your business is doing today.",
  "Import Data": "From scattered files to a clear financial picture.",
  Transactions: "Every record organized, traceable, and in your control.",
  Reconciliation:
    "Bring your bank transactions and business records into agreement.",
  Invoices: "Less paperwork. More time for your business.",
  "Sales & Stock": "Know what’s selling. Keep your shelves one step ahead.",
  "Ask AI": "A conversation with your business data.",
  "AI Insights":
    "See what changed, understand why, and decide what comes next.",
  Forecasting: "Plan ahead with a clearer view of the possibilities.",
  "Monthly Reports": "Your month in numbers, with the context that matters.",
  "Review Queue": "A second look, with you in control.",
  Integrations: "Bring your business tools into one connected workspace.",
  "Audit History": "A transparent record of every important change.",
  Settings: "Make LedgerVision work for your business.",
  "Cost Patterns":
    "Understand your regular commitments and one-time investments.",
  "Capture Receipt":
    "Turn a receipt into a record, wherever business takes you.",
  "Voice Invoice": "From a few spoken words to an editable invoice.",
  "Business Setup": "A few details to make your workspace feel like home.",
};
function Shell() {
  const { data, page, go, period, setPeriod, toast, notify } = useWorkspace();
  const [mobile, setMobile] = useState(false),
    [modal, setModal] = useState(""),
    [query, setQuery] = useState(""),
    [read, setRead] = useState(false),
    [selected, setSelected] = useState<Transaction | null>(null);
  function navigate(p: Page) {
    setMobile(false);
    setModal("");
    go(p);
  }
  const initials = data.business.owner
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2);
  const notices = [
    {
      title: `Invoice ${data.invoices.find((i) => i.status === "Overdue")?.id || "INV-2026-0037"} is overdue.`,
      sub: "A friendly follow-up could improve cash flow.",
      page: "Invoices",
    },
    {
      title: `${data.reviews.length} imported records need review.`,
      sub: "AI suggestions are ready for your confirmation.",
      page: "Review Queue",
    },
    {
      title: `${data.products.filter((p) => p.stock < p.reorder).length} products are below their restock level.`,
      sub: "Review your inventory before the next busy weekend.",
      page: "Sales & Stock",
    },
    {
      title: "Bank reconciliation completed.",
      sub: "218 sample transactions have been matched.",
      page: "Reconciliation",
    },
    {
      title: "September AI report is ready.",
      sub: "Your monthly business summary is here.",
      page: "Monthly Reports",
    },
    {
      title: "Unusual expense detected: $1,840.",
      sub: "Kitchen World · Equipment · Please verify.",
      page: "Review Queue",
    },
  ].filter((_, i) => i === 2 ? Boolean(data.preferences.stockAlerts) : i === 4 ? Boolean(data.preferences.reportAlerts) : i === 5 ? Boolean(data.preferences.expenseAlerts) : true);
  return (
    <div className="app">
      <aside className={"sidebar " + (mobile ? "open" : "")}>
        <button className="brand" onClick={() => navigate("Dashboard")}>
          <span className="brand-icon">
            <ChartColumnIncreasing size={23} />
          </span>
          <span>LedgerVision</span>
          <span className="ai-label">AI</span>
        </button>
        <div className="workspace-label">
          <span className="workspace-dot" />
          YOUR BUSINESS, IN FOCUS<span className="demo-tag">DEMO</span>
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(({ name, icon: Icon, group }) => (
            <React.Fragment key={name}>
              {group && <div className="nav-label">{group}</div>}
              <button
                aria-current={page === name ? "page" : undefined}
                className={page === name ? "active" : ""}
                onClick={() => navigate(name)}
              >
                <Icon size={18} />
                <span>{name}</span>
                {name === "Review Queue" && data.reviews.length > 0 && (
                  <span className="nav-count">{data.reviews.length}</span>
                )}
                {name === "Ask AI" && <span className="nav-ai">✦</span>}
              </button>
            </React.Fragment>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="help-link"
            onClick={() => setModal("Help & Support")}
          >
            <CircleHelp size={18} />
            Help & Support
            <ArrowRight size={14} />
          </button>
          <button
            className="sidebar-user"
            onClick={() => setModal("Your profile")}
          >
            <span className="avatar">{initials}</span>
            <span>
              <strong>{data.business.owner}</strong>
              <small>Business owner</small>
            </span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <main>
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Menu size={21} />
          </button>
          <button
            className="workspace-selector"
            onClick={() => setModal("Your workspace")}
          >
            <span className="business-icon">
              <Leaf size={18} />
            </span>
            <span>
              <strong>{data.business.name}</strong>
              <small>Business workspace</small>
            </span>
            <ChevronDown size={14} />
          </button>
          <div className="topbar-actions">
            <button
              className="top-search"
              aria-label="Search workspace"
              onClick={() => {
                setModal("Search workspace");
                setQuery("");
              }}
            >
              <Search size={17} />
              <span>Search anything…</span>
              <kbd>⌕</kbd>
            </button>
            <label className="date-select">
              <CalendarDays size={16} />
              <select
                aria-label="Reporting period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option>September 2026</option>
                <option>August 2026</option>
                <option>July 2026</option>
              </select>
            </label>
            <button
              className="icon-button ai-shortcut"
              aria-label="Open AI assistant"
              title="Ask LedgerVision AI"
              onClick={() => navigate("Ask AI")}
            >
              <Sparkles size={19} />
            </button>
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              title="Notifications"
              onClick={() => setModal("Notifications")}
            >
              <Bell size={19} />
              {!read && <i />}
            </button>
            <span className="topbar-divider" />
            <button
              className="avatar small"
              aria-label="Profile menu"
              onClick={() => setModal("Your profile")}
            >
              {initials}
            </button>
          </div>
        </header>
        <div className="content">
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={12} />
            <strong>{page}</strong>
            <span className="session-label">
              <span />
              Live demo workspace
            </span>
          </div>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {page === "Dashboard"
                  ? "A LITTLE CLARITY. A LOT OF POSSIBILITY."
                  : data.business.name.toUpperCase()}
              </div>
              <h1>
                {page === "Dashboard"
                  ? `Good morning, ${data.business.owner.split(" ")[0]}.`
                  : page === "Forecasting"
                    ? "AI Business Forecast"
                    : page === "Voice Invoice"
                      ? "Create Invoice with Voice"
                      : page}
              </h1>
              <p>{subtitles[page] || "Your business, brought into focus."}</p>
            </div>
            <div className="heading-actions">
              {page === "Dashboard" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate("Monthly Reports")}
                  >
                    <FileText size={15} />
                    View report
                  </Button>
                  <Button onClick={() => navigate("Import Data")}>
                    <Plus size={16} />
                    Import data
                  </Button>
                </>
              )}
              {page === "Invoices" && (
                <Badge tone="blue">Delivery is simulated</Badge>
              )}
              {page === "Sales & Stock" && (
                <Button
                  variant="outline"
                  onClick={() => navigate("Import Data")}
                >
                  <CloudUpload size={16} />
                  Import sales
                </Button>
              )}
            </div>
          </div>
          {page === "Dashboard" && <Dashboard />}
          {page === "Transactions" && <Transactions />}
          {page === "Import Data" && <ImportData />}
          {page === "Reconciliation" && <Reconciliation />}
          {page === "Invoices" && <InvoiceWorkspace key="invoices" />}
          {page === "Sales & Stock" && <SalesStock />}
          {page === "Ask AI" && <AskAI />}
          {page === "AI Insights" && <Insights />}
          {page === "Forecasting" && <Forecasting />}
          {page === "Monthly Reports" && <MonthlyReports />}
          {page === "Review Queue" && <ReviewQueue />}
          {page === "Integrations" && <Integrations />}
          {page === "Audit History" && <AuditHistory />}
          {page === "Settings" && <Settings />}
          {page === "Cost Patterns" && <CostPatterns />}
          {page === "Capture Receipt" && <CaptureReceipt />}
          {page === "Voice Invoice" && <InvoiceWorkspace key="voice" voice />}
          {page === "Business Setup" && <Settings onboarding />}
          {page === "Login" && <Login />}
          <footer className="page-footer">
            <ShieldCheck size={13} />
            <span>Financial clarity, powered by AI. Always guided by you.</span>
            <span className="footer-status">
              <i />
              Demo systems operational
            </span>
          </footer>
        </div>
      </main>
      <nav className="mobile-bottom" aria-label="Mobile navigation">
        {[
          [LayoutDashboard, "Home", "Dashboard"],
          [ArrowLeftRight, "Transactions", "Transactions"],
          [Camera, "Capture", "Capture Receipt"],
          [Sparkles, "AI", "Ask AI"],
          [Menu, "More", "More"],
        ].map(([I, label, target]) => {
          const Icon = I as typeof Camera;
          return (
            <button
              key={String(label)}
              className={page === target ? "active" : ""}
              onClick={() =>
                target === "More" ? setMobile(true) : navigate(target as Page)
              }
            >
              <span className={label === "Capture" ? "capture-nav" : ""}>
                <Icon size={21} />
              </span>
              <small>{String(label)}</small>
            </button>
          );
        })}
      </nav>
      <Modal
        title={modal}
        open={!!modal}
        onClose={() => setModal("")}
        description={
          modal === "Search workspace"
            ? "Find pages, invoices, and transactions."
            : "Manage your Angkor Brew demo workspace."
        }
      >
        {modal === "Your workspace" && (
          <>
            <button className="workspace-option" onClick={() => setModal("")}>
              <span className="business-icon">
                <Leaf size={22} />
              </span>
              <span>
                <strong>{data.business.name}</strong>
                <small>
                  {data.business.country} · {data.business.currency}
                </small>
              </span>
              <Badge>Active</Badge>
            </button>
            <Button
              variant="outline"
              onClick={() => navigate("Business Setup")}
            >
              <Plus size={16} />
              Business setup
            </Button>
          </>
        )}
        {modal === "Your profile" && (
          <>
            <div className="profile-card">
              <span className="avatar">{initials}</span>
              <h3>{data.business.owner}</h3>
              <p>{data.business.email}</p>
              <Badge>Business owner</Badge>
            </div>
            <div className="stack-actions">
              <Button variant="outline" onClick={() => navigate("Settings")}>
                <SettingsIcon size={16} />
                Account settings
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("Voice Invoice")}
              >
                <Mic size={16} />
                Create invoice with voice
              </Button>
              <Button variant="ghost" onClick={() => navigate("Login")}>
                <LogOut size={16} />
                Sign out of demo
              </Button>
            </div>
          </>
        )}
        {modal === "Help & Support" && (
          <>
            <div className="help-grid">
              {[
                [
                  "1",
                  "Connect your data",
                  "Upload a file or explore Shopify, POS, and Telegram in Integrations.",
                ],
                [
                  "2",
                  "Review AI suggestions",
                  "Accept, correct, or reject changes. Nothing is silently overwritten.",
                ],
                [
                  "3",
                  "Run your business",
                  "Reconcile records, create invoices, monitor inventory, and explore forecasts.",
                ],
              ].map(([n, t, d]) => (
                <div key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <TrustNote>
              This prototype uses local session state and simulated services.
              Refreshing resets your changes.
            </TrustNote>
            <Button onClick={() => navigate("Business Setup")}>
              Start business setup
              <ArrowRight size={15} />
            </Button>
          </>
        )}
        {modal === "Notifications" && (
          <>
            <div className="toolbar">
              <Badge tone="blue">
                {read ? "All read" : notices.length + " updates"}
              </Badge>
              <button
                className="text-link"
                onClick={() => {
                  setRead(true);
                  notify("All notifications marked as read.");
                }}
              >
                Mark all as read
              </button>
            </div>
            <div className="notification-list">
              {notices.map((n, i) => (
                <button key={n.title} onClick={() => navigate(n.page as Page)}>
                  <span className={"icon-box " + (i === 2 ? "amber" : "blue")}>
                    {i === 0 ? (
                      <FileText size={18} />
                    ) : i === 2 ? (
                      <ShoppingBag size={18} />
                    ) : (
                      <Sparkles size={18} />
                    )}
                  </span>
                  <span>
                    <strong>{n.title}</strong>
                    <small>{n.sub}</small>
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          </>
        )}
        {modal === "Search workspace" && (
          <>
            <label className="search-input global-search">
              <Search size={18} />
              <input
                autoFocus
                placeholder="Search pages, merchants, invoices…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className="search-results">
              {navigation
                .filter((n) =>
                  n.name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((n) => (
                  <button key={n.name} onClick={() => navigate(n.name)}>
                    <n.icon size={18} />
                    <span>{n.name}</span>
                    <small>Page</small>
                    <ChevronRight size={14} />
                  </button>
                ))}
              {query &&
                data.transactions
                  .filter((t) =>
                    (t.merchant + t.description)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .slice(0, 5)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setModal("");
                        setSelected(t);
                      }}
                    >
                      <Wallet size={18} />
                      <span>{t.merchant}</span>
                      <small>{money(t.amount)}</small>
                    </button>
                  ))}
              {query &&
                data.invoices
                  .filter((i) =>
                    (i.id + i.customer)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .slice(0, 3)
                  .map((i) => (
                    <button key={i.id} onClick={() => navigate("Invoices")}>
                      <FileText size={18} />
                      <span>
                        {i.id} · {i.customer}
                      </span>
                      <small>Invoice</small>
                    </button>
                  ))}
            </div>
          </>
        )}
      </Modal>
      <TransactionDialog
        transaction={selected}
        onClose={() => setSelected(null)}
      />
      {toast && (
        <div className="toast" role="status">
          <ShieldCheck size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
export default function App() {
  return (
    <WorkspaceProvider>
      <Shell />
    </WorkspaceProvider>
  );
}
