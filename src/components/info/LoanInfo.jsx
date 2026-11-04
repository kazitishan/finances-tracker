"use client";

import { typeLabel } from "@/components/dropdowns/TypeDropdown";
import { daysUntil, formatCurrency, ordinal } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import DetailSection, { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import { parseDateString } from "@/lib/recurringInvestments";
import { itemName } from "@/lib/itemNames";

export function amountRemaining(loan) {
    if (!loan.amountLoaned) return null;
    return Number(loan.amountLoaned) + Number(loan.interestAmount || 0) - Number(loan.amountPaid || 0);
}

const daysSince = (date) => Math.max(0, -daysUntil(date));

// Simple interest so far: each disbursement accrues daily from its date to today. Payments have no dates, so
// the amount paid is treated as coming off the balance evenly since the first disbursement.
export function estimatedInterest(loan) {
    const rate = Number(loan.interestRate) / 100;
    const disbursed = (loan.disbursements || [])
        .map((disbursement) => ({ date: parseDateString(disbursement.date), amount: Number(disbursement.amount) }))
        .filter((disbursement) => disbursement.date && disbursement.amount > 0)
        .sort((a, b) => a.date - b.date);
    if (!rate || disbursed.length === 0) return null;

    // Oldest first; anything disbursed past the amount loaned isn't counted.
    let uncounted = Number(loan.amountLoaned) || Infinity;
    let dollarDays = 0;
    for (const { date, amount } of disbursed) {
        const counted = Math.min(amount, uncounted);
        uncounted -= counted;
        dollarDays += counted * daysSince(date);
    }
    dollarDays -= (Number(loan.amountPaid || 0) * daysSince(disbursed[0].date)) / 2;

    return (Math.max(0, dollarDays) * rate) / 365;
}

function DisbursementsSection({ disbursements }) {
    // Rows left blank in the form aren't shown. The rest run oldest first, whatever order they were added in.
    const entered = disbursements
        .filter((disbursement) => disbursement.date || disbursement.amount)
        .sort((a, b) => a.date.localeCompare(b.date));
    if (entered.length === 0) return null;

    return (
        <DetailSection title="Disbursements">
            <ul>
                {entered.map((disbursement) => {
                    const date = parseDateString(disbursement.date);
                    return (
                        <li key={disbursement.id} className="flex items-center gap-3 border-b border-[var(--border)] py-1.5 text-sm last:border-b-0">
                            <span className="min-w-0 flex-1 truncate">
                                {date ? date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "No date"}
                            </span>
                            {disbursement.amount && <span className="tabular-nums">{formatCurrency(disbursement.amount)}</span>}
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
}

function LoanInfo({ loan, onEdit }) {
    const typeName = typeLabel(loan.type, loan.otherType);
    const formatAmount = (amount) => (amount ? formatCurrency(amount) : null);
    const remaining = amountRemaining(loan);
    const interest = estimatedInterest(loan);
    const remainingStat = remaining !== null && {
        label: "Amount Remaining",
        value: formatCurrency(remaining),
        caption: "remaining",
        lines: [
            { label: "Amount Loaned", value: formatCurrency(loan.amountLoaned) },
            { label: "Interest Amount", value: `+ ${formatCurrency(loan.interestAmount || 0)}` },
            { label: "Amount Paid", value: `− ${formatCurrency(loan.amountPaid || 0)}` },
        ],
    };

    return (
        <InfoCard
            image={loan.img}
            imageAlt={loan.provider}
            title={itemName("loans", loan)}
            subtitle={loan.provider}
            tags={[typeName].filter(Boolean)}
            stat={remainingStat}
            link={loan.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={loan.loginUsername} password={loan.loginPassword} />
            <DetailRow label="Interest Rate" value={loan.interestRate ? `${loan.interestRate}%` : null} />
            <DetailRow label="Estimated Interest" value={interest !== null ? `${formatCurrency(interest)} so far` : null} />
            {/* With no amount loaned there's no key stat to show these in. */}
            {!remainingStat && <DetailRow label="Interest Amount" value={formatAmount(loan.interestAmount)} />}
            {!remainingStat && <DetailRow label="Amount Paid" value={formatAmount(loan.amountPaid)} />}
            <DetailRow label="Monthly Payment" value={loan.monthlyPayment ? `${formatCurrency(loan.monthlyPayment)} / mo` : null} />
            <DetailRow label="Payments Due" value={loan.paymentDay ? `${ordinal(Number(loan.paymentDay))} of every month` : null} />

            <DisbursementsSection disbursements={loan.disbursements || []} />
            <NotesSection notes={loan.notes} />
        </InfoCard>
    );
}

export default LoanInfo;
