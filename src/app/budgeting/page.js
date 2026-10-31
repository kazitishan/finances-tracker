"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { typeLabel } from "@/components/dropdowns/TypeDropdown";
import AddIncomeStreamModal from "@/components/modals/AddIncomeStreamModal";
import { useToast } from "@/components/ToastProvider";
import { ArrowUpRightIcon, PencilIcon, PlusIcon, XIcon } from "@/components/ui/icons";
import { formatCurrency, inputClasses, months, onlyDecimal } from "@/lib/formUtils";
import { incomeFrequencies, isEstimated, nextPayday, paidInMonth } from "@/lib/incomeStreams";
import { getBankAccounts } from "@/util/getBankAccounts";
import { getUserInfo } from "@/util/getUserInfo";
import { saveUserInfo } from "@/util/saveUserInfo";
import { getMonthlyExpenses } from "@/util/getMonthlyExpenses";

// Spending from the user's accounts. Each keeps its color no matter which others are on the chart.
const CATEGORIES = [
  { key: "subscriptions", label: "Subscriptions", color: "var(--series-1)", href: "/expenses/subscriptions", group: "accounts" },
  { key: "loans", label: "Loans", color: "var(--series-2)", href: "/expenses/loans", group: "accounts" },
  { key: "insurance", label: "Insurance", color: "var(--series-3)", href: "/expenses/insurance", group: "accounts" },
  { key: "investments", label: "Investments", color: "var(--series-4)", href: "/accounts/investing", group: "accounts" },
  { key: "utilities", label: "Utilities", color: "var(--series-5)", href: "/expenses/utilities", group: "accounts" },
  { key: "annualFees", label: "Annual Fees", color: "var(--series-6)", href: "/expenses/credit-cards", group: "accounts" },
];
// Additional expenses take the remaining chart colors in order. Past the last color, the rest share one
// "Other Expenses" slice rather than getting a color that's too close to another.
const ADDITIONAL_COLORS = ["var(--series-7)", "var(--series-8)"];
const LEFT_OVER = { key: "left-over", label: "Left Over", color: "var(--border-strong)", group: "left-over" };

// Additional expenses are stored as one-key objects: { "<name>": <monthly amount> }.
const entryOf = (entry) => Object.entries(entry)[0];
const sum = (amounts) => amounts.reduce((total, amount) => total + amount, 0);
const percentOf = (amount, total) => (total > 0 ? `${Math.round((amount / total) * 100)}%` : "–");

// One slice per additional expense.
function additionalSlices(additionalExpenses) {
  const entries = additionalExpenses.map(entryOf);
  const ownColor = entries.length > ADDITIONAL_COLORS.length ? entries.slice(0, ADDITIONAL_COLORS.length - 1) : entries;
  const slices = ownColor.map(([name, amount], index) => ({
    key: `additional-${index}`,
    label: name,
    color: ADDITIONAL_COLORS[index],
    amount,
    group: "additional",
  }));
  const rest = entries.slice(ownColor.length);
  if (rest.length > 0) {
    slices.push({
      key: "additional-other",
      label: `Other Expenses (${rest.length})`,
      color: ADDITIONAL_COLORS.at(-1),
      amount: sum(rest.map(([, amount]) => amount)),
      group: "additional",
    });
  }
  return slices;
}

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SLICE_GAP = 2;
// Between groups and at the top, where the last slice meets the first, slices sit further apart. Any two
// colors can meet there, and not every pair is easy to tell apart side by side.
const GROUP_GAP = 8;

