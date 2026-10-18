"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";
import platforms from "@/data/platforms.json";

export const subscriptions = platforms.subscription;

function SubscriptionDropdown({ value, onChange, customLogo, onCustomLogoChange }) {
    return (
        <LogoDropdown
            options={subscriptions}
            value={value}
            onChange={onChange}
            customLogo={customLogo}
            onCustomLogoChange={onCustomLogoChange}
            placeholder="Select a subscription"
            searchPlaceholder="Search subscriptions..."
            namePlaceholder="Enter subscription name"
        />
    );
}

export default SubscriptionDropdown;
