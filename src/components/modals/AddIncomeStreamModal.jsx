"use client";

import { useState } from "react";
import Dropdown from "@/components/dropdowns/Dropdown";
import { useToast } from "@/components/ToastProvider";
import Modal from "@/components/ui/Modal";
import { dueDates, inputClasses, onlyDecimal } from "@/lib/formUtils";
import { emptyIncomeStream, incomeFrequencies, isEstimated, isPayday } from "@/lib/incomeStreams";
import { marketWeekdays, nextWeekdays, toDateString, withStartDate } from "@/lib/recurringInvestments";
import AffixInput from "@/components/ui/AffixInput";
import FormActions from "@/components/ui/FormActions";

function PayDaySelect({ label, value, onChange }) {
    return (
        <label className="flex flex-col gap-1 flex-1">
            <span className="field-label">{label}</span>
            <select className={inputClasses} value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">--</option>
                {dueDates.map((dueDate) => (
                    <option key={dueDate.value} value={dueDate.value}>
                        {dueDate.label.replace(" of every month", "")}
                    </option>
                ))}
                <option value="last">Last day of the month</option>
            </select>
        </label>
    );
}

// Income streams live in user-info rather than being a category, so `onSave` and `onDelete` are the budget's own,
// resolving to whether the change was saved. Without `initialData` this adds a new stream.
function AddIncomeStreamModal({ isOpen, onClose, initialData, onSave, onDelete }) {
    const showToast = useToast();
    const [initialForm] = useState(() => (initialData ? { ...emptyIncomeStream, ...initialData } : emptyIncomeStream));
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => withStartDate({ ...prev, [field]: value }));
    }

    function requestClose() {
        const changed = JSON.stringify(form) !== JSON.stringify(initialForm);
        if (changed && !window.confirm("Discard unsaved changes?")) return;
        onClose();
    }

    async function save() {
        setSubmitting(true);
        const saved = await onSave({ ...form, name: form.name.trim(), id: form.id || crypto.randomUUID() });
        setSubmitting(false);
        if (!saved) return;
        showToast(initialData ? "Saved" : "Added");
        onClose();
    }

    async function remove() {
        if (!window.confirm("Delete this item? This cannot be undone.")) return;
        setSubmitting(true);
        const deleted = await onDelete(form.id);
        setSubmitting(false);
        if (!deleted) return;
        showToast("Deleted");
        onClose();
    }

    const usesWeekday = form.frequency === "weekly" || form.frequency === "biweekly";
    // The next two dates on the chosen weekday; the one in step with `startDate` is selected.
    const nextDates = form.frequency === "biweekly" && form.dayOfWeek ? nextWeekdays(form.dayOfWeek) : [];
    const selectedNext = nextDates.find((date) => isPayday(form, date));
    const sameDayTwice = form.frequency === "twice-monthly" && form.dayOfMonth && form.dayOfMonth === form.secondDayOfMonth;
    const estimated = isEstimated(form);
    const amount = estimated ? form.monthlyEstimate : form.paycheckAmount;
    const canSave = form.name.trim() !== "" && Number(amount) > 0 && !sameDayTwice;

    return (
        <Modal title={initialData ? "Edit Income Stream" : "Add Income Stream"} onClose={requestClose}>
            <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                    <span className="field-label">Name</span>
                    <input
                        type="text"
                        className={inputClasses}
                        placeholder="e.g. Day job"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                    />
                </label>

                <div className="flex flex-col gap-1">
                    <span className="field-label">Type</span>
                    <Dropdown
                        type="income-type"
                        value={form.type}
                        onChange={(type) => updateField("type", type)}
                        otherValue={form.otherType}
                        onOtherChange={(otherType) => updateField("otherType", otherType)}
                    />
                </div>

                <label className="flex flex-col gap-1">
                    <span className="field-label">Pay Frequency</span>
                    <select
                        className={inputClasses}
                        value={form.frequency}
                        onChange={(e) => updateField("frequency", e.target.value)}
                    >
                        {incomeFrequencies.map((frequency) => (
                            <option key={frequency.value} value={frequency.value}>
                                {frequency.label}
                            </option>
                        ))}
                    </select>
                </label>

                {usesWeekday && (
                    <label className="flex flex-col gap-1">
                        <span className="field-label">Payday</span>
                        <select
                            className={inputClasses}
                            value={form.dayOfWeek}
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
                        <span className="field-label">Next Paycheck</span>
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

                {form.frequency === "monthly" && (
                    <PayDaySelect
                        label="Payday"
                        value={form.dayOfMonth}
                        onChange={(day) => updateField("dayOfMonth", day)}
                    />
                )}

                {form.frequency === "twice-monthly" && (
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-4">
                            <PayDaySelect
                                label="First Payday"
                                value={form.dayOfMonth}
                                onChange={(day) => updateField("dayOfMonth", day)}
                            />
                            <PayDaySelect
                                label="Second Payday"
                                value={form.secondDayOfMonth}
                                onChange={(day) => updateField("secondDayOfMonth", day)}
                            />
                        </div>
                        {sameDayTwice && <span className="field-error">Pick two different days</span>}
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <span className="field-label">Amount</span>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="amountType"
                                checked={!estimated}
                                onChange={() => updateField("amountType", "paycheck")}
                            />
                            Fixed paycheck
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="amountType"
                                checked={estimated}
                                onChange={() => updateField("amountType", "estimate")}
                            />
                            Varies
                        </label>
                    </div>
                </div>

                <label className="flex flex-col gap-1">
                    <span className="field-label">{estimated ? "Estimated Monthly Income" : "Paycheck Amount"}</span>
                    <AffixInput
                        prefix="$"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => updateField(estimated ? "monthlyEstimate" : "paycheckAmount", onlyDecimal(e.target.value))}
                    />
                    {estimated && <span className="field-hint">What you expect to make in a month. Update it whenever your estimate changes.</span>}
                    {!estimated && !form.frequency && <span className="field-hint">With no set schedule, this counts once a month.</span>}
                </label>

                <div className="flex flex-col gap-1">
                    <span className="field-label">Payment Type</span>
                    <Dropdown
                        type="payment-type"
                        value={form.paymentType}
                        onChange={(paymentType) => updateField("paymentType", paymentType)}
                        otherValue={form.otherPaymentType}
                        onOtherChange={(otherPaymentType) => updateField("otherPaymentType", otherPaymentType)}
                    />
                </div>

                {form.paymentType === "Direct Deposit" && (
                    <div className="flex flex-col gap-1">
                        <span className="field-label">Bank Account</span>
                        <Dropdown
                            type="bank-account"
                            value={form.bankAccount}
                            onChange={(accountId) => updateField("bankAccount", accountId)}
                        />
                    </div>
                )}

                <FormActions
                    isEditing={Boolean(initialData)}
                    onSave={save}
                    onDelete={remove}
                    submitting={submitting}
                    disabled={!canSave}
                    hint={canSave ? null : "Add a name and an amount to save."}
                />
            </div>
        </Modal>
    );
}

export default AddIncomeStreamModal;
