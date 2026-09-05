"use client";

import { useState } from "react";
import SubscriptionDropdown from "@/components/dropdowns/SubscriptionDropdown";
import { months, dueDates, inputClasses, onlyDecimal } from "@/lib/formUtils";

const initialFormState = {
    name: "",
    subscription: "",
    link: "",
    cost: "",
    billingCycle: "month",
    billingMonth: "",
    billingDay: "",
};

function AddSubscriptionModal({ isOpen, onClose, itemId, initialData, onSaved }) {
    const [form, setForm] = useState(() => (initialData ? { ...initialFormState, ...initialData } : initialFormState));
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleClose() {
        onClose();
    }

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const url = itemId ? `/api/subscriptions/${itemId}` : "/api/subscriptions";
            const res = await fetch(url, {
                method: itemId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const saved = await res.json();
            onSaved?.(saved);
            handleClose();
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{itemId ? "Edit Subscription" : "Add Subscription"}</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Name</span>
                        <input
                            type="text"
                            className={inputClasses}
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Subscription</span>
                        <SubscriptionDropdown
                            value={form.subscription}
                            onChange={(subscription) => updateField("subscription", subscription)}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Link</span>
                        <input
                            type="url"
                            className={inputClasses}
                            value={form.link}
                            onChange={(e) => updateField("link", e.target.value)}
                        />
                    </label>

                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">Billing</span>
                        <div className="flex items-center gap-2">
                            <span>$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                className={inputClasses}
                                value={form.cost}
                                onChange={(e) => updateField("cost", onlyDecimal(e.target.value))}
                            />
                            <span>every</span>
                            <select
                                className={inputClasses}
                                value={form.billingCycle}
                                onChange={(e) => updateField("billingCycle", e.target.value)}
                            >
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                            </select>
                        </div>
                    </div>

                    {form.billingCycle === "year" && (
                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Renewal Month</span>
                            <select
                                className={inputClasses}
                                value={form.billingMonth}
                                onChange={(e) => updateField("billingMonth", e.target.value)}
                            >
                                <option value="">--</option>
                                {months.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.value} - {month.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">
                            {form.billingCycle === "year" ? "Renewal Day" : "Day of the Month"}
                        </span>
                        <select
                            className={inputClasses}
                            value={form.billingDay}
                            onChange={(e) => updateField("billingDay", e.target.value)}
                        >
                            <option value="">--</option>
                            {dueDates.map((dueDate) => (
                                <option key={dueDate.value} value={dueDate.value}>
                                    {dueDate.label.replace(" of every month", "")}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="mt-2 bg-green-800 font-bold text-white p-2 rounded-xl hover:bg-green-900 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {itemId ? "Save Changes" : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddSubscriptionModal;
