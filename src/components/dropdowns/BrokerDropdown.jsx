"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

function BrokerDropdown({ value, onChange }) {
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

    const selectedBroker = brokers.find((broker) => broker.name === value);
    const filteredBrokers = brokers.filter((broker) =>
        broker.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => (open ? closeDropdown() : setOpen(true))}
                className="field flex items-center justify-between gap-2 cursor-pointer text-left"
            >
                <span className="flex items-center gap-2">
                    {selectedBroker && (
                        <Image
                            src={selectedBroker.image}
                            alt={selectedBroker.name}
                            width={20}
                            height={20}
                            className="object-contain"
                        />
                    )}
                    <span className={selectedBroker ? "" : "text-muted"}>
                        {selectedBroker ? selectedBroker.name : "Select a broker"}
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
                            placeholder="Search brokers..."
                            className="field py-1.5"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto">
                        {filteredBrokers.length > 0 ? (
                            filteredBrokers.map((broker) => (
                                <li key={broker.name}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(broker.name);
                                            closeDropdown();
                                        }}
                                        className="dropdown-item"
                                    >
                                        <Image
                                            src={broker.image}
                                            alt={broker.name}
                                            width={20}
                                            height={20}
                                            className="object-contain"
                                        />
                                        {broker.name}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-muted">No brokers found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default BrokerDropdown;
