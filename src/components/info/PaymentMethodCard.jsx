import Image from "next/image";
import DetailSection from "@/components/ui/DetailSection";

function PaymentMethodCard({ image, imageAlt, name, detail }) {
    return (
        <DetailSection title="Payment Method">
            <div className="flex items-center gap-3 rounded-xl p-2.5 bg-[var(--surface-hover)] border border-[var(--border)]">
                <div className="logo-tile" style={{ width: "2rem", height: "2rem" }}>
                    {image && (
                        <Image src={image} alt={imageAlt || ""} width={32} height={32} className="h-full w-full object-cover" />
                    )}
                </div>
                <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{name}</div>
                    {detail && <div className="text-xs text-muted">{detail}</div>}
                </div>
            </div>
        </DetailSection>
    );
}

export default PaymentMethodCard;
