"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";
import platforms from "@/data/platforms.json";

export const banks = platforms.bank;
export const brokers = platforms.broker;
export const subscriptions = platforms.subscription;
// Loans can come from any bank as well as the lenders listed under "loan-provider".
export const loanProviders = [...banks, ...platforms["loan-provider"]].sort((a, b) => a.name.localeCompare(b.name));

const optionsByType = {
    bank: banks,
    broker: brokers,
    "loan-provider": loanProviders,
    subscription: subscriptions,
};

// A platform dropdown for one `type`: "bank", "broker", "loan-provider" or "subscription".
function Dropdown({ type, value, onChange, customLogo, onCustomLogoChange }) {
    const options = optionsByType[type];
    if (!options) throw new Error(`Unknown dropdown type: ${type}`);
    const label = type.replace("-", " ");

    return (
        <LogoDropdown
            options={options}
            value={value}
            onChange={onChange}
            customLogo={customLogo}
            onCustomLogoChange={onCustomLogoChange}
            placeholder={`Select a ${label}`}
            searchPlaceholder={`Search ${label}s...`}
            namePlaceholder={`Enter ${label} name`}
        />
    );
}

export default Dropdown;
