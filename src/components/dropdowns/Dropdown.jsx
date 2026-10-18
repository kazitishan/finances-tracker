"use client";

import { useEffect, useState } from "react";
import LogoDropdown from "@/components/dropdowns/LogoDropdown";
import TypeDropdown from "@/components/dropdowns/TypeDropdown";
import platforms from "@/data/platforms.json";
import { logoFor } from "@/lib/logos";
import { maskLast4 } from "@/lib/formUtils";
import { getBankAccounts } from "@/util/getBankAccounts";
import { getPaymentMethods } from "@/util/getPaymentMethods";

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

const typesByType = {
    "insurance-type": ["Health", "Auto", "Life", "Home", "Other"],
    "loan-type": ["Mortgage", "Student Loans", "Personal Loans", "Business Loans", "Auto Loan", "Other"],
};

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
// "payment-method": Dropdown of the user's credit and debit cards.
// "insurance-type": Dropdown of the insurance types (Health, Auto, Life, Home, Other).
// "loan-type": Dropdown of the loan types (Mortgage, Student Loans, Personal Loans, Business Loans, Auto Loan, Other).
//     Picking "Other" on either asks for the type; that's `otherValue`.
function Dropdown({ type, value, onChange, customLogo, onCustomLogoChange, otherValue, onOtherChange }) {
    const [bankAccounts, setBankAccounts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    useEffect(() => {
        if (type === "bank-account") getBankAccounts().then(setBankAccounts);
        if (type === "payment-method") getPaymentMethods().then(setPaymentMethods);
    }, [type]);

    if (typesByType[type]) {
        return (
            <TypeDropdown
                types={typesByType[type]}
                value={value}
                otherValue={otherValue}
                onChange={onChange}
                onOtherChange={onOtherChange}
                placeholder={placeholders(type).placeholder}
                otherPlaceholder={`Enter ${type.replaceAll("-", " ")}`}
            />
        );
    }

    // The user's credit cards and the debit cards on their bank accounts, picked by `credit:<id>` / `debit:<id>`.
    if (type === "payment-method") {
        const options = paymentMethods.map((method) => ({
            value: method.value,
            name: method.name,
            detail: maskLast4(method.last4),
            image: logoFor(banks, method.bank, method.customLogo),
            keywords: method.bank,
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
