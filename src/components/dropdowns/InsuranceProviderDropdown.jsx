"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";

export const healthInsurers = [
    { name: 'Aetna', image: '/insurance/health/aetna.png' },
    { name: 'Centene', image: '/insurance/health/centene-corporation.png' },
    { name: 'Cigna', image: '/insurance/health/cigna.png' },
    { name: 'Elevance Health', image: '/insurance/health/elevance-health.png' },
    { name: 'EmblemHealth', image: '/insurance/health/emblem-health.png' },
    { name: 'Health Care Service Corporation', image: '/insurance/health/health-care-service-corporation.png' },
    { name: 'Healthfirst', image: '/insurance/health/healthfirst.png' },
    { name: 'Humana', image: '/insurance/health/humana.png' },
    { name: 'Kaiser Permanente', image: '/insurance/health/kaiser-permanente.png' },
    { name: 'UnitedHealthcare', image: '/insurance/health/unitedhealthcare.png' },
];

export const insurers = [
    { name: 'Allstate', image: '/insurance/allstate.png' },
    { name: 'Farmers Insurance', image: '/insurance/farmers-insurance.png' },
    { name: 'GEICO', image: '/insurance/geico.png' },
    { name: 'Liberty Mutual', image: '/insurance/liberty-mutual.png' },
    { name: 'MetLife', image: '/insurance/metlife.png' },
    { name: 'New York Life', image: '/insurance/new-york-life.png' },
    { name: 'Northwestern Mutual', image: '/insurance/northwestern-mutual.png' },
    { name: 'Progressive', image: '/insurance/progressive.png' },
    { name: 'Prudential', image: '/insurance/prudential.png' },
    { name: 'State Farm', image: '/insurance/state-farm.png' },
    { name: 'USAA', image: '/insurance/usaa.png' },
];

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
