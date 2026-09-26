"use client";

import { useState } from "react";
import LoanProviderDropdown from "@/components/dropdowns/LoanProviderDropdown";
import LoanTypeDropdown from "@/components/dropdowns/LoanTypeDropdown";
import { dueDates, inputClasses, onlyDecimal } from "@/lib/formUtils";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";

const initialFormState = {
    name: "",
    type: "",
    otherType: "",
    provider: "",
    link: "",
    loginUsername: "",
    loginPassword: "",
    amountLoaned: "",
    interestRate: "",
    interestAmount: "",
    amountPaid: "",
    monthlyPayment: "",
    paymentDay: "",
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
        <Modal title={itemId ? "Edit Loan" : "Add Loan"} onClose={handleClose}>
                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1">
                        <span className="field-label">Name</span>
                        <input
                            type="text"
                            className={inputClasses}
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                    </label>

                    <div className="flex flex-col gap-1">
                        <span className="field-label">Type</span>
                        <LoanTypeDropdown
                            value={form.type}
                            otherValue={form.otherType}
                            onChange={(type) => updateField("type", type)}
                            onOtherChange={(otherType) => updateField("otherType", otherType)}
                        />
                    </div>

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Loan Provider</span>
                        <LoanProviderDropdown
                            value={form.provider}
                            onChange={(provider) => updateField("provider", provider)}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Link</span>
                        <input
                            type="url"
                            className={inputClasses}
                            value={form.link}
                            onChange={(e) => updateField("link", e.target.value)}
                        />
                    </label>

                    <LoginFields
                        username={form.loginUsername}
                        password={form.loginPassword}
                        onUsernameChange={(value) => updateField("loginUsername", value)}
                        onPasswordChange={(value) => updateField("loginPassword", value)}
                    />

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Amount Loaned</span>
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
                        <span className="field-label">Interest Rate</span>
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

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Interest Amount</span>
                        <div className="flex items-center gap-2">
                            <span>$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                className={inputClasses}
                                value={form.interestAmount}
                                onChange={(e) => updateField("interestAmount", onlyDecimal(e.target.value))}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Amount Paid</span>
                        <div className="flex items-center gap-2">
                            <span>$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                className={inputClasses}
                                value={form.amountPaid}
                                onChange={(e) => updateField("amountPaid", onlyDecimal(e.target.value))}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Monthly Loan Payment</span>
                        <div className="flex items-center gap-2">
                            <span>$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                className={inputClasses}
                                value={form.monthlyPayment}
                                onChange={(e) => updateField("monthlyPayment", onlyDecimal(e.target.value))}
                            />
                        </div>
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Monthly Loan Payment Date</span>
                        <select
                            className={inputClasses}
                            value={form.paymentDay}
                            onChange={(e) => updateField("paymentDay", e.target.value)}
                        >
                            <option value="">--</option>
                            {dueDates.map((dueDate) => (
                                <option key={dueDate.value} value={dueDate.value}>
                                    {dueDate.label.replace(" of every month", "")}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="form-section">
                        <span className="field-label">Notes</span>

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
                        className="btn btn-primary mt-2 py-2.5"
                    >
                        {itemId ? "Save Changes" : "Add"}
                    </button>
                </div>
        </Modal>
    );
}

export default AddLoanModal;
