"use client";

import { useEffect, useRef, useState } from "react";
import { formatNames } from "@/lib/formUtils";
import { useToast } from "@/components/ToastProvider";

function LoginChangePrompt({ sharedWith, disabled, onChoose, onCancel }) {
    const ref = useRef(null);

    useEffect(() => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, []);

    return (
        <div ref={ref} className="mt-2 flex flex-col gap-3 rounded-xl border border-[var(--border-strong)] p-4">
            <div className="text-sm">
                <div className="font-medium">{formatNames(sharedWith)} also {sharedWith.length === 1 ? "uses" : "use"} this login.</div>
                <div className="text-muted mt-0.5">Change the password for {sharedWith.length === 1 ? "it" : "them"} too?</div>
            </div>
            <div className="flex flex-col gap-2">
                <button type="button" disabled={disabled} onClick={() => onChoose("update-all")} className="btn btn-primary">
                    Update password everywhere
                </button>
                <button type="button" disabled={disabled} onClick={() => onChoose("new")} className="btn btn-secondary">
                    Save as a new login
                </button>
                <button type="button" disabled={disabled} onClick={onCancel} className="btn text-muted">
                    Cancel
                </button>
            </div>
        </div>
    );
}

// Saves a form for `category`. If the password of a login other items share was changed,
// `prompt` asks whether to update those items too; render it in place of the save button.
// `requestClose` asks before discarding edits; `remove` deletes the item being edited.
export function useSaveItem({ category, itemId, form, initialForm, onSaved, onDelete, onClose }) {
    const showToast = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [sharedWith, setSharedWith] = useState(null);

    async function save(loginMode = null) {
        setSubmitting(true);
        try {
            const url = itemId ? `/api/${category}/${itemId}` : `/api/${category}`;
            const res = await fetch(loginMode ? `${url}?login=${loginMode}` : url, {
                method: itemId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.status === 409) {
                setSharedWith((await res.json()).sharedWith);
                return;
            }
            if (!res.ok) throw new Error(`Save failed: ${res.status}`);
            const saved = await res.json();
            onSaved?.(saved);

            // Other items on this page may have had their password changed too.
            if (loginMode === "update-all") {
                const items = await fetch(`/api/${category}`).then((r) => r.json());
                items.filter((item) => item.id !== saved.id).forEach((item) => onSaved?.(item));
            }
            showToast(loginMode === "update-all" ? "Saved everywhere" : itemId ? "Saved" : "Added");
            onClose();
        } catch {
            showToast("Couldn't save");
        } finally {
            setSubmitting(false);
        }
    }

    async function remove() {
        if (!window.confirm("Delete this item? This cannot be undone.")) return;
        setSubmitting(true);
        try {
            await onDelete(itemId);
            showToast("Deleted");
            onClose();
        } catch {
            showToast("Couldn't delete");
        } finally {
            setSubmitting(false);
        }
    }

    function requestClose() {
        const changed = JSON.stringify(form) !== JSON.stringify(initialForm);
        if (changed && !window.confirm("Discard unsaved changes?")) return;
        onClose();
    }

    const prompt = sharedWith && (
        <LoginChangePrompt
            sharedWith={sharedWith}
            disabled={submitting}
            onChoose={save}
            onCancel={() => setSharedWith(null)}
        />
    );

    return { save, remove, requestClose, submitting, prompt };
}
