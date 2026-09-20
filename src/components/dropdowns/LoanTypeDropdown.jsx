"use client";

import { useEffect, useRef, useState } from "react";
import { inputClasses } from "@/lib/formUtils";

export const loanTypes = [
    "Mortgage",
    "Student Loans",
    "Personal Loans",
    "Business Loans",
    "Auto Loan",
    "Other",
];

export function loanTypeLabel(type, otherType) {
    if (type === "Other") return otherType || "Other";
    return type || "";
}

function LoanTypeDropdown({ value, otherValue, onChange, onOtherChange }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <div className="relative" ref={containerRef}>
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg p-2 bg-white cursor-pointer"
                >
                    <span className={value ? "" : "text-gray-400"}>{value || "Select a loan type"}</span>
                    <span className="text-gray-400">▾</span>
                </button>

                {open && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                        <ul className="max-h-56 overflow-y-auto">
                            {loanTypes.map((type) => (
                                <li key={type}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(type);
                                            setOpen(false);
                                        }}
                                        className="w-full p-2 hover:bg-gray-100 cursor-pointer text-left"
                                    >
                                        {type}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {value === "Other" && (
                <input
                    type="text"
                    className={inputClasses}
                    placeholder="Enter loan type"
                    value={otherValue}
                    onChange={(e) => onOtherChange(e.target.value)}
                />
            )}
        </div>
    );
}

export default LoanTypeDropdown;
