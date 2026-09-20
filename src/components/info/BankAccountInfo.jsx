"use client";

import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { interestPaymentOptions, maskAll, maskLast4 } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import RevealableDetailRow from "@/components/info/RevealableDetailRow";
import LoginDetailRow from "@/components/info/LoginDetailRow";

function BankAccountInfo({ account, onEdit }) {
    const bankInfo = banks.find((b) => b.name === account.bank);

    return (
        <InfoCard
            image={bankInfo?.image}
            imageAlt={bankInfo?.name}
            title={account.name || "Unnamed Account"}
            subtitle={[account.bank, account.type, account.accountNumber ? maskLast4(account.accountNumber) : null]
                .filter(Boolean)
                .join(" · ")}
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
                <>
                    <div className="field-label mt-4 mb-1">Debit Card</div>
                    <DetailRow label="Cardholder" value={account.cardholder} />
                    <RevealableDetailRow label="Card Number" value={account.cardNumber} mask={maskLast4} />
                    <RevealableDetailRow label="CVC" value={account.cvc} mask={maskAll} />
                    <RevealableDetailRow label="PIN" value={account.pin} mask={maskAll} />
                    <DetailRow
                        label="Expiration"
                        value={account.expMonth && account.expYear ? `${account.expMonth}/${account.expYear}` : ""}
                    />
                </>
            )}

            {account.notes && (
                <div className="mt-2">
                    <div className="detail-label text-sm mb-1">Notes</div>
                    <div className="text-sm whitespace-pre-wrap">{account.notes}</div>
                </div>
            )}
        </InfoCard>
    );
}

export default BankAccountInfo;
