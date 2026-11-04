"use client";

import { typeLabel } from "@/components/dropdowns/TypeDropdown";
import { months, ordinal, formatCurrency } from "@/lib/formUtils";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import { itemName } from "@/lib/itemNames";

function UtilityInfo({ utility, onEdit }) {
    const typeName = typeLabel(utility.type, utility.otherType);

    const costStat = utility.cost
        ? utility.billingCycle === "year"
            ? { label: "Yearly Cost", value: formatCurrency(utility.cost), caption: "per year" }
            : { label: "Monthly Cost", value: formatCurrency(utility.cost), caption: "per month" }
        : null;

    const monthLabel = months.find((month) => month.value === utility.billingMonth)?.label;
    const paymentsDueLabel = utility.billingCycle === "year"
        ? (monthLabel && utility.billingDay ? `${monthLabel} ${ordinal(Number(utility.billingDay))}, every year` : "")
        : (utility.billingDay ? `${ordinal(Number(utility.billingDay))} of every month` : "");

    return (
        <InfoCard
            image={utility.img}
            imageAlt={typeName}
            title={itemName("utilities", utility)}
            subtitle={utility.provider}
            tags={[typeName].filter(Boolean)}
            stat={costStat}
            link={utility.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={utility.loginUsername} password={utility.loginPassword} />
            <DetailRow label="Payments Due" value={paymentsDueLabel} />

            <NotesSection notes={utility.notes} />
        </InfoCard>
    );
}

export default UtilityInfo;
