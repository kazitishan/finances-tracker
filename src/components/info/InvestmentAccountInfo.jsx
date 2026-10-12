"use client";

import { brokers } from "@/components/dropdowns/BrokerDropdown";
import InfoCard from "@/components/ui/InfoCard";
import { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";

export const investmentAccountTypes = ["Brokerage", "Roth IRA", "401K"];

function InvestmentAccountInfo({ account, onEdit }) {
    const brokerInfo = brokers.find((b) => b.name === account.broker);

    return (
        <InfoCard
            image={brokerInfo?.image}
            imageAlt={brokerInfo?.name}
            title={account.name || "Unnamed Account"}
            subtitle={account.broker}
            tags={[account.type].filter(Boolean)}
            link={account.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={account.loginUsername} password={account.loginPassword} />
            <NotesSection notes={account.notes} />
        </InfoCard>
    );
}

export default InvestmentAccountInfo;
