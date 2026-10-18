"use client";

import { loanProviders } from "@/components/dropdowns/Dropdown";
import { loanTypeLabel } from "@/components/dropdowns/LoanTypeDropdown";
import { formatCurrency, ordinal } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import { logoFor } from "@/lib/logos";

export function amountRemaining(loan) {
    if (!loan.amountLoaned) return null;
    return Number(loan.amountLoaned) + Number(loan.interestAmount || 0) - Number(loan.amountPaid || 0);
}

function LoanInfo({ loan, onEdit }) {
    const typeLabel = loanTypeLabel(loan.type, loan.otherType);
    const formatAmount = (amount) => (amount ? formatCurrency(amount) : null);
    const remaining = amountRemaining(loan);

    return (
        <InfoCard
            image={logoFor(loanProviders, loan.provider, loan.customLogo)}
            imageAlt={loan.provider}
            title={loan.name || "Unnamed Loan"}
            subtitle={loan.provider}
            tags={[typeLabel].filter(Boolean)}
            stat={remaining !== null ? { label: "Amount Remaining", value: formatCurrency(remaining), caption: "remaining" } : null}
            link={loan.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={loan.loginUsername} password={loan.loginPassword} />
            <DetailRow label="Amount Loaned" value={formatAmount(loan.amountLoaned)} />
            <DetailRow label="Interest Rate" value={loan.interestRate ? `${loan.interestRate}%` : null} />
            <DetailRow label="Interest Amount" value={formatAmount(loan.interestAmount)} />
            <DetailRow label="Amount Paid" value={formatAmount(loan.amountPaid)} />
            <DetailRow label="Monthly Payment" value={loan.monthlyPayment ? `${formatCurrency(loan.monthlyPayment)} / mo` : null} />
            <DetailRow label="Payments Due" value={loan.paymentDay ? `${ordinal(Number(loan.paymentDay))} of every month` : null} />

            <NotesSection notes={loan.notes} />
        </InfoCard>
    );
}

export default LoanInfo;
