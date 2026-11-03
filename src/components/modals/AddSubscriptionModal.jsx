"use client";

import { useState } from "react";
import Dropdown from "@/components/dropdowns/Dropdown";
import { months, dueDates, inputClasses, onlyDecimal } from "@/lib/formUtils";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";
import { useSaveItem } from "@/components/useSaveItem";
import FormActions from "@/components/ui/FormActions";
import NotesField from "@/components/ui/NotesField";
import AffixInput from "@/components/ui/AffixInput";

const initialFormState = {
    name: "",
    subscription: "",
    customLogo: "",
    link: "",
    loginUsername: "",
    loginPassword: "",
    paymentMethod: "",
    cost: "",
    billingCycle: "month",
    billingMonth: "",
    billingDay: "",
    notes: "",
};

function AddSubscriptionModal({ isOpen, onClose, itemId, initialData, onSaved, onDelete }) {
    const [initialForm] = useState(() => (initialData ? { ...initialFormState, ...initialData } : initialFormState));
    const [form, setForm] = useState(initialForm);
    const { save, remove, requestClose, submitting, prompt } = useSaveItem({
        category: "subscriptions", itemId, form, initialForm, onSaved, onDelete, onClose,
    });

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <Modal title={itemId ? "Edit Subscription" : "Add Subscription"} onClose={requestClose}>
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
                    <span className="field-label">Subscription</span>
                    <Dropdown
                        type="subscription"
                        value={form.subscription}
                        onChange={(subscription) => updateField("subscription", subscription)}
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
                    platform={form.subscription}
                    username={form.loginUsername}
                    password={form.loginPassword}
                    onUsernameChange={(value) => updateField("loginUsername", value)}
                    onPasswordChange={(value) => updateField("loginPassword", value)}
                />

                <div className="flex flex-col gap-1">
                    <span className="field-label">Payment Method</span>
                    <Dropdown
                        type="payment-method"
                        value={form.paymentMethod}
                        onChange={(paymentMethod) => updateField("paymentMethod", paymentMethod)}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <span className="field-label">Billing</span>
                    <div className="flex items-center gap-2">
                        <AffixInput
                            prefix="$"
                            inputMode="decimal"
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
                        <span className="field-label">Renewal Month</span>
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
                    <span className="field-label">Renewal Day</span>
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

export default AddSubscriptionModal;
