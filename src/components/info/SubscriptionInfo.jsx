"use client";

import { subscriptions } from "@/components/dropdowns/SubscriptionDropdown";
import { banks } from "@/components/dropdowns/BankCompaniesDropdown";
import { findPaymentAccount } from "@/components/dropdowns/PaymentMethodDropdown";
import { months, ordinal, maskLast4, formatCurrency } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import PaymentMethodCard from "@/components/info/PaymentMethodCard";

function SubscriptionInfo({ subscription, creditCards = [], bankAccounts = [], onEdit }) {
    const subscriptionInfo = subscriptions.find((s) => s.name === subscription.subscription);

    const paymentAccount = findPaymentAccount(subscription.paymentMethod, { creditCards, bankAccounts });
    const paymentAccountBankInfo = paymentAccount ? banks.find((b) => b.name === paymentAccount.bank) : null;

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
            image={subscriptionInfo?.image}
            imageAlt={subscriptionInfo?.name}
            title={subscription.name || "Unnamed Subscription"}
            subtitle={subscription.subscription}
            stat={costStat}
            link={subscription.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={subscription.loginUsername} password={subscription.loginPassword} />
            <DetailRow label="Renews" value={renewsLabel} />

            {paymentAccount && (
                <PaymentMethodCard
                    bankInfo={paymentAccountBankInfo}
                    name={paymentAccount.name}
                    detail={paymentAccount.cardNumber ? maskLast4(paymentAccount.cardNumber) : null}
                />
            )}

            <NotesSection notes={subscription.notes} />
        </InfoCard>
    );
}

export default SubscriptionInfo;
