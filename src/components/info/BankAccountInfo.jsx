"use client";

import { useState } from "react";
import Image from "next/image";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { maskAll, maskLast4 } from "@/lib/formUtils";
import RevealableDetailRow from "@/components/info/RevealableDetailRow";

function DetailRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between gap-4 text-sm py-1">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-right break-all">{value}</span>
        </div>
    );
}

function BankAccountInfo({ account, onEdit }) {
    const [expanded, setExpanded] = useState(false);
    const bankInfo = banks.find((b) => b.name === account.bank);

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <div className="flex items-center gap-3">
                {bankInfo && (
                    <Image
                        src={bankInfo.image}
                        alt={bankInfo.name}
                        width={36}
                        height={36}
                        className="object-contain shrink-0"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold truncate">{account.name || "Unnamed Account"}</span>
                        <button
                            type="button"
                            onClick={onEdit}
                            className="text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                            aria-label="Edit"
                        >
                            ✎
                        </button>
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                        {[account.bank, account.type, account.accountNumber ? maskLast4(account.accountNumber) : null]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                    </div>
                </div>
                {account.link && (
                    <a
                        href={account.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-gray-600 border border-gray-300 rounded-lg px-2 py-1 hover:bg-gray-50 cursor-pointer shrink-0"
                    >
                        Open
                    </a>
                )}
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                    aria-label="Toggle details"
                >
                    {expanded ? "▲" : "▼"}
                </button>
            </div>

            {expanded && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                    <DetailRow label="Routing Number" value={account.routingNumber} />
                    <RevealableDetailRow label="Account Number" value={account.accountNumber} mask={maskLast4} />
                    <DetailRow label="APY" value={account.apy ? `${account.apy}%` : ""} />

                    {account.type === "Checking" && (account.cardholder || account.cardNumber || account.expMonth || account.cvc) && (
                        <>
                            <div className="text-sm font-semibold mt-2 mb-1">Debit Card</div>
                            <DetailRow label="Cardholder" value={account.cardholder} />
                            <RevealableDetailRow label="Card Number" value={account.cardNumber} mask={maskLast4} />
                            <RevealableDetailRow label="CVC" value={account.cvc} mask={maskAll} />
                            <DetailRow
                                label="Expiration"
                                value={account.expMonth && account.expYear ? `${account.expMonth}/${account.expYear}` : ""}
                            />
                        </>
                    )}

                    {account.notes && (
                        <div className="mt-2">
                            <div className="text-sm text-gray-500 mb-1">Notes</div>
                            <div className="text-sm whitespace-pre-wrap">{account.notes}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default BankAccountInfo;
