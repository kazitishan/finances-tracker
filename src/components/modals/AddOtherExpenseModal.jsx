"use client";

import { useState } from "react";
import Dropdown from "@/components/dropdowns/Dropdown";
import { inputClasses, onlyPrice } from "@/lib/formUtils";
import Modal from "@/components/ui/Modal";
import { useSaveItem } from "@/components/useSaveItem";

const initialFormState = {
    name: "",
    category: "",
    otherCategory: "",
    price: "",
    link: "",
};

function AddOtherExpenseModal({ isOpen, onClose, itemId, initialData, onSaved, onDelete }) {
    const [initialForm] = useState(() => (initialData ? { ...initialFormState, ...initialData } : initialFormState));
    const [form, setForm] = useState(initialForm);
    const { save, remove, requestClose, submitting, prompt } = useSaveItem({
        category: "other-expenses", itemId, form, initialForm, onSaved, onDelete, onClose,
    });

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    return (
        <Modal title={itemId ? "Edit Expense" : "Add Expense"} onClose={requestClose}>
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
                        <span className="field-label">Category</span>
                        <Dropdown
                            type="expense-category"
                            value={form.category}
                            otherValue={form.otherCategory}
                            onChange={(category) => updateField("category", category)}
                            onOtherChange={(otherCategory) => updateField("otherCategory", otherCategory)}
                        />
                    </div>

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Price</span>
                        <div className="flex items-center gap-2">
                            <span>$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                className={inputClasses}
                                value={form.price}
                                onChange={(e) => updateField("price", onlyPrice(e.target.value))}
                            />
                        </div>
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

                    {prompt || (
                        <div className="flex gap-2 mt-2">
                            {itemId && (
                                <button type="button" onClick={remove} disabled={submitting} className="btn btn-danger py-2.5">
                                    Delete
                                </button>
                            )}
                            <button type="button" onClick={() => save()} disabled={submitting || !form.name.trim()} className="btn btn-primary flex-1 py-2.5">
                                {itemId ? "Save Changes" : "Add"}
                            </button>
                        </div>
                    )}
                </div>
        </Modal>
    );
}

export default AddOtherExpenseModal;