// A donut of `slices` ({ key, label, color, amount, group }) as shares of `total`, with `children` in the middle.
function Donut({ slices, total, hovered, onHover, children }) {
  const visible = slices.filter((slice) => slice.amount > 0);
  const arcs = [];
  let start = 0;
  for (const [index, slice] of visible.entries()) {
    const next = visible[index + 1];
    const length = total > 0 ? (slice.amount / total) * CIRCUMFERENCE : 0;
    arcs.push({ ...slice, start, length, gap: next && next.group === slice.group ? SLICE_GAP : GROUP_GAP });
    start += length;
  }

  return (
    <div className="relative h-56 w-56 shrink-0">
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={visible.map((slice) => `${slice.label} ${formatCurrency(slice.amount)}`).join(", ")}
      >
        <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="var(--surface-hover)" strokeWidth="24" />
        {arcs.map((arc) => (
          <circle
            key={arc.key}
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth={hovered === arc.key ? 30 : 24}
            strokeDasharray={`${Math.max(arc.length - arc.gap, 0.5)} ${CIRCUMFERENCE}`}
            strokeDashoffset={-arc.start}
            opacity={hovered && hovered !== arc.key ? 0.35 : 1}
            className="cursor-pointer transition-[opacity,stroke-width] duration-150"
            onMouseEnter={() => onHover(arc.key)}
            onMouseLeave={() => onHover(null)}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        {children}
      </div>
    </div>
  );
}

function Swatch({ color }) {
  return <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: color }} />;
}

function StatTile({ label, value, tone }) {
  return (
    <div className="rounded-xl bg-[var(--surface-hover)] px-3 py-2.5">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold tabular-nums ${tone === "danger" ? "text-[var(--danger)]" : ""}`}>
        {value}
      </div>
    </div>
  );
}

// "Biweekly · Next Paycheck: Wed, Nov 11", or just the frequency when the stream has no pay date yet.
function scheduleLabel(stream) {
  const frequency = incomeFrequencies.find((frequency) => frequency.value === stream.frequency)?.label;
  const next = nextPayday(stream);
  const nextLabel = next && `Next Paycheck: ${next.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}`;
  return [frequency, nextLabel].filter(Boolean).join(" · ");
}

function amountLabel(stream) {
  return isEstimated(stream)
    ? `${formatCurrency(stream.monthlyEstimate)} estimated per month`
    : `${formatCurrency(stream.paycheckAmount)} per paycheck`;
}

// "Direct Deposit to Chase Checking", or just the payment type when there's no account to name.
function paymentLabel(stream, bankAccounts) {
  const type = typeLabel(stream.paymentType, stream.otherPaymentType);
  const account = stream.paymentType === "Direct Deposit" && bankAccounts.find((account) => account.id === stream.bankAccount);
  return account ? `${type} to ${account.name || "Unnamed Account"}` : type;
}

// The income streams, each with what it pays this month. Adding and editing happen in AddIncomeStreamModal.
function IncomeStreamList({ streams, bankAccounts, onAdd, onEdit }) {
  const total = sum(streams.map((stream) => paidInMonth(stream)));

  return (
    <section className="card flex flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">Income Streams</h2>
        <span className="text-sm tabular-nums text-muted">{formatCurrency(total)} / mo</span>
      </div>

      {streams.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {streams.map((stream) => (
            <li key={stream.id} className="flex items-center gap-3 rounded-lg border border-[var(--border-strong)] p-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate">{stream.name}</div>
                <div className="truncate text-xs text-muted">
                  {[typeLabel(stream.type, stream.otherType), scheduleLabel(stream)].filter(Boolean).join(" · ")}
                </div>
                <div className="truncate text-xs text-muted">
                  {[amountLabel(stream), paymentLabel(stream, bankAccounts)].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span className="tabular-nums">{formatCurrency(paidInMonth(stream))}</span>
              <button type="button" onClick={() => onEdit(stream)} className="icon-btn" aria-label={`Edit ${stream.name}`}>
                <PencilIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-[var(--border-strong)] px-3 py-4 text-center text-sm text-muted">
          Add a job or other income to see what&apos;s left each month.
        </p>
      )}

      <button type="button" onClick={onAdd} className="btn btn-primary mt-4 self-start">
        <PlusIcon size={14} />
        Add
      </button>
    </section>
  );
}

// A list of named monthly amounts, with a row to add another.
function AmountList({ title, entries, emptyText, namePlaceholder, onAdd, onRemove }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const canAdd = name.trim() !== "" && Number(amount) > 0;
  const total = sum(entries.map((entry) => entryOf(entry)[1]));

  function handleSubmit(event) {
    event.preventDefault();
    if (!canAdd) return;
    onAdd({ [name.trim()]: Number(amount) });
    setName("");
    setAmount("");
  }

  return (
    <section className="card flex flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm tabular-nums text-muted">{formatCurrency(total)} / mo</span>
      </div>

      {entries.length > 0 ? (
        <ul className="mt-3">
          {entries.map((entry, index) => {
            const [entryName, entryAmount] = entryOf(entry);
            return (
              <li key={index} className="flex items-center gap-3 border-b border-[var(--border)] py-1.5 text-sm last:border-b-0">
                <span className="min-w-0 flex-1 truncate">{entryName}</span>
                <span className="tabular-nums">{formatCurrency(entryAmount)}</span>
                <button type="button" onClick={() => onRemove(index)} className="icon-btn" aria-label={`Remove ${entryName}`}>
                  <XIcon size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-[var(--border-strong)] px-3 py-4 text-center text-sm text-muted">
          {emptyText}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-auto flex gap-2 pt-4">
        <input
          type="text"
          className={`${inputClasses} min-w-0 flex-1`}
          placeholder={namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="relative w-28 shrink-0">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
          <input
            type="text"
            inputMode="decimal"
            className={`${inputClasses} pl-6`}
            placeholder="0.00"
            aria-label="Monthly amount"
            value={amount}
            onChange={(e) => setAmount(onlyDecimal(e.target.value))}
          />
        </div>
        <button type="submit" disabled={!canAdd} className="btn btn-primary shrink-0">
          <PlusIcon size={14} />
          Add
        </button>
      </form>
    </section>
  );
}

export default function BudgetingPage() {
  const showToast = useToast();
  const [userInfo, setUserInfo] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState(null);
  const [incomeModalKey, setIncomeModalKey] = useState(0);

  useEffect(() => {
    getUserInfo().then(setUserInfo).catch(() => showToast("Couldn't load your budget"));
    getMonthlyExpenses().then(setExpenses).catch(() => showToast("Couldn't load your expenses"));
    getBankAccounts().then(setBankAccounts).catch(() => showToast("Couldn't load your bank accounts"));
  }, [showToast]);

  if (!userInfo || !expenses) return null;

  const incomeStreams = userInfo["income-streams"];
  const additionalExpenses = userInfo["additional-expenses"];

  // Saves right away, putting the list back if the save fails. Resolves to whether it saved.
  async function updateList(key, list) {
    const previous = userInfo;
    const next = { ...userInfo, [key]: list };
    setUserInfo(next);
    try {
      await saveUserInfo(next);
      return true;
    } catch {
      setUserInfo(previous);
      showToast("Couldn't save");
      return false;
    }
  }

  function openIncomeModal(stream) {
    setEditingStream(stream);
    setIncomeModalKey((key) => key + 1);
    setIsIncomeModalOpen(true);
  }

  function saveStream(stream) {
    const exists = incomeStreams.some((existing) => existing.id === stream.id);
    return updateList(
      "income-streams",
      exists ? incomeStreams.map((existing) => (existing.id === stream.id ? stream : existing)) : [...incomeStreams, stream]
    );
  }

  function deleteStream(id) {
    return updateList("income-streams", incomeStreams.filter((stream) => stream.id !== id));
  }

  const income = sum(incomeStreams.map((stream) => paidInMonth(stream)));
  const accountSlices = CATEGORIES.map((category) => ({
    ...category,
    amount: sum(expenses[category.key].map((item) => item.amount)),
  }));
  const spending = sum(accountSlices.map((slice) => slice.amount))
    + sum(additionalExpenses.map((entry) => entryOf(entry)[1]));
  const leftOver = income - spending;
  // Only categories with something to pay this month get a list under From Your Accounts.
  const accountCategories = CATEGORIES.filter((category) => expenses[category.key].length > 0);

  // Categories with nothing to pay this month are left off the chart and its legend.
  const slices = [
    ...accountSlices,
    ...additionalSlices(additionalExpenses),
    ...(leftOver > 0 ? [{ ...LEFT_OVER, amount: leftOver }] : []),
  ].filter((slice) => slice.amount > 0);
  // Shares are of income, or of spending when it's more than income.
  const chartTotal = Math.max(income, spending);
  const shareBase = income > 0 ? income : spending;
  const hoveredSlice = slices.find((slice) => slice.key === hovered);

  let center;
  if (hoveredSlice) {
    center = { label: hoveredSlice.label, value: formatCurrency(hoveredSlice.amount), note: `${percentOf(hoveredSlice.amount, shareBase)} of ${income > 0 ? "income" : "spending"}` };
  } else if (income === 0) {
    center = { label: "Spending", value: formatCurrency(spending, { cents: false }), note: "per month" };
  } else if (leftOver >= 0) {
    center = { label: "Left Over", value: formatCurrency(leftOver, { cents: false }), note: "per month" };
  } else {
    center = { label: "Over Budget", value: formatCurrency(-leftOver, { cents: false }), note: "per month", tone: "danger" };
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        {months[new Date().getMonth()].label} Budgeting
      </h1>

      <section className="card mb-4 flex flex-col items-center gap-8 p-6 md:flex-row md:items-center">
        <Donut slices={slices} total={chartTotal} hovered={hovered} onHover={setHovered}>
          <div className="text-xs text-muted">{center.label}</div>
          <div className={`text-2xl font-semibold tracking-tight ${center.tone === "danger" ? "text-[var(--danger)]" : ""}`}>
            {center.value}
          </div>
          <div className="text-xs text-muted">{center.note}</div>
        </Donut>

        <div className="w-full min-w-0 flex-1">
          <div className="grid grid-cols-3 gap-2">
            <StatTile label="Monthly Income" value={formatCurrency(income, { cents: false })} />
            <StatTile label="Monthly Spending" value={formatCurrency(spending, { cents: false })} />
            {leftOver >= 0 ? (
              <StatTile label="Left Over" value={formatCurrency(leftOver, { cents: false })} />
            ) : (
              <StatTile label="Over Budget" value={formatCurrency(-leftOver, { cents: false })} tone="danger" />
            )}
          </div>

          <ul className="mt-4">
            {slices.map((row) => {
              const amount = row.amount;
              return (
                <li
                  key={row.key}
                  onMouseEnter={() => setHovered(row.key)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors duration-100 ${
                    hovered === row.key ? "bg-[var(--surface-hover)]" : ""
                  }`}
                >
                  <Swatch color={row.color} />
                  <span className="min-w-0 flex-1 truncate">{row.label}</span>
                  <span className="tabular-nums">{formatCurrency(amount)}</span>
                  <span className="w-10 text-right tabular-nums text-muted">{percentOf(amount, shareBase)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="mb-4 flex flex-col gap-4">
        <IncomeStreamList
          streams={incomeStreams}
          bankAccounts={bankAccounts}
          onAdd={() => openIncomeModal(null)}
          onEdit={openIncomeModal}
        />
        <AmountList
          title="Additional Expenses"
          entries={additionalExpenses}
          emptyText="Nothing added yet."
          namePlaceholder="e.g. Rent"
          onAdd={(entry) => updateList("additional-expenses", [...additionalExpenses, entry])}
          onRemove={(index) => updateList("additional-expenses", additionalExpenses.filter((_, i) => i !== index))}
        />
      </div>

      {accountCategories.length > 0 && (
        <section className="card p-5">
          <h2 className="font-semibold">From Your Accounts</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {accountCategories.map((category) => (
              <div key={category.key} className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Swatch color={category.color} />
                  <span className="flex-1">{category.label}</span>
                  <Link href={category.href} className="icon-btn -mr-1.5" aria-label={`Go to ${category.label}`}>
                    <ArrowUpRightIcon size={14} />
                  </Link>
                </div>
                <ul className="mt-1.5">
                  {expenses[category.key].map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-1 text-sm">
                      <span className="min-w-0 flex-1 truncate text-muted">{item.name}</span>
                      <span className="tabular-nums">{formatCurrency(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <AddIncomeStreamModal
        key={`income-${incomeModalKey}`}
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        initialData={editingStream}
        onSave={saveStream}
        onDelete={deleteStream}
      />
    </div>
  );
}
