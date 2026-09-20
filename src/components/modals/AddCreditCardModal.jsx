"use client";

import { useState } from "react";
import BankCompaniesDropdown from "@/components/dropdowns/BankCompaniesDropdown";
import BankAccountsDropdown from "@/components/dropdowns/BankAccountsDropdown";
import { months, years, pastYears, dueDates, inputClasses, onlyDigits, groupFromRight, stripSpacesOnCopy } from "@/lib/formUtils";
import LoginFields from "@/components/LoginFields";
import Modal from "@/components/ui/Modal";

const initialFormState = {
    name: "",
    bank: "",
    link: "",
    loginUsername: "",
    loginPassword: "",
    openMonth: "",
    openYear: "",
    cardholder: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    creditLine: "",
    paymentMethod: "",
    dueDate: "",
    rewards: "",
    usage: "",
    notes: "",
};

function AddCreditCardModal({ isOpen, onClose, itemId, initialData, onSaved }) {
    const [form, setForm] = useState(() => (initialData ? { ...initialFormState, ...initialData } : initialFormState));
    const [touched, setTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function markTouched(field) {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }

    function handleClose() {
        onClose();
    }

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const url = itemId ? `/api/credit-cards/${itemId}` : "/api/credit-cards";
            const res = await fetch(url, {
                method: itemId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const saved = await res.json();
            onSaved?.(saved);
            handleClose();
        } finally {
            setSubmitting(false);
        }
    }

    const cardNumberError =
        touched.cardNumber && form.cardNumber.length > 0 && form.cardNumber.length !== 16;
    const cvcError = touched.cvc && form.cvc.length > 0 && form.cvc.length !== 3;

    return (
        <Modal title={itemId ? "Edit Credit Card" : "Add Credit Card"} onClose={handleClose}>
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

                    <label className="flex flex-col gap-1">
                        <span className="field-label">Bank</span>
                        <BankCompaniesDropdown
                            value={form.bank}
                            onChange={(bank) => updateField("bank", bank)}
                        />
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

                    <LoginFields
                        username={form.loginUsername}
                        password={form.loginPassword}
                        onUsernameChange={(value) => updateField("loginUsername", value)}
                        onPasswordChange={(value) => updateField("loginPassword", value)}
                    />

                    <div className="flex flex-col gap-1">
                        <span className="field-label">Open Date</span>
                        <div className="flex gap-4">
                            <label className="flex flex-col gap-1 flex-1">
                                <span className="field-hint">Month</span>
                                <select
                                    className={inputClasses}
                                    value={form.openMonth}
                                    onChange={(e) => updateField("openMonth", e.target.value)}
                                >
                                    <option value="">--</option>
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.value} - {month.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1 flex-1">
                                <span className="field-hint">Year</span>
                                <select
                                    className={inputClasses}
                                    value={form.openYear}
                                    onChange={(e) => updateField("openYear", e.target.value)}
                                >
                                    <option value="">--</option>
                                    {pastYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="form-section">
                        <span className="field-label">Credit Card Info</span>

                        <label className="flex flex-col gap-1">
                            <span className="field-label">Cardholder</span>
                            <input
                                type="text"
                                className={inputClasses}
                                value={form.cardholder}
                                onChange={(e) => updateField("cardholder", e.target.value)}
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="field-label">Card Number</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                className={inputClasses}
                                value={groupFromRight(form.cardNumber)}
                                onChange={(e) => updateField("cardNumber", onlyDigits(e.target.value).slice(0, 16))}
                                onBlur={() => markTouched("cardNumber")}
                                onCopy={stripSpacesOnCopy}
                            />
                            {cardNumberError && (
                                <span className="field-error">Card number must be 16 digits</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="field-label">CVC</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={3}
                                className={inputClasses}
                                value={form.cvc}
                                onChange={(e) => updateField("cvc", onlyDigits(e.target.value).slice(0, 3))}
                                onBlur={() => markTouched("cvc")}
                            />
                            {cvcError && (
                                <span className="field-error">CVC must be 3 digits</span>
                            )}
                        </label>

                        <div className="flex gap-4">
                            <label className="flex flex-col gap-1 flex-1">
                                <span className="field-label">Expiration Month</span>
                                <select
                                    className={inputClasses}
                                    value={form.expMonth}
                                    onChange={(e) => updateField("expMonth", e.target.value)}
                                >
                                    <option value="">--</option>
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>
                                            {month.value} - {month.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1 flex-1">
                                <span className="field-label">Expiration Year</span>
                                <select
                                    className={inputClasses}
                                    value={form.expYear}
                                    onChange={(e) => updateField("expYear", e.target.value)}
                                >
                                    <option value="">--</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="flex flex-col gap-1">
                            <span className="field-label">Credit Line</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                className={inputClasses}
                                value={form.creditLine}
                                onChange={(e) => updateField("creditLine", onlyDigits(e.target.value))}
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="field-label">Payment Method</span>
                            <BankAccountsDropdown
                                value={form.paymentMethod}
                                onChange={(accountId) => updateField("paymentMethod", accountId)}
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="field-label">Payments are due on</span>
                            <select
                                className={inputClasses}
                                value={form.dueDate}
                                onChange={(e) => updateField("dueDate", e.target.value)}
                            >
                                <option value="">--</option>
                                {dueDates.map((dueDate) => (
                                    <option key={dueDate.value} value={dueDate.value}>
                                        {dueDate.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="form-section">
                        <span className="field-label">Rewards & Benefits</span>

                        <label className="flex flex-col gap-1">
                            <textarea
                                rows={4}
                                className={inputClasses}
                                value={form.rewards}
                                onChange={(e) => updateField("rewards", e.target.value)}
                            />
                            <span className="field-hint">Each line is a bullet point</span>
                        </label>
                    </div>

                    <div className="form-section">
                        <span className="field-label">How will you use this card?</span>

                        <label className="flex flex-col gap-1">
                            <textarea
                                rows={4}
                                className={inputClasses}
                                value={form.usage}
                                onChange={(e) => updateField("usage", e.target.value)}
                            />
                            <span className="field-hint">Each line becomes a chip</span>
                        </label>
                    </div>

                    <div className="form-section">
                        <span className="field-label">Notes</span>

                        <textarea
                            rows={4}
                            className={inputClasses}
                            value={form.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn btn-primary mt-2 py-2.5"
                    >
                        {itemId ? "Save Changes" : "Add"}
                    </button>
                </div>
        </Modal>
    );
}

export default AddCreditCardModal;
