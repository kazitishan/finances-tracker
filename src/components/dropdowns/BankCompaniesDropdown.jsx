"use client";

import LogoDropdown from "@/components/dropdowns/LogoDropdown";

export const banks = [
    {
        name: 'American Express',
        image: '/banks/amex.png',
    },
    {
        name: 'Bank of America',
        image: '/banks/bank-of-america.png',
    },
    {
        name: 'Barclays',
        image: '/banks/barclays.png',
    },
    {
        name: 'Capital One',
        image: '/banks/capital-one.png',
    },
    {
        name: 'Chase',
        image: '/banks/chase.png',
    },
    {
        name: 'Citi',
        image: '/banks/citi.png',
    },
    {
        name: 'Discover',
        image: '/banks/discover.png',
    },
    {
        name: 'PNC',
        image: '/banks/pnc.png',
    },
    {
        name: 'Santander',
        image: '/banks/santander.png',
    },
    {
        name: 'SoFi',
        image: '/banks/sofi.png',
    },
    {
        name: 'TD Bank',
        image: '/banks/td-bank.png',
    },
    {
        name: 'US Bank',
        image: '/banks/us-bank.png',
    },
    {
        name: 'Wells Fargo',
        image: '/banks/wells-fargo.png',
    },
];

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
