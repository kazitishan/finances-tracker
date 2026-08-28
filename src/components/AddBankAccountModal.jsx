"use client";

import { useState } from "react";
import BankDropdown from "@/components/BankDropdown";
import { months, years, inputClasses, onlyDigits, onlyDecimal, groupFromRight, stripSpacesOnCopy } from "@/lib/formUtils";

const initialFormState = {
    name: "",
    bank: "",
    link: "",
    type: "",
    routingNumber: "",
    accountNumber: "",
    apy: "",
    cardholder: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    notes: "",
};

function AddBankAccountModal({ isOpen, onClose, itemId, initialData, onSaved }) {
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
            const url = itemId ? `/api/bank-accounts/${itemId}` : "/api/bank-accounts";
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
                    <h2 className="text-xl font-bold">{itemId ? "Edit Bank Account" : "Add Bank Account"}</h2>
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
                        <BankDropdown
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
                        <span className="font-semibold">Type</span>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={form.type === "Checking"}
                                    onChange={() => updateField("type", "Checking")}
                                />
                                Checking
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={form.type === "Savings"}
                                    onChange={() => updateField("type", "Savings")}
                                />
                                Savings
                            </label>
                        </div>
                    </div>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Routing Number</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            className={inputClasses}
                            value={form.routingNumber}
                            onChange={(e) => updateField("routingNumber", onlyDigits(e.target.value))}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Account Number</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            className={inputClasses}
                            value={groupFromRight(form.accountNumber)}
                            onChange={(e) => updateField("accountNumber", onlyDigits(e.target.value))}
                            onCopy={stripSpacesOnCopy}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">APY</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            className={inputClasses}
                            value={form.apy}
                            onChange={(e) => updateField("apy", onlyDecimal(e.target.value))}
                        />
                    </label>

                    {form.type === "Checking" && (
                        <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                            <span className="font-semibold">Debit Card Info</span>

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
                        </div>
                    )}

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

export default AddBankAccountModal;
