"use client";

import { useEffect, useRef, useState } from "react";
import { inputClasses, maskAll } from "@/lib/formUtils";
import { CheckIcon, KeyIcon } from "@/components/ui/icons";
import { EyeIcon, EyeOffIcon } from "@/components/info/RevealableDetailRow";

function useSavedLogins(platform) {
    const [passwords, setPasswords] = useState([]);

    useEffect(() => {
        fetch("/api/passwords")
            .then((res) => res.json())
            .then(setPasswords);
    }, []);

    return platform ? passwords.filter((login) => login.platform === platform) : [];
}

function SavedLoginPicker({ platform, logins, selectedId, onSelect }) {
    const [open, setOpen] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (logins.length === 1) {
        const [login] = logins;
        const selected = login.id === selectedId;

        return (
            <button
                type="button"
                onClick={() => onSelect(login)}
                disabled={selected}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left cursor-pointer transition-colors duration-150 bg-[var(--accent-soft)] text-[var(--accent)] disabled:cursor-default"
            >
                {selected ? <CheckIcon size={14} /> : <KeyIcon size={14} />}
                <span className="min-w-0 truncate">
                    {selected ? `Using your saved ${platform} login` : `Use your saved ${platform} login`}
                    {login.username && <span className="font-medium"> · {login.username}</span>}
                </span>
            </button>
        );
    }

    const selectedLogin = logins.find((login) => login.id === selectedId);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="field flex items-center justify-between gap-2 cursor-pointer text-left"
            >
                <span className="flex items-center gap-2 min-w-0">
                    <KeyIcon size={14} />
                    <span className={`truncate ${selectedLogin ? "" : "text-muted"}`}>
                        {selectedLogin
                            ? selectedLogin.username || "No username"
                            : `Use a saved ${platform} login (${logins.length})`}
                    </span>
                </span>
                <span className="text-muted text-xs shrink-0">▾</span>
            </button>

            {open && (
                <div className="dropdown-panel">
                    <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-[var(--border)]">
                        <span className="field-label">Saved {platform} logins</span>
                        <button
                            type="button"
                            onClick={() => setRevealed((prev) => !prev)}
                            className="icon-btn"
                            aria-label={revealed ? "Hide passwords" : "Show passwords"}
                        >
                            {revealed ? <EyeIcon /> : <EyeOffIcon />}
                        </button>
                    </div>
                    <ul className="max-h-56 overflow-y-auto">
                        {logins.map((login) => (
                            <li key={login.id}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelect(login);
                                        setOpen(false);
                                    }}
                                    className="dropdown-item"
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">{login.username || "No username"}</span>
                                        <span className="block truncate text-xs text-muted">
                                            {login.password ? (revealed ? login.password : maskAll(login.password)) : "No password"}
                                        </span>
                                    </span>
                                    {login.id === selectedId && (
                                        <span className="shrink-0 text-[var(--accent)]"><CheckIcon size={14} /></span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function LoginFields({ platform, username, password, onUsernameChange, onPasswordChange }) {
    const savedLogins = useSavedLogins(platform);
    const [showPassword, setShowPassword] = useState(false);
    const selectedLogin = savedLogins.find(
        (login) => login.username === (username ?? "") && login.password === (password ?? "")
    );

    function applyLogin(login) {
        onUsernameChange(login.username);
        onPasswordChange(login.password);
    }

    return (
        <div className="flex flex-col gap-2">
            {savedLogins.length > 0 && (
                <SavedLoginPicker
                    platform={platform}
                    logins={savedLogins}
                    selectedId={selectedLogin?.id}
                    onSelect={applyLogin}
                />
            )}
            <div className="flex gap-2">
                <label className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="field-label">User Name</span>
                    <input
                        type="text"
                        autoComplete="off"
                        className={inputClasses}
                        value={username ?? ""}
                        onChange={(e) => onUsernameChange(e.target.value)}
                    />
                </label>
                <label className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="field-label">Password</span>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={`${inputClasses} pr-9`}
                            value={password ?? ""}
                            onChange={(e) => onPasswordChange(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                        </button>
                    </div>
                </label>
            </div>
        </div>
    );
}

export default LoginFields;
