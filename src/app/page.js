"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { subscriptions as subscriptionCompanies } from "@/components/dropdowns/SubscriptionDropdown";
import { daysUntil, formatDaysUntil, nextInterestDate, nextOccurrence } from "@/lib/formUtils";

function buildPayments(cards, subscriptions, bankAccounts) {
  const cardPayments = cards
    .map((card) => ({
      id: `card-${card.id}`,
      kind: "Credit card payment",
      href: "/credit-cards",
      name: card.name || card.bank || "Unnamed Card",
      image: banks.find((bank) => bank.name === card.bank)?.image,
      date: nextOccurrence(card.dueDate),
    }));

  const subscriptionPayments = subscriptions
    .map((subscription) => ({
      id: `subscription-${subscription.id}`,
      kind: "Subscription payment",
      href: "/subscriptions",
      name: subscription.name || subscription.subscription || "Unnamed Subscription",
      image: subscriptionCompanies.find((company) => company.name === subscription.subscription)?.image,
      amount: subscription.cost ? `$${Number(subscription.cost).toFixed(2)}` : null,
      date: subscription.billingCycle === "year"
        ? nextOccurrence(subscription.billingDay, subscription.billingMonth)
        : nextOccurrence(subscription.billingDay),
    }));

  const interestPayments = bankAccounts.map((account) => ({
    id: `interest-${account.id}`,
    kind: "Interest payment",
    href: "/bank-accounts",
    name: account.name || account.bank || "Unnamed Account",
    image: banks.find((bank) => bank.name === account.bank)?.image,
    date: nextInterestDate(account.interestPaymentDate),
  }));

  return [...cardPayments, ...subscriptionPayments, ...interestPayments]
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
    ]).then(([cards, subscriptions, bankAccounts]) => {
      setPayments(buildPayments(cards, subscriptions, bankAccounts));
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
          <Link href="/credit-cards" className="text-[var(--accent)] hover:underline">credit card</Link>,{" "}
          <Link href="/subscriptions" className="text-[var(--accent)] hover:underline">subscription</Link>, or an interest
          date to a <Link href="/bank-accounts" className="text-[var(--accent)] hover:underline">bank account</Link>.
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
