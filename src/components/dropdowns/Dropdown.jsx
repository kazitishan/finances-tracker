"use client";

import { useEffect, useState } from "react";
import LogoDropdown from "@/components/dropdowns/LogoDropdown";
import platforms from "@/data/platforms.json";
import { logoFor } from "@/lib/logos";
import { maskLast4 } from "@/lib/formUtils";
import { getBankAccounts } from "@/util/getBankAccounts";

export const banks = platforms.bank;
export const brokers = platforms.broker;
export const subscriptions = platforms.subscription;
export const loanProviders = [...banks, ...platforms["loan-provider"]].sort((a, b) => a.name.localeCompare(b.name));
export const healthInsuranceProviders = platforms.healthInsurance;
export const insuranceProviders = platforms.insurance;
export const allInsuranceProviders = [...healthInsuranceProviders, ...insuranceProviders];

// Health plans come from health insurers; every other type of insurance from the rest.
export function insuranceProvidersFor(insuranceType) {
    return insuranceType === "Health" ? healthInsuranceProviders : insuranceProviders;
}

const optionsByType = {
    bank: banks,
    broker: brokers,
    "loan-provider": loanProviders,
    subscription: subscriptions,
    "health-insurance-provider": healthInsuranceProviders,
    "insurance-provider": insuranceProviders,
};

function placeholders(type) {
    const label = type.replaceAll("-", " ");
    const article = /^[aeiou]/.test(label) ? "an" : "a";
    return {
        placeholder: `Select ${article} ${label}`,
        searchPlaceholder: `Search ${label}s...`,
        namePlaceholder: `Enter ${label} name`,
        emptyText: `No ${label}s found`,
    };
}

// Dropdown Types:
// Dropdown of all of the default platforms + "Other":
// "bank"
// "broker"
// "subscription"
// "loan-provider"
// "health-insurance-provider"
// "insurance-provider"
// "bank-account": Dropdown of the user's bank accounts.
function Dropdown({ type, value, onChange, customLogo, onCustomLogoChange }) {
    const [bankAccounts, setBankAccounts] = useState([]);

    useEffect(() => {
        if (type === "bank-account") getBankAccounts().then(setBankAccounts);
    }, [type]);

    // The user's own bank accounts, picked by id. They're added on the Bank Accounts page, so there's no "Other".
    if (type === "bank-account") {
        const options = bankAccounts.map((account) => ({
            value: account.id,
            name: account.name,
            detail: account.accountNumber ? maskLast4(account.accountNumber) : null,
            image: logoFor(banks, account.bank, account.customLogo),
            keywords: account.bank,
        }));

        return (
            <LogoDropdown
                options={options}
                value={value}
                onChange={onChange}
                allowOther={false}
                {...placeholders(type)}
            />
        );
    }

    const options = optionsByType[type];
    if (!options) throw new Error(`Unknown dropdown type: ${type}`);

    return (
        <LogoDropdown
            options={options}
            value={value}
            onChange={onChange}
            customLogo={customLogo}
            onCustomLogoChange={onCustomLogoChange}
            {...placeholders(type)}
        />
    );
}

export default Dropdown;
