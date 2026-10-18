"use client";

import { useEffect, useRef, useState } from "react";
import { inputClasses } from "@/lib/formUtils";

// The name to show for a type: what the user typed in when they picked "Other", otherwise the type itself.
export function typeLabel(type, otherType) {
    if (type === "Other") return otherType || "Other";
    return type || "";
}

// A dropdown of the different `types` of a thing. When the type picked is "Other", a text field
// below it asks what the type is; that's `otherValue`.
function TypeDropdown({ types, value, otherValue, onChange, onOtherChange, placeholder, otherPlaceholder }) {
    const [open, setOpen] = useState(false);
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

    return (
        <div className="flex flex-col gap-2">
            <div className="relative" ref={containerRef}>
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="field flex items-center justify-between gap-2 cursor-pointer text-left"
                >
                    <span className={value ? "" : "text-muted"}>{value || placeholder}</span>
                    <span className="text-muted text-xs">▾</span>
                </button>

                {open && (
                    <div className="dropdown-panel">
                        <ul className="max-h-56 overflow-y-auto">
                            {types.map((type) => (
                                <li key={type}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(type);
                                            setOpen(false);
                                        }}
                                        className="dropdown-item"
                                    >
                                        {type}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {value === "Other" && (
                <input
                    type="text"
                    className={inputClasses}
                    placeholder={otherPlaceholder}
                    value={otherValue}
                    onChange={(e) => onOtherChange(e.target.value)}
                />
            )}
        </div>
    );
}

export default TypeDropdown;
