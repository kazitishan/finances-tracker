"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";

export const brokers = [
    {
        name: 'Fidelity',
        image: '/investment/fidelity.png',
    },
    {
        name: 'Robinhood',
        image: '/investment/robinhood.png',
    },
    {
        name: 'Vanguard',
        image: '/investment/vanguard.png',
    },
];

function BrokerDropdown({ value, onChange, customLogo, onCustomLogoChange }) {
    return (
        <LogoDropdown
            options={brokers}
            value={value}
            onChange={onChange}
            customLogo={customLogo}
            onCustomLogoChange={onCustomLogoChange}
            placeholder="Select a broker"
            searchPlaceholder="Search brokers..."
            namePlaceholder="Enter broker name"
        />
    );
}

export default BrokerDropdown;
