"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { maskLast4 } from "@/lib/formUtils";

function BankAccountsDropdown({ value, onChange }) {
    const [accounts, setAccounts] = useState([]);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        fetch("/api/bank-accounts")
            .then((res) => res.json())
            .then(setAccounts);
    }, []);

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

    function bankLogo(bankName) {
        return banks.find((b) => b.name === bankName)?.image;
    }

    const selectedAccount = accounts.find((account) => account.id === value);
    const filteredAccounts = accounts.filter((account) =>
        [account.name, account.bank].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => (open ? closeDropdown() : setOpen(true))}
                className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg p-2 bg-white cursor-pointer"
            >
                <span className="flex items-center gap-2 min-w-0">
                    {selectedAccount && bankLogo(selectedAccount.bank) && (
                        <Image
                            src={bankLogo(selectedAccount.bank)}
                            alt={selectedAccount.bank}
                            width={20}
                            height={20}
                            className="object-contain shrink-0"
                        />
                    )}
                    <span className={`truncate ${selectedAccount ? "" : "text-gray-400"}`}>
                        {selectedAccount
                            ? `${selectedAccount.name}${selectedAccount.accountNumber ? ` · ${maskLast4(selectedAccount.accountNumber)}` : ""}`
                            : "Select a payment method"}
                    </span>
                </span>
                <span className="text-gray-400 shrink-0">▾</span>
            </button>

            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-200">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search bank accounts..."
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto">
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map((account) => (
                                <li key={account.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(account.id);
                                            closeDropdown();
                                        }}
                                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-left"
                                    >
                                        {bankLogo(account.bank) && (
                                            <Image
                                                src={bankLogo(account.bank)}
                                                alt={account.bank}
                                                width={20}
                                                height={20}
                                                className="object-contain shrink-0"
                                            />
                                        )}
                                        <span className="min-w-0 flex-1 truncate">
                                            {account.name}
                                            {account.accountNumber && (
                                                <span className="text-gray-400"> · {maskLast4(account.accountNumber)}</span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-sm text-gray-400">No bank accounts found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default BankAccountsDropdown;
