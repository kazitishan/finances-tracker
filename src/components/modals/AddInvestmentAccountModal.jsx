"use client";

import { useState } from "react";
import LoginFields from "@/components/LoginFields";
import RecurringInvestmentFields from "@/components/RecurringInvestmentFields";
import Modal from "@/components/ui/Modal";
import { useSaveItem } from "@/components/useSaveItem";
import { inputClasses } from "@/lib/formUtils";
import Dropdown from "@/components/dropdowns/Dropdown";
import FormActions from "@/components/ui/FormActions";
import NotesField from "@/components/ui/NotesField";

const initialFormState = {
    name: "",
    type: "",
    broker: "",
    customLogo: "",
    link: "",
    loginUsername: "",
    loginPassword: "",
    recurringInvestments: [],
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

                <div className="flex flex-col gap-1">
                    <span className="field-label">Type</span>
                    <Dropdown type="investment-type" value={form.type} onChange={(type) => updateField("type", type)} />
                </div>

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

                <RecurringInvestmentFields
                    investments={form.recurringInvestments}
                    onChange={(investments) => updateField("recurringInvestments", investments)}
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

export default AddInvestmentAccountModal;
