"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { useToast } from "@/components/ToastProvider";
import { TAX_GROUPS, predictTaxForms } from "@/lib/taxForms";
import { nextTaxDay, normalizeTaxInfo } from "@/lib/taxInfo";
import TaxInfoCard from "@/components/TaxInfoCard";
import { CheckIcon, MinusIcon, XIcon } from "@/components/ui/icons";
import { getUserInfo } from "@/util/getUserInfo";

const STATUS = {
  needed: { label: "Needed", className: "bg-[var(--accent-soft)] text-[var(--accent)]" },
  maybe: { label: "Maybe", className: "bg-[var(--surface-hover)] text-foreground" },
  "not-needed": { label: "Not needed", className: "bg-[var(--surface-hover)] text-muted" },
};

// Needed first, then maybe, then not needed, keeping each group's own order otherwise.
const STATUS_ORDER = ["needed", "maybe", "not-needed"];

// How each condition state is drawn: green check, neutral dash, red X.
const CONDITION = {
  met: { icon: CheckIcon, label: "Met", className: "bg-[var(--accent-soft)] text-[var(--accent)]" },
  unknown: { icon: MinusIcon, label: "Unknown", className: "bg-[var(--surface-hover)] text-muted" },
  unmet: { icon: XIcon, label: "Not met", className: "bg-[var(--danger-soft)] text-[var(--danger)]" },
};

function ConditionList({ conditions }) {
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {conditions.map((condition) => {
        const look = CONDITION[condition.state];
        return (
          <li key={condition.id} className="flex items-start gap-2 text-xs">
            <span className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${look.className}`}>
              <look.icon size={10} />
            </span>
            <span className="sr-only">{look.label}:</span>
            <span className={condition.state === "met" ? "text-foreground" : "text-muted"}>{condition.text}</span>
          </li>
        );
      })}
    </ul>
  );
}

function FormRow({ form }) {
  const status = STATUS[form.status];
  return (
    <li>
      <Link
        href={form.href}
        className="flex items-start gap-3 rounded-lg border border-[var(--border-strong)] p-3 transition-colors hover:bg-[var(--surface-hover)]"
      >
        <span className={`w-28 shrink-0 pt-0.5 text-sm font-semibold tabular-nums ${form.status === "not-needed" ? "opacity-60" : ""}`}>{form.form}</span>
        <div className="min-w-0 flex-1">
          {/* Dimmed when not needed; the conditions stay full strength, since they say why. */}
          <div className={form.status === "not-needed" ? "opacity-60" : ""}>
            <div className="text-sm font-medium">{form.title}</div>
            {form.from && <div className="text-xs text-muted">From {form.from}</div>}
            <div className="mt-1 text-xs text-muted">{form.why}</div>
          </div>
          <ConditionList conditions={form.conditions} />
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
      </Link>
    </li>
  );
}

function FormGroup({ title, empty, forms }) {
  const sorted = [...forms].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
  const needed = forms.filter((form) => form.status === "needed").length;

  return (
    <section className="card flex flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        {forms.length > 0 && (
          <span className="text-sm text-muted">
            {forms.length} {forms.length === 1 ? "form" : "forms"}{needed > 0 ? ` · ${needed} needed` : ""}
          </span>
        )}
      </div>
      {forms.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {sorted.map((form) => <FormRow key={form.id} form={form} />)}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">
          {empty.text}{" "}
          <Link href={empty.href} className="text-[var(--accent)] hover:underline">{empty.link}</Link>
        </p>
      )}
    </section>
  );
}

export default function TaxesPage() {
  const [data, setData] = useState(null);
  const showToast = useToast();
  const taxDay = nextTaxDay();
  const taxYear = taxDay.getFullYear() - 1;

  useEffect(() => {
    Promise.all([
      fetch("/api/bank-accounts").then((res) => res.json()),
      fetch("/api/loans").then((res) => res.json()),
      fetch("/api/investment-accounts").then((res) => res.json()),
      getUserInfo(),
    ])
      .then(([bankAccounts, loans, investmentAccounts, userInfo]) => setData({ bankAccounts, loans, investmentAccounts, userInfo }))
      .catch(() => showToast("Couldn't load your tax forms"));
  }, [showToast]);

  const header = (
    <PageHeader
      title="Taxes"
      description={`${taxYear} tax year · due ${taxDay.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}`}
    />
  );
  if (!data) return header;

  const taxInfo = normalizeTaxInfo(data.userInfo["tax-info"]);
  const forms = predictTaxForms({
    taxYear,
    taxInfo,
    incomeStreams: data.userInfo["income-streams"],
    bankAccounts: data.bankAccounts,
    loans: data.loans,
    investmentAccounts: data.investmentAccounts,
  });

  return (
    <div>
      {header}
      <div className="flex flex-col gap-6">
        <TaxInfoCard
          taxInfo={taxInfo}
          onSaved={(saved) => setData((prev) => ({ ...prev, userInfo: { ...prev.userInfo, "tax-info": saved } }))}
        />
        {TAX_GROUPS.map((group) => (
          <FormGroup
            key={group.name}
            title={group.name}
            empty={group.empty}
            forms={forms.filter((form) => form.group === group.name)}
          />
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">
        Predicted from what&apos;s saved in the app, not tax advice. Check the forms you actually receive before filing.
      </p>
    </div>
  );
}
