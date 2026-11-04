"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUrlFilters } from "@/components/useUrlFilters";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { NoMatches } from "@/components/ui/SearchInput";
import { daysUntil, formatCurrency, formatDaysUntil, matchesSearch, nextInterestDate, nextOccurrence } from "@/lib/formUtils";
import { isEstimated, nextPayday } from "@/lib/incomeStreams";
import { allRecurringInvestments, investmentName, nextInvestmentDate } from "@/lib/recurringInvestments";
import { getUserInfo } from "@/util/getUserInfo";
import { itemName } from "@/lib/itemNames";

// Money coming in. Every other type is money going out, which the filter calls Expenses.
const INCOMING_TYPES = ["Income Streams", "Interest Payments"];

function buildPayments(cards, subscriptions, bankAccounts, loans, policies, investmentAccounts, utilities, incomeStreams) {
  const paychecks = incomeStreams.map((stream) => ({
    id: `paycheck-${stream.id}`,
    kind: "Paycheck",
    type: "Income Streams",
    href: "/budgeting",
    name: stream.name,
    image: "/income/suitcase.svg",
    amount: stream.paycheckAmount && !isEstimated(stream) ? formatCurrency(stream.paycheckAmount) : null,
    date: nextPayday(stream),
  }));

  const cardPayments = cards
    .map((card) => ({
      id: `card-${card.id}`,
      kind: "Credit card payment",
      type: "Credit Cards",
      href: "/expenses/credit-cards",
      name: itemName("credit-cards", card),
      image: card.img,
      date: nextOccurrence(card.dueDate),
    }));

  const annualFeePayments = cards
    .filter((card) => Number(card.annualFee) > 0 && card.renewalMonth)
    .map((card) => ({
      id: `annual-fee-${card.id}`,
      kind: "Annual fee",
      type: "Annual Fees",
      href: "/expenses/credit-cards",
      name: itemName("credit-cards", card),
      image: card.img,
      amount: formatCurrency(card.annualFee),
      date: nextOccurrence(card.renewalDay, card.renewalMonth),
    }));

  const subscriptionPayments = subscriptions
    .map((subscription) => ({
      id: `subscription-${subscription.id}`,
      kind: "Subscription payment",
      type: "Subscriptions",
      href: "/expenses/subscriptions",
      name: itemName("subscriptions", subscription),
      image: subscription.img,
      amount: subscription.cost ? formatCurrency(subscription.cost) : null,
      date: subscription.billingCycle === "year"
        ? nextOccurrence(subscription.billingDay, subscription.billingMonth)
        : nextOccurrence(subscription.billingDay),
    }));

  const interestPayments = bankAccounts.map((account) => ({
    id: `interest-${account.id}`,
    kind: "Interest payment",
    type: "Interest Payments",
    href: "/accounts/bank-accounts",
    name: itemName("bank-accounts", account),
    image: account.img,
    date: nextInterestDate(account.interestPaymentDate),
  }));

  const loanPayments = loans.map((loan) => ({
    id: `loan-${loan.id}`,
    kind: "Loan payment",
    type: "Loans",
    href: "/expenses/loans",
    name: itemName("loans", loan),
    image: loan.img,
    amount: loan.monthlyPayment ? formatCurrency(loan.monthlyPayment) : null,
    date: nextOccurrence(loan.paymentDay),
  }));

  const insurancePayments = policies.map((policy) => ({
    id: `insurance-${policy.id}`,
    kind: "Insurance payment",
    type: "Insurance",
    href: "/expenses/insurance",
    name: itemName("insurance", policy),
    image: policy.img,
    amount: policy.premium ? formatCurrency(policy.premium) : null,
    date: policy.billingCycle === "year"
      ? nextOccurrence(policy.billingDay, policy.billingMonth)
      : nextOccurrence(policy.billingDay),
  }));

  const utilityPayments = utilities.map((utility) => ({
    id: `utility-${utility.id}`,
    kind: "Utility payment",
    type: "Utilities",
    href: "/expenses/utilities",
    name: itemName("utilities", utility),
    image: utility.img,
    amount: utility.cost ? formatCurrency(utility.cost) : null,
    date: utility.billingCycle === "year"
      ? nextOccurrence(utility.billingDay, utility.billingMonth)
      : nextOccurrence(utility.billingDay),
  }));

  const investmentPayments = allRecurringInvestments(investmentAccounts).map(({ investment, account }) => ({
    id: `investment-${investment.id}`,
    kind: "Recurring investment",
    type: "Investments",
    href: "/accounts/investing",
    name: investmentName(investment, account),
    image: account.img,
    amount: investment.amount ? formatCurrency(investment.amount) : null,
    date: nextInvestmentDate(investment),
  }));

  return [...paychecks, ...cardPayments, ...annualFeePayments, ...subscriptionPayments, ...interestPayments, ...loanPayments, ...insurancePayments, ...utilityPayments, ...investmentPayments]
    .filter((payment) => payment.date)
    .map((payment) => ({ ...payment, days: daysUntil(payment.date) }))
    .sort((a, b) => a.days - b.days);
}

function Home() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/credit-cards").then((res) => res.json()),
      fetch("/api/subscriptions").then((res) => res.json()),
      fetch("/api/bank-accounts").then((res) => res.json()),
      fetch("/api/loans").then((res) => res.json()),
      fetch("/api/insurance").then((res) => res.json()),
      fetch("/api/investment-accounts").then((res) => res.json()),
      fetch("/api/utilities").then((res) => res.json()),
      getUserInfo(),
    ]).then(([cards, subscriptions, bankAccounts, loans, policies, investmentAccounts, utilities, userInfo]) => {
      setPayments(buildPayments(cards, subscriptions, bankAccounts, loans, policies, investmentAccounts, utilities, userInfo["income-streams"]));
      setLoaded(true);
    });
  }, []);

  const filters = useUrlFilters(payments, [
    {
      key: "show",
      label: "Show",
      getValue: (payment) => (INCOMING_TYPES.includes(payment.type) ? "Payments" : "Expenses"),
      sub: { key: "type", getValue: (payment) => payment.type },
    },
  ]);

  const filteredPayments = payments.filter((payment) =>
    filters.matches(payment) && matchesSearch([payment.name, payment.kind], search)
  );

  return (
    <div>
      <PageHeader
        title="Home"
        count={loaded ? payments.length : null}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search upcoming payments..."
        filters={filters}
      />

      {loaded && payments.length === 0 && (
        <EmptyState>
          Nothing coming up. Add a due date to a{" "}
          <Link href="/expenses/credit-cards" className="text-[var(--accent)] hover:underline">credit card</Link>,{" "}
          <Link href="/expenses/subscriptions" className="text-[var(--accent)] hover:underline">subscription</Link>, or an interest
          date to a <Link href="/accounts/bank-accounts" className="text-[var(--accent)] hover:underline">bank account</Link>.
        </EmptyState>
      )}
      {payments.length > 0 && filteredPayments.length === 0 && <NoMatches query={search} />}

      <div className="flex flex-col gap-3">
        {filteredPayments.map((payment) => (
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

export default function HomePage() {
  // useUrlFilters reads the URL's search params, which needs a Suspense boundary.
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
