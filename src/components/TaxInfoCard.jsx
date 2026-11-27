"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { inputClasses, onlyDigits } from "@/lib/formUtils";
import {
    canClaimDependents,
    dependentOptions,
    filingStatusOptions,
    noWageTaxStates,
    normalizeTaxInfo,
    residencyOptions,
    stateOptions,
    studentStatusOptions,
} from "@/lib/taxInfo";
import { getUserInfo } from "@/util/getUserInfo";
import { saveUserInfo } from "@/util/saveUserInfo";

function ChoiceField({ label, value, options, onChange, hint }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="field-label">{label}</span>
            <select className={inputClasses} value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">--</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {hint && <span className="field-hint">{hint}</span>}
        </label>
    );
}

function CountField({ label, value, onChange, hint }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="field-label">{label}</span>
            <input
                type="text"
                inputMode="numeric"
                className={inputClasses}
                placeholder="0"
                value={value}
                onChange={(e) => onChange(onlyDigits(e.target.value))}
            />
            {hint && <span className="field-hint">{hint}</span>}
        </label>
    );
}

// The Profile page's Tax Info card: facts that decide which tax forms the user will need (see lib/taxInfo.js).
function TaxInfoCard() {
    const [saved, setSaved] = useState(null);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const showToast = useToast();

    useEffect(() => {
        getUserInfo()
            .then((info) => {
                const taxInfo = normalizeTaxInfo(info["tax-info"]);
                setSaved(taxInfo);
                setForm(taxInfo);
            })
            .catch(() => showToast("Couldn't load your tax info"));
    }, [showToast]);

    if (!form) return null;

    const changed = Object.keys(form).some((key) => form[key] !== saved[key]);

    function updateField(field, value) {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (!canClaimDependents(next)) {
                next.childrenUnder17 = "";
                next.otherDependents = "";
            }
            return next;
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        try {
            // Load the latest user-info first, so budgeting changes made in another tab aren't undone.
            const latest = await getUserInfo();
            const updated = await saveUserInfo({ ...latest, "tax-info": form });
            const taxInfo = normalizeTaxInfo(updated["tax-info"]);
            setSaved(taxInfo);
            setForm(taxInfo);
            showToast("Tax info saved");
        } catch {
            showToast("Couldn't save");
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card mt-6 flex flex-col gap-4 p-5">
            <div>
                <h2 className="font-semibold">Tax Info</h2>
                <div className="text-sm text-muted">Used to work out which tax forms you&apos;ll need to file.</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <ChoiceField
                    label="Filing Status"
                    value={form.filingStatus}
                    options={filingStatusOptions}
                    onChange={(value) => updateField("filingStatus", value)}
                />
                <label className="flex flex-col gap-1">
                    <span className="field-label">Date of Birth</span>
                    <input
                        type="date"
                        className={inputClasses}
                        value={form.birthDate}
                        onChange={(e) => updateField("birthDate", e.target.value)}
                    />
                </label>
                <ChoiceField
                    label="Residency Status"
                    value={form.residency}
                    options={residencyOptions}
                    onChange={(value) => updateField("residency", value)}
                />
                <ChoiceField
                    label="State of Residence"
                    value={form.state}
                    options={stateOptions}
                    onChange={(value) => updateField("state", value)}
                    hint={noWageTaxStates.includes(form.state) ? "No state income tax on wages" : null}
                />
                <ChoiceField
                    label="Can Someone Claim You as a Dependent?"
                    value={form.claimedAsDependent}
                    options={dependentOptions}
                    onChange={(value) => updateField("claimedAsDependent", value)}
                    hint="For example, a parent who supports you while you're in school"
                />
                <ChoiceField
                    label="Student Status"
                    value={form.studentStatus}
                    options={studentStatusOptions}
                    onChange={(value) => updateField("studentStatus", value)}
                />
                {canClaimDependents(form) && (
                    <>
                        <CountField
                            label="Children Under 17"
                            value={form.childrenUnder17}
                            onChange={(value) => updateField("childrenUnder17", value)}
                            hint="Dependents who were under 17 at the end of the year"
                        />
                        <CountField
                            label="Other Dependents"
                            value={form.otherDependents}
                            onChange={(value) => updateField("otherDependents", value)}
                            hint="Older children and relatives you support"
                        />
                    </>
                )}
            </div>

            <div className="flex justify-end">
                <button type="submit" className="btn btn-primary" disabled={saving || !changed}>
                    Save Changes
                </button>
            </div>
        </form>
    );
}

export default TaxInfoCard;
