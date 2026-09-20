"use client";

import { inputClasses } from "@/lib/formUtils";

function LoginFields({ username, password, onUsernameChange, onPasswordChange }) {
    return (
        <div className="flex gap-2">
            <label className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="font-semibold">User Name</span>
                <input
                    type="text"
                    autoComplete="off"
                    className={inputClasses}
                    value={username ?? ""}
                    onChange={(e) => onUsernameChange(e.target.value)}
                />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="font-semibold">Password</span>
                <input
                    type="password"
                    autoComplete="new-password"
                    className={inputClasses}
                    value={password ?? ""}
                    onChange={(e) => onPasswordChange(e.target.value)}
                />
            </label>
        </div>
    );
}

export default LoginFields;
