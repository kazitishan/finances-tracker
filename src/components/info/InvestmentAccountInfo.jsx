"use client";

import InfoCard from "@/components/ui/InfoCard";
import DetailSection, { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import { formatCurrency } from "@/lib/formUtils";
import { logoFor } from "@/lib/logos";
import { describeSchedule } from "@/lib/recurringInvestments";
import { brokers } from "@/components/dropdowns/Dropdown";

export const investmentAccountTypes = ["Brokerage", "Roth IRA", "401K"];

function RecurringInvestmentsSection({ investments, bankAccounts }) {
    if (investments.length === 0) return null;

    return (
        <DetailSection title="Recurring Investments">
            <ul>
                {investments.map((investment) => {
                    const bankAccount = bankAccounts.find((account) => account.id === investment.bankAccount);
                    const details = [describeSchedule(investment), bankAccount && `from ${bankAccount.name || "Unnamed Account"}`];
                    return (
                        <li key={investment.id} className="flex items-center gap-3 border-b border-[var(--border)] py-1.5 text-sm last:border-b-0">
                            <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">{investment.stock || "Unnamed Stock"}</div>
                                <div className="truncate text-xs text-muted">{details.filter(Boolean).join(" · ") || "No schedule set"}</div>
                            </div>
                            {investment.amount && <span className="tabular-nums">{formatCurrency(investment.amount)}</span>}
                        </li>
                    );
                })}
            </ul>
        </DetailSection>
    );
}

function InvestmentAccountInfo({ account, bankAccounts = [], onEdit }) {
    return (
        <InfoCard
            image={logoFor(brokers, account.broker, account.customLogo)}
            imageAlt={account.broker}
            title={account.name || "Unnamed Account"}
            subtitle={account.broker}
            tags={[account.type].filter(Boolean)}
            link={account.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={account.loginUsername} password={account.loginPassword} />
            <RecurringInvestmentsSection investments={account.recurringInvestments || []} bankAccounts={bankAccounts} />
            <NotesSection notes={account.notes} />
        </InfoCard>
    );
}

export default InvestmentAccountInfo;
