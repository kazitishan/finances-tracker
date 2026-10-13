"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

function InsuranceProviderDropdown({ type, value, onChange }) {
    const insuranceProviders = insuranceProvidersFor(type);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    function closeDropdown() {
        setOpen(false);
        setSearch("");
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                closeDropdown();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) {
            searchInputRef.current?.focus();
        }
    }, [open]);

    const selectedProvider = insuranceProviders.find((provider) => provider.name === value);
    const filteredProviders = insuranceProviders.filter((provider) =>
        provider.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => (open ? closeDropdown() : setOpen(true))}
                className="field flex items-center justify-between gap-2 cursor-pointer text-left"
            >
                <span className="flex items-center gap-2">
                    {selectedProvider && (
                        <Image
                            src={selectedProvider.image}
                            alt={selectedProvider.name}
                            width={20}
                            height={20}
                            className="object-contain"
                        />
                    )}
                    <span className={selectedProvider ? "" : "text-muted"}>
                        {selectedProvider ? selectedProvider.name : "Select a provider"}
                    </span>
                </span>
                <span className="text-muted text-xs">▾</span>
            </button>

            {open && (
                <div className="dropdown-panel">
                    <div className="p-2 border-b border-[var(--border)]">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search providers..."
                            className="field py-1.5"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto">
                        {filteredProviders.length > 0 ? (
                            filteredProviders.map((provider) => (
                                <li key={provider.name}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(provider.name);
                                            closeDropdown();
                                        }}
                                        className="dropdown-item"
                                    >
                                        <Image
                                            src={provider.image}
                                            alt={provider.name}
                                            width={20}
                                            height={20}
                                            className="object-contain"
                                        />
                                        {provider.name}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-muted">No providers found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default InsuranceProviderDropdown;
