"use client";

import { maskAll, maskLast4, ordinal, formatAccountAge, formatCurrency, expiryStatus } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import DetailSection, { NotesSection } from "@/components/ui/DetailSection";
import RevealableDetailRow from "@/components/info/RevealableDetailRow";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import PaymentMethodCard from "@/components/info/PaymentMethodCard";
import { logoFor } from "@/lib/logos";
import { banks } from "@/components/dropdowns/Dropdown";

function splitLines(text) {
    return (text || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

function CreditCardInfo({ card, bankAccounts = [], onEdit }) {
    const paymentAccount = bankAccounts.find((account) => account.id === card.paymentMethod);
    const rewardsList = splitLines(card.rewards);
    const usageList = splitLines(card.usage);
    const expiry = expiryStatus(card.expMonth, card.expYear);

    return (
        <InfoCard
            image={logoFor(banks, card.bank, card.customLogo)}
            imageAlt={card.bank}
            title={card.name || "Unnamed Card"}
            subtitle={[card.bank, card.cardNumber ? maskLast4(card.cardNumber) : null].filter(Boolean).join(" · ")}
            tags={[
                ...(expiry ? [{ label: expiry === "expired" ? "Expired" : "Expires soon", tone: "danger" }] : []),
                ...usageList,
            ]}
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
                    image={logoFor(banks, paymentAccount.bank, paymentAccount.customLogo)}
                    imageAlt={paymentAccount.bank}
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
