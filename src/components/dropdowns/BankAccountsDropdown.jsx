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
                className="field flex items-center justify-between gap-2 cursor-pointer text-left"
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
                    <span className={`truncate ${selectedAccount ? "" : "text-muted"}`}>
                        {selectedAccount
                            ? `${selectedAccount.name}${selectedAccount.accountNumber ? ` · ${maskLast4(selectedAccount.accountNumber)}` : ""}`
                            : "Select a payment method"}
                    </span>
                </span>
                <span className="text-muted text-xs shrink-0">▾</span>
            </button>

            {open && (
                <div className="dropdown-panel">
                    <div className="p-2 border-b border-[var(--border)]">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search bank accounts..."
                            className="field py-1.5"
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
                                        className="dropdown-item"
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
                                                <span className="text-muted"> · {maskLast4(account.accountNumber)}</span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-muted">No bank accounts found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default BankAccountsDropdown;
