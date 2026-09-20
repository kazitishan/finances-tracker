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
                className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg p-2 bg-white cursor-pointer"
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
                    <span className={selectedProvider ? "" : "text-gray-400"}>
                        {selectedProvider ? selectedProvider.name : "Select a loan provider"}
                    </span>
                </span>
                <span className="text-gray-400">▾</span>
            </button>

            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-200">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search loan providers..."
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
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
                                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-left"
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
                            <li className="p-2 text-sm text-gray-400">No loan providers found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default LoanProviderDropdown;
