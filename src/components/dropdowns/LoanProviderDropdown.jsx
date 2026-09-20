"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";

export const loanCompanies = [
    {
        name: 'Federal Student Aid',
        image: '/loans/fsa.png',
    },
];

export const loanProviders = [...banks, ...loanCompanies].sort((a, b) => a.name.localeCompare(b.name));

function LoanProviderDropdown({ value, onChange }) {
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

    const selectedProvider = loanProviders.find((provider) => provider.name === value);
    const filteredProviders = loanProviders.filter((provider) =>
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
                        {selectedProvider ? selectedProvider.name : "Select a loan provider"}
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
                            placeholder="Search loan providers..."
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
                            <li className="px-3 py-2 text-sm text-muted">No loan providers found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default LoanProviderDropdown;
