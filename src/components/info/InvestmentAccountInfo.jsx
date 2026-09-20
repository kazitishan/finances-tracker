"use client";

import { brokers } from "@/components/dropdowns/BrokerDropdown";
import InfoCard from "@/components/ui/InfoCard";
import DetailRow from "@/components/ui/DetailRow";
import LoginDetailRow from "@/components/info/LoginDetailRow";

export const investmentAccountTypes = ["Brokerage", "Roth IRA", "401K"];

function InvestmentAccountInfo({ account, onEdit }) {
    const brokerInfo = brokers.find((b) => b.name === account.broker);

    return (
        <InfoCard
            image={brokerInfo?.image}
            imageAlt={brokerInfo?.name}
            title={account.name || "Unnamed Account"}
            subtitle={[account.broker, account.type].filter(Boolean).join(" · ")}
            link={account.link}
            onEdit={onEdit}
        >
            <LoginDetailRow username={account.loginUsername} password={account.loginPassword} />
            <DetailRow label="Type" value={account.type} />
            <DetailRow label="Broker" value={account.broker} />

            {account.notes && (
                <div className="mt-2">
                    <div className="detail-label text-sm mb-1">Notes</div>
                    <div className="text-sm whitespace-pre-wrap">{account.notes}</div>
                </div>
            )}
        </InfoCard>
    );
}

export default InvestmentAccountInfo;
