"use client";

import { useState } from "react";
import { maskAll } from "@/lib/formUtils";
import { useCopyToClipboard } from "@/components/ToastProvider";
import { EyeIcon, EyeOffIcon } from "@/components/info/RevealableDetailRow";

function LoginValue({ label, value }) {
    const [revealed, setRevealed] = useState(false);
    const copyToClipboard = useCopyToClipboard();

    return (
        <div className="flex-1 min-w-0 text-sm py-1">
            <div className="text-gray-500">{label}</div>
            <div className="flex items-center gap-2">
                <span
                    className="font-medium break-all cursor-pointer"
                    onClick={() => copyToClipboard(value, label)}
                    title="Click to copy"
                >
                    {revealed ? value : maskAll(value)}
                </span>
                <button
                    type="button"
                    onClick={() => setRevealed((prev) => !prev)}
                    className="text-gray-400 hover:text-gray-700 cursor-pointer shrink-0"
                    aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
                >
                    {revealed ? <EyeIcon /> : <EyeOffIcon />}
                </button>
            </div>
        </div>
    );
}

function LoginDetailRow({ username, password }) {
    if (!username && !password) return null;

    return (
        <div className="flex gap-4">
            {username && <LoginValue label="User Name" value={username} />}
            {password && <LoginValue label="Password" value={password} />}
        </div>
    );
}

export default LoginDetailRow;
