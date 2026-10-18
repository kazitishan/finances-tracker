"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";
import platforms from "@/data/platforms.json";

export const brokers = platforms.broker;

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
