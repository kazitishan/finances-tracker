"use client";

import { useState } from "react";
import SubscriptionDropdown from "@/components/dropdowns/SubscriptionDropdown";
import PaymentMethodDropdown from "@/components/dropdowns/PaymentMethodDropdown";
import { months, dueDates, inputClasses, onlyDecimal } from "@/lib/formUtils";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";
import { useSaveItem } from "@/components/useSaveItem";

const initialFormState = {
    name: "",
    subscription: "",
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

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Subscription</span>
                        <SubscriptionDropdown
                            value={form.subscription}
                            onChange={(subscription) => updateField("subscription", subscription)}
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

                        platform={form.subscription}
                        username={form.loginUsername}
                        password={form.loginPassword}
                        onUsernameChange={(value) => updateField("loginUsername", value)}
                        onPasswordChange={(value) => updateField("loginPassword", value)}
                    />

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Payment Method</span>
                        <PaymentMethodDropdown
                            value={form.paymentMethod}
                            onChange={(paymentMethod) => updateField("paymentMethod", paymentMethod)}
                        />
                    </label>

                    <div className="flex flex-col gap-1">
                        <span className="field-label">Billing</span>
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
                        <span className="field-label">
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

export default AddSubscriptionModal;
