"use client";

import { banks } from "@/components/dropdowns/Dropdown";
import { allInsuranceProviders } from "@/components/dropdowns/Dropdown";
import { typeLabel } from "@/components/dropdowns/TypeDropdown";
import { insuranceTypeFields } from "@/components/modals/AddInsuranceModal";
import { findPaymentAccount } from "@/util/findPaymentAccount";
import { months, ordinal, maskLast4, formatCurrency } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import PaymentMethodCard from "@/components/info/PaymentMethodCard";
import { logoFor } from "@/lib/logos";

function InsuranceInfo({ insurance, creditCards = [], bankAccounts = [], onEdit }) {
    const typeName = typeLabel(insurance.type, insurance.otherType);
    const typeFields = insuranceTypeFields[insurance.type] || [];

    const paymentAccount = findPaymentAccount(insurance.paymentMethod, { creditCards, bankAccounts });

    const premiumStat = insurance.premium
        ? insurance.billingCycle === "year"
            ? { label: "Yearly Premium", value: formatCurrency(insurance.premium), caption: "per year" }
            : { label: "Monthly Premium", value: formatCurrency(insurance.premium), caption: "per month" }
        : null;

    const monthLabel = months.find((month) => month.value === insurance.billingMonth)?.label;
    const paymentsDueLabel = insurance.billingCycle === "year"
        ? (monthLabel && insurance.billingDay ? `${monthLabel} ${ordinal(Number(insurance.billingDay))}, every year` : "")
        : (insurance.billingDay ? `${ordinal(Number(insurance.billingDay))} of every month` : "");

    return (
        <InfoCard
            image={logoFor(allInsuranceProviders, insurance.provider, insurance.customLogo)}
            imageAlt={insurance.provider}
            title={insurance.name || "Unnamed Insurance"}
            subtitle={insurance.provider}
            tags={[typeName].filter(Boolean)}
            stat={premiumStat}
            link={insurance.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={insurance.loginUsername} password={insurance.loginPassword} />
            {typeFields.map((field) => (
                <DetailRow
                    key={field.key}
                    label={field.label}
                    value={field.money && insurance[field.key]
                        ? formatCurrency(insurance[field.key], { cents: false })
                        : insurance[field.key]}
                    copyable={field.copyable}
                />
            ))}
            <DetailRow label="Payments Due" value={paymentsDueLabel} />

            {paymentAccount && (
                <PaymentMethodCard
                    image={logoFor(banks, paymentAccount.bank, paymentAccount.customLogo)}
                    imageAlt={paymentAccount.bank}
                    name={paymentAccount.displayName}
                    detail={paymentAccount.cardNumber ? maskLast4(paymentAccount.cardNumber) : null}
                />
            )}

            <NotesSection notes={insurance.notes} />
        </InfoCard>
    );
}

export default InsuranceInfo;
