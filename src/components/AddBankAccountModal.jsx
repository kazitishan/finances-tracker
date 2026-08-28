"use client";

import { useState } from "react";
import BankDropdown from "@/components/BankDropdown";

const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const years = [];
for (let year = currentYear; year <= 2099; year++) {
    years.push(year);
}

const initialFormState = {
    name: "",
    bank: "",
    type: "",
    routingNumber: "",
    accountNumber: "",
    apy: "",
    debitName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
};

const inputClasses = "w-full border border-gray-300 rounded-lg p-2 bg-white";

function onlyDigits(value) {
    return value.replace(/\D/g, "");
}

function onlyDecimal(value) {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length <= 2) return cleaned;
    return `${parts[0]}.${parts.slice(1).join("")}`;
}

function AddBankAccountModal({ isOpen, onClose }) {
    const [form, setForm] = useState(initialFormState);
    const [touched, setTouched] = useState({});

    if (!isOpen) return null;

    function updateField(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function markTouched(field) {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }

    function handleClose() {
        setForm(initialFormState);
        setTouched({});
        onClose();
    }

    const cardNumberError =
        touched.cardNumber && form.cardNumber.length > 0 && form.cardNumber.length !== 16;
    const cvcError = touched.cvc && form.cvc.length > 0 && form.cvc.length !== 3;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Add Bank Account</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer text-xl leading-none"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Name</span>
                        <input
                            type="text"
                            className={inputClasses}
                            value={form.name}
                            onChange={(e) => updateField("name", e.target.value)}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Bank</span>
                        <BankDropdown
                            value={form.bank}
                            onChange={(bank) => updateField("bank", bank)}
                        />
                    </label>

                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">Type</span>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={form.type === "Checking"}
                                    onChange={() => updateField("type", "Checking")}
                                />
                                Checking
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={form.type === "Savings"}
                                    onChange={() => updateField("type", "Savings")}
                                />
                                Savings
                            </label>
                        </div>
                    </div>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Routing Number</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            className={inputClasses}
                            value={form.routingNumber}
                            onChange={(e) => updateField("routingNumber", onlyDigits(e.target.value))}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Account Number</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            className={inputClasses}
                            value={form.accountNumber}
                            onChange={(e) => updateField("accountNumber", onlyDigits(e.target.value))}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">APY</span>
                        <input
                            type="text"
                            inputMode="decimal"
                            className={inputClasses}
                            value={form.apy}
                            onChange={(e) => updateField("apy", onlyDecimal(e.target.value))}
                        />
                    </label>

                    {form.type === "Checking" && (
                        <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                            <span className="font-semibold">Debit Card Info</span>

                            <label className="flex flex-col gap-1">
                                <span className="font-semibold">Name</span>
                                <input
                                    type="text"
                                    className={inputClasses}
                                    value={form.debitName}
                                    onChange={(e) => updateField("debitName", e.target.value)}
                                />
                            </label>

                            <label className="flex flex-col gap-1">
                                <span className="font-semibold">Card Number</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={16}
                                    className={inputClasses}
                                    value={form.cardNumber}
                                    onChange={(e) => updateField("cardNumber", onlyDigits(e.target.value).slice(0, 16))}
                                    onBlur={() => markTouched("cardNumber")}
                                />
                                {cardNumberError && (
                                    <span className="text-red-600 text-sm">Card number must be 16 digits</span>
                                )}
                            </label>

                            <div className="flex gap-4">
                                <label className="flex flex-col gap-1 flex-1">
                                    <span className="font-semibold">Expiration Month</span>
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
                                    <span className="font-semibold">Expiration Year</span>
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
                                <span className="font-semibold">CVC</span>
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
                                    <span className="text-red-600 text-sm">CVC must be 3 digits</span>
                                )}
                            </label>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleClose}
                        className="mt-2 bg-green-800 font-bold text-white p-2 rounded-xl hover:bg-green-900 transition-colors cursor-pointer"
                    >
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddBankAccountModal;
