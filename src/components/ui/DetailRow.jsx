"use client";

import { useCopyToClipboard } from "@/components/ToastProvider";

function DetailRow({ label, value, copyable = false }) {
    const copyToClipboard = useCopyToClipboard();
    if (!value) return null;

    return (
        <div className="detail-row">
            <span className="detail-label">{label}</span>
            <span
                className={`font-medium text-right break-all${copyable ? " copyable" : ""}`}
                onClick={copyable ? () => copyToClipboard(value, label) : undefined}
                title={copyable ? "Click to copy" : undefined}
            >
                {value}
            </span>
        </div>
    );
}

export default DetailRow;
