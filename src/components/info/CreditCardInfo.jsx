"use client";

import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { maskAll, maskLast4, ordinal, formatAccountAge, formatCurrency } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import DetailSection, { NotesSection } from "@/components/ui/DetailSection";
import RevealableDetailRow from "@/components/info/RevealableDetailRow";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import PaymentMethodCard from "@/components/info/PaymentMethodCard";

function splitLines(text) {
    return (text || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

function CreditCardInfo({ card, bankAccounts = [], onEdit }) {
    const bankInfo = banks.find((b) => b.name === card.bank);
    const paymentAccount = bankAccounts.find((account) => account.id === card.paymentMethod);
    const paymentAccountBankInfo = paymentAccount ? banks.find((b) => b.name === paymentAccount.bank) : null;
    const rewardsList = splitLines(card.rewards);
    const usageList = splitLines(card.usage);

    return (
        <InfoCard
            image={bankInfo?.image}
            imageAlt={bankInfo?.name}
            title={card.name || "Unnamed Card"}
            subtitle={[card.bank, card.cardNumber ? maskLast4(card.cardNumber) : null].filter(Boolean).join(" · ")}
            tags={usageList}
            link={card.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={card.loginUsername} password={card.loginPassword} />
            <DetailRow
                label="Open Date"
                value={
                    card.openMonth && card.openYear
                        ? `${card.openMonth}/${card.openYear} · ${formatAccountAge(card.openMonth, card.openYear)}`
                        : ""
                }
            />
            <DetailRow label="Cardholder" value={card.cardholder} />
            <RevealableDetailRow label="Card Number" value={card.cardNumber} mask={maskLast4} />
            <RevealableDetailRow label="CVC" value={card.cvc} mask={maskAll} />
            <DetailRow
                label="Expiration"
                value={card.expMonth && card.expYear ? `${card.expMonth}/${card.expYear}` : ""}
            />
            <DetailRow
                label="Credit Line"
                value={card.creditLine ? formatCurrency(card.creditLine, { cents: false }) : ""}
            />
            <DetailRow
                label="Payments Due"
                value={card.dueDate ? `${ordinal(Number(card.dueDate))} of every month` : ""}
            />

            {paymentAccount && (
                <PaymentMethodCard
                    bankInfo={paymentAccountBankInfo}
                    name={paymentAccount.name}
                    detail={paymentAccount.accountNumber ? maskLast4(paymentAccount.accountNumber) : null}
                />
            )}

            {rewardsList.length > 0 && (
                <DetailSection title="Rewards & Benefits">
                    <ul className="list-disc list-inside text-sm">
                        {rewardsList.map((reward, index) => (
                            <li key={index}>{reward}</li>
                        ))}
                    </ul>
                </DetailSection>
            )}

            <NotesSection notes={card.notes} />
        </InfoCard>
    );
}

export default CreditCardInfo;
