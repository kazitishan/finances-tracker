import Image from "next/image";

function PaymentMethodCard({ bankInfo, name, detail }) {
    return (
        <div className="mt-3">
            <div className="detail-label text-sm mb-1.5">Payment Method</div>
            <div className="flex items-center gap-3 rounded-xl p-2.5 bg-[var(--surface-hover)] border border-[var(--border)]">
                <div className="logo-tile" style={{ width: "2rem", height: "2rem" }}>
                    {bankInfo && (
                        <Image src={bankInfo.image} alt={bankInfo.name} width={32} height={32} className="h-full w-full object-cover" />
                    )}
                </div>
                <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{name}</div>
                    {detail && <div className="text-xs text-muted">{detail}</div>}
                </div>
            </div>
        </div>
    );
}

export default PaymentMethodCard;
