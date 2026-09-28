import { before, afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React from "react";
let App: typeof import("../app/page").default;
let render: typeof import("@testing-library/react").render;
let screen: typeof import("@testing-library/react").screen;
let fireEvent: typeof import("@testing-library/react").fireEvent;
let cleanup: typeof import("@testing-library/react").cleanup;
let waitFor: typeof import("@testing-library/react").waitFor;
let within: typeof import("@testing-library/react").within;
before(async () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost:3000",
  });
  for (const key of [
    "window",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
    "NodeFilter",
    "DocumentFragment",
    "MutationObserver",
    "HTMLInputElement",
    "HTMLButtonElement",
    "SVGElement",
    "Event",
    "MouseEvent",
    "CustomEvent",
    "FormData",
  ])
    Object.defineProperty(globalThis, key, {
      value: (dom.window as any)[key],
      configurable: true,
      writable: true,
    });
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  Object.defineProperty(
    dom.window.HTMLElement.prototype,
    "getBoundingClientRect",
    {
      value() {
        return {
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 600,
          bottom: 300,
          width: 600,
          height: 300,
          toJSON() {
            return {};
          },
        };
      },
    },
  );
  globalThis.requestAnimationFrame = (cb) =>
    setTimeout(cb, 0) as unknown as number;
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.scrollTo = () => {};
  App = (await import("../app/page")).default;
  ({ render, screen, fireEvent, cleanup, waitFor, within } =
    await import("@testing-library/react"));
  (await import("@testing-library/react")).configure({
    getElementError: (message) => new Error(message || "Element not found"),
  });
});
afterEach(() => cleanup());
function navigate(name: string) {
  const nav = Array.from(
    document.querySelectorAll("aside.sidebar nav button"),
  ).find((b) => b.querySelector("span")?.textContent === name);
  assert.ok(nav, "Navigation exists: " + name);
  fireEvent.click(nav);
}
function click(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}
function field(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
test("all primary navigation screens render without runtime errors", () => {
  render(<App />);
  for (const name of [
    "Import Data",
    "Transactions",
    "Reconciliation",
    "Invoices",
    "Sales & Stock",
    "Ask AI",
    "AI Insights",
    "Forecasting",
    "Monthly Reports",
    "Review Queue",
    "Integrations",
    "Audit History",
    "Settings",
    "Dashboard",
  ]) {
    navigate(name);
    assert.ok(document.querySelector("main h1")?.textContent);
    assert.equal(
      document.querySelector("main h1")?.textContent,
      name === "Dashboard"
        ? "Good morning, John."
        : name === "Forecasting"
          ? "AI Business Forecast"
          : name,
    );
  }
});
test("transaction creation, editing, source preservation and audit trail", () => {
  render(<App />);
  navigate("Transactions");
  click("Add transaction");
  field("Merchant", "Test supplier");
  field("Amount", "123.45");
  field("Description", "Weekly produce");
  click("Save transaction");
  fireEvent.change(screen.getByPlaceholderText("Search transactions…"), {
    target: { value: "Test supplier" },
  });
  click("View Test supplier");
  click("Edit transaction");
  field("Amount", "135.50");
  click("Save transaction");
  assert.ok(screen.getByText("−$135.50"));
  click("View Test supplier");
  fireEvent.click(screen.getByText("Original imported data"));
  assert.match(document.querySelector("pre")!.textContent!, /123.45/);
  click("Close dialog");
  navigate("Audit History");
  assert.ok(screen.getByText(/Ingredients · \$135.50/));
});
test("category types and renames survive navigation and update transactions", () => {
  render(<App />);
  navigate("Settings");
  click("Categories");
  click("Add category");
  field("Category name", "Catering");
  field("Category type", "Income");
  click("Save category");
  const row = screen.getByText("Catering").closest(".category-row")!;
  assert.match(row.textContent!, /Income/);
  fireEvent.click(
    within(row as HTMLElement).getByRole("button", { name: "Edit" }),
  );
  field("Category name", "Event catering");
  click("Save category");
  navigate("Dashboard");
  navigate("Settings");
  click("Categories");
  assert.ok(screen.getByText("Event catering"));
});
test("bulk review requires confirmation and rejection preserves original data", () => {
  render(<App />);
  navigate("Review Queue");
  click("Accept all high confidence (3)");
  assert.ok(screen.getByRole("dialog"));
  click("Cancel");
  assert.equal(document.querySelectorAll(".review-item").length, 7);
  click("Accept all high confidence (3)");
  click("Confirm 3 changes");
  assert.equal(document.querySelectorAll(".review-item").length, 4);
  click("Abnormal amounts");
  click("Reject");
  assert.ok(screen.getByText("All clear here"));
  navigate("Audit History");
  assert.ok(screen.getByText("AI suggestion rejected"));
});
test("receipt simulation produces a corrected transaction after review", async () => {
  render(<App />);
  click("Upload receipt");
  click("Try a sample receipt");
  await waitFor(() => assert.ok(screen.getByLabelText("Merchant")), {
    timeout: 2500,
  });
  field("Merchant", "Receipt test merchant");
  field("Amount", "89.75");
  click("Save Transaction");
  assert.ok(screen.getByText("Receipt test merchant"));
  assert.ok(screen.getByText("−$89.75"));
});
test("import validates unique mappings, adds records, and queues uncertainty", async () => {
  render(<App />);
  navigate("Import Data");
  fireEvent.change(document.querySelector("input[type=file]")!, {
    target: {
      files: [
        new window.File(["date,description,amount"], "sample.csv", {
          type: "text/csv",
        }),
      ],
    },
  });
  await waitFor(
    () => assert.ok(screen.getByRole("button", { name: "Validate Data" })),
    { timeout: 2500 },
  );
  assert.equal(
    (
      screen.getByRole("button", {
        name: "Continue Import",
      }) as HTMLButtonElement
    ).disabled,
    true,
  );
  field("Vendor", "Date");
  click("Validate Data");
  assert.ok(screen.getByRole("alert"));
  field("Vendor", "Merchant");
  click("Validate Data");
  await waitFor(() =>
    assert.equal(
      (
        screen.getByRole("button", {
          name: "Continue Import",
        }) as HTMLButtonElement
      ).disabled,
      false,
    ),
  );
  click("Continue Import");
  await waitFor(
    () =>
      assert.equal(
        document.querySelector("main h1")?.textContent,
        "Review Queue",
      ),
    { timeout: 2000 },
  );
  assert.equal(document.querySelectorAll(".review-item").length, 8);
  navigate("Transactions");
  assert.ok(
    screen.getAllByText("Sample imported row · sample.csv").length === 3,
  );
});
test("invoice math and delivery require final confirmation", async () => {
  render(<App />);
  navigate("Invoices");
  click("Create Invoice");
  field("Customer Name", "Test Café");
  field("Customer Email", "accounts@example.com");
  field("Item 1", "Coffee beans");
  field("Quantity 1", "10");
  field("Unit price 1", "20");
  field("Tax 1", "10");
  field("Discount (USD)", "5");
  assert.ok(screen.getByText("$215.00"));
  click("Send Invoice");
  assert.ok(screen.getByRole("dialog", { name: "Send invoice" }));
  assert.ok(screen.getByText(/no email or Telegram message leaves this app/));
  click("Cancel");
  assert.equal(screen.queryByRole("dialog"), null);
  click("Send Invoice");
  click("Confirm & Send Invoice");
  await waitFor(() => assert.ok(screen.getByText("Test Café")), {
    timeout: 2000,
  });
  const row = screen.getByText("Test Café").closest("tr")!;
  assert.match(row.textContent!, /Sent/);
  assert.match(row.textContent!, /\$215.00/);
  navigate("Audit History");
  assert.ok(screen.getByText("Invoice delivery simulated"));
});
test("voice simulation creates an editable $225 draft without microphone access", async () => {
  render(<App />);
  navigate("Invoices");
  click("Create with voice");
  click("Start voice invoice simulation");
  await waitFor(() => assert.ok(screen.getByLabelText("Customer Name")), {
    timeout: 3000,
  });
  assert.equal(
    (screen.getByLabelText("Customer Name") as HTMLInputElement).value,
    "ABC Restaurant",
  );
  assert.equal(document.querySelector(".grand-total b")?.textContent, "$225.00");
  field("Customer Name", "Edited voice customer");
  click("Save Draft");
  assert.ok(screen.getByText("Edited voice customer"));
  assert.match(
    screen.getByText("Edited voice customer").closest("tr")!.textContent!,
    /Draft/,
  );
});
test("reconciliation confirms a match and synchronizes transaction status", () => {
  render(<App />);
  navigate("Reconciliation");
  click("Possible Match");
  click("Confirm Match");
  assert.ok(screen.getByText("No records in this view"));
  navigate("Transactions");
  assert.match(
    screen.getByRole("button", { name: "View Angkor Market" }).closest("tr")!
      .textContent!,
    /Matched/,
  );
  navigate("Audit History");
  assert.ok(screen.getByText("Reconciliation updated"));
});
test("stock adjustment resolves a low-stock alert and records the change", () => {
  render(<App />);
  navigate("Sales & Stock");
  click("Stock inventory");
  const row = screen.getByText("Arabica Coffee").closest("tr")!;
  fireEvent.click(
    within(row as HTMLElement).getByRole("button", { name: "Adjust stock" }),
  );
  field("Current stock", "40");
  click("Confirm stock adjustment");
  assert.match(
    screen.getByText("Arabica Coffee").closest("tr")!.textContent!,
    /In Stock/,
  );
  assert.ok(screen.getByText("1 product needs a restock"));
  navigate("Audit History");
  assert.ok(screen.getByText("Stock adjusted"));
});
test("forecast period changes estimated values and confidence", () => {
  render(<App />);
  navigate("Forecasting");
  assert.ok(screen.getByText("$16,800.00"));
  click("Next 12 Months");
  assert.equal(screen.queryByText("$16,800.00"), null);
  assert.ok(screen.getByText("Low confidence"));
});
test("integration disconnect requires confirmation and reconnect is simulated", async () => {
  render(<App />);
  navigate("Integrations");
  const card = screen
    .getByRole("heading", { name: "LedgerVision Telegram Bot" })
    .closest(".card")!;
  fireEvent.click(
    within(card as HTMLElement).getByRole("button", { name: "Disconnect" }),
  );
  click("Keep connected");
  assert.ok(within(card as HTMLElement).getByText("Connected"));
  fireEvent.click(
    within(card as HTMLElement).getByRole("button", { name: "Disconnect" }),
  );
  click("Confirm disconnect");
  click("Connect Telegram");
  await waitFor(
    () => assert.ok(within(card as HTMLElement).getByText("Connected")),
    { timeout: 2000 },
  );
});
test("AI responds with sourced business data and a source action", async () => {
  render(<App />);
  navigate("Ask AI");
  click("What were my best-selling products?");
  await waitFor(() => assert.ok(screen.getByText("128 sold")), {
    timeout: 2000,
  });
  assert.ok(screen.getByText(/Source: Sales & Stock/));
  click("View source products");
  assert.equal(document.querySelector("main h1")?.textContent, "Sales & Stock");
});

test("saved payment terms apply to future invoices and reporting period updates totals", () => {
  render(<App />);
  field("Reporting period", "August 2026");
  assert.ok(screen.getByText("$14,167.00"));
  navigate("Monthly Reports");
  assert.ok(screen.getByRole("heading", { name: "August 2026" }));
  assert.ok(screen.getByText("$14,167.00"));
  navigate("Settings");
  click("Invoice Settings");
  field("Default payment terms", "30 days");
  click("Save invoice settings");
  navigate("Invoices");
  click("Create Invoice");
  assert.equal((screen.getByLabelText("Due Date") as HTMLInputElement).value, "2026-10-28");
});

test("disabled delivery integration blocks sending until reconnected", () => {
  render(<App />);
  navigate("Integrations");
  const card = screen.getByRole("heading", { name: "Email" }).closest(".card")!;
  fireEvent.click(within(card as HTMLElement).getByRole("button", { name: "Disconnect" }));
  click("Confirm disconnect");
  navigate("Invoices");
  const row = screen.getByText("INV-2026-0037").closest("tr")!;
  fireEvent.click(within(row as HTMLElement).getByRole("button", { name: "Send" }));
  click("Confirm & Send Invoice");
  assert.match(screen.getByRole("alert").textContent!, /Connect Email/);
  click("Cancel");
  assert.match(screen.getByText("INV-2026-0037").closest("tr")!.textContent!, /Overdue/);
});

test("automatic import actions need explicit preference approval and create audit events", async () => {
  render(<App />);
  navigate("Settings");
  click("AI Preferences");
  field("AI Suggestion Confidence Threshold", "80");
  fireEvent.click(screen.getByRole("checkbox", { name: /^Auto Categorization/ }));
  assert.ok(screen.getByRole("dialog"));
  click("Cancel");
  assert.equal((screen.getByRole("checkbox", { name: /^Auto Categorization/ }) as HTMLInputElement).checked, false);
  fireEvent.click(screen.getByRole("checkbox", { name: /^Auto Categorization/ }));
  click("Enable preference");
  fireEvent.click(screen.getByRole("checkbox", { name: /^Auto Reconciliation/ }));
  click("Enable preference");
  navigate("Import Data");
  fireEvent.change(document.querySelector("input[type=file]")!, { target: { files: [new window.File(["sample"], "authorized.csv", { type: "text/csv" })] } });
  await waitFor(() => assert.ok(screen.getByRole("button", { name: "Validate Data" })), { timeout: 2500 });
  click("Validate Data");
  await waitFor(() => assert.equal((screen.getByRole("button", { name: "Continue Import" }) as HTMLButtonElement).disabled, false));
  click("Continue Import");
  await waitFor(() => assert.equal(document.querySelector("main h1")?.textContent, "Transactions"), { timeout: 2000 });
  navigate("Audit History");
  assert.ok(screen.getByText("Automatic category confirmed"));
  assert.ok(screen.getByText("Automatic reconciliation"));
});
