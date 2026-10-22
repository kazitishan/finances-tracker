"use client";

import Dropdown from "@/components/dropdowns/Dropdown";
import { PlusIcon } from "@/components/ui/icons";
import { dueDates, inputClasses, onlyDecimal } from "@/lib/formUtils";
import {
    investmentFrequencies,
    isInvestmentDay,
    marketWeekdays,
    nextWeekdays,
    parseDateString,
    toDateString,
} from "@/lib/recurringInvestments";

const emptyInvestment = {
    stock: "",
    amount: "",
    frequency: "weekly",
    dayOfWeek: "",
    dayOfMonth: "",
    startDate: "",
    bankAccount: "",
};

// Every two weeks needs to know which week it's on. It's saved as `startDate`; this keeps it on the chosen weekday.
function withStartDate(investment) {
    if (investment.frequency !== "biweekly" || !investment.dayOfWeek) return investment;
    const start = parseDateString(investment.startDate);
    if (start && start.getDay() === Number(investment.dayOfWeek)) return investment;
    return { ...investment, startDate: toDateString(nextWeekdays(investment.dayOfWeek)[0]) };
}

function RecurringInvestment({ investment, onChange, onRemove }) {
    function updateField(field, value) {
        onChange(withStartDate({ ...investment, [field]: value }));
    }

    // The next two dates on the chosen weekday; the one in step with `startDate` is selected.
    const nextDates = investment.frequency === "biweekly" && investment.dayOfWeek ? nextWeekdays(investment.dayOfWeek) : [];
    const selectedNext = nextDates.find((date) => isInvestmentDay(investment, date));

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-3">
            <div className="flex items-end gap-2">
                <label className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="field-label">Stock</span>
                    <input
                        type="text"
                        className={inputClasses}
                        placeholder="e.g. VOO"
                        value={investment.stock}
                        onChange={(e) => updateField("stock", e.target.value)}
                    />
                </label>
                <label className="flex w-32 shrink-0 flex-col gap-1">
                    <span className="field-label">Amount</span>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            className={`${inputClasses} pl-6`}
                            placeholder="0.00"
                            value={investment.amount}
                            onChange={(e) => updateField("amount", onlyDecimal(e.target.value))}
                        />
                    </div>
                </label>
            </div>

            <label className="flex flex-col gap-1">
                <span className="field-label">Frequency</span>
                <select
                    className={inputClasses}
                    value={investment.frequency}
                    onChange={(e) => updateField("frequency", e.target.value)}
                >
                    {investmentFrequencies.map((frequency) => (
                        <option key={frequency.value} value={frequency.value}>
                            {frequency.label}
                        </option>
                    ))}
                </select>
            </label>

            {(investment.frequency === "weekly" || investment.frequency === "biweekly") && (
                <label className="flex flex-col gap-1">
                    <span className="field-label">Day of the Week</span>
                    <select
                        className={inputClasses}
                        value={investment.dayOfWeek}
                        onChange={(e) => updateField("dayOfWeek", e.target.value)}
                    >
                        <option value="">--</option>
                        {marketWeekdays.map((day) => (
                            <option key={day.value} value={day.value}>
                                {day.label}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {nextDates.length > 0 && (
                <label className="flex flex-col gap-1">
                    <span className="field-label">Next Investment</span>
                    <select
                        className={inputClasses}
                        value={selectedNext ? toDateString(selectedNext) : ""}
                        onChange={(e) => updateField("startDate", e.target.value)}
                    >
                        {nextDates.map((date) => (
                            <option key={date.getTime()} value={toDateString(date)}>
                                {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            {investment.frequency === "monthly" && (
                <label className="flex flex-col gap-1">
                    <span className="field-label">Day of the Month</span>
                    <select
                        className={inputClasses}
                        value={investment.dayOfMonth}
                        onChange={(e) => updateField("dayOfMonth", e.target.value)}
                    >
                        <option value="">--</option>
                        {dueDates.map((dueDate) => (
                            <option key={dueDate.value} value={dueDate.value}>
                                {dueDate.label.replace(" of every month", "")}
                            </option>
                        ))}
                    </select>
                </label>
            )}

            <div className="flex flex-col gap-1">
                <span className="field-label">Paid From</span>
                <Dropdown
                    type="bank-account"
                    value={investment.bankAccount}
                    onChange={(accountId) => updateField("bankAccount", accountId)}
                />
            </div>

            <button type="button" onClick={onRemove} className="btn btn-danger self-start -ml-3.5">
                Remove
            </button>
        </div>
    );
}

// Edits an investment account's list of recurring investments.
function RecurringInvestmentFields({ investments, onChange }) {
    function update(index, investment) {
        onChange(investments.map((existing, i) => (i === index ? investment : existing)));
    }

    return (
        <div className="form-section">
            <span className="field-label">Recurring Investments</span>

            {investments.map((investment, index) => (
                <RecurringInvestment
                    key={investment.id}
                    investment={investment}
                    onChange={(updated) => update(index, updated)}
                    onRemove={() => onChange(investments.filter((_, i) => i !== index))}
                />
            ))}

            <button
                type="button"
                onClick={() => onChange([...investments, { ...emptyInvestment, id: crypto.randomUUID() }])}
                className="btn btn-secondary self-start"
            >
                <PlusIcon size={14} />
                Add Recurring Investment
            </button>
        </div>
    );
}

export default RecurringInvestmentFields;
