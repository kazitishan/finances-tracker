"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CheckIcon, FilterIcon } from "@/components/ui/icons";

function FilterMenu({ filters }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const { groups, toggle, clear, activeCount } = filters;

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
                className="btn btn-secondary h-full"
                aria-haspopup="true"
                aria-expanded={open}
            >
                <FilterIcon size={14} />
                Filter
                {activeCount > 0 && (
                    <span className="rounded-full bg-[var(--accent)] px-1.5 text-xs font-semibold text-[var(--accent-contrast)]">
                        {activeCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="dropdown-panel right-0 w-64 max-h-96 overflow-y-auto">
                    {groups.map((group, index) => (
                        <div key={group.key} className={`py-1.5 ${index > 0 ? "border-t border-[var(--border)]" : ""}`}>
                            <div className="field-label px-3 pt-1 pb-1">{group.label}</div>
                            {group.options.length === 0 && (
                                <div className="px-3 py-1.5 text-sm text-muted">Nothing to filter by yet</div>
                            )}
                            {group.options.map((option) => {
                                const checked = group.selected.includes(option.value.toLowerCase());
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="menuitemcheckbox"
                                        aria-checked={checked}
                                        onClick={() => toggle(group.key, option.value)}
                                        className="dropdown-item"
                                    >
                                        <span
                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                                checked
                                                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]"
                                                    : "border-[var(--border-strong)]"
                                            }`}
                                        >
                                            {checked && <CheckIcon size={12} />}
                                        </span>
                                        {option.image && (
                                            <Image src={option.image} alt="" width={20} height={20} className="object-contain" />
                                        )}
                                        <span className="flex-1 truncate">{option.value}</span>
                                        <span className="text-xs text-muted">{option.count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                    {activeCount > 0 && (
                        <div className="border-t border-[var(--border)] p-1.5">
                            <button type="button" onClick={clear} className="btn btn-secondary w-full justify-center">
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default FilterMenu;
