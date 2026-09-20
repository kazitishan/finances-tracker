"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { maskLast4 } from "@/lib/formUtils";

export function buildPaymentMethods({ creditCards = [], bankAccounts = [] }) {
    const creditMethods = creditCards
        .filter((card) => card.cardNumber)
        .map((card) => ({
            value: `credit:${card.id}`,
            name: card.name || "Unnamed Card",
            bank: card.bank,
            last4: card.cardNumber,
            badge: "Credit",
        }));

    const debitMethods = bankAccounts
        .filter((account) => account.cardNumber)
        .map((account) => ({
            value: `debit:${account.id}`,
            name: account.name || "Unnamed Account",
            bank: account.bank,
            last4: account.cardNumber,
            badge: "Debit",
        }));

    return [...creditMethods, ...debitMethods];
}

export function usePaymentMethods() {
    const [creditCards, setCreditCards] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);

    useEffect(() => {
        fetch("/api/credit-cards")
            .then((res) => res.json())
            .then(setCreditCards);
        fetch("/api/bank-accounts")
            .then((res) => res.json())
            .then(setBankAccounts);
    }, []);

    return buildPaymentMethods({ creditCards, bankAccounts });
}

function PaymentMethodDropdown({ value, onChange }) {
    const paymentMethods = usePaymentMethods();
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

    function bankLogo(bankName) {
        return banks.find((b) => b.name === bankName)?.image;
    }

    const selectedMethod = paymentMethods.find((method) => method.value === value);
    const filteredMethods = paymentMethods.filter((method) =>
        [method.name, method.bank].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => (open ? closeDropdown() : setOpen(true))}
                className="field flex items-center justify-between gap-2 cursor-pointer text-left"
            >
                <span className="flex items-center gap-2 min-w-0">
                    {selectedMethod && bankLogo(selectedMethod.bank) && (
                        <Image
                            src={bankLogo(selectedMethod.bank)}
                            alt={selectedMethod.bank}
                            width={20}
                            height={20}
                            className="object-contain shrink-0"
                        />
                    )}
                    <span className={`truncate ${selectedMethod ? "" : "text-muted"}`}>
                        {selectedMethod
                            ? `${selectedMethod.name} · ${maskLast4(selectedMethod.last4)}`
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
                            placeholder="Search payment methods..."
                            className="field py-1.5"
                        />
                    </div>
                    <ul className="max-h-56 overflow-y-auto">
                        {filteredMethods.length > 0 ? (
                            filteredMethods.map((method) => (
                                <li key={method.value}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(method.value);
                                            closeDropdown();
                                        }}
                                        className="dropdown-item"
                                    >
                                        {bankLogo(method.bank) && (
                                            <Image
                                                src={bankLogo(method.bank)}
                                                alt={method.bank}
                                                width={20}
                                                height={20}
                                                className="object-contain shrink-0"
                                            />
                                        )}
                                        <span className="min-w-0 flex-1 truncate">
                                            {method.name}
                                            <span className="text-muted"> · {maskLast4(method.last4)}</span>
                                        </span>
                                        <span className="chip shrink-0">
                                            {method.badge}
                                        </span>
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-muted">No payment methods found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default PaymentMethodDropdown;
