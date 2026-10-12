"use client";

import { useState } from "react";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ToastProvider";
import { formatNames } from "@/lib/formUtils";

function EditLoginModal({ isOpen, onClose, login, onChanged }) {
    const [username, setUsername] = useState(login?.username ?? "");
    const [password, setPassword] = useState(login?.password ?? "");
    const [submitting, setSubmitting] = useState(false);
    const showToast = useToast();

    if (!isOpen || !login) return null;

    const usedByNames = login.usedBy.map((item) => item.name || "Unnamed item");

    async function handleSave() {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/passwords/${login.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!res.ok) throw new Error(`Save failed: ${res.status}`);
            await onChanged();
            showToast("Login updated");
            onClose();
        } catch {
            showToast("Couldn't save");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        const message = usedByNames.length > 0
            ? `Delete this login? It will also be removed from ${formatNames(usedByNames)}.`
            : "Delete this login?";
        if (!window.confirm(message)) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/passwords/${login.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
            await onChanged();
            showToast("Login deleted");
            onClose();
        } catch {
            showToast("Couldn't delete");
        } finally {
            setSubmitting(false);
        }
    }

    function requestClose() {
        const changed = username !== login.username || password !== login.password;
        if (changed && !window.confirm("Discard unsaved changes?")) return;
        onClose();
    }

    return (
        <Modal title={`Edit ${login.platform} Login`} onClose={requestClose}>
            <div className="flex flex-col gap-4">
                {usedByNames.length > 0 && (
                    <p className="text-sm text-muted">Changes also apply to {formatNames(usedByNames)}.</p>
                )}

                <LoginFields
                    username={username}
                    password={password}
                    onUsernameChange={setUsername}
                    onPasswordChange={setPassword}
                />

                <div className="flex gap-2 mt-2">
                    <button type="button" onClick={handleDelete} disabled={submitting} className="btn btn-danger py-2.5">
                        Delete
                    </button>
                    <button type="button" onClick={handleSave} disabled={submitting} className="btn btn-primary flex-1 py-2.5">
                        Save Changes
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default EditLoginModal;
