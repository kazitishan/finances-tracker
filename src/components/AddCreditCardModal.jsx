"use client";

import { useState } from "react";
import BankDropdown from "@/components/BankDropdown";
import { months, years, inputClasses, onlyDigits } from "@/lib/formUtils";

function ordinal(day) {
    if (day % 10 === 1 && day % 100 !== 11) return `${day}st`;
    if (day % 10 === 2 && day % 100 !== 12) return `${day}nd`;
    if (day % 10 === 3 && day % 100 !== 13) return `${day}rd`;
    return `${day}th`;
}

const dueDates = [];
for (let day = 1; day <= 28; day++) {
    dueDates.push({ value: day, label: `${ordinal(day)} of every month` });
}

const initialFormState = {
    name: "",
    bank: "",
    link: "",
    cardName: "",
    cardNumber: "",
    expMonth: "",
    expYear: "",
    cvc: "",
    creditLine: "",
    dueDate: "",
    rewards: "",
    notes: "",
};

function AddCreditCardModal({ isOpen, onClose }) {
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
                    <h2 className="text-xl font-bold">Add Credit Card</h2>
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

                    <label className="flex flex-col gap-1">
                        <span className="font-semibold">Link</span>
                        <input
                            type="url"
                            className={inputClasses}
                            value={form.link}
                            onChange={(e) => updateField("link", e.target.value)}
                        />
                    </label>

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                        <span className="font-semibold">Credit Card Info</span>

                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Name</span>
                            <input
                                type="text"
                                className={inputClasses}
                                value={form.cardName}
                                onChange={(e) => updateField("cardName", e.target.value)}
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

                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Credit Line</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                className={inputClasses}
                                value={form.creditLine}
                                onChange={(e) => updateField("creditLine", onlyDigits(e.target.value))}
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="font-semibold">Payments are due on</span>
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

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                        <span className="font-semibold">Rewards & Benefits</span>

                        <label className="flex flex-col gap-1">
                            <textarea
                                rows={4}
                                className={inputClasses}
                                value={form.rewards}
                                onChange={(e) => updateField("rewards", e.target.value)}
                            />
                            <span className="text-gray-500 text-sm">Each line is a bullet point</span>
                        </label>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
                        <span className="font-semibold">Notes</span>

                        <textarea
                            rows={4}
                            className={inputClasses}
                            value={form.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                        />
                    </div>

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

export default AddCreditCardModal;
