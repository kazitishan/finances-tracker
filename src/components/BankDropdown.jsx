"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

function BankDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedBank = banks.find((bank) => bank.name === value);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg p-2 bg-white cursor-pointer"
            >
                <span className="flex items-center gap-2">
                    {selectedBank && (
                        <Image
                            src={selectedBank.image}
                            alt={selectedBank.name}
                            width={20}
                            height={20}
                            className="object-contain"
                        />
                    )}
                    <span className={selectedBank ? "" : "text-gray-400"}>
                        {selectedBank ? selectedBank.name : "Select a bank"}
                    </span>
                </span>
                <span className="text-gray-400">▾</span>
            </button>

            {open && (
                <ul className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                    {banks.map((bank) => (
                        <li key={bank.name}>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(bank.name);
                                    setOpen(false);
                                }}
                                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-left"
                            >
                                <Image
                                    src={bank.image}
                                    alt={bank.name}
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                />
                                {bank.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default BankDropdown;
