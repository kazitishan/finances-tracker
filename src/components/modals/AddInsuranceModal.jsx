"use client";

import { useState } from "react";
import InsuranceTypeDropdown, { allInsuranceFieldKeys, insuranceTypeFields } from "@/components/dropdowns/InsuranceTypeDropdown";
import Dropdown, { allInsuranceProviders, insuranceProvidersFor } from "@/components/dropdowns/Dropdown";
import { months, dueDates, inputClasses, onlyDecimal, onlyDigits } from "@/lib/formUtils";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";
import { useSaveItem } from "@/components/useSaveItem";

const initialFormState = {
    name: "",
    type: "",
    otherType: "",
    provider: "",
    customLogo: "",
    link: "",
    loginUsername: "",
    loginPassword: "",
    ...Object.fromEntries(allInsuranceFieldKeys.map((key) => [key, ""])),
    paymentMethod: "",
    premium: "",
    billingCycle: "month",
    billingMonth: "",
    billingDay: "",
    notes: "",
};

function TypeField({ field, value, onChange }) {
    if (field.money) {
        return (
            <div className="flex items-center gap-2">
                <span>$</span>
                <input
                    type="text"
                    inputMode="decimal"
                    className={inputClasses}
                    value={value}
                    onChange={(e) => onChange(onlyDecimal(e.target.value))}
                />
            </div>
        );
    }
    if (field.options) {
        return (
            <select className={inputClasses} value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">--</option>
                {field.options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        );
    }
    if (field.digits) {
        return (
            <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                className={inputClasses}
                value={value}
                onChange={(e) => onChange(onlyDigits(e.target.value))}
            />
        );
    }
    return <input type="text" className={inputClasses} value={value} onChange={(e) => onChange(e.target.value)} />;
}

function AddInsuranceModal({ isOpen, onClose, itemId, initialData, onSaved, onDelete }) {
    const [initialForm] = useState(() => (initialData ? { ...initialFormState, ...initialData } : initialFormState));
    const [form, setForm] = useState(initialForm);
    const { save, remove, requestClose, submitting, prompt } = useSaveItem({
        category: "insurance", itemId, form, initialForm, onSaved, onDelete, onClose,
    });

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    // Health and non-health insurance have different providers, so switching between them clears a listed
    // provider. One entered through "Other" isn't on either list and is kept.
    function updateType(type) {
        setForm((prev) => {
            const isListed = allInsuranceProviders.some((provider) => provider.name === prev.provider);
            const fitsType = insuranceProvidersFor(type).some((provider) => provider.name === prev.provider);
            return { ...prev, type, provider: !isListed || fitsType ? prev.provider : "" };
        });
    }

    const typeFields = insuranceTypeFields[form.type] || [];

    return (
        <Modal title={itemId ? "Edit Insurance" : "Add Insurance"} onClose={requestClose}>
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
                        <InsuranceTypeDropdown
                            value={form.type}
                            otherValue={form.otherType}
                            onChange={updateType}
                            onOtherChange={(otherType) => updateField("otherType", otherType)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="field-label">Provider</span>
                        <Dropdown
                            type={form.type === "Health" ? "health-insurance-provider" : "insurance-provider"}
                            value={form.provider}
                            onChange={(provider) => updateField("provider", provider)}
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
                        platform={form.provider}
                        username={form.loginUsername}
                        password={form.loginPassword}
                        onUsernameChange={(value) => updateField("loginUsername", value)}
                        onPasswordChange={(value) => updateField("loginPassword", value)}
                    />

                    {typeFields.map((field) => (
                        <label key={field.key} className="flex flex-col gap-1">
                            <span className="field-label">{field.label}</span>
                            <TypeField field={field} value={form[field.key]} onChange={(value) => updateField(field.key, value)} />
                        </label>
                    ))}

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Payment Method</span>
                        <Dropdown
                            type="payment-method"
                            value={form.paymentMethod}
                            onChange={(paymentMethod) => updateField("paymentMethod", paymentMethod)}
                        />
                    </label>

                    <div className="flex flex-col gap-1">
                        <span className="field-label">Premium</span>
                        <div className="flex items-center gap-2">
                            <span>$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                className={inputClasses}
                                value={form.premium}
                                onChange={(e) => updateField("premium", onlyDecimal(e.target.value))}
                            />
                            <span>every</span>
                            <select
                                className={inputClasses}
                                value={form.billingCycle}
                                onChange={(e) => updateField("billingCycle", e.target.value)}
                            >
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                            </select>
                        </div>
                    </div>

                    {form.billingCycle === "year" && (
                        <label className="flex flex-col gap-1">
                            <span className="field-label">Payment Month</span>
                            <select
                                className={inputClasses}
                                value={form.billingMonth}
                                onChange={(e) => updateField("billingMonth", e.target.value)}
                            >
                                <option value="">--</option>
                                {months.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.value} - {month.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <label className="flex flex-col gap-1">
                        <span className="field-label">
                            {form.billingCycle === "year" ? "Payment Day" : "Day of the Month"}
                        </span>
                        <select
                            className={inputClasses}
                            value={form.billingDay}
                            onChange={(e) => updateField("billingDay", e.target.value)}
                        >
                            <option value="">--</option>
                            {dueDates.map((dueDate) => (
                                <option key={dueDate.value} value={dueDate.value}>
                                    {dueDate.label.replace(" of every month", "")}
                                </option>
                            ))}
                        </select>
                    </label>

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

export default AddInsuranceModal;
