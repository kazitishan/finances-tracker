"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";
import platforms from "@/data/platforms.json";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";

export const loanCompanies = platforms.loan;

export const loanProviders = [...banks, ...loanCompanies].sort((a, b) => a.name.localeCompare(b.name));

function LoanProviderDropdown({ value, onChange, customLogo, onCustomLogoChange }) {
    return (
        <LogoDropdown
            options={loanProviders}
            value={value}
            onChange={onChange}
            customLogo={customLogo}
            onCustomLogoChange={onCustomLogoChange}
            placeholder="Select a loan provider"
            searchPlaceholder="Search loan providers..."
            namePlaceholder="Enter loan provider name"
        />
    );
}

export default LoanProviderDropdown;
