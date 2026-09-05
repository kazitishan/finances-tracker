"use client";

import { useState } from "react";
import Image from "next/image";
import { subscriptions } from "@/components/SubscriptionDropdown";
import { months, ordinal } from "@/lib/formUtils";

function DetailRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between gap-4 text-sm py-1">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-right break-all">{value}</span>
        </div>
    );
}

function SubscriptionInfo({ subscription, onEdit }) {
    const [expanded, setExpanded] = useState(false);
    const subscriptionInfo = subscriptions.find((s) => s.name === subscription.subscription);

    const costLabel = subscription.cost
        ? `$${Number(subscription.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${subscription.billingCycle === "year" ? "yr" : "mo"}`
        : null;

    const monthLabel = months.find((month) => month.value === subscription.billingMonth)?.label;
    const renewsLabel = subscription.billingCycle === "year"
        ? (monthLabel && subscription.billingDay ? `${monthLabel} ${ordinal(Number(subscription.billingDay))}, every year` : "")
        : (subscription.billingDay ? `${ordinal(Number(subscription.billingDay))} of every month` : "");

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
            <div className="flex items-center gap-3">
                {subscriptionInfo && (
                    <Image
                        src={subscriptionInfo.image}
                        alt={subscriptionInfo.name}
                        width={36}
                        height={36}
                        className="object-contain shrink-0"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold truncate">{subscription.name || "Unnamed Subscription"}</span>
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
                        {[subscription.subscription, costLabel].filter(Boolean).join(" · ") || "—"}
                    </div>
                </div>
                {subscription.link && (
                    <a
                        href={subscription.link}
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
                    <DetailRow label="Cost" value={costLabel} />
                    <DetailRow label="Renews" value={renewsLabel} />
                </div>
            )}
        </div>
    );
}

export default SubscriptionInfo;
