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
                className="w-full flex items-center justify-between gap-2 border border-gray-300 rounded-lg p-2 bg-white cursor-pointer"
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
                    <span className={`truncate ${selectedMethod ? "" : "text-gray-400"}`}>
                        {selectedMethod
                            ? `${selectedMethod.name} · ${maskLast4(selectedMethod.last4)}`
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
                            placeholder="Search payment methods..."
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
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
                                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-left"
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
                                            <span className="text-gray-400"> · {maskLast4(method.last4)}</span>
                                        </span>
                                        <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 shrink-0">
                                            {method.badge}
                                        </span>
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="p-2 text-sm text-gray-400">No payment methods found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default PaymentMethodDropdown;
