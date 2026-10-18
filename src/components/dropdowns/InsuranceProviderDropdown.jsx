"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";
import platforms from "@/data/platforms.json";

export const healthInsurers = platforms.healthInsurance;

export const insurers = platforms.insurance;

export const allInsuranceProviders = [...healthInsurers, ...insurers];

// Health plans come from health insurers; every other type of insurance from the rest.
export function insuranceProvidersFor(type) {
    return type === "Health" ? healthInsurers : insurers;
}

function InsuranceProviderDropdown({ type, value, onChange, customLogo, onCustomLogoChange }) {
    return (
        <LogoDropdown
            options={insuranceProvidersFor(type)}
            value={value}
            onChange={onChange}
            customLogo={customLogo}
            onCustomLogoChange={onCustomLogoChange}
            placeholder="Select a provider"
            searchPlaceholder="Search providers..."
            namePlaceholder="Enter provider name"
        />
    );
}

export default InsuranceProviderDropdown;
