"use client";

import { PlusIcon, XIcon } from "@/components/ui/icons";
import { inputClasses, onlyDecimal } from "@/lib/formUtils";

const emptyDisbursement = { date: "", amount: "" };

function Disbursement({ disbursement, onChange, onRemove }) {
    function updateField(field, value) {
        onChange({ ...disbursement, [field]: value });
    }

    return (
        <div className="flex items-end gap-2">
            <label className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="field-label">Date Disbursed</span>
                <input
                    type="date"
                    className={inputClasses}
                    value={disbursement.date}
                    onChange={(e) => updateField("date", e.target.value)}
                />
            </label>
            <label className="flex w-32 shrink-0 flex-col gap-1">
                <span className="field-label">Amount</span>
                <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        className={`${inputClasses} pl-6`}
                        placeholder="0.00"
                        value={disbursement.amount}
                        onChange={(e) => updateField("amount", onlyDecimal(e.target.value))}
                    />
                </div>
            </label>
            <button type="button" onClick={onRemove} className="icon-btn mb-1.5 shrink-0" aria-label="Remove disbursement">
                <XIcon size={14} />
            </button>
        </div>
    );
}

// Edits a loan's list of disbursements.
function LoanDisbursementFields({ disbursements, onChange }) {
    function update(index, disbursement) {
        onChange(disbursements.map((existing, i) => (i === index ? disbursement : existing)));
    }

    return (
        <div className="form-section">
            <span className="field-label">Disbursements</span>

            {disbursements.map((disbursement, index) => (
                <Disbursement
                    key={disbursement.id}
                    disbursement={disbursement}
                    onChange={(updated) => update(index, updated)}
                    onRemove={() => onChange(disbursements.filter((_, i) => i !== index))}
                />
            ))}

            <button
                type="button"
                onClick={() => onChange([...disbursements, { ...emptyDisbursement, id: crypto.randomUUID() }])}
                className="btn btn-secondary self-start"
            >
                <PlusIcon size={14} />
                Add Disbursement
            </button>
        </div>
    );
}

export default LoanDisbursementFields;
