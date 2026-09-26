"use client";

import { loanProviders } from "@/components/dropdowns/LoanProviderDropdown";
import { loanTypeLabel } from "@/components/dropdowns/LoanTypeDropdown";
import { ordinal } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import LoginDetailRow from "@/components/info/LoginDetailRow";

export function amountRemaining(loan) {
    if (!loan.amountLoaned) return null;
    return Number(loan.amountLoaned) + Number(loan.interestAmount || 0) - Number(loan.amountPaid || 0);
}

function LoanInfo({ loan, onEdit }) {
    const providerInfo = loanProviders.find((p) => p.name === loan.provider);

    const typeLabel = loanTypeLabel(loan.type, loan.otherType);
    const amountLabel = loan.amountLoaned
        ? `$${Number(loan.amountLoaned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : null;
    const formatAmount = (amount) =>
        amount
            ? `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : null;
    const paymentLabel = loan.monthlyPayment
        ? `$${Number(loan.monthlyPayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo`
        : null;
    const paymentDateLabel = loan.paymentDay ? `${ordinal(Number(loan.paymentDay))} of every month` : null;
    const rateLabel = loan.interestRate ? `${loan.interestRate}%` : null;
    const remaining = amountRemaining(loan);
    const remainingLabel = remaining !== null
        ? `$${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : null;

    return (
        <InfoCard
            image={providerInfo?.image}
            imageAlt={providerInfo?.name}
            title={loan.name || "Unnamed Loan"}
            subtitle={[typeLabel, loan.provider, remainingLabel].filter(Boolean).join(" · ")}
            highlight={paymentLabel}
            link={loan.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={loan.loginUsername} password={loan.loginPassword} />
            <DetailRow label="Type" value={typeLabel} />
            <DetailRow label="Provider" value={loan.provider} />
            <DetailRow label="Amount Loaned" value={amountLabel} />
            <DetailRow label="Interest Rate" value={rateLabel} />
            <DetailRow label="Interest Amount" value={formatAmount(loan.interestAmount)} />
            <DetailRow label="Amount Paid" value={formatAmount(loan.amountPaid)} />
            <DetailRow label="Monthly Loan Payment" value={paymentLabel} />
            <DetailRow label="Monthly Loan Payment Date" value={paymentDateLabel} />

            {remainingLabel && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-[var(--accent-soft)] px-3 py-2.5">
                    <span className="text-sm font-medium text-[var(--accent)]">Amount Remaining</span>
                    <span className="text-lg font-semibold tabular-nums text-[var(--accent)]">{remainingLabel}</span>
                </div>
            )}

            {loan.notes && (
                <div className="mt-2">
                    <div className="detail-label text-sm mb-1">Notes</div>
                    <div className="text-sm whitespace-pre-wrap">{loan.notes}</div>
                </div>
            )}
        </InfoCard>
    );
}

export default LoanInfo;
