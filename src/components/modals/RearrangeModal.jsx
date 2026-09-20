"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "@/components/ui/icons";

function RearrangeModal({ isOpen, onClose, items, getLabel, onReorder, onDelete }) {
    const [order, setOrder] = useState(items);

    if (!isOpen) return null;

    function moveUp(index) {
        if (index === 0) return;
        setOrder((prev) => {
            const next = [...prev];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            return next;
        });
    }

    function moveDown(index) {
        setOrder((prev) => {
            if (index === prev.length - 1) return prev;
            const next = [...prev];
            [next[index + 1], next[index]] = [next[index], next[index + 1]];
            return next;
        });
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this item? This cannot be undone.")) return;
        setOrder((prev) => prev.filter((item) => item.id !== id));
        await onDelete(id);
    }

    async function handleDone() {
        await onReorder(order.map((item) => item.id));
        onClose();
    }

    return (
        <Modal title="Rearrange" onClose={onClose}>
            {order.length === 0 && (
                <p className="text-muted text-sm">Nothing to rearrange yet.</p>
            )}

            <ul className="flex flex-col gap-2">
                {order.map((item, index) => (
                    <li
                        key={item.id}
                        className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-3 pr-1.5 transition-colors hover:border-[var(--border-strong)]"
                    >
                        <span className="flex-1 truncate text-sm font-medium">{getLabel(item)}</span>
                        <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveUp(index)}
                            className="icon-btn"
                            aria-label="Move up"
                        >
                            <ArrowUpIcon size={15} />
                        </button>
                        <button
                            type="button"
                            disabled={index === order.length - 1}
                            onClick={() => moveDown(index)}
                            className="icon-btn"
                            aria-label="Move down"
                        >
                            <ArrowDownIcon size={15} />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="icon-btn hover:!text-[var(--danger)] hover:!bg-[var(--danger-soft)]"
                            aria-label="Delete"
                        >
                            <TrashIcon size={15} />
                        </button>
                    </li>
                ))}
            </ul>

            <button type="button" onClick={handleDone} className="btn btn-primary mt-5 w-full py-2.5">
                Done
            </button>
        </Modal>
    );
}

export default RearrangeModal;
