"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";
import platforms from "@/data/platforms.json";

export const banks = platforms.bank;

function BankCompaniesDropdown({ value, onChange, customLogo, onCustomLogoChange }) {
    return (
        <LogoDropdown
            options={banks}
            value={value}
            onChange={onChange}
            customLogo={customLogo}
            onCustomLogoChange={onCustomLogoChange}
            placeholder="Select a bank"
            searchPlaceholder="Search banks..."
            namePlaceholder="Enter bank name"
        />
    );
}

export default BankCompaniesDropdown;
