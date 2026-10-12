"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DownloadIcon, GearIcon, KeyIcon, UploadIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ToastProvider";

const themes = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
];

// The layout's inline script applies the saved theme on load; this keeps it in sync after a change.
function readTheme() {
    try {
        const theme = localStorage.getItem("theme");
        return theme === "light" || theme === "dark" ? theme : "system";
    } catch {
        return "system";
    }
}

function applyTheme(theme) {
    try {
        if (theme === "system") localStorage.removeItem("theme");
        else localStorage.setItem("theme", theme);
    } catch {}
    if (theme === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
}

function SettingsMenu() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(() => (typeof window === "undefined" ? "system" : readTheme()));
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);
    const showToast = useToast();

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        function handleKeyDown(event) {
            if (event.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    function chooseTheme(value) {
        setTheme(value);
        applyTheme(value);
    }

    async function handleImportFile(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        setOpen(false);

        let data;
        try {
            data = JSON.parse(await file.text());
        } catch {
            showToast("That file isn't a valid info.json");
            return;
        }
        if (!window.confirm("This replaces all of your current info. Download a backup first if you're unsure. Continue?")) {
            return;
        }

        try {
            const res = await fetch("/api/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                showToast("That file isn't a valid info.json");
                return;
            }
        } catch {
            showToast("Couldn't import");
            return;
        }
        showToast("Info imported");
        // Pages load their data on mount, so reload to show the imported info.
        setTimeout(() => window.location.reload(), 800);
    }

    return (
        <div className="relative shrink-0" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="icon-btn p-2"
                aria-label="Settings"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <GearIcon size={18} />
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
            />

            {open && (
                <div className="dropdown-panel right-0 w-56" role="menu">
                    <Link href="/passwords" role="menuitem" onClick={() => setOpen(false)} className="dropdown-item">
                        <KeyIcon size={15} />
                        Password Manager
                    </Link>
                    <a
                        href="/api/download"
                        download="info.json"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            showToast("Downloading info.json…");
                        }}
                        className="dropdown-item"
                    >
                        <DownloadIcon size={15} />
                        Download Info
                    </a>
                    <button type="button" role="menuitem" onClick={() => fileInputRef.current?.click()} className="dropdown-item">
                        <UploadIcon size={15} />
                        Import Info
                    </button>

                    <div className="border-t border-[var(--border)] px-3 py-2.5">
                        <div className="field-label mb-1.5">Theme</div>
                        <div className="flex rounded-lg bg-[var(--surface-hover)] p-0.5" role="radiogroup" aria-label="Theme">
                            {themes.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={theme === option.value}
                                    onClick={() => chooseTheme(option.value)}
                                    className={`flex-1 rounded-md px-2 py-1 text-xs font-medium cursor-pointer transition-colors duration-150 ${
                                        theme === option.value
                                            ? "bg-[var(--surface)] text-foreground shadow-sm"
                                            : "text-muted hover:text-foreground"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettingsMenu;
