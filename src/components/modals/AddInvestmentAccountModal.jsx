"use client";

import { useState } from "react";
import BrokerDropdown from "@/components/dropdowns/BrokerDropdown";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";
import { investmentAccountTypes } from "@/components/info/InvestmentAccountInfo";
import { inputClasses } from "@/lib/formUtils";

const initialFormState = {
    name: "",
    type: "",
    broker: "",
    link: "",
    loginUsername: "",
    loginPassword: "",
    notes: "",
};

function AddInvestmentAccountModal({ isOpen, onClose, itemId, initialData, onSaved }) {
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
            const url = itemId ? `/api/investment-accounts/${itemId}` : "/api/investment-accounts";
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
        <Modal title={itemId ? "Edit Investment Account" : "Add Investment Account"} onClose={handleClose}>
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
                    <span className="field-label">Type</span>
                    <select
                        className={inputClasses}
                        value={form.type}
                        onChange={(e) => updateField("type", e.target.value)}
                    >
                        <option value="">--</option>
                        {investmentAccountTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1">
                    <span className="field-label">Broker</span>
                    <BrokerDropdown value={form.broker} onChange={(broker) => updateField("broker", broker)} />
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

export default AddInvestmentAccountModal;
