"use client";

import { useState } from "react";
import Image from "next/image";
import { loanProviders } from "@/components/dropdowns/LoanProviderDropdown";
import { loanTypeLabel } from "@/components/dropdowns/LoanTypeDropdown";
import LoginDetailRow from "@/components/info/LoginDetailRow";

function DetailRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between gap-4 text-sm py-1">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-right break-all">{value}</span>
        </div>
    );
}

function LoanInfo({ loan, onEdit }) {
    const [expanded, setExpanded] = useState(false);
    const providerInfo = loanProviders.find((p) => p.name === loan.provider);

    const typeLabel = loanTypeLabel(loan.type, loan.otherType);
    const amountLabel =loan.amountLoaned
        ? `$${Number(loan.amountLoaned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : null;
    const rateLabel = loan.interestRate ? `${loan.interestRate}%` : null;

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <div className="flex items-center gap-3">
                {providerInfo && (
                    <Image
                        src={providerInfo.image}
                        alt={providerInfo.name}
                        width={36}
                        height={36}
                        className="object-contain shrink-0"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold truncate">{loan.name || "Unnamed Loan"}</span>
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
                        {[typeLabel, loan.provider, amountLabel].filter(Boolean).join(" · ") || "—"}
                    </div>
                </div>
                {loan.link && (
                    <a
                        href={loan.link}
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
                    <LoginDetailRow username={loan.loginUsername} password={loan.loginPassword} />
                    <DetailRow label="Type" value={typeLabel} />
                    <DetailRow label="Provider" value={loan.provider} />
                    <DetailRow label="Amount Loaned" value={amountLabel} />
                    <DetailRow label="Interest Rate" value={rateLabel} />

                    {loan.notes && (
                        <div className="mt-2">
                            <div className="text-sm text-gray-500 mb-1">Notes</div>
                            <div className="text-sm whitespace-pre-wrap">{loan.notes}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default LoanInfo;
