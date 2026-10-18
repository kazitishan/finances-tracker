"use client";

import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { expiryStatus, interestPaymentOptions, maskAll, maskLast4 } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import DetailSection, { NotesSection } from "@/components/ui/DetailSection";
import RevealableDetailRow from "@/components/info/RevealableDetailRow";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import { logoFor } from "@/lib/logos";

function BankAccountInfo({ account, onEdit }) {
    const debitExpiry = account.type === "Checking" ? expiryStatus(account.expMonth, account.expYear) : null;

    return (
        <InfoCard
            image={logoFor(banks, account.bank, account.customLogo)}
            imageAlt={account.bank}
            title={account.name || "Unnamed Account"}
            subtitle={[account.bank, account.accountNumber ? maskLast4(account.accountNumber) : null]
                .filter(Boolean)
                .join(" · ")}
            tags={[
                ...[account.type].filter(Boolean),
                ...(debitExpiry
                    ? [{ label: debitExpiry === "expired" ? "Debit card expired" : "Debit card expires soon", tone: "danger" }]
                    : []),
            ]}
            link={account.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={account.loginUsername} password={account.loginPassword} />
            <DetailRow label="Routing Number" value={account.routingNumber} copyable />
            <RevealableDetailRow label="Account Number" value={account.accountNumber} mask={maskLast4} />
            <DetailRow label="APY" value={account.apy ? `${account.apy}%` : ""} />
            <DetailRow
                label="Interest Payment Date"
                value={interestPaymentOptions.find((option) => option.value === account.interestPaymentDate)?.label}
            />

            {account.type === "Checking" && (account.cardholder || account.cardNumber || account.expMonth || account.cvc || account.pin) && (
                <DetailSection title="Debit Card">
                    <DetailRow label="Cardholder" value={account.cardholder} />
                    <RevealableDetailRow label="Card Number" value={account.cardNumber} mask={maskLast4} />
                    <RevealableDetailRow label="CVC" value={account.cvc} mask={maskAll} />
                    <RevealableDetailRow label="PIN" value={account.pin} mask={maskAll} />
                    <DetailRow
                        label="Expiration"
                        value={account.expMonth && account.expYear ? `${account.expMonth}/${account.expYear}` : ""}
                    />
                </DetailSection>
            )}

            <NotesSection notes={account.notes} />
        </InfoCard>
    );
}

export default BankAccountInfo;
