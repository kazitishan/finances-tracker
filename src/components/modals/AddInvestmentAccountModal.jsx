"use client";

import { useState } from "react";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";
import { useSaveItem } from "@/components/useSaveItem";
import { investmentAccountTypes } from "@/components/info/InvestmentAccountInfo";
import { inputClasses } from "@/lib/formUtils";
import Dropdown from "@/components/dropdowns/Dropdown";

const initialFormState = {
    name: "",
    type: "",
    broker: "",
    customLogo: "",
    link: "",
    loginUsername: "",
    loginPassword: "",
    notes: "",
};

function AddInvestmentAccountModal({ isOpen, onClose, itemId, initialData, onSaved, onDelete }) {
    const [initialForm] = useState(() => (initialData ? { ...initialFormState, ...initialData } : initialFormState));
    const [form, setForm] = useState(initialForm);
    const { save, remove, requestClose, submitting, prompt } = useSaveItem({
        category: "investment-accounts", itemId, form, initialForm, onSaved, onDelete, onClose,
    });

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <Modal title={itemId ? "Edit Investment Account" : "Add Investment Account"} onClose={requestClose}>
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

                <div className="flex flex-col gap-1">
                    <span className="field-label">Broker</span>
                    <Dropdown
                        type="broker"
                        value={form.broker}
                        onChange={(broker) => updateField("broker", broker)}
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

                    platform={form.broker}
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

export default AddInvestmentAccountModal;
