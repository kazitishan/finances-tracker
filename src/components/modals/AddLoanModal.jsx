"use client";

import { useState } from "react";
import LoanProviderDropdown from "@/components/dropdowns/LoanProviderDropdown";
import LoanTypeDropdown from "@/components/dropdowns/LoanTypeDropdown";
import { dueDates, inputClasses, onlyDecimal } from "@/lib/formUtils";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";
import { useSaveItem } from "@/components/useSaveItem";

const initialFormState = {
    name: "",
    type: "",
    otherType: "",
    provider: "",
    customLogo: "",
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

function AddLoanModal({ isOpen, onClose, itemId, initialData, onSaved, onDelete }) {
    const [initialForm] = useState(() => (initialData ? { ...initialFormState, ...initialData } : initialFormState));
    const [form, setForm] = useState(initialForm);
    const { save, remove, requestClose, submitting, prompt } = useSaveItem({
        category: "loans", itemId, form, initialForm, onSaved, onDelete, onClose,
    });

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <Modal title={itemId ? "Edit Loan" : "Add Loan"} onClose={requestClose}>
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

                    <div className="flex flex-col gap-1">
                        <span className="field-label">Loan Provider</span>
                        <LoanProviderDropdown
                            value={form.provider}
                            onChange={(provider) => updateField("provider", provider)}
                            customLogo={form.customLogo}
                            onCustomLogoChange={(customLogo) => updateField("customLogo", customLogo)}
                        />
                    </div>

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

                        platform={form.provider}
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

                    {prompt || (
                        <div className="flex gap-2 mt-2">
                            {itemId && (
                                <button type="button" onClick={remove} disabled={submitting} className="btn btn-danger py-2.5">
                                    Delete
                                </button>
                            )}
                            <button type="button" onClick={() => save()} disabled={submitting} className="btn btn-primary flex-1 py-2.5">
                                {itemId ? "Save Changes" : "Add"}
                            </button>
                        </div>
                    )}
                </div>
        </Modal>
    );
}

export default AddLoanModal;
