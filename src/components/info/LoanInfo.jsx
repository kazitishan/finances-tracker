"use client";

import { loanProviders } from "@/components/dropdowns/LoanProviderDropdown";
import { loanTypeLabel } from "@/components/dropdowns/LoanTypeDropdown";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import LoginDetailRow from "@/components/info/LoginDetailRow";

function LoanInfo({ loan, onEdit }) {
    const providerInfo = loanProviders.find((p) => p.name === loan.provider);

    const typeLabel = loanTypeLabel(loan.type, loan.otherType);
    const amountLabel = loan.amountLoaned
        ? `$${Number(loan.amountLoaned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : null;
    const rateLabel = loan.interestRate ? `${loan.interestRate}%` : null;

    return (
        <InfoCard
            image={providerInfo?.image}
            imageAlt={providerInfo?.name}
            title={loan.name || "Unnamed Loan"}
            subtitle={[typeLabel, loan.provider, amountLabel].filter(Boolean).join(" · ")}
            link={loan.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={loan.loginUsername} password={loan.loginPassword} />
            <DetailRow label="Type" value={typeLabel} />
            <DetailRow label="Provider" value={loan.provider} />
            <DetailRow label="Amount Loaned" value={amountLabel} />
            <DetailRow label="Interest Rate" value={rateLabel} />

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
