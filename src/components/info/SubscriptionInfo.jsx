"use client";

import { subscriptions } from "@/components/dropdowns/SubscriptionDropdown";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { months, ordinal, maskLast4 } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import PaymentMethodCard from "@/components/info/PaymentMethodCard";

function SubscriptionInfo({ subscription, creditCards = [], bankAccounts = [], onEdit }) {
    const subscriptionInfo = subscriptions.find((s) => s.name === subscription.subscription);

    const [methodType, methodId] = (subscription.paymentMethod || "").split(":");
    const paymentAccount = methodType === "credit"
        ? creditCards.find((card) => card.id === methodId)
        : methodType === "debit"
            ? bankAccounts.find((account) => account.id === methodId)
            : null;
    const paymentAccountBankInfo = paymentAccount ? banks.find((b) => b.name === paymentAccount.bank) : null;

    const costLabel = subscription.cost
        ? `$${Number(subscription.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${subscription.billingCycle === "year" ? "yr" : "mo"}`
        : null;

    const monthLabel = months.find((month) => month.value === subscription.billingMonth)?.label;
    const renewsLabel = subscription.billingCycle === "year"
        ? (monthLabel && subscription.billingDay ? `${monthLabel} ${ordinal(Number(subscription.billingDay))}, every year` : "")
        : (subscription.billingDay ? `${ordinal(Number(subscription.billingDay))} of every month` : "");

    return (
        <InfoCard
            image={subscriptionInfo?.image}
            imageAlt={subscriptionInfo?.name}
            title={subscription.name || "Unnamed Subscription"}
            subtitle={[subscription.subscription, costLabel].filter(Boolean).join(" · ")}
            link={subscription.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={subscription.loginUsername} password={subscription.loginPassword} />
            <DetailRow label="Cost" value={costLabel} />
            <DetailRow label="Renews" value={renewsLabel} />

            {paymentAccount && (
                <PaymentMethodCard
                    bankInfo={paymentAccountBankInfo}
                    name={paymentAccount.name}
                    detail={paymentAccount.cardNumber ? maskLast4(paymentAccount.cardNumber) : null}
                />
            )}
        </InfoCard>
    );
}

export default SubscriptionInfo;
