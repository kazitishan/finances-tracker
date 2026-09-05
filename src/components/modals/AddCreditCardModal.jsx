"use client";

import { useState } from "react";
import BankCompaniesDropdown from "@/components/dropdowns/BankCompaniesDropdown";
import { months, years, pastYears, dueDates, inputClasses, onlyDigits, groupFromRight, stripSpacesOnCopy } from "@/lib/formUtils";

const initialFormState = {
    name: "",
    bank: "",
    link: "",
    openMonth: "",
    openYear: "",
    cardholder: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    creditLine: "",
    dueDate: "",
    rewards: "",
    usage: "",
    notes: "",
};

function AddCreditCardModal({ isOpen, onClose, itemId, initialData, onSaved }) {
    const [form, setForm] = useState(() => (initialData ? { ...initialFormState, ...initialData } : initialFormState));
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function markTouched(field) {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }

    function handleClose() {
        onClose();
    }

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const url = itemId ? `/api/credit-cards/${itemId}` : "/api/credit-cards";
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

    const cardNumberError =
        touched.cardNumber && form.cardNumber.length > 0 && form.cardNumber.length !== 16;
    const cvcError = touched.cvc && form.cvc.length > 0 && form.cvc.length !== 3;

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
                    <h2 className="text-xl font-bold">{itemId ? "Edit Credit Card" : "Add Credit Card"}</h2>
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
                        <span className="font-semibold">Bank</span>
                        <BankCompaniesDropdown
                            value={form.bank}
                            onChange={(bank) => updateField("bank", bank)}
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
                        <span className="font-semibold">Open Date</span>
                        <div className="flex gap-4">
                            <label className="flex flex-col gap-1 flex-1">
                                <span className="text-sm text-gray-500">Month</span>
                                <select
                                    className={inputClasses}
                                    value={form.openMonth}
                                    onChange={(e) => updateField("openMonth", e.target.value)}
                                >
                                    <option value="">--</option>
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.value} - {month.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1 flex-1">
                                <span className="text-sm text-gray-500">Year</span>
                                <select
                                    className={inputClasses}
                                    value={form.openYear}
                                    onChange={(e) => updateField("openYear", e.target.value)}
                                >
                                    <option value="">--</option>
                                    {pastYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                        <span className="font-semibold">Credit Card Info</span>

                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Cardholder</span>
                            <input
                                type="text"
                                className={inputClasses}
                                value={form.cardholder}
                                onChange={(e) => updateField("cardholder", e.target.value)}
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Card Number</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                className={inputClasses}
                                value={groupFromRight(form.cardNumber)}
                                onChange={(e) => updateField("cardNumber", onlyDigits(e.target.value).slice(0, 16))}
                                onBlur={() => markTouched("cardNumber")}
                                onCopy={stripSpacesOnCopy}
                            />
                            {cardNumberError && (
                                <span className="text-red-600 text-sm">Card number must be 16 digits</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">CVC</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={3}
                                className={inputClasses}
                                value={form.cvc}
                                onChange={(e) => updateField("cvc", onlyDigits(e.target.value).slice(0, 3))}
                                onBlur={() => markTouched("cvc")}
                            />
                            {cvcError && (
                                <span className="text-red-600 text-sm">CVC must be 3 digits</span>
                            )}
                        </label>

                        <div className="flex gap-4">
                            <label className="flex flex-col gap-1 flex-1">
                                <span className="font-semibold">Expiration Month</span>
                                <select
                                    className={inputClasses}
                                    value={form.expMonth}
                                    onChange={(e) => updateField("expMonth", e.target.value)}
                                >
                                    <option value="">--</option>
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.value} - {month.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1 flex-1">
                                <span className="font-semibold">Expiration Year</span>
                                <select
                                    className={inputClasses}
                                    value={form.expYear}
                                    onChange={(e) => updateField("expYear", e.target.value)}
                                >
                                    <option value="">--</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Credit Line</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                className={inputClasses}
                                value={form.creditLine}
                                onChange={(e) => updateField("creditLine", onlyDigits(e.target.value))}
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Payments are due on</span>
                            <select
                                className={inputClasses}
                                value={form.dueDate}
                                onChange={(e) => updateField("dueDate", e.target.value)}
                            >
                                <option value="">--</option>
                                {dueDates.map((dueDate) => (
                                    <option key={dueDate.value} value={dueDate.value}>
                                        {dueDate.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                        <span className="font-semibold">Rewards & Benefits</span>

                        <label className="flex flex-col gap-1">
                            <textarea
                                rows={4}
                                className={inputClasses}
                                value={form.rewards}
                                onChange={(e) => updateField("rewards", e.target.value)}
                            />
                            <span className="text-gray-500 text-sm">Each line is a bullet point</span>
                        </label>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                        <span className="font-semibold">How will you use this card?</span>

                        <label className="flex flex-col gap-1">
                            <textarea
                                rows={4}
                                className={inputClasses}
                                value={form.usage}
                                onChange={(e) => updateField("usage", e.target.value)}
                            />
                            <span className="text-gray-500 text-sm">Each line becomes a chip</span>
                        </label>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                        <span className="font-semibold">Notes</span>

                        <textarea
                            rows={4}
                            className={inputClasses}
                            value={form.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                        />
                    </div>

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

export default AddCreditCardModal;
