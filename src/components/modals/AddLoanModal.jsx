"use client";

import { useState } from "react";
import LoanProviderDropdown from "@/components/dropdowns/LoanProviderDropdown";
import LoanTypeDropdown from "@/components/dropdowns/LoanTypeDropdown";
import { inputClasses, onlyDecimal } from "@/lib/formUtils";

const initialFormState = {
    name: "",
    type: "",
    otherType: "",
    provider: "",
    link: "",
    amountLoaned: "",
    interestRate: "",
    notes: "",
};

function AddLoanModal({ isOpen, onClose, itemId, initialData, onSaved }) {
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
            const url = itemId ? `/api/loans/${itemId}` : "/api/loans";
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
                    <h2 className="text-xl font-bold">{itemId ? "Edit Loan" : "Add Loan"}</h2>
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

                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">Type</span>
                        <LoanTypeDropdown
                            value={form.type}
                            otherValue={form.otherType}
                            onChange={(type) => updateField("type", type)}
                            onOtherChange={(otherType) => updateField("otherType", otherType)}
                        />
                    </div>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Loan Provider</span>
                        <LoanProviderDropdown
                            value={form.provider}
                            onChange={(provider) => updateField("provider", provider)}
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

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Amount Loaned</span>
                        <div className="flex items-center gap-2">
                            <span>$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                className={inputClasses}
                                value={form.amountLoaned}
                                onChange={(e) => updateField("amountLoaned", onlyDecimal(e.target.value))}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Interest Rate</span>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                inputMode="decimal"
                                className={inputClasses}
                                value={form.interestRate}
                                onChange={(e) => updateField("interestRate", onlyDecimal(e.target.value))}
                            />
                            <span>%</span>
                        </div>
                    </label>

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

export default AddLoanModal;
