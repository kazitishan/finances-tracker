"use client";

import { useState } from "react";
import Dropdown from "@/components/dropdowns/Dropdown";
import { dueDates, inputClasses, onlyDecimal } from "@/lib/formUtils";
import LoanDisbursementFields from "@/components/LoanDisbursementFields";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";
import { useSaveItem } from "@/components/useSaveItem";
import FormActions from "@/components/ui/FormActions";
import NotesField from "@/components/ui/NotesField";
import AffixInput from "@/components/ui/AffixInput";

const initialFormState = {
    name: "",
    type: "",
    otherType: "",
    provider: "",
    img: "",
    link: "",
    loginUsername: "",
    loginPassword: "",
    amountLoaned: "",
    interestRate: "",
    interestAmount: "",
    amountPaid: "",
    monthlyPayment: "",
    paymentDay: "",
    disbursements: [],
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
                    <Dropdown
                        type="loan-type"
                        value={form.type}
                        otherValue={form.otherType}
                        onChange={(type) => updateField("type", type)}
                        onOtherChange={(otherType) => updateField("otherType", otherType)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <span className="field-label">Provider</span>
                    <Dropdown
                        type="loan-provider"
                        value={form.provider}
                        onChange={(provider) => updateField("provider", provider)}
                        customLogo={form.img}
                        onCustomLogoChange={(img) => updateField("img", img)}
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
                    <AffixInput
                        prefix="$"
                        inputMode="decimal"
                        value={form.amountLoaned}
                        onChange={(e) => updateField("amountLoaned", onlyDecimal(e.target.value))}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="field-label">Interest Rate</span>
                    <AffixInput
                        suffix="%"
                        inputMode="decimal"
                        value={form.interestRate}
                        onChange={(e) => updateField("interestRate", onlyDecimal(e.target.value))}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="field-label">Interest Amount</span>
                    <AffixInput
                        prefix="$"
                        inputMode="decimal"
                        value={form.interestAmount}
                        onChange={(e) => updateField("interestAmount", onlyDecimal(e.target.value))}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="field-label">Amount Paid</span>
                    <AffixInput
                        prefix="$"
                        inputMode="decimal"
                        value={form.amountPaid}
                        onChange={(e) => updateField("amountPaid", onlyDecimal(e.target.value))}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="field-label">Monthly Payment</span>
                    <AffixInput
                        prefix="$"
                        inputMode="decimal"
                        value={form.monthlyPayment}
                        onChange={(e) => updateField("monthlyPayment", onlyDecimal(e.target.value))}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className="field-label">Payment Day</span>
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

                <LoanDisbursementFields
                    disbursements={form.disbursements}
                    onChange={(disbursements) => updateField("disbursements", disbursements)}
                />

                <NotesField value={form.notes} onChange={(notes) => updateField("notes", notes)} />

                {prompt || (
                    <FormActions
                        isEditing={Boolean(itemId)}
                        onSave={save}
                        onDelete={remove}
                        submitting={submitting}
                    />
                )}
            </div>
        </Modal>
    );
}

export default AddLoanModal;
