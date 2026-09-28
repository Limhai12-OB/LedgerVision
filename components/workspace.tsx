"use client";
import React, { createContext, useContext, useState } from "react";
import * as seed from "@/lib/demo";
type Store = {
  team: { name: string; email: string; role: string }[];
  transactions: seed.Transaction[];
  invoices: seed.Invoice[];
  reviews: seed.Review[];
  products: seed.Product[];
  matches: seed.Match[];
  costs: seed.Cost[];
  integrations: seed.Integration[];
  jobs: seed.Job[];
  categories: { name: string; type: string }[];
  audit: seed.Audit[];
  business: Record<string, string>;
  preferences: Record<string, boolean | number | string>;
};
type Workspace = {
  data: Store;
  setData: React.Dispatch<React.SetStateAction<Store>>;
  page: seed.Page;
  go: (page: seed.Page) => void;
  period: string;
  setPeriod: (p: string) => void;
  toast: string;
  notify: (s: string) => void;
  log: (
    action: string,
    record: string,
    original: string,
    value: string,
    source?: string,
  ) => void;
  review: (ids: string[], accept: boolean) => void;
  saveTx: (t: seed.Transaction) => void;
};
const Context = createContext<Workspace | null>(null);
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Store>({
    team: [{ name: "John", email: "john@angkorbrew.example", role: "Owner" }],
    transactions: seed.transactions,
    invoices: seed.invoices,
    reviews: seed.reviews,
    products: seed.products,
    matches: seed.matches,
    costs: seed.costs,
    integrations: seed.integrations,
    jobs: seed.jobs,
    categories: seed.categories.map((name) => ({
      name,
      type: name === "Sales" ? "Income" : "Expense",
    })),
    audit: [
      {
        id: "a1",
        time: "2026-09-28T10:35:00",
        user: "John",
        action: "Category Updated",
        record: "Angkor Market",
        original: "Other",
        value: "Ingredients",
        source: "AI Suggestion",
      },
      {
        id: "a2",
        time: "2026-09-28T09:12:00",
        user: "John",
        action: "Import completed",
        record: "August_Bank_Statement.csv",
        original: "Pending",
        value: "452 records",
        source: "Bank",
      },
    ],
    business: {
      name: "Angkor Brew Coffee Co.",
      owner: "John",
      email: "john@angkorbrew.example",
      phone: "+855 12 345 678",
      country: "Cambodia",
      currency: "USD",
      type: "Coffee shop & retail",
      fiscal: "January",
      address: "Phnom Penh, Cambodia",
    },
    preferences: {
      threshold: 90,
      autoCategory: false,
      autoReconcile: false,
      insightNotifications: true,
      forecasting: true,
      invoicePrefix: "INV-2026-",
      paymentTerms: "7 days",
      stockAlerts: true,
      expenseAlerts: true,
      reportAlerts: true,
    },
  });
  const [page, setPage] = useState<seed.Page>("Dashboard"),
    [period, setPeriod] = useState("September 2026"),
    [toast, setToast] = useState("");
  function go(p: seed.Page) {
    setPage(p);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "instant" });
  }
  function notify(s: string) {
    setToast(s);
    setTimeout(() => setToast(""), 4500);
  }
  function event(
    action: string,
    record: string,
    original: string,
    value: string,
    source = "Manual",
  ): seed.Audit {
    return {
      id: seed.uid(),
      time: new Date().toISOString(),
      user: data.business.owner,
      action,
      record,
      original,
      value,
      source,
    };
  }
  function log(
    action: string,
    record: string,
    original: string,
    value: string,
    source = "Manual",
  ) {
    setData((d) => ({
      ...d,
      audit: [event(action, record, original, value, source), ...d.audit],
    }));
  }
  function review(ids: string[], accept: boolean) {
    setData((d) => {
      const items = d.reviews.filter((r) => ids.includes(r.id));
      let transactions = [...d.transactions];
      for (const r of items) {
        transactions = transactions.map((t) =>
          t.id === r.txId
            ? {
                ...t,
                ...(accept
                  ? {
                      [r.field]:
                        r.field === "amount"
                          ? Number(r.suggestion)
                          : r.suggestion,
                    }
                  : {}),
                ai:
                  r.field === "ai" && accept
                    ? r.suggestion
                    : d.reviews.some(
                          (x) => x.txId === t.id && !ids.includes(x.id),
                        )
                      ? "Needs review"
                      : "Verified",
              }
            : t,
        );
      }
      return {
        ...d,
        transactions,
        reviews: d.reviews.filter((r) => !ids.includes(r.id)),
        audit: [
          ...items.map((r) =>
            event(
              accept ? "AI suggestion accepted" : "AI suggestion rejected",
              d.transactions.find((t) => t.id === r.txId)?.merchant || r.txId,
              r.original,
              accept ? r.suggestion : r.original,
              r.source,
            ),
          ),
          ...d.audit,
        ],
      };
    });
    notify(
      accept
        ? "Suggestions applied with your confirmation."
        : "Suggestion rejected. Original data preserved.",
    );
  }
  function saveTx(t: seed.Transaction) {
    const old = data.transactions.find((x) => x.id === t.id);
    setData((d) => ({
      ...d,
      transactions: old
        ? d.transactions.map((x) =>
            x.id === t.id ? { ...t, original: old.original } : x,
          )
        : [{ ...t, original: JSON.stringify(t, null, 2) }, ...d.transactions],
      audit: [
        event(
          old ? "Transaction updated" : "Transaction added",
          t.merchant,
          old ? `${old.category} · ${seed.money(old.amount)}` : "—",
          `${t.category} · ${seed.money(t.amount)}`,
          t.source,
        ),
        ...d.audit,
      ],
    }));
    notify("Transaction saved. Change recorded in audit history.");
  }
  return (
    <Context.Provider
      value={{
        data,
        setData,
        page,
        go,
        period,
        setPeriod,
        toast,
        notify,
        log,
        review,
        saveTx,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const c = useContext(Context);
  if (!c) throw new Error("Workspace provider missing");
  return c;
}
