"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { loanProviders } from "@/components/dropdowns/LoanProviderDropdown";
import { subscriptions as subscriptionCompanies } from "@/components/dropdowns/SubscriptionDropdown";
import { allInsuranceProviders } from "@/components/dropdowns/InsuranceProviderDropdown";
import { daysUntil, formatCurrency, formatDaysUntil, nextInterestDate, nextOccurrence } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";

function buildPayments(cards, subscriptions, bankAccounts, loans, policies) {
  const cardPayments = cards
    .map((card) => ({
      id: `card-${card.id}`,
      kind: "Credit card payment",
      href: "/expenses/credit-cards",
      name: card.name || card.bank || "Unnamed Card",
      image: logoFor(banks, card.bank, card.customLogo),
      date: nextOccurrence(card.dueDate),
    }));

  const subscriptionPayments = subscriptions
    .map((subscription) => ({
      id: `subscription-${subscription.id}`,
      kind: "Subscription payment",
      href: "/expenses/subscriptions",
      name: subscription.name || subscription.subscription || "Unnamed Subscription",
      image: logoFor(subscriptionCompanies, subscription.subscription, subscription.customLogo),
      amount: subscription.cost ? formatCurrency(subscription.cost) : null,
      date: subscription.billingCycle === "year"
        ? nextOccurrence(subscription.billingDay, subscription.billingMonth)
        : nextOccurrence(subscription.billingDay),
    }));

  const interestPayments = bankAccounts.map((account) => ({
    id: `interest-${account.id}`,
    kind: "Interest payment",
    href: "/accounts/bank-accounts",
    name: account.name || account.bank || "Unnamed Account",
    image: logoFor(banks, account.bank, account.customLogo),
    date: nextInterestDate(account.interestPaymentDate),
  }));

  const loanPayments = loans.map((loan) => ({
    id: `loan-${loan.id}`,
    kind: "Loan payment",
    href: "/expenses/loans",
    name: loan.name || loan.provider || "Unnamed Loan",
    image: logoFor(loanProviders, loan.provider, loan.customLogo),
    amount: loan.monthlyPayment ? formatCurrency(loan.monthlyPayment) : null,
    date: nextOccurrence(loan.paymentDay),
  }));

  const insurancePayments = policies.map((policy) => ({
    id: `insurance-${policy.id}`,
    kind: "Insurance payment",
    href: "/expenses/insurance",
    name: policy.name || policy.provider || "Unnamed Insurance",
    image: logoFor(allInsuranceProviders, policy.provider, policy.customLogo),
    amount: policy.premium ? formatCurrency(policy.premium) : null,
    date: policy.billingCycle === "year"
      ? nextOccurrence(policy.billingDay, policy.billingMonth)
      : nextOccurrence(policy.billingDay),
  }));

  return [...cardPayments, ...subscriptionPayments, ...interestPayments, ...loanPayments, ...insurancePayments]
    .filter((payment) => payment.date)
    .map((payment) => ({ ...payment, days: daysUntil(payment.date) }))
    .sort((a, b) => a.days - b.days);
}

export default function Home() {
  const [payments, setPayments] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/credit-cards").then((res) => res.json()),
      fetch("/api/subscriptions").then((res) => res.json()),
      fetch("/api/bank-accounts").then((res) => res.json()),
      fetch("/api/loans").then((res) => res.json()),
      fetch("/api/insurance").then((res) => res.json()),
    ]).then(([cards, subscriptions, bankAccounts, loans, policies]) => {
      setPayments(buildPayments(cards, subscriptions, bankAccounts, loans, policies));
      setLoaded(true);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="mt-1 text-sm text-muted">Bills and interest coming up, soonest first.</p>
      </div>

      {loaded && payments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] py-16 text-center text-sm text-muted">
          Nothing coming up. Add a due date to a{" "}
          <Link href="/expenses/credit-cards" className="text-[var(--accent)] hover:underline">credit card</Link>,{" "}
          <Link href="/expenses/subscriptions" className="text-[var(--accent)] hover:underline">subscription</Link>, or an interest
          date to a <Link href="/accounts/bank-accounts" className="text-[var(--accent)] hover:underline">bank account</Link>.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {payments.map((payment) => (
          <Link key={payment.id} href={payment.href} className="card flex items-center gap-3 p-4">
            <div className="logo-tile">
              {payment.image && (
                <Image src={payment.image} alt="" width={40} height={40} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{payment.name}</div>
              <div className="truncate text-sm text-muted">
                {payment.kind}
                {payment.amount ? ` · ${payment.amount}` : ""} ·{" "}
                {payment.date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                payment.days <= 3
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[var(--surface-hover)] text-muted"
              }`}
            >
              {formatDaysUntil(payment.days)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
