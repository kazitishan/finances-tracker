"use client";

import { findPaymentAccount } from "@/util/findPaymentAccount";
import { months, ordinal, maskLast4, formatCurrency } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import PaymentMethodCard from "@/components/info/PaymentMethodCard";
import { itemName } from "@/lib/itemNames";
import { typeLabel } from "@/components/dropdowns/TypeDropdown";

function SubscriptionInfo({ subscription, creditCards = [], bankAccounts = [], onEdit }) {
    const typeName = typeLabel(subscription.type, subscription.otherType);
    const paymentAccount = findPaymentAccount(subscription.paymentMethod, { creditCards, bankAccounts });

    const costStat = subscription.cost
        ? subscription.billingCycle === "year"
            ? { label: "Yearly Cost", value: formatCurrency(subscription.cost), caption: "per year" }
            : { label: "Monthly Cost", value: formatCurrency(subscription.cost), caption: "per month" }
        : null;

    const monthLabel = months.find((month) => month.value === subscription.billingMonth)?.label;
    const renewsLabel = subscription.billingCycle === "year"
        ? (monthLabel && subscription.billingDay ? `${monthLabel} ${ordinal(Number(subscription.billingDay))}, every year` : "")
        : (subscription.billingDay ? `${ordinal(Number(subscription.billingDay))} of every month` : "");

    return (
        <InfoCard
            image={subscription.img}
            imageAlt={subscription.subscription}
            title={itemName("subscriptions", subscription)}
            subtitle={subscription.subscription}
            tags={[typeName].filter(Boolean)}
            stat={costStat}
            link={subscription.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={subscription.loginUsername} password={subscription.loginPassword} />
            <DetailRow label="Renews" value={renewsLabel} />

            {paymentAccount && (
                <PaymentMethodCard
                    image={paymentAccount.img}
                    imageAlt={paymentAccount.bank}
                    name={paymentAccount.displayName}
                    detail={paymentAccount.cardNumber ? maskLast4(paymentAccount.cardNumber) : null}
                />
            )}

            <NotesSection notes={subscription.notes} />
        </InfoCard>
    );
}

export default SubscriptionInfo;
