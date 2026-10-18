"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ImageUploadButton from "@/components/ui/ImageUploadButton";
import { PlusIcon } from "@/components/ui/icons";

// A searchable dropdown of platforms with logos. Its last option, "Other", is for one that isn't listed:
// the user types its name and uploads its logo. `customLogo` is that logo, the path of the uploaded image
// or, until the form is saved, the picked image as a data URL.
function LogoDropdown({
    options,
    value,
    onChange,
    customLogo,
    onCustomLogoChange,
    placeholder,
    searchPlaceholder,
    namePlaceholder,
}) {
    const selectedOption = options.find((option) => option.name === value);
    const [isOther, setIsOther] = useState(Boolean(value) && !selectedOption);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    function closeDropdown() {
        setOpen(false);
        setSearch("");
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                closeDropdown();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open) {
            searchInputRef.current?.focus();
        }
    }, [open]);

    function selectOption(name) {
        setIsOther(false);
        onChange(name);
        onCustomLogoChange("");
        closeDropdown();
    }

    // A search that found nothing is most likely the name of the platform being added, so it carries over.
    function selectOther() {
        setIsOther(true);
        onChange(search.trim() || (isOther ? value : ""));
        closeDropdown();
    }

    const filteredOptions = options.filter((option) =>
        option.name.toLowerCase().includes(search.toLowerCase())
    );
    const searchName = filteredOptions.some((option) => option.name.toLowerCase() === search.trim().toLowerCase())
        ? ""
        : search.trim();

    return (
        <div className="flex flex-col gap-2">
            <div className="relative" ref={containerRef}>
                <button
                    type="button"
                    onClick={() => (open ? closeDropdown() : setOpen(true))}
                    className="field flex items-center justify-between gap-2 cursor-pointer text-left"
                >
                    <span className="flex items-center gap-2">
                        {!isOther && selectedOption && (
                            <Image
                                src={selectedOption.image}
                                alt={selectedOption.name}
                                width={20}
                                height={20}
                                className="object-contain"
                            />
                        )}
                        <span className={isOther || selectedOption ? "" : "text-muted"}>
                            {isOther ? "Other" : selectedOption ? selectedOption.name : placeholder}
                        </span>
                    </span>
                    <span className="text-muted text-xs">▾</span>
                </button>

                {open && (
                    <div className="dropdown-panel">
                        <div className="p-2 border-b border-[var(--border)]">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="field py-1.5"
                            />
                        </div>
                        <ul className="max-h-56 overflow-y-auto">
                            {filteredOptions.map((option) => (
                                <li key={option.name}>
                                    <button
                                        type="button"
                                        onClick={() => selectOption(option.name)}
                                        className="dropdown-item"
                                    >
                                        <Image
                                            src={option.image}
                                            alt={option.name}
                                            width={20}
                                            height={20}
                                            className="object-contain"
                                        />
                                        {option.name}
                                    </button>
                                </li>
                            ))}
                            <li className={filteredOptions.length > 0 ? "border-t border-[var(--border)]" : ""}>
                                <button type="button" onClick={selectOther} className="dropdown-item">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-dashed border-[var(--border-strong)] text-muted">
                                        <PlusIcon size={12} />
                                    </span>
                                    <span className="min-w-0 truncate">
                                        Other
                                        {searchName && <span className="text-muted"> · &ldquo;{searchName}&rdquo;</span>}
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            {isOther && (
                <div className="flex gap-2">
                    <ImageUploadButton image={customLogo} onChange={onCustomLogoChange} />
                    <input
                        type="text"
                        className="field"
                        placeholder={namePlaceholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}

export default LogoDropdown;
