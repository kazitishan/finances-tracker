"use client";

import { useState } from "react";
import { groupFromRight } from "@/lib/formUtils";

function EyeIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

function handleCopy(e) {
    const selection = window.getSelection()?.toString() ?? "";
    e.clipboardData.setData("text/plain", selection.replace(/\s/g, ""));
    e.preventDefault();
}

function RevealableDetailRow({ label, value, mask }) {
    const [revealed, setRevealed] = useState(false);

    if (!value) return null;

    return (
        <div className="flex justify-between items-center gap-4 text-sm py-1">
            <span className="text-gray-500">{label}</span>
            <span className="flex items-center gap-2">
                <span className="font-medium text-right break-all" onCopy={handleCopy}>
                    {revealed ? groupFromRight(value) : mask(value)}
                </span>
                <button
                    type="button"
                    onClick={() => setRevealed((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                    aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
                >
                    {revealed ? <EyeIcon /> : <EyeOffIcon />}
                </button>
            </span>
        </div>
    );
}

export default RevealableDetailRow;
