"use client";

import { useState } from "react";
import Image from "next/image";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { maskAll, maskLast4, ordinal, formatAccountAge } from "@/lib/formUtils";
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

function CreditCardInfo({ card, onEdit }) {
    const [expanded, setExpanded] = useState(false);
    const bankInfo = banks.find((b) => b.name === card.bank);
    const rewardsList = (card.rewards || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const usageList = (card.usage || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

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
                        <span className="font-bold truncate">{card.name || "Unnamed Card"}</span>
                        <button
                            type="button"
                            onClick={onEdit}
                            className="text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                            aria-label="Edit"
                        >
                            ✎
                        </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-500 truncate">
                            {[card.bank, card.cardNumber ? maskLast4(card.cardNumber) : null].filter(Boolean).join(" · ") || "—"}
                        </span>
                        {usageList.map((usage, index) => (
                            <span
                                key={index}
                                className="text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5"
                            >
                                {usage}
                            </span>
                        ))}
                    </div>
                </div>
                {card.link && (
                    <a
                        href={card.link}
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
                    <DetailRow
                        label="Open Date"
                        value={
                            card.openMonth && card.openYear
                                ? `${card.openMonth}/${card.openYear} · ${formatAccountAge(card.openMonth, card.openYear)}`
                                : ""
                        }
                    />
                    <DetailRow label="Cardholder" value={card.cardholder} />
                    <RevealableDetailRow label="Card Number" value={card.cardNumber} mask={maskLast4} />
                    <RevealableDetailRow label="CVC" value={card.cvc} mask={maskAll} />
                    <DetailRow
                        label="Expiration"
                        value={card.expMonth && card.expYear ? `${card.expMonth}/${card.expYear}` : ""}
                    />
                    <DetailRow
                        label="Credit Line"
                        value={card.creditLine ? `$${Number(card.creditLine).toLocaleString()}` : ""}
                    />
                    <DetailRow
                        label="Payments Due"
                        value={card.dueDate ? `${ordinal(Number(card.dueDate))} of every month` : ""}
                    />

                    {rewardsList.length > 0 && (
                        <div className="mt-2">
                            <div className="text-sm text-gray-500 mb-1">Rewards & Benefits</div>
                            <ul className="list-disc list-inside text-sm">
                                {rewardsList.map((reward, index) => (
                                    <li key={index}>{reward}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {card.notes && (
                        <div className="mt-2">
                            <div className="text-sm text-gray-500 mb-1">Notes</div>
                            <div className="text-sm whitespace-pre-wrap">{card.notes}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CreditCardInfo;
