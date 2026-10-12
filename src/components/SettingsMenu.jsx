"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DownloadIcon, GearIcon, KeyIcon } from "@/components/ui/icons";

function SettingsMenu() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

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

            {open && (
                <div className="dropdown-panel right-0 w-52" role="menu">
                    <Link href="/passwords" role="menuitem" onClick={() => setOpen(false)} className="dropdown-item">
                        <KeyIcon size={15} />
                        Password Manager
                    </Link>
                    <a href="/api/download" download="info.json" role="menuitem" onClick={() => setOpen(false)} className="dropdown-item">
                        <DownloadIcon size={15} />
                        Download Info
                    </a>
                </div>
            )}
        </div>
    );
}

export default SettingsMenu;
