"use client";

import { useState } from "react";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Rearrange</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {order.length === 0 && (
                    <p className="text-gray-500 text-sm">Nothing to rearrange yet.</p>
                )}

                <ul className="flex flex-col gap-2">
                    {order.map((item, index) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-3 border border-gray-200 rounded-lg p-2"
                        >
                            <div className="flex flex-col">
                                <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => moveUp(index)}
                                    className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer leading-none"
                                    aria-label="Move up"
                                >
                                    ▲
                                </button>
                                <button
                                    type="button"
                                    disabled={index === order.length - 1}
                                    onClick={() => moveDown(index)}
                                    className="text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer leading-none"
                                    aria-label="Move down"
                                >
                                    ▼
                                </button>
                            </div>
                            <span className="flex-1 truncate">{getLabel(item)}</span>
                            <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800 cursor-pointer"
                                aria-label="Delete"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    type="button"
                    onClick={handleDone}
                    className="mt-4 w-full bg-green-800 font-bold text-white p-2 rounded-xl hover:bg-green-900 transition-colors cursor-pointer"
                >
                    Done
                </button>
            </div>
        </div>
    );
}

export default RearrangeModal;
