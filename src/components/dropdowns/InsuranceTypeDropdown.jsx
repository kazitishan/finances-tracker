"use client";

import { useEffect, useRef, useState } from "react";
import { inputClasses } from "@/lib/formUtils";

export const insuranceTypes = ["Health", "Auto", "Life", "Home", "Other"];

export function insuranceTypeLabel(type, otherType) {
    if (type === "Other") return otherType || "Other";
    return type || "";
}

const policyNumber = { key: "policyNumber", label: "Policy Number", copyable: true };
const deductible = { key: "deductible", label: "Deductible", money: true };

// The detail fields each insurance type asks for, in form order. `money` fields hold a dollar
// amount, `options` fields are picked from a list, and `copyable` fields copy on click.
export const insuranceTypeFields = {
    Health: [
        { key: "planName", label: "Plan Name" },
        { key: "memberId", label: "Member ID", copyable: true },
        { key: "groupNumber", label: "Group Number", copyable: true },
        deductible,
        { key: "outOfPocketMax", label: "Out-of-Pocket Maximum", money: true },
        { key: "copay", label: "Primary Care Copay", money: true },
    ],
    Auto: [
        policyNumber,
        { key: "vehicles", label: "Covered Vehicles" },
        { key: "coverage", label: "Coverage", options: ["Liability Only", "Full Coverage"] },
        deductible,
    ],
    Life: [
        policyNumber,
        { key: "lifePolicyType", label: "Policy Type", options: ["Term", "Whole", "Universal", "Variable"] },
        { key: "deathBenefit", label: "Death Benefit", money: true },
        { key: "termEndYear", label: "Term Ends (Year)", digits: true },
        { key: "beneficiaries", label: "Beneficiaries" },
    ],
    Home: [
        policyNumber,
        { key: "homePolicyType", label: "Policy Type", options: ["Homeowners", "Renters", "Condo"] },
        { key: "propertyAddress", label: "Property Address" },
        { key: "dwellingCoverage", label: "Dwelling Coverage", money: true },
        { key: "personalPropertyCoverage", label: "Personal Property Coverage", money: true },
        deductible,
    ],
    Other: [
        policyNumber,
        { key: "coverageAmount", label: "Coverage Amount", money: true },
        deductible,
    ],
};

export const allInsuranceFieldKeys = [
    ...new Set(Object.values(insuranceTypeFields).flatMap((fields) => fields.map((field) => field.key))),
];

function InsuranceTypeDropdown({ value, otherValue, onChange, onOtherChange }) {
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
                    className="field flex items-center justify-between gap-2 cursor-pointer text-left"
                >
                    <span className={value ? "" : "text-muted"}>{value || "Select an insurance type"}</span>
                    <span className="text-muted text-xs">▾</span>
                </button>

                {open && (
                    <div className="dropdown-panel">
                        <ul className="max-h-56 overflow-y-auto">
                            {insuranceTypes.map((type) => (
                                <li key={type}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(type);
                                            setOpen(false);
                                        }}
                                        className="dropdown-item"
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
                    placeholder="Enter insurance type"
                    value={otherValue}
                    onChange={(e) => onOtherChange(e.target.value)}
                />
            )}
        </div>
    );
}

export default InsuranceTypeDropdown;
