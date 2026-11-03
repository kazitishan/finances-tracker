"use client";

import { useState } from "react";
import { groupFromRight } from "@/lib/formUtils";
import { useCopyToClipboard } from "@/components/ToastProvider";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

function handleCopy(e) {
    const selection = window.getSelection()?.toString() ?? "";
    e.clipboardData.setData("text/plain", selection.replace(/\s/g, ""));
    e.preventDefault();
}

function RevealableDetailRow({ label, value, mask }) {
    const [revealed, setRevealed] = useState(false);
    const copyToClipboard = useCopyToClipboard();

    if (!value) return null;

    return (
        <div className="detail-row">
            <span className="detail-label">{label}</span>
            <span className="flex items-center gap-2">
                <span
                    className="font-medium text-right break-all copyable"
                    onCopy={handleCopy}
                    onClick={() => copyToClipboard(value, label)}
                    title="Click to copy"
                >
                    {revealed ? groupFromRight(value) : mask(value)}
                </span>
                <button
                    type="button"
                    onClick={() => setRevealed((prev) => !prev)}
                    className="icon-btn"
                    aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
                >
                    {revealed ? <EyeIcon /> : <EyeOffIcon />}
                </button>
            </span>
        </div>
    );
}

export default RevealableDetailRow;
