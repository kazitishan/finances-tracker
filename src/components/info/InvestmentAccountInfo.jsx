"use client";

import InfoCard from "@/components/ui/InfoCard";
import { NotesSection } from "@/components/ui/DetailSection";
import LoginDetailRow from "@/components/info/LoginDetailRow";
import { logoFor } from "@/lib/logos";
import { brokers } from "@/components/dropdowns/Dropdown";

export const investmentAccountTypes = ["Brokerage", "Roth IRA", "401K"];

function InvestmentAccountInfo({ account, onEdit }) {
    return (
        <InfoCard
            image={logoFor(brokers, account.broker, account.customLogo)}
            imageAlt={account.broker}
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
