"use client";

import { useState } from "react";
import Image from "next/image";
import { banks } from "@/components/BankDropdown";
import { maskLast4, ordinal } from "@/lib/formUtils";

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
                    <div className="font-bold truncate">{card.name || "Unnamed Card"}</div>
                    <div className="text-sm text-gray-500 truncate">
                        {[card.bank, card.cardNumber ? maskLast4(card.cardNumber) : null].filter(Boolean).join(" · ") || "—"}
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
                    <DetailRow label="Cardholder" value={card.cardName} />
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

                    {card.link && (
                        <DetailRow
                            label="Link"
                            value={
                                <a
                                    href={card.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    {card.link}
                                </a>
                            }
                        />
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
