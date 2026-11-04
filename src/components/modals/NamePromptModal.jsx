"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ToastProvider";
import { inputClasses } from "@/lib/formUtils";

// Asks a new user for their name. It has no close button and ignores Escape and backdrop clicks,
// so the app can't be used until a name is saved.
function NamePromptModal({ onSave }) {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const showToast = useToast();

    async function handleSubmit(event) {
        event.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        try {
            await onSave({ name });
        } catch {
            showToast("Couldn't save");
            setSaving(false);
        }
    }

    return (
        <Modal title="Welcome!">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-sm text-muted">Enter your name to get started. You can change it later from Profile in Settings.</p>
                <label className="flex flex-col gap-1">
                    <span className="field-label">Name</span>
                    <input
                        type="text"
                        autoComplete="name"
                        autoFocus
                        className={inputClasses}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </label>
                <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
                    Continue
                </button>
            </form>
        </Modal>
    );
}

export default NamePromptModal;
