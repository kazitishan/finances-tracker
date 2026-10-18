"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { maskLast4 } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";
import { banks } from "@/components/dropdowns/Dropdown";
import { getPaymentMethods } from "@/util/getPaymentMethods";

// The credit card or bank account a `credit:<id>` / `debit:<id>` payment method points to, with a display name.
export function findPaymentAccount(paymentMethod, { creditCards = [], bankAccounts = [] }) {
    const [methodType, methodId] = (paymentMethod || "").split(":");
    if (methodType === "credit") {
        const card = creditCards.find((card) => card.id === methodId);
        return card ? { ...card, displayName: card.name || "Unnamed Card" } : null;
    }
    if (methodType === "debit") {
        const account = bankAccounts.find((account) => account.id === methodId);
        return account ? { ...account, displayName: account.name || "Unnamed Account" } : null;
    }
    return null;
}

function PaymentMethodDropdown({ value, onChange }) {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        getPaymentMethods().then(setPaymentMethods);
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

    function bankLogo(method) {
        return logoFor(banks, method.bank, method.customLogo);
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
                    {selectedMethod && bankLogo(selectedMethod) && (
                        <Image
                            src={bankLogo(selectedMethod)}
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
                                        {bankLogo(method) && (
                                            <Image
                                                src={bankLogo(method)}
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
