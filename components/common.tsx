"use client";
import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ChevronRight,
  Inbox,
  ShieldCheck,
  X,
} from "lucide-react";
export { Button } from "./ui/button";
export function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  const text = String(children);
  const color =
    tone ||
    (/Overdue|Failed|Out of Stock|Unmatched|Cancelled/.test(text)
      ? "red"
      : /Review|Possible|Low Stock|Draft|Pending|Processing/.test(text)
        ? "amber"
        : /Matched|Paid|Verified|Completed|Connected/.test(text)
          ? "green"
          : "blue");
  return (
    <span className={"badge " + color}>
      <i />
      {children}
    </span>
  );
}
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={"card " + className}>
      {(title || action) && (
        <div className="card-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Modal({
  title,
  description = "Review the details before confirming.",
  open,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className={"dialog-content " + (wide ? "wide" : "")}>
          <div className="dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close aria-label="Close dialog" className="icon-button">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="dialog-description">
            {description}
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Empty({
  title = "Nothing here yet",
  text = "Your records will appear here.",
  action,
}: {
  title?: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <Inbox size={32} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function Metric({
  label,
  value,
  change,
  icon: Icon,
  tone = "blue",
  note = "vs. previous month",
}: {
  label: string;
  value: string;
  change?: string;
  icon?: React.ElementType;
  tone?: string;
  note?: string;
}) {
  return (
    <div className="card metric">
      <div className="metric-label">
        {label}
        {Icon && (
          <span className={"icon-box " + tone}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <strong>{value}</strong>
      <div className="metric-footer">
        {change && (
          <span className={tone === "amber" ? "negative" : "positive"}>
            <ArrowUpRight size={12} />
            {change}
          </span>
        )}
        <span>{note}</span>
      </div>
    </div>
  );
}
export function TextLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ChevronRight size={14} />
    </button>
  );
}
export function TrustNote({
  children = "AI suggests. You decide. Every confirmed change is recorded.",
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="trust-note">
      <ShieldCheck size={15} />
      {children}
    </div>
  );
}
