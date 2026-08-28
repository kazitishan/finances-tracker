"use client";

import { useState } from "react";
import Image from "next/image";
import { banks } from "@/components/BankDropdown";
import { maskLast4 } from "@/lib/formUtils";

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
                    <div className="font-bold truncate">{account.name || "Unnamed Account"}</div>
                    <div className="text-sm text-gray-500 truncate">
                        {[account.bank, account.type].filter(Boolean).join(" · ") || "—"}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onEdit}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                    aria-label="Edit"
                >
                    ✎
                </button>
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
                    <DetailRow label="Routing Number" value={maskLast4(account.routingNumber)} />
                    <DetailRow label="Account Number" value={maskLast4(account.accountNumber)} />
                    <DetailRow label="APY" value={account.apy ? `${account.apy}%` : ""} />

                    {account.type === "Checking" && (account.debitName || account.cardNumber || account.expMonth) && (
                        <>
                            <div className="text-sm font-semibold mt-2 mb-1">Debit Card</div>
                            <DetailRow label="Name" value={account.debitName} />
                            <DetailRow label="Card Number" value={maskLast4(account.cardNumber)} />
                            <DetailRow
                                label="Expiration"
                                value={account.expMonth && account.expYear ? `${account.expMonth}/${account.expYear}` : ""}
                            />
                        </>
                    )}

                    {account.link && (
                        <DetailRow
                            label="Link"
                            value={
                                <a
                                    href={account.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    {account.link}
                                </a>
                            }
                        />
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
